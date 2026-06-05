import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// PATCH — update debt details, regenerate schedule if payment terms change
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
      include: { commitments: true },
    });
    if (!debt || debt.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body        = await request.json();
    const newStatus   = body.status ?? debt.status;
    const isSettled   = newStatus === "SETTLED";
    const debtType    = body.debtType ?? debt.debtType;
    const monthlyPayment = body.monthlyPayment !== undefined
      ? parseFloat(body.monthlyPayment)
      : debt.monthlyPayment;

    const updated = await prisma.debt.update({
      where: { id },
      data: {
        name:             body.name             ?? debt.name,
        creditor:         body.creditor         ?? debt.creditor,
        debtType,
        category:         body.category         ?? debt.category,
        totalAmount:      body.totalAmount      ? parseFloat(body.totalAmount)      : debt.totalAmount,
        remainingAmount:  body.remainingAmount  ? parseFloat(body.remainingAmount)  : debt.remainingAmount,
        monthlyPayment,
        interestRate:     body.interestRate     !== undefined ? parseFloat(body.interestRate) : debt.interestRate,
        firstPaymentDate: body.firstPaymentDate ? new Date(body.firstPaymentDate)  : debt.firstPaymentDate,
        totalInstalments: body.totalInstalments ? parseInt(body.totalInstalments)  : debt.totalInstalments,
        status:           newStatus,
        note:             body.note             ?? debt.note,
      },
    });

    // If settled — deactivate linked commitments
    if (isSettled && debt.commitments.length > 0) {
      await prisma.commitment.updateMany({
        where: { debtId: id },
        data: { isActive: false },
      });
    }

    // If payment terms changed — regenerate schedule for FIXED/BNPL
    const paymentTermsChanged =
      body.monthlyPayment !== undefined ||
      body.firstPaymentDate !== undefined ||
      body.totalInstalments !== undefined;

    if (paymentTermsChanged && (debtType === "FIXED" || debtType === "BNPL") && !isSettled) {
      // Delete pending schedules and regenerate
      await prisma.debtSchedule.deleteMany({
        where: { debtId: id, status: "PENDING" },
      });

      const firstPaymentDate = updated.firstPaymentDate;
      if (firstPaymentDate && monthlyPayment > 0) {
        const instalments = updated.totalInstalments ?? Math.ceil(updated.remainingAmount / monthlyPayment);
        const rows = [];
        for (let i = 0; i < instalments; i++) {
          const dueDate = new Date(firstPaymentDate);
          dueDate.setMonth(dueDate.getMonth() + i);
          rows.push({
            debtId: id,
            userId,
            instalmentNo: i + 1,
            dueDate,
            amount: monthlyPayment,
            status: "PENDING" as const,
          });
        }
        await prisma.debtSchedule.createMany({ data: rows });
      }
    }

    // Sync linked commitment amount if changed
    if (body.monthlyPayment !== undefined && debt.commitments.length > 0) {
      await prisma.commitment.updateMany({
        where: { debtId: id, isActive: true },
        data: { amount: monthlyPayment, name: updated.name },
      });
    }

    const result = await prisma.debt.findUnique({
      where: { id },
      include: {
        schedules:    { orderBy: { instalmentNo: "asc" } },
        commitments:  { select: { id: true, name: true, isActive: true } },
        transactions: { orderBy: { date: "desc" }, select: { id: true, title: true, amount: true, type: true, date: true } },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PATCH /api/debts/[id] error:", error);
    return NextResponse.json({ error: "Failed to update debt" }, { status: 500 });
  }
}

// DELETE
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
