// app/api/notifications/push/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// GET — VAPID public key for client
export async function GET() {
  return NextResponse.json({
    publicKey: process.env.VAPID_PUBLIC_KEY ?? "",
  });
}

// POST — save push subscription
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { endpoint, keys, deviceName } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth)
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, deviceName },
    update: { userId, p256dh: keys.p256dh, auth: keys.auth, deviceName },
  });

  return NextResponse.json({ success: true });
}

// DELETE — remove push subscription
export async function DELETE(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = await request.json();
  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
  return NextResponse.json({ success: true });
}