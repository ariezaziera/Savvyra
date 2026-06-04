import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

function calcGoldCurrentValue(inv: any): number {
  if (inv.type === "Gold" && inv.goldGrams && inv.goldCurrentPricePerGram) {
    return inv.goldGrams * inv.goldCurrentPricePerGram;
  }
  return inv.currentValue ?? inv.principalAmount;
}

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const investments = await prisma.investment.findMany({
    where: { userId },
    orderBy: [{ type: "asc" }, { createdAt: "desc" }],
  });

  // Auto-compute currentValue for gold holdings
  const enriched = investments.map((inv) => ({
    ...inv,
    currentValue: calcGoldCurrentValue(inv),
    goldSellingValue: inv.type === "Gold" && inv.goldGrams && inv.goldSellingPricePerGram
      ? inv.goldGrams * inv.goldSellingPricePerGram
      : null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const isGold = body.type === "Gold";

  // For gold: compute principalAmount from grams × buy price
  const principalAmount = isGold && body.goldGrams && body.goldBuyPricePerGram
    ? parseFloat(body.goldGrams) * parseFloat(body.goldBuyPricePerGram)
    : parseFloat(body.principalAmount ?? 0);

  const currentValue = isGold && body.goldGrams && body.goldCurrentPricePerGram
    ? parseFloat(body.goldGrams) * parseFloat(body.goldCurrentPricePerGram)
    : parseFloat(body.currentValue ?? principalAmount);

  const investment = await prisma.investment.create({
    data: {
      user: { connect: { id: userId } },
      name:                   body.name,
      platform:               body.platform               ?? null,
      type:                   body.type                   ?? "General",
      subType:                body.subType                ?? null,
      principalAmount,
      currentValue,
      monthlyContribution:    parseFloat(body.monthlyContribution ?? 0),
      returnRate:             parseFloat(body.returnRate          ?? 0),
      startDate:              body.startDate    ? new Date(body.startDate)    : new Date(),
      maturityDate:           body.maturityDate ? new Date(body.maturityDate) : null,
      status:                 body.status       ?? "ACTIVE",
      note:                   body.note         ?? null,
      goldGrams:              isGold ? parseFloat(body.goldGrams             ?? 0) : null,
      goldBuyPricePerGram:    isGold ? parseFloat(body.goldBuyPricePerGram   ?? 0) : null,
      goldCurrentPricePerGram:isGold ? parseFloat(body.goldCurrentPricePerGram ?? 0) : null,
      goldSellingPricePerGram:isGold ? parseFloat(body.goldSellingPricePerGram ?? 0) : null,
    },
  });

  return NextResponse.json({
    ...investment,
    goldSellingValue: isGold && investment.goldGrams && investment.goldSellingPricePerGram
      ? investment.goldGrams * investment.goldSellingPricePerGram
      : null,
  }, { status: 201 });
}
