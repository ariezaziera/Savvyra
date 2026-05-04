import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function getUserIdFromRequest(req: Request | NextRequest): string | null {
  // Try to get token from cookies (assuming you set it as 'token' cookie)
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const tokenCookie = cookieHeader.split("; ").find(row => row.startsWith("token="));
    if (tokenCookie) {
      const token = tokenCookie.split("=")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
      } catch (err) {
        console.error("JWT verification failed:", err);
        return null;
      }
    }
  }

  // Fallback: Authorization header (Bearer token)
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    } catch {
      return null;
    }
  }

  return null;
}