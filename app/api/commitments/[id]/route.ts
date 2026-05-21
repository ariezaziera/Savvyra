// app/api/commitments/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// PATCH — update (including mark as paid)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await prisma.commitment.findUnique({ where: { id: params.id } });
  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();

  const updated = await prisma.commitment.update({
    where: { id: params.id },
    data: {
      ...(body.name      !== undefined && { name: body.name }),
      ...(body.amount    !== undefined && { amount: parseFloat(body.amount) }),
      ...(body.dueDate   !== undefined && { dueDate: new Date(body.dueDate) }),
      ...(body.category  !== undefined && { category: body.category }),
      ...(body.frequency !== undefined && { frequency: body.frequency }),
      ...(body.note      !== undefined && { note: body.note }),
      ...(body.isPaid    !== undefined && { isPaid: body.isPaid }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await prisma.commitment.findUnique({ where: { id: params.id } });
  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.commitment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}