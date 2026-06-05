import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

const sf = (val: any, fallback = 0): number => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

// Compute current value from linked transactions
function computeValue(transactions: { type: string; amount: number }[]): number {
  return transactions.reduce((sum, t) => {
    if (t.type === "INVESTMENT")     return sum + t.amount;   // funding in
    if (t.type === "INCOME")         return sum - t.amount;   // withdrawal out
    return sum;
  }, 0);
}

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        investmentAccount: true,
        transactions: { select: { type: true, amount: true } },
      },
    });

    const enriched = investments.map((inv) => {
      const currentValue = computeValue(inv.transactions);
      return { ...inv, currentValue };
    });

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
    if (!body.name || !body.investmentAccountId) {
      return NextResponse.json({ error: "Name and investment account are required" }, { status: 400 });
    }

    const investment = await prisma.investment.create({
      data: {
        userId,
        investmentAccountId: body.investmentAccountId,
        name:               body.name,
        purpose:            body.purpose             || null,
        type:               body.type                ?? "General",
        subType:            body.subType             || null,
        monthlyContribution: sf(body.monthlyContribution),
        returnRate:          sf(body.returnRate),
        startDate:           body.startDate    ? new Date(body.startDate)    : new Date(),
        maturityDate:        body.maturityDate ? new Date(body.maturityDate) : null,
        status:              body.status       ?? "ACTIVE",
        goldGrams:           body.goldGrams    ? sf(body.goldGrams)          : null,
        targetGoldGrams:     body.targetGoldGrams ? sf(body.targetGoldGrams) : null,
        note:                body.note         || null,
      },
      include: { investmentAccount: true },
    });

    return NextResponse.json({ ...investment, currentValue: 0 }, { status: 201 });
  } catch (error) {
    console.error("POST /api/investments error:", error);
    return NextResponse.json({ error: "Failed to create investment" }, { status: 500 });
  }
}