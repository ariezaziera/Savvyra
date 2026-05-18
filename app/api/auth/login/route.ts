import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const TOKEN_MAX_AGE_SECONDS = 5 * 60; // 5 minutes — must match JWT expiresIn

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ── Hard fail if secret is missing — never fall back to a weak default ──
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { message: "This account uses a different sign-in method." },
        { status: 400 }
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: TOKEN_MAX_AGE_SECONDS } // ✅ number in seconds, not "5m" string
    );

    const response = NextResponse.json({ message: "Login successful" });

    response.cookies.set("savvyra_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS, // ✅ matches JWT — was 10 (10 seconds!) before
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}