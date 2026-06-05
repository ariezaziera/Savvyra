import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// POST /api/commitments/[id]/instance/pay
// Mark a commitment instance as paid — creates a transaction automatically
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: commitmentId } = await params;
  const body = await request.json();

  if (!body.instanceId) {
    return NextResponse.json({ error: "instanceId is required" }, { status: 400 });
  }

  const instance = await prisma.commitmentInstance.findUnique({
    where: { id: body.instanceId },
    include: { commitment: true },
  });

  if (!instance || instance.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (instance.status === "PAID")
    return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const now = new Date();

  // Create transaction + mark instance paid in one atomic operation
  const [transaction, updatedInstance] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId,
        title: instance.commitment.name,
        description: `Commitment payment — ${instance.month}/${instance.year}`,
        amount: instance.amount,
        type: "COMMITMENT",
        category: instance.commitment.category,
        date: body.date ? new Date(body.date) : now,
        commitmentInstanceId: instance.id,
        note: body.note ?? null,
      },
    }),
    prisma.commitmentInstance.update({
      where: { id: instance.id },
      data: {
        status: "PAID",
        paidAt: now,
      },
    }),
  ]);

  return NextResponse.json({ transaction, instance: updatedInstance });
}
