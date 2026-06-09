import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const record = await prisma.salaryMonth.findUnique({ where: { id } });

  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (record.isMarkedReceived)
    return NextResponse.json({ error: "Already marked received" }, { status: 400 });

  const now       = new Date();
  const actualNet = record.actualNet ?? record.expectedNet;

  // Create salary income transaction ONLY — plan items are handled individually
  await prisma.transaction.create({
    data: {
      userId,
      title:         `Salary — ${new Date(record.year, record.month - 1).toLocaleString("en-MY", { month: "long", year: "numeric" })}`,
      description:   "Monthly salary received",
      amount:        actualNet,
      type:          "INCOME",
      category:      "Salary",
      date:          now,
      salaryMonthId: record.id,
    },
  });

  const updated = await prisma.salaryMonth.update({
    where: { id },
    data:  { isMarkedReceived: true },
  });

  return NextResponse.json(updated);
}