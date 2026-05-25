import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const investment = await prisma.investment.findUnique({ where: { id: params.id } });
  if (!investment || investment.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();

  const updated = await prisma.investment.update({
    where: { id: params.id },
    data: {
      name:                body.name                ?? investment.name,
      platform:            body.platform            ?? investment.platform,
      type:                body.type                ?? investment.type,
      principalAmount:     body.principalAmount     ? parseFloat(body.principalAmount)     : investment.principalAmount,
      currentValue:        body.currentValue        ? parseFloat(body.currentValue)        : investment.currentValue,
      monthlyContribution: body.monthlyContribution !== undefined ? parseFloat(body.monthlyContribution) : investment.monthlyContribution,
      returnRate:          body.returnRate          !== undefined ? parseFloat(body.returnRate)          : investment.returnRate,
      startDate:           body.startDate           ? new Date(body.startDate)             : investment.startDate,
      maturityDate:        body.maturityDate        ? new Date(body.maturityDate)          : investment.maturityDate,
      status:              body.status              ?? investment.status,
      note:                body.note               ?? investment.note,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const investment = await prisma.investment.findUnique({ where: { id: params.id } });
  if (!investment || investment.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.investment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}