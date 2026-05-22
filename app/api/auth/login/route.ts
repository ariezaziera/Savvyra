import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { loginRatelimit } from "@/lib/ratelimit";
import { loginSchema } from "@/lib/schemas";

const TOKEN_MAX_AGE_SECONDS = 30 * 60; // 30 minutes in seconds

export async function POST(request: Request) {

  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success, remaining } = await loginRatelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait a minute." },
      { 
        status: 429,
        headers: { "Retry-After": "60" },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

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
      { expiresIn: TOKEN_MAX_AGE_SECONDS }
    );

    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set("savvyra_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS,
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