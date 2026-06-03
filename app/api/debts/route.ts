import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const debts = await prisma.debt.findMany({
      where: { userId },
      orderBy: [{ debtType: "asc" }, { createdAt: "desc" }],
      include: { commitment: true },
    });

    return NextResponse.json(debts);
  } catch (error) {
    console.error("GET /api/debts error:", error);
    return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const isRevolving = body.debtType === "REVOLVING";
    const monthlyPayment = isRevolving ? 0 : parseFloat(body.monthlyPayment ?? 0);

    const debt = await prisma.debt.create({
      data: {
        userId,
        name:            body.name,
        creditor:        body.creditor        ?? null,
        debtType:        body.debtType        ?? "FIXED",
        totalAmount:     parseFloat(body.totalAmount),
        remainingAmount: parseFloat(body.remainingAmount ?? body.totalAmount),
        monthlyPayment,
        minimumPayment:  isRevolving ? parseFloat(body.minimumPayment ?? 0) : null,
        creditLimit:     body.creditLimit     ? parseFloat(body.creditLimit) : null,
        interestRate:    parseFloat(body.interestRate ?? 0),
        dueDate:         body.dueDate         ? new Date(body.dueDate)         : null,
        nextPaymentDate: body.nextPaymentDate ? new Date(body.nextPaymentDate) : null,
        category:        body.category        ?? "General",
        status:          body.status          ?? "ACTIVE",
        note:            body.note            ?? null,
      },
    });

    // Auto-create linked commitment for FIXED debts with a monthly payment
    if (!isRevolving && monthlyPayment > 0 && body.status !== "SETTLED") {
      const dueDate = body.nextPaymentDate
        ? new Date(body.nextPaymentDate)
        : body.dueDate
        ? new Date(body.dueDate)
        : new Date();

      await prisma.commitment.create({
        data: {
          userId,
          debtId:    debt.id,
          name:      debt.name,
          amount:    monthlyPayment,
          dueDate,
          category:  "Repayment",
          frequency: "Monthly",
          note:      debt.creditor ? `Auto-linked: ${debt.creditor}` : "Auto-linked from Debts",
          isPaid:    false,
        },
      });
    }

    const result = await prisma.debt.findUnique({
      where: { id: debt.id },
      include: { commitment: true },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/debts error:", error);
    return NextResponse.json({ error: "Failed to create debt" }, { status: 500 });
  }
}
