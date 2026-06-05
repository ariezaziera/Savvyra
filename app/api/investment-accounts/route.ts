import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accounts = await prisma.investmentAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: {
        investments: {
          where: { status: "ACTIVE" },
          select: {
            id: true, name: true, type: true, purpose: true,
            goldGrams: true, targetGoldGrams: true,
            transactions: { select: { type: true, amount: true } },
          },
        },
      },
    });

    const enriched = accounts.map((acc) => {
      const investments = acc.investments.map((inv) => {
        const currentValue = inv.transactions.reduce((sum, t) => {
          if (t.type === "INVESTMENT") return sum + t.amount;
          if (t.type === "INCOME")     return sum - t.amount;
          return sum;
        }, 0);
        return { ...inv, currentValue };
      });

      const totalCurrentValue = investments.reduce((s, i) => s + i.currentValue, 0);
      return { ...acc, investments, totalCurrentValue };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("GET /api/investment-accounts error:", error);
    return NextResponse.json({ error: "Failed to fetch investment accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.name || !body.platform) {
      return NextResponse.json({ error: "Name and platform are required" }, { status: 400 });
    }

    const account = await prisma.investmentAccount.create({
      data: {
        userId,
        name:     body.name,
        platform: body.platform,
        type:     body.type ?? "General",
        note:     body.note || null,
        isGold:   body.isGold ?? false,
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("POST /api/investment-accounts error:", error);
    return NextResponse.json({ error: "Failed to create investment account" }, { status: 500 });
  }
}