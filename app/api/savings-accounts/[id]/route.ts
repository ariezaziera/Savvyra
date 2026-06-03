import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const account = await prisma.savingsAccount.findUnique({ where: { id } });
  if (!account || account.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const updated = await prisma.savingsAccount.update({
    where: { id },
    data: {
      name:    body.name    ?? account.name,
      bank:    body.bank    ?? account.bank,
      balance: body.balance !== undefined ? parseFloat(body.balance) : account.balance,
      note:    body.note    ?? account.note,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const account = await prisma.savingsAccount.findUnique({ where: { id } });
  if (!account || account.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.savingsAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
