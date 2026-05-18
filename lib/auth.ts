import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getUserIdFromRequest(
  req: Request | NextRequest
): Promise<string | null> {

  // ── 1. Try custom JWT cookie (credentials login) ──
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const tokenCookie = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("savvyra_token="));
    if (tokenCookie) {
      const token = tokenCookie.split("=").slice(1).join("=");
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
      } catch (err) {
        console.error("JWT verification failed:", err);
      }
    }
  }

  // ── 2. Try NextAuth session (Google login) ──
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      return user?.id ?? null;
    }
  } catch (err) {
    console.error("NextAuth session check failed:", err);
  }

  return null;
}