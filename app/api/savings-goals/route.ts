import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const goals = await prisma.savingsGoal.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const body = await request.json();

  const goal = await prisma.savingsGoal.create({
    data: {
      name: body.name,
      category: body.category,
      target: Number(body.target),
      current: Number(body.current || 0),
      deadline: body.deadline ? new Date(body.deadline) : null,
      note: body.note || null,
    },
  });

  return NextResponse.json(goal);
}

export async function PUT(request: Request) {
  const body = await request.json();

  const goal = await prisma.savingsGoal.update({
    where: { id: Number(body.id) },
    data: {
      name: body.name,
      category: body.category,
      target: Number(body.target),
      current: Number(body.current || 0),
      deadline: body.deadline ? new Date(body.deadline) : null,
      note: body.note || null,
    },
  });

  return NextResponse.json(goal);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  await prisma.savingsGoal.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ message: "Deleted" });
}