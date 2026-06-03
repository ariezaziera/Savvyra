import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const inv = await prisma.investment.findUnique({ where: { id } });
  if (!inv || inv.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const isGold = (body.type ?? inv.type) === "Gold";

  const goldGrams              = isGold ? parseFloat(body.goldGrams              ?? inv.goldGrams              ?? 0) : null;
  const goldBuyPricePerGram    = isGold ? parseFloat(body.goldBuyPricePerGram    ?? inv.goldBuyPricePerGram    ?? 0) : null;
  const goldCurrentPricePerGram= isGold ? parseFloat(body.goldCurrentPricePerGram?? inv.goldCurrentPricePerGram?? 0) : null;
  const goldSellingPricePerGram= isGold ? parseFloat(body.goldSellingPricePerGram?? inv.goldSellingPricePerGram?? 0) : null;

  const principalAmount = isGold && goldGrams && goldBuyPricePerGram
    ? goldGrams * goldBuyPricePerGram
    : body.principalAmount !== undefined ? parseFloat(body.principalAmount) : inv.principalAmount;

  const currentValue = isGold && goldGrams && goldCurrentPricePerGram
    ? goldGrams * goldCurrentPricePerGram
    : body.currentValue !== undefined ? parseFloat(body.currentValue) : inv.currentValue;

  const updated = await prisma.investment.update({
    where: { id },
    data: {
      name:                    body.name                   ?? inv.name,
      platform:                body.platform               ?? inv.platform,
      type:                    body.type                   ?? inv.type,
      subType:                 body.subType                ?? inv.subType,
      principalAmount,
      currentValue,
      monthlyContribution:     body.monthlyContribution !== undefined ? parseFloat(body.monthlyContribution) : inv.monthlyContribution,
      returnRate:              body.returnRate           !== undefined ? parseFloat(body.returnRate)           : inv.returnRate,
      startDate:               body.startDate    ? new Date(body.startDate)    : inv.startDate,
      maturityDate:            body.maturityDate ? new Date(body.maturityDate) : inv.maturityDate,
      status:                  body.status  ?? inv.status,
      note:                    body.note    ?? inv.note,
      goldGrams,
      goldBuyPricePerGram,
      goldCurrentPricePerGram,
      goldSellingPricePerGram,
    },
  });

  return NextResponse.json({
    ...updated,
    goldSellingValue: isGold && updated.goldGrams && updated.goldSellingPricePerGram
      ? updated.goldGrams * updated.goldSellingPricePerGram
      : null,
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const inv = await prisma.investment.findUnique({ where: { id } });
  if (!inv || inv.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.investment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
