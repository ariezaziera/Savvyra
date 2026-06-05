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

  const updated = await prisma.investment.update({
    where: { id },
    data: {
      name:               body.name               ?? inv.name,
      purpose:            body.purpose            ?? inv.purpose,
      type:               body.type               ?? inv.type,
      subType:            body.subType            ?? inv.subType,
      monthlyContribution: body.monthlyContribution !== undefined ? parseFloat(body.monthlyContribution) : inv.monthlyContribution,
      returnRate:          body.returnRate         !== undefined ? parseFloat(body.returnRate)          : inv.returnRate,
      startDate:           body.startDate    ? new Date(body.startDate)    : inv.startDate,
      maturityDate:        body.maturityDate ? new Date(body.maturityDate) : inv.maturityDate,
      status:              body.status       ?? inv.status,
      goldGrams:           body.goldGrams    !== undefined ? parseFloat(body.goldGrams)    : inv.goldGrams,
      targetGoldGrams:     body.targetGoldGrams !== undefined ? parseFloat(body.targetGoldGrams) : inv.targetGoldGrams,
      note:                body.note         ?? inv.note,
    },
  });

  return NextResponse.json(updated);
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