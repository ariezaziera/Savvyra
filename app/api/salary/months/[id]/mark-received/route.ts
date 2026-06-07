import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// POST /api/salary/months/[id]/mark-received
// Marks salary as received and cascades updates to all linked modules
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const record = await prisma.salaryMonth.findUnique({
    where: { id },
    include: { salaryPlanItems: true },
  });

  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (record.isMarkedReceived)
    return NextResponse.json({ error: "Already marked received" }, { status: 400 });

  const now        = new Date();
  const planItems  = record.salaryPlanItems;
  const actualNet  = record.actualNet ?? record.expectedNet;

  // Record salary income transaction
  await prisma.transaction.create({
    data: {
      userId,
      title:        `Salary — ${new Date(record.year, record.month - 1).toLocaleString("en-MY", { month: "long", year: "numeric" })}`,
      description:  "Monthly salary received",
      amount:       actualNet,
      type:         "INCOME",
      category:     "Salary",
      date:         now,
      salaryMonthId: record.id,
    },
  });

  // Cascade to each plan item based on sourceType
  for (const item of planItems) {
    if (!item.isIncluded || !item.sourceId) continue;

    try {
      if (item.sourceType === "SAVINGS" && item.sourceId) {
        // Top up savings goal
        await prisma.transaction.create({
          data: {
            userId,
            title:        `Savings Top Up — ${item.label}`,
            amount:       item.amount,
            type:         "SAVINGS",
            category:     "Savings",
            date:         now,
            savingsGoalId: item.sourceId,
          },
        });
      }

      if (item.sourceType === "INVESTMENT" && item.sourceId) {
        // Fund investment
        await prisma.transaction.create({
          data: {
            userId,
            title:        `Investment Top Up — ${item.label}`,
            amount:       item.amount,
            type:         "INVESTMENT",
            category:     "Investment",
            date:         now,
            investmentId: item.sourceId,
          },
        });
      }

      if (item.sourceType === "DEBT" && item.sourceId) {
        // Pay debt — reduce remaining amount
        const debt = await prisma.debt.findUnique({ where: { id: item.sourceId } });
        if (debt) {
          const newRemaining = Math.max(0, debt.remainingAmount - item.amount);
          await prisma.debt.update({
            where: { id: item.sourceId },
            data: {
              remainingAmount: newRemaining,
              status: newRemaining === 0 ? "SETTLED" : debt.status,
            },
          });
          await prisma.transaction.create({
            data: {
              userId,
              title:    `Debt Payment — ${item.label}`,
              amount:   item.amount,
              type:     "DEBT_PAYMENT",
              category: "Repayment",
              date:     now,
              debtId:   item.sourceId,
            },
          });
        }
      }

      if (item.sourceType === "COMMITMENT" && item.sourceId) {
        // Mark commitment instance paid for current month
        const instance = await prisma.commitmentInstance.findUnique({
          where: {
            commitmentId_month_year: {
              commitmentId: item.sourceId,
              month: record.month,
              year:  record.year,
            },
          },
        });
        if (instance && instance.status !== "PAID") {
          const tx = await prisma.transaction.create({
            data: {
              userId,
              title:               `Commitment — ${item.label}`,
              amount:              item.amount,
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
    } catch (err) {
      console.error(`Failed to process plan item ${item.label}:`, err);
      // Continue processing other items even if one fails
    }
  }

  // Mark salary month as received
  const updated = await prisma.salaryMonth.update({
    where: { id },
    data: { isMarkedReceived: true },
  });

  return NextResponse.json(updated);
}
