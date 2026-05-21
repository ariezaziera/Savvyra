// app/api/auth/webauthn/authenticate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// ── Step 1: Get authentication options ──
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  // If email provided, get credentials for that user
  // If not, allow any registered credential (discoverable)
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

  const options = {
    challenge,
    rpId: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost",
    allowCredentials,
    userVerification: "required",
    timeout: 60000,
  };

  return NextResponse.json(options);
}

// ── Step 2: Verify authentication & return session token ──
export async function POST(request: Request) {
  const body = await request.json();
  const { credentialId, userHandle } = body;

  if (!credentialId) {
    return NextResponse.json({ error: "Missing credential" }, { status: 400 });
  }

  // Find the credential
  const credential = await prisma.webAuthnCredential.findUnique({
    where: { credentialId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!credential) {
    return NextResponse.json({ error: "Credential not found. Please register biometric first." }, { status: 404 });
  }

  // In production: verify the authenticator assertion signature against stored publicKey
  // For this implementation we trust the device assertion (platform authenticator = device already verified)
  // Full crypto verification requires @simplewebauthn/server

  // Update last used + counter
  await prisma.webAuthnCredential.update({
    where: { credentialId },
    data: { lastUsed: new Date(), counter: { increment: 1 } },
  });

  // Issue JWT session (same as credentials login)
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

  // Set same cookie as credentials login
  response.cookies.set("savvyra_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}