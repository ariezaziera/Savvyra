import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { randomBytes } from "crypto";
import { redis } from "@/lib/redis";
import {
  verifyRegistrationResponse,
  generateRegistrationOptions,
} from "@simplewebauthn/server";

const RP_NAME   = "Savvyra";
const RP_ID     = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost";
const ORIGIN    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const CHALLENGE_TTL = 120;

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const challenge = randomBytes(32).toString("base64url");

  // ✅ Simpan challenge dalam Redis
  await redis.set(`webauthn:reg:${challenge}`, userId, { ex: CHALLENGE_TTL });

  const options = {
    challenge,
    rp: { name: RP_NAME, id: RP_ID },
    user: {
      id: Buffer.from(userId).toString("base64url"),
      name: user.email,
      displayName: user.name ?? user.email,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -257 },
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required",
      residentKey: "preferred",
    },
    timeout: 60000,
    attestation: "none",
  };

  return NextResponse.json(options);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { credentialId, publicKey, deviceName, challenge, attestationObject, clientDataJSON } = body;

  if (!credentialId || !publicKey || !challenge || !attestationObject || !clientDataJSON) {
    return NextResponse.json({ error: "Missing credential data" }, { status: 400 });
  }

  // ✅ Verify challenge dari Redis
  const key = `webauthn:reg:${challenge}`;
  const storedUserId = await redis.get(key);
  if (!storedUserId || storedUserId !== userId) {
    return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 400 });
  }
  await redis.del(key); // one-time use

  // ✅ Verify attestation response secara kriptografi
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: {
        id: credentialId,
        rawId: credentialId,
        response: {
          attestationObject,
          clientDataJSON,
        },
        type: "public-key",
        clientExtensionResults: {},
      },
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });
  } catch (err) {
    console.error("WebAuthn registration verification failed:", err);
    return NextResponse.json({ error: "Biometric verification failed" }, { status: 400 });
  }

  if (!verification.verified) {
    return NextResponse.json({ error: "Biometric verification failed" }, { status: 400 });
  }

  // Check duplicate
  const existing = await prisma.webAuthnCredential.findUnique({ where: { credentialId } });
  if (existing) {
    return NextResponse.json({ error: "Credential already registered" }, { status: 409 });
  }

  // Dalam register POST, guna verification result
  const { credentialPublicKey, counter } = verification.registrationInfo!;

  await prisma.webAuthnCredential.create({
    data: {
      userId,
      credentialId,
      publicKey: Buffer.from(credentialPublicKey).toString("base64url"), // ✅ dari server
      counter,  // ✅ simpan counter dari verification
      deviceName: deviceName ?? "My Device",
    },
  });

  return NextResponse.json({ success: true, credentialId });
}

export async function DELETE(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { credentialId } = await request.json();

  await prisma.webAuthnCredential.deleteMany({
    where: { userId, credentialId },
  });

  return NextResponse.json({ success: true });
}