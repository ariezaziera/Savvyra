import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const transaction = await prisma.transaction.create({
      data: {
        title: body.title,
        category: body.category,
        amount: Number(body.amount),
        type: body.type,
        status: body.status,
        date: new Date(body.date),
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    await prisma.transaction.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({ message: "Transaction deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const transaction = await prisma.transaction.update({
      where: {
        id: Number(body.id),
      },
      data: {
        title: body.title,
        category: body.category,
        amount: Number(body.amount),
        type: body.type,
        status: body.status,
        date: new Date(body.date),
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}