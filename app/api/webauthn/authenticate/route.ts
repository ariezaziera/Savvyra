import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { redis } from "@/lib/redis";

const JWT_SECRET = process.env.JWT_SECRET!;
const CHALLENGE_TTL = 120; // 2 minit

// ── Step 1: Get authentication options ──
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  let allowCredentials: { type: string; id: string }[] = [];

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { webAuthnCredentials: { select: { credentialId: true } } },
    });
    if (user?.webAuthnCredentials?.length) {
      allowCredentials = user.webAuthnCredentials.map((c) => ({
        type: "public-key",
        id: c.credentialId,
      }));
    }
  }

  const challenge = randomBytes(32).toString("base64url");

  // ✅ Simpan challenge dalam Redis dengan TTL 2 minit
  await redis.set(`webauthn:challenge:${challenge}`, "1", { ex: CHALLENGE_TTL });

  const options = {
    challenge,
    rpId: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost",
    allowCredentials,
    userVerification: "required",
    timeout: 60000,
  };

  return NextResponse.json(options);
}

// ── Step 2: Verify authentication ──
export async function POST(request: Request) {
  const body = await request.json();
  const { credentialId, challenge } = body;

  if (!credentialId || !challenge) {
    return NextResponse.json({ error: "Missing credential or challenge" }, { status: 400 });
  }

  // ✅ Verify challenge wujud dan belum dipakai
  const key = `webauthn:challenge:${challenge}`;
  const valid = await redis.get(key);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 400 });
  }

  // ✅ Padam terus — one-time use, elak replay attack
  await redis.del(key);

  // ✅ Fetch credential dulu sebelum verify
  const credential = await prisma.webAuthnCredential.findUnique({
    where: { credentialId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!credential) {
    return NextResponse.json({ error: "Credential not found." }, { status: 404 });
  }

  // ✅ Verify assertion signature
  const { verifyAuthenticationResponse } = await import("@simplewebauthn/server");

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: {
        id: credentialId,
        rawId: credentialId,
        response: {
          authenticatorData: body.authenticatorData,
          clientDataJSON:    body.clientDataJSON,
          signature:         body.signature,
          userHandle:        body.userHandle ?? null,
        },
        type: "public-key",
        clientExtensionResults: {},
      },
      expectedChallenge: challenge,
      expectedOrigin:    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      expectedRPID:      process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost",
      authenticator: {
        credentialID:        new Uint8Array(Buffer.from(credential.credentialId, "base64url")),
        credentialPublicKey: new Uint8Array(Buffer.from(credential.publicKey, "base64url")),
        counter:             credential.counter,
      },
    });
  } catch (err) {
    console.error("WebAuthn auth verification failed:", err);
    return NextResponse.json({ error: "Biometric verification failed" }, { status: 400 });
  }

  if (!verification.verified) {
    return NextResponse.json({ error: "Biometric verification failed" }, { status: 400 });
  }

  // Dalam authenticate POST, selepas verify
  await prisma.webAuthnCredential.update({
    where: { credentialId },
    data: {
      lastUsed: new Date(),
      counter: verification.authenticationInfo.newCounter, // ✅ guna nilai dari verify
    },
  });

  const token = jwt.sign(
    { userId: credential.user.id, email: credential.user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const response = NextResponse.json({
    success: true,
    user: {
      id: credential.user.id,
      email: credential.user.email,
      name: credential.user.name,
    },
  });

  response.cookies.set("savvyra_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}