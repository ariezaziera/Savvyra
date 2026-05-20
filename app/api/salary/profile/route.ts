// app/api/salary/profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.salaryProfile.findUnique({ where: { userId } });
  return NextResponse.json(profile ?? null);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const data = {
    basicSalary:      parseFloat(body.basicSalary),
    allowances:       body.allowances       ?? [],
    epfRate:          parseFloat(body.epfRate)      || 11,
    socsoRate:        parseFloat(body.socsoRate)     || 0.5,
    eisRate:          parseFloat(body.eisRate)       || 0.2,
    customDeductions: body.customDeductions  ?? [],
    otRate:           parseFloat(body.otRate)        || 1.5,
    doublePayRate:    parseFloat(body.doublePayRate) || 2.0,
    dailyRateFormula: body.dailyRateFormula  ?? "basic/26",
  };

  const profile = await prisma.salaryProfile.upsert({
    where:  { userId },
    create: { userId, ...data },
    update: data,
  });

  return NextResponse.json(profile);
}