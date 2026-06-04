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
          select: { id: true, name: true, type: true, principalAmount: true, currentValue: true, goldGrams: true, goldCurrentPricePerGram: true, goldSellingPricePerGram: true },
        },
      },
    });

    // Enrich with totals
    const enriched = accounts.map((acc) => {
      const totalInvested = acc.investments.reduce((s, i) => s + i.principalAmount, 0);
      const totalCurrentValue = acc.investments.reduce((s, i) => {
        if (i.type === "Gold" && i.goldGrams && i.goldCurrentPricePerGram) {
          return s + i.goldGrams * i.goldCurrentPricePerGram;
        }
        return s + i.currentValue;
      }, 0);
      return { ...acc, totalInvested, totalCurrentValue, gainLoss: totalCurrentValue - totalInvested };
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
    const account = await prisma.investmentAccount.create({
      data: {
        user:     { connect: { id: userId } },
        name:     body.name,
        platform: body.platform,
        type:     body.type ?? "General",
        note:     body.note || null,
      },
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("POST /api/investment-accounts error:", error);
    return NextResponse.json({ error: "Failed to create investment account" }, { status: 500 });
  }
}

