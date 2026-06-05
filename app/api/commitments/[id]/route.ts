import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// PATCH — update commitment master (name, amount, category, frequency etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const record = await prisma.commitment.findUnique({ where: { id } });
  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();

  const updated = await prisma.commitment.update({
    where: { id },
    data: {
      ...(body.name       !== undefined && { name: body.name }),
      ...(body.amount     !== undefined && { amount: parseFloat(body.amount) }),
      ...(body.category   !== undefined && { category: body.category }),
      ...(body.frequency  !== undefined && { frequency: body.frequency }),
      ...(body.dayOfMonth !== undefined && { dayOfMonth: body.dayOfMonth ? parseInt(body.dayOfMonth) : null }),
      ...(body.endDate    !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      ...(body.note       !== undefined && { note: body.note }),
      ...(body.isActive   !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE — delete commitment master (cascades to all instances)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const record = await prisma.commitment.findUnique({ where: { id } });
  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.commitment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
