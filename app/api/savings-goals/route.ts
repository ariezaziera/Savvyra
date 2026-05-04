import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request);
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

  console.log("RAW GOALS:", JSON.stringify(goals, null, 2));

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
    };
  });

  return NextResponse.json(goalsWithProgress);
}

export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Map frontend fields (target, current) to schema fields (targetAmount, currentAmount)
  const goal = await prisma.savingsGoal.create({
    data: {
      name: body.name,
      targetAmount: Number(body.targetAmount ?? body.target), // support both
      currentAmount: Number(body.currentAmount ?? body.current ?? 0),
      deadline: body.deadline ? new Date(body.deadline) : null,
      userId,
    },
  });

  return NextResponse.json(goal);
}

export async function PUT(request: Request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Verify ownership
  const existing = await prisma.savingsGoal.findFirst({
    where: { id: body.id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  const goal = await prisma.savingsGoal.update({
    where: { id: body.id },
    data: {
      name: body.name,
      targetAmount: Number(body.targetAmount ?? body.target),
      currentAmount: Number(body.currentAmount ?? body.current ?? 0),
      deadline: body.deadline ? new Date(body.deadline) : null,
    },
  });

  return NextResponse.json(goal);
}

export async function DELETE(request: Request) {
  const userId = getUserIdFromRequest(request);
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