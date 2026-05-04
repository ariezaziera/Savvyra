import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const transaction = await prisma.transaction.create({
      data: {
        title: body.title,
        category: body.category,
        description: body.description,
        amount: Number(body.amount),
        type: body.type,
        status: body.status,
        date: new Date(body.date),
        userId,
        savingsGoalId: body.savingsGoalId || null,
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
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    await prisma.transaction.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("DELETE /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const transaction = await prisma.transaction.update({
      where: { id: String(body.id) },
      data: {
        title: body.title,
        category: body.category,
        amount: Number(body.amount),
        type: body.type,
        status: body.status,
        date: new Date(body.date),
        savingsGoalId: body.savingsGoalId || null,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("PUT /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}