import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// PUT /api/salary/months/[id]/plan-items
// Replace all plan items for a salary month (for re-planning existing months)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const record = await prisma.salaryMonth.findUnique({ where: { id } });

  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const planItems: any[] = body.planItems ?? [];

  // Delete existing plan items that are not yet paid (sortOrder !== -1)
  await prisma.salaryPlanItem.deleteMany({
    where: { salaryMonthId: id, sortOrder: { not: -1 } },
  });

  // Create new ones
  if (planItems.length > 0) {
    await prisma.salaryPlanItem.createMany({
      data: planItems.map((item: any, idx: number) => ({
        salaryMonthId: id,
        userId,
        label:      item.label      ?? "",
        amount:     parseFloat(item.amount) || 0,
        sourceType: item.sourceType ?? "CUSTOM",
        sourceId:   item.sourceId   ?? null,
        isIncluded: item.isIncluded ?? true,
        sortOrder:  item.sortOrder  ?? idx,
      })),
    });
  }

  const updated = await prisma.salaryMonth.findUnique({
    where: { id },
    include: { salaryPlanItems: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(updated);
}
