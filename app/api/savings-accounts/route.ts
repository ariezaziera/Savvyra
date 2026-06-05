import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accounts = await prisma.savingsAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: {
        savingsGoals: {
          where: { isArchived: false },
          select: { id: true, name: true, targetAmount: true },
        },
      },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("GET /api/savings-accounts error:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.name || !body.bank) {
      return NextResponse.json({ error: "Name and bank are required" }, { status: 400 });
    }

    const account = await prisma.savingsAccount.create({
      data: {
        userId,
        name: body.name,
        bank: body.bank,
        note: body.note || null,
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("POST /api/savings-accounts error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}