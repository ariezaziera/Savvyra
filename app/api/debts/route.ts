import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

const sf = (val: any, fallback = 0): number => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

// Helper: generate schedule rows for FIXED and BNPL debts
async function generateSchedule(
  debtId: string,
  userId: string,
  monthlyPayment: number,
  firstPaymentDate: Date,
  totalInstalments: number | null,
  totalAmount: number
) {
  if (!monthlyPayment || monthlyPayment <= 0) return;

  const instalments = totalInstalments ?? Math.ceil(totalAmount / monthlyPayment);
  const rows = [];

  for (let i = 0; i < instalments; i++) {
    const dueDate = new Date(firstPaymentDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    rows.push({
      debtId,
      userId,
      instalmentNo: i + 1,
      dueDate,
      amount: monthlyPayment,
      status: "PENDING" as const,
    });
  }

  await prisma.debtSchedule.createMany({ data: rows });
}

// GET — fetch all debts with schedules and linked commitments
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const debts = await prisma.debt.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        schedules: { orderBy: { instalmentNo: "asc" } },
        commitments: { select: { id: true, name: true, isActive: true } },
        transactions: {
          where: { type: { in: ["DEBT_PAYMENT", "DEBT_ADDITION"] } },
          orderBy: { date: "desc" },
          select: { id: true, title: true, amount: true, type: true, date: true },
        },
      },
    });

    return NextResponse.json(debts);
  } catch (error) {
    console.error("GET /api/debts error:", error);
    return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 });
  }
}

// POST — create a new debt + optional schedule + optional linked commitment
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    if (!body.name || !body.totalAmount) {
      return NextResponse.json({ error: "Name and total amount are required" }, { status: 400 });
    }

    const debtType       = body.debtType ?? "FIXED";
    const totalAmount    = sf(body.totalAmount);
    const remainingAmount = sf(body.remainingAmount ?? body.totalAmount);
    const monthlyPayment = sf(body.monthlyPayment);
    const totalInstalments = body.totalInstalments ? parseInt(body.totalInstalments) : null;
    const firstPaymentDate = body.firstPaymentDate ? new Date(body.firstPaymentDate) : null;

    const debt = await prisma.debt.create({
      data: {
        userId,
        name:             body.name,
        creditor:         body.creditor         || null,
        debtType,
        category:         body.category         ?? "General",
        totalAmount,
        remainingAmount,
        monthlyPayment,
        interestRate:     sf(body.interestRate),
        startDate:        body.startDate        ? new Date(body.startDate) : new Date(),
        firstPaymentDate,
        totalInstalments,
        status:           body.status           ?? "ACTIVE",
        note:             body.note             || null,
      },
    });

    // Generate schedule for FIXED and BNPL debts
    if ((debtType === "FIXED" || debtType === "BNPL") && monthlyPayment > 0 && firstPaymentDate) {
      await generateSchedule(debt.id, userId, monthlyPayment, firstPaymentDate, totalInstalments, totalAmount);
    }

    // Auto-create linked commitment for FIXED debts with monthly payment
    if (debtType === "FIXED" && monthlyPayment > 0 && body.status !== "SETTLED") {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear  = now.getFullYear();
      const dayOfMonth   = firstPaymentDate ? firstPaymentDate.getDate() : 1;

      const commitment = await prisma.commitment.create({
        data: {
          userId,
          debtId:    debt.id,
          name:      debt.name,
          amount:    monthlyPayment,
          category:  "Repayment",
          frequency: "MONTHLY",
          dayOfMonth,
          note:      debt.creditor ? `Auto-linked: ${debt.creditor}` : "Auto-linked from Debts",
          isActive:  true,
        },
      });

      // Spawn current month instance for the commitment
      const dueDate = new Date(currentYear, currentMonth - 1, dayOfMonth);
      await prisma.commitmentInstance.upsert({
        where: { commitmentId_month_year: { commitmentId: commitment.id, month: currentMonth, year: currentYear } },
        update: {},
        create: {
          commitmentId: commitment.id,
          userId,
          month:   currentMonth,
          year:    currentYear,
          dueDate,
          amount:  monthlyPayment,
          status:  "PENDING",
        },
      });
    }

    const result = await prisma.debt.findUnique({
      where: { id: debt.id },
      include: {
        schedules:    { orderBy: { instalmentNo: "asc" } },
        commitments:  { select: { id: true, name: true, isActive: true } },
        transactions: { orderBy: { date: "desc" }, select: { id: true, title: true, amount: true, type: true, date: true } },
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/debts error:", error);
    return NextResponse.json({ error: "Failed to create debt" }, { status: 500 });
  }
}
