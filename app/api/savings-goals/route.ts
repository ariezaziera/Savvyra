import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goals = await prisma.savingsGoal.findMany({
    where: { userId },
    include: {
      transactions: {
        where: { status: "Completed" },
        select: { amount: true },
      },
    },
  });

  const goalsWithProgress = goals.map((goal) => {
    const currentAmount = goal.transactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    return {
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount,
      deadline: goal.deadline,
      monthlyContribution: goal.monthlyContribution ?? null,
    };
  });

  return NextResponse.json(goalsWithProgress);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const goal = await prisma.savingsGoal.create({
    data: {
      name: body.name,
      targetAmount: Number(body.targetAmount ?? body.target),
      currentAmount: Number(body.currentAmount ?? body.current ?? 0),
      deadline: body.deadline ? new Date(body.deadline) : null,
      monthlyContribution: body.monthlyContribution
        ? Number(body.monthlyContribution)
        : null,
      userId,
    },
  });

  return NextResponse.json(goal);
}

export async function PUT(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const existing = await prisma.savingsGoal.findFirst({
    where: { id: body.id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  // ── TOP UP flow ──────────────────────────────────────────────
  // Detected when body.topUpAmount is provided
  if (body.topUpAmount !== undefined) {
    const topUpAmount = Number(body.topUpAmount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      return NextResponse.json({ error: "Invalid top up amount" }, { status: 400 });
    }

    // 1. Create a transaction in history
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

    // 2. Update currentAmount in SavingsGoal
    const updated = await prisma.savingsGoal.update({
      where: { id: body.id },
      data: {
        currentAmount: existing.currentAmount + topUpAmount,
      },
    });

    return NextResponse.json(updated);
  }

  // ── EDIT flow (name, target, deadline, etc.) ─────────────────
  const goal = await prisma.savingsGoal.update({
    where: { id: body.id },
    data: {
      name: body.name,
      targetAmount: Number(body.targetAmount ?? body.target),
      currentAmount: Number(body.currentAmount ?? body.current ?? 0),
      deadline: body.deadline ? new Date(body.deadline) : null,
      monthlyContribution: body.monthlyContribution
        ? Number(body.monthlyContribution)
        : null,
    },
  });

  return NextResponse.json(goal);
}

export async function DELETE(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  const existing = await prisma.savingsGoal.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  await prisma.savingsGoal.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Deleted" });
}