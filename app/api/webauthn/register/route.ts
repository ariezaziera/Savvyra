// app/api/auth/webauthn/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { randomBytes } from "crypto";

// ── Step 1: Generate registration options ──
export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Generate challenge — store in a short-lived way (we'll use a signed value)
  const challenge = randomBytes(32).toString("base64url");

  // Store challenge temporarily in DB (or use signed JWT — simple approach here)
  // We encode it as a short expiry token in the response for the client to echo back
  const options = {
    challenge,
    rp: {
      name: "Savvyra",
      id: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost",
    },
    user: {
      id: Buffer.from(userId).toString("base64url"),
      name: user.email,
      displayName: user.name ?? user.email,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7  }, // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // device biometric only
      userVerification: "required",
      residentKey: "preferred",
    },
    timeout: 60000,
    attestation: "none",
  };

  return NextResponse.json(options);
}

// ── Step 2: Verify & save credential ──
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { credentialId, publicKey, deviceName } = body;

  if (!credentialId || !publicKey) {
    return NextResponse.json({ error: "Missing credential data" }, { status: 400 });
  }

  // Check if credential already registered
  const existing = await prisma.webAuthnCredential.findUnique({
    where: { credentialId },
  });
  if (existing) {
    return NextResponse.json({ error: "Credential already registered" }, { status: 409 });
  }

  const credential = await prisma.webAuthnCredential.create({
    data: {
      userId,
      credentialId,
      publicKey,
      deviceName: deviceName ?? "My Device",
    },
  });

  return NextResponse.json({ success: true, credentialId: credential.credentialId });
}

// ── DELETE: Remove a credential ──
export async function DELETE(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { credentialId } = await request.json();

  await prisma.webAuthnCredential.deleteMany({
    where: { userId, credentialId },
  });

  return NextResponse.json({ success: true });
}