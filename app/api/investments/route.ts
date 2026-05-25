import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const investments = await prisma.investment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(investments);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const investment = await prisma.investment.create({
    data: {
      userId,
      name:                body.name,
      platform:            body.platform            ?? null,
      type:                body.type                ?? "General",
      principalAmount:     parseFloat(body.principalAmount),
      currentValue:        parseFloat(body.currentValue        ?? body.principalAmount),
      monthlyContribution: parseFloat(body.monthlyContribution ?? 0),
      returnRate:          parseFloat(body.returnRate          ?? 0),
      startDate:           body.startDate    ? new Date(body.startDate)    : new Date(),
      maturityDate:        body.maturityDate ? new Date(body.maturityDate) : null,
      status:              body.status       ?? "ACTIVE",
      note:                body.note         ?? null,
    },
  });

  return NextResponse.json(investment, { status: 201 });
}