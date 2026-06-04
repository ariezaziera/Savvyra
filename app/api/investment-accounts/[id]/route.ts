import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const acc = await prisma.investmentAccount.findUnique({ where: { id } });
    if (!acc || acc.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const updated = await prisma.investmentAccount.update({
      where: { id },
      data: {
        name:     body.name     ?? acc.name,
        platform: body.platform ?? acc.platform,
        type:     body.type     ?? acc.type,
        note:     body.note     ?? acc.note,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/investment-accounts/[id] error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const acc = await prisma.investmentAccount.findUnique({ where: { id } });
    if (!acc || acc.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.investmentAccount.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/investment-accounts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
