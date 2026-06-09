// app/api/salary/months/[id]/plan-items/[itemId]/route.ts
// POST — mark ONE plan item as paid, create the linked transaction, update linked module

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: monthId, itemId } = await params;

  const month = await prisma.salaryMonth.findUnique({
    where: { id: monthId },
    include: { salaryPlanItems: true },
  });

  if (!month || month.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Must confirm actual salary received first
  if (!month.isMarkedReceived)
    return NextResponse.json(
      { error: "Confirm salary received before marking items as paid." },
      { status: 422 }
    );

  const item = month.salaryPlanItems.find((i) => i.id === itemId);
  if (!item)
    return NextResponse.json({ error: "Plan item not found" }, { status: 404 });

  // Already paid — sortOrder === -1 is the paid signal
  if (item.sortOrder === -1)
    return NextResponse.json({ error: "Already paid" }, { status: 409 });

  const now       = new Date();
  const monthName = new Date(month.year, month.month - 1).toLocaleString("en-MY", { month: "long" });
  const periodLabel = `${monthName} ${month.year}`;

  try {
    // ── COMMITMENT ──────────────────────────────────────────
    if (item.sourceType === "COMMITMENT" && item.sourceId) {
      let instance = await prisma.commitmentInstance.findUnique({
        where: {
          commitmentId_month_year: {
            commitmentId: item.sourceId,
            month: month.month,
            year:  month.year,
          },
        },
      });

      // Create instance if it doesn't exist yet
      if (!instance) {
        instance = await prisma.commitmentInstance.create({
          data: {
            commitmentId: item.sourceId,
            userId,
            month:   month.month,
            year:    month.year,
            dueDate: new Date(month.year, month.month - 1, 25),
            amount:  item.amount,
            status:  "PENDING",
          },
        });
      }

      if (instance.status !== "PAID") {
        await prisma.transaction.create({
          data: {
            userId,
            title:               `${item.label} — ${periodLabel}`,
            amount:              item.amount,
            type:                "COMMITMENT",
            category:            "Commitment",
            date:                now,
            commitmentInstanceId: instance.id,
          },
        });
        await prisma.commitmentInstance.update({
          where: { id: instance.id },
          data:  { status: "PAID", paidAt: now },
        });
      }
    }

    // ── SAVINGS ─────────────────────────────────────────────
    else if (item.sourceType === "SAVINGS" && item.sourceId) {
      await prisma.transaction.create({
        data: {
          userId,
          title:         `Savings — ${item.label} (${periodLabel})`,
          amount:        item.amount,
          type:          "SAVINGS",
          category:      "Savings",
          date:          now,
          savingsGoalId: item.sourceId,
        },
      });
    }

    // ── DEBT ─────────────────────────────────────────────────
    else if (item.sourceType === "DEBT" && item.sourceId) {
      const debt = await prisma.debt.findUnique({ where: { id: item.sourceId } });
      if (debt) {
        await prisma.transaction.create({
          data: {
            userId,
            title:    `Debt Payment — ${item.label} (${periodLabel})`,
            amount:   item.amount,
            type:     "DEBT_PAYMENT",
            category: "Repayment",
            date:     now,
            debtId:   item.sourceId,
          },
        });
        const newRemaining = Math.max(0, debt.remainingAmount - item.amount);
        await prisma.debt.update({
          where: { id: item.sourceId },
          data: {
            remainingAmount: newRemaining,
            ...(newRemaining === 0 && { status: "SETTLED" }),
          },
        });
      }
    }

    // ── INVESTMENT ───────────────────────────────────────────
    else if (item.sourceType === "INVESTMENT" && item.sourceId) {
      await prisma.transaction.create({
        data: {
          userId,
          title:        `Investment — ${item.label} (${periodLabel})`,
          amount:       item.amount,
          type:         "INVESTMENT",
          category:     "Investment",
          date:         now,
          investmentId: item.sourceId,
        },
      });
    }

    // ── CUSTOM (no linked module) ────────────────────────────
    else {
      await prisma.transaction.create({
        data: {
          userId,
          title:    `${item.label} — ${periodLabel}`,
          amount:   item.amount,
          type:     "EXPENSE",
          category: "General",
          date:     now,
        },
      });
    }
  } catch (err) {
    console.error("Failed to create transaction for plan item:", err);
    return NextResponse.json({ error: "Transaction creation failed" }, { status: 500 });
  }

  // Mark item as paid using sortOrder = -1 convention
  await prisma.salaryPlanItem.update({
    where: { id: itemId },
    data:  { sortOrder: -1 },
  });

  // Return full updated month
  const updated = await prisma.salaryMonth.findUnique({
    where:   { id: monthId },
    include: { salaryPlanItems: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(updated);
}