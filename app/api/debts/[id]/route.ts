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

    const debt = await prisma.debt.findUnique({
      where: { id },
      include: { commitment: true },
    });
    if (!debt || debt.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const debtType = body.debtType ?? debt.debtType;
    const isRevolving = debtType === "REVOLVING";
    const monthlyPayment = isRevolving
      ? 0
      : body.monthlyPayment !== undefined
      ? parseFloat(body.monthlyPayment)
      : debt.monthlyPayment;

    const newStatus = body.status ?? debt.status;
    const isSettled = newStatus === "SETTLED";

    const updated = await prisma.debt.update({
      where: { id },
      data: {
        name:            body.name            ?? debt.name,
        creditor:        body.creditor        ?? debt.creditor,
        debtType,
        totalAmount:     body.totalAmount     ? parseFloat(body.totalAmount)     : debt.totalAmount,
        remainingAmount: body.remainingAmount ? parseFloat(body.remainingAmount) : debt.remainingAmount,
        monthlyPayment:  isRevolving ? 0 : monthlyPayment,
        minimumPayment:  isRevolving ? (body.minimumPayment ? parseFloat(body.minimumPayment) : debt.minimumPayment) : null,
        creditLimit:     body.creditLimit     ? parseFloat(body.creditLimit)     : debt.creditLimit,
        interestRate:    body.interestRate    !== undefined ? parseFloat(body.interestRate) : debt.interestRate,
        dueDate:         body.dueDate         ? new Date(body.dueDate)           : debt.dueDate,
        nextPaymentDate: body.nextPaymentDate ? new Date(body.nextPaymentDate)   : debt.nextPaymentDate,
        category:        body.category        ?? debt.category,
        status:          newStatus,
        note:            body.note            ?? debt.note,
      },
    });

    // Sync linked commitment
    if (isSettled || isRevolving || monthlyPayment === 0) {
      // Remove commitment if debt settled, revolving, or no monthly payment
      if (debt.commitment) {
        await prisma.commitment.delete({ where: { id: debt.commitment.id } });
      }
    } else if (debt.commitment) {
      // Update existing linked commitment
      const dueDate = body.nextPaymentDate
        ? new Date(body.nextPaymentDate)
        : body.dueDate
        ? new Date(body.dueDate)
        : debt.commitment.dueDate;

      await prisma.commitment.update({
        where: { id: debt.commitment.id },
        data: {
          name:   updated.name,
          amount: monthlyPayment,
          dueDate,
          note:   updated.creditor ? `Auto-linked: ${updated.creditor}` : "Auto-linked from Debts",
        },
      });
    } else {
      // No linked commitment yet — create one now
      const dueDate = body.nextPaymentDate
        ? new Date(body.nextPaymentDate)
        : body.dueDate
        ? new Date(body.dueDate)
        : new Date();

      await prisma.commitment.create({
        data: {
          userId,
          debtId:    id,
          name:      updated.name,
          amount:    monthlyPayment,
          dueDate,
          category:  "Repayment",
          frequency: "Monthly",
          note:      updated.creditor ? `Auto-linked: ${updated.creditor}` : "Auto-linked from Debts",
          isPaid:    false,
        },
      });
    }

    const result = await prisma.debt.findUnique({
      where: { id },
      include: { commitment: true },
    });

    return NextResponse.json(result);
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

    // Cascade delete handles commitment automatically (onDelete: Cascade on debtId FK)
    await prisma.debt.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/debts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete debt" }, { status: 500 });
  }
}
