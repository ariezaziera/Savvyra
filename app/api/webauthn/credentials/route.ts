// app/api/auth/webauthn/credentials/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const credentials = await prisma.webAuthnCredential.findMany({
    where: { userId },
    select: {
      id: true,
      credentialId: true,
      deviceName: true,
      createdAt: true,
      lastUsed: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(credentials);
}