import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const debt = await prisma.debt.findUnique({ where: { id } });
    if (!debt || debt.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const debtType = body.debtType ?? debt.debtType;
    const isRevolving = debtType === "REVOLVING";

    const updated = await prisma.debt.update({
      where: { id },
      data: {
        name:            body.name            ?? debt.name,
        creditor:        body.creditor        ?? debt.creditor,
        debtType,
        totalAmount:     body.totalAmount     ? parseFloat(body.totalAmount)     : debt.totalAmount,
        remainingAmount: body.remainingAmount ? parseFloat(body.remainingAmount) : debt.remainingAmount,
        monthlyPayment:  isRevolving ? 0      : body.monthlyPayment ? parseFloat(body.monthlyPayment) : debt.monthlyPayment,
        minimumPayment:  isRevolving          ? (body.minimumPayment ? parseFloat(body.minimumPayment) : debt.minimumPayment) : null,
        creditLimit:     body.creditLimit     ? parseFloat(body.creditLimit)     : debt.creditLimit,
        interestRate:    body.interestRate    !== undefined ? parseFloat(body.interestRate) : debt.interestRate,
        dueDate:         body.dueDate         ? new Date(body.dueDate)           : debt.dueDate,
        nextPaymentDate: body.nextPaymentDate ? new Date(body.nextPaymentDate)   : debt.nextPaymentDate,
        category:        body.category        ?? debt.category,
        status:          body.status          ?? debt.status,
        note:            body.note            ?? debt.note,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/debts/[id] error:", error);
    return NextResponse.json({ error: "Failed to update debt" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const debt = await prisma.debt.findUnique({ where: { id } });
    if (!debt || debt.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.debt.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/debts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete debt" }, { status: 500 });
  }
}