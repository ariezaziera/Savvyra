import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { transactionSchema } from "@/lib/schemas"; // ✅

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // ✅ Zod validation
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, amount, type, category, date, status, description, savingsGoalId } = parsed.data;

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount,
        type,
        category,
        date: new Date(date),
        status: status ?? "Completed",
        description: description ?? null,
        savingsGoalId: savingsGoalId ?? null,
        userId,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 20;
    const skip  = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: limit,
        skip,
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // ✅ Zod validation — validate fields except id
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.transaction.findFirst({
      where: { id: String(body.id), userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const { title, amount, type, category, date, status, description, savingsGoalId } = parsed.data;

    const transaction = await prisma.transaction.update({
      where: { id: String(body.id) },
      data: {
        title,
        amount,
        type,
        category,
        date: new Date(date),
        status: status ?? existing.status,
        description: description ?? null,
        savingsGoalId: savingsGoalId ?? null,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("PUT /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();

    await prisma.transaction.deleteMany({
      where: { id: String(id), userId },
    });

    return NextResponse.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("DELETE /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}