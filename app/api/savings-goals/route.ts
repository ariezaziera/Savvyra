import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { savingsGoalSchema } from "@/lib/schemas"; // ✅

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    include: {
      transactions: {
        where: { status: "Completed" },
        select: { amount: true },
      },
    },
  });

  const goalsWithProgress = goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.transactions.reduce((sum, t) => sum + t.amount, 0),
    deadline: goal.deadline,
    monthlyContribution: goal.monthlyContribution ?? null,
  }));

  return NextResponse.json(goalsWithProgress);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // ✅ Zod validation
  const parsed = savingsGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, targetAmount, currentAmount, deadline, monthlyContribution } = parsed.data;

  const goal = await prisma.savingsGoal.create({
    data: {
      name,
      targetAmount,
      currentAmount: currentAmount ?? 0,
      deadline: deadline ? new Date(deadline) : null,
      monthlyContribution: monthlyContribution ?? null,
      userId,
    },
  });

  return NextResponse.json(goal);
}

export async function PUT(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const existing = await prisma.savingsGoal.findFirst({
    where: { id: body.id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  // ── TOP UP flow ──────────────────────────────────────────────
  if (body.topUpAmount !== undefined) {
    const topUpAmount = Number(body.topUpAmount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      return NextResponse.json({ error: "Invalid top up amount" }, { status: 400 });
    }

    await prisma.transaction.create({
      data: {
        title: `Top Up — ${existing.name}`,
        category: "Savings",
        amount: topUpAmount,
        type: "EXPENSE",
        status: "Completed",
        date: new Date(),
        userId,
        savingsGoalId: existing.id,
      },
    });

    const updated = await prisma.savingsGoal.update({
      where: { id: body.id },
      data: { currentAmount: existing.currentAmount + topUpAmount },
    });

    return NextResponse.json(updated);
  }

  // ── EDIT flow ────────────────────────────────────────────────
  // ✅ Zod validation untuk edit
  const parsed = savingsGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, targetAmount, currentAmount, deadline, monthlyContribution } = parsed.data;

  const goal = await prisma.savingsGoal.update({
    where: { id: body.id },
    data: {
      name,
      targetAmount,
      currentAmount: currentAmount ?? existing.currentAmount,
      deadline: deadline ? new Date(deadline) : null,
      monthlyContribution: monthlyContribution ?? null,
    },
  });

  return NextResponse.json(goal);
}

export async function DELETE(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();

  const existing = await prisma.savingsGoal.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  await prisma.savingsGoal.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted" });
}