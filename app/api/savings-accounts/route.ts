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
    const balance = parseFloat(body.balance);

    const account = await prisma.savingsAccount.create({
      data: {
        user:    { connect: { id: userId } },
        name:    body.name,
        bank:    body.bank,
        balance: isNaN(balance) ? 0 : balance,
        note:    body.note || null,
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("POST /api/savings-accounts error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
