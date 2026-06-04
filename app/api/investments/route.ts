import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

const sf = (val: any, fallback = 0): number => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

function calcGoldCurrentValue(inv: any): number {
  if (inv.type === "Gold" && inv.goldGrams && inv.goldCurrentPricePerGram) {
    return inv.goldGrams * inv.goldCurrentPricePerGram;
  }
  return inv.currentValue ?? inv.principalAmount ?? 0;
}

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { createdAt: "desc" }],
      include: { investmentAccount: true },
    });

    const enriched = investments.map((inv) => ({
      ...inv,
      currentValue: calcGoldCurrentValue(inv),
      goldSellingValue: inv.type === "Gold" && inv.goldGrams && inv.goldSellingPricePerGram
        ? inv.goldGrams * inv.goldSellingPricePerGram
        : null,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("GET /api/investments error:", error);
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const isGold = body.type === "Gold";

    const goldGrams              = isGold ? sf(body.goldGrams) : null;
    const goldBuyPricePerGram    = isGold ? sf(body.goldBuyPricePerGram) : null;
    const goldCurrentPricePerGram= isGold ? sf(body.goldCurrentPricePerGram) : null;
    const goldSellingPricePerGram= isGold ? sf(body.goldSellingPricePerGram) : null;

    const principalAmount = isGold && goldGrams && goldBuyPricePerGram
      ? goldGrams * goldBuyPricePerGram
      : sf(body.principalAmount);

    const currentValue = isGold && goldGrams && goldCurrentPricePerGram
      ? goldGrams * goldCurrentPricePerGram
      : sf(body.currentValue, principalAmount);

    const investment = await prisma.investment.create({
      data: {
        user:               { connect: { id: userId } },
        ...(body.investmentAccountId ? { investmentAccount: { connect: { id: body.investmentAccountId } } } : {}),
        name:               body.name,
        platform:           body.platform    || null,
        type:               body.type        ?? "General",
        subType:            body.subType     || null,
        principalAmount,
        currentValue,
        monthlyContribution: sf(body.monthlyContribution),
        returnRate:          sf(body.returnRate),
        startDate:           body.startDate    ? new Date(body.startDate)    : new Date(),
        maturityDate:        body.maturityDate ? new Date(body.maturityDate) : null,
        status:              body.status       ?? "ACTIVE",
        note:                body.note         || null,
        goldGrams,
        goldBuyPricePerGram,
        goldCurrentPricePerGram,
        goldSellingPricePerGram,
      },
      include: { investmentAccount: true },
    });

    return NextResponse.json({
      ...investment,
      goldSellingValue: isGold && investment.goldGrams && investment.goldSellingPricePerGram
        ? investment.goldGrams * investment.goldSellingPricePerGram
        : null,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/investments error:", error);
    return NextResponse.json({ error: "Failed to create investment" }, { status: 500 });
  }
}
