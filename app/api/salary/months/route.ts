// app/api/salary/months/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { calcSalary } from "@/lib/salaryCalc";

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const months = await prisma.salaryMonth.findMany({
    where: { userId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json(months);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Check if month already exists
  const existing = await prisma.salaryMonth.findUnique({
    where: { userId_month_year: { userId, month: body.month, year: body.year } },
  });
  if (existing) {
    return NextResponse.json({ error: "Month already exists" }, { status: 409 });
  }

  // Calculate breakdown — strictly follows SalaryInputs type from salaryCalc.ts
  const breakdown = calcSalary({
    basicSalary:      parseFloat(body.basicSalary) || 0,
    allowances:       body.allowances ?? [],
    customDeductions: body.customDeductions ?? [],
    otRate:           parseFloat(body.otRate) || 1.5,
    doublePayRate:    parseFloat(body.doublePayRate) || 2.0,
    hoursPerDay:      parseFloat(body.hoursPerDay) || 7.5,
    dailyRateFormula: body.dailyRateFormula ?? "basic/26",
    unpaidLeaveDays:  parseFloat(body.unpaidLeaveDays) || 0,
    annualLeaveDays:  parseFloat(body.annualLeaveDays) || 0,
    medicalLeaveDays: parseFloat(body.medicalLeaveDays) || 0,
    replacementDays:  parseFloat(body.replacementDays) || 0,
    otHours:          parseFloat(body.otHours) || 0,
    doublePayHours:   parseFloat(body.doublePayHours) || 0,
    month:            parseInt(body.month),
    year:             parseInt(body.year),
  });

  const record = await prisma.salaryMonth.create({
    data: {
      userId,
      month:            body.month,
      year:             body.year,
      basicSalary:      parseFloat(body.basicSalary) || 0,
      allowances:       body.allowances ?? [],
      customDeductions: body.customDeductions ?? [],
      otRate:           parseFloat(body.otRate) || 1.5,
      doublePayRate:    parseFloat(body.doublePayRate) || 2.0,
      epfRate:          11,    // statutory — Third Schedule (employee 11%)
      socsoRate:        0.5,   // statutory — PERKESO First Category (~0.5%)
      eisRate:          0.2,   // statutory — 0.2% employee share
      dailyRateFormula: body.dailyRateFormula ?? "basic/26",
      unpaidLeaveDays:  parseFloat(body.unpaidLeaveDays) || 0,
      annualLeaveDays:  parseFloat(body.annualLeaveDays) || 0,
      medicalLeaveDays: parseFloat(body.medicalLeaveDays) || 0,
      replacementDays:  parseFloat(body.replacementDays) || 0,
      otHours:          parseFloat(body.otHours) || 0,
      doublePayHours:   parseFloat(body.doublePayHours) || 0,
      grossSalary:      breakdown.grossSalary,
      epfAmount:        breakdown.epfAmount,
      socsoAmount:      breakdown.socsoAmount,
      eisAmount:        breakdown.eisAmount,
      customDeductTotal: breakdown.customDeductTotal,
      expectedNet:      breakdown.expectedNet,
      allocations:      body.allocations ?? [],
    },
  });

  return NextResponse.json(record, { status: 201 });
}