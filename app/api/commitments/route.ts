// app/api/commitments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const commitments = await prisma.commitment.findMany({
    where: { userId },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(commitments);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, amount, dueDate, category, frequency, note } = body;

  if (!name || !amount || !dueDate)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const commitment = await prisma.commitment.create({
    data: {
      userId,
      name,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      category: category ?? "General",
      frequency: frequency ?? "Monthly",
      note: note ?? null,
      isPaid: false,
    },
  });

  return NextResponse.json(commitment, { status: 201 });
}