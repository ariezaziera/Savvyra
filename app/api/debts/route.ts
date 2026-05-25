import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const debts = await prisma.debt.findMany({
    where: { userId },
    orderBy: [{ debtType: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(debts);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const isRevolving = body.debtType === "REVOLVING";

  const debt = await prisma.debt.create({
    data: {
      userId,
      name:            body.name,
      creditor:        body.creditor           ?? null,
      debtType:        body.debtType           ?? "FIXED",
      totalAmount:     parseFloat(body.totalAmount),
      remainingAmount: parseFloat(body.remainingAmount ?? body.totalAmount),
      monthlyPayment:  isRevolving ? 0 : parseFloat(body.monthlyPayment  ?? 0),
      minimumPayment:  isRevolving ? parseFloat(body.minimumPayment ?? 0) : null,
      creditLimit:     body.creditLimit        ? parseFloat(body.creditLimit) : null,
      interestRate:    parseFloat(body.interestRate ?? 0),
      dueDate:         body.dueDate            ? new Date(body.dueDate)         : null,
      nextPaymentDate: body.nextPaymentDate    ? new Date(body.nextPaymentDate) : null,
      category:        body.category           ?? "General",
      status:          body.status             ?? "ACTIVE",
      note:            body.note               ?? null,
    },
  });

  return NextResponse.json(debt, { status: 201 });
}