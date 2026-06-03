import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { commitmentSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const commitments = await prisma.commitment.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" },
      select: {
        id: true, name: true, amount: true, dueDate: true,
        isPaid: true, category: true, frequency: true, note: true,
        debtId: true,
      },
    });

    return NextResponse.json(commitments);
  } catch (error) {
    console.error("GET /api/commitments error:", error);
    return NextResponse.json({ error: "Failed to fetch commitments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const parsed = commitmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, amount, dueDate, category, frequency, note } = parsed.data;

    const commitment = await prisma.commitment.create({
      data: {
        userId,
        name,
        amount,
        dueDate: new Date(dueDate),
        category: category ?? "General",
        frequency: frequency ?? "Monthly",
        note: note ?? null,
        isPaid: false,
      },
    });

    return NextResponse.json(commitment, { status: 201 });
  } catch (error) {
    console.error("POST /api/commitments error:", error);
    return NextResponse.json({ error: "Failed to create commitment" }, { status: 500 });
  }
}