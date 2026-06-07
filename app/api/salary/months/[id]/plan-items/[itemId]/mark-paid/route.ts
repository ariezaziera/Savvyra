import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// POST /api/salary/months/[id]/plan-items/[itemId]/mark-paid
// Marks a single plan item as paid and creates the linked transaction + updates module
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: monthId, itemId } = await params;

  const salaryMonth = await prisma.salaryMonth.findUnique({
    where: { id: monthId },
  });
  if (!salaryMonth || salaryMonth.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!salaryMonth.isMarkedReceived)
    return NextResponse.json(
      { error: "Salary must be confirmed as received before marking items as paid" },
      { status: 400 }
    );

  const planItem = await prisma.salaryPlanItem.findUnique({ where: { id: itemId } });
  if (!planItem || planItem.userId !== userId)
    return NextResponse.json({ error: "Plan item not found" }, { status: 404 });

  const now = new Date();

  try {
    if (planItem.sourceType === "SAVINGS" && planItem.sourceId) {
      await prisma.transaction.create({
        data: {
          userId,
          title:         `Savings Top Up — ${planItem.label}`,
          amount:        planItem.amount,
          type:          "SAVINGS",
          category:      "Savings",
          date:          now,
          savingsGoalId: planItem.sourceId,
        },
      });
    }

    if (planItem.sourceType === "INVESTMENT" && planItem.sourceId) {
      await prisma.transaction.create({
        data: {
          userId,
          title:        `Investment Top Up — ${planItem.label}`,
          amount:       planItem.amount,
          type:         "INVESTMENT",
          category:     "Investment",
          date:         now,
          investmentId: planItem.sourceId,
        },
      });
    }

    if (planItem.sourceType === "DEBT" && planItem.sourceId) {
      const debt = await prisma.debt.findUnique({ where: { id: planItem.sourceId } });
      if (debt) {
        const newRemaining = Math.max(0, debt.remainingAmount - planItem.amount);
        await prisma.debt.update({
          where: { id: planItem.sourceId },
          data: {
            remainingAmount: newRemaining,
            status: newRemaining === 0 ? "SETTLED" : debt.status,
          },
        });
        await prisma.transaction.create({
          data: {
            userId,
            title:    `Debt Payment — ${planItem.label}`,
            amount:   planItem.amount,
            type:     "DEBT_PAYMENT",
            category: "Repayment",
            date:     now,
            debtId:   planItem.sourceId,
          },
        });
      }
    }

    if (planItem.sourceType === "COMMITMENT" && planItem.sourceId) {
      const instance = await prisma.commitmentInstance.findUnique({
        where: {
          commitmentId_month_year: {
            commitmentId: planItem.sourceId,
            month: salaryMonth.month,
            year:  salaryMonth.year,
          },
        },
      });
      if (instance && instance.status !== "PAID") {
        await prisma.transaction.create({
          data: {
            userId,
            title:               `Commitment — ${planItem.label}`,
            amount:              planItem.amount,
            type:                "COMMITMENT",
            category:            "Commitment",
            date:                now,
            commitmentInstanceId: instance.id,
          },
        });
        await prisma.commitmentInstance.update({
          where: { id: instance.id },
          data: { status: "PAID", paidAt: now },
        });
      }
    }

    if (planItem.sourceType === "CUSTOM") {
      await prisma.transaction.create({
        data: {
          userId,
          title:    planItem.label,
          amount:   planItem.amount,
          type:     "EXPENSE",
          category: "General",
          date:     now,
        },
      });
    }

    // Mark the plan item as paid by setting isIncluded=false (re-using field as paid flag)
    // We use a dedicated approach: store paidAt via salaryMonth update not possible directly,
    // so we mark it via a convention: sortOrder = -1 means paid
    const updated = await prisma.salaryPlanItem.update({
      where: { id: itemId },
      data: { sortOrder: -1 }, // convention: -1 = paid
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (err) {
    console.error("mark-paid error:", err);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
