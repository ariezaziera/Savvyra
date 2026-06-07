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
    include: { salaryPlanItems: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(months);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const existing = await prisma.salaryMonth.findUnique({
    where: { userId_month_year: { userId, month: body.month, year: body.year } },
  });
  if (existing) {
    return NextResponse.json({ error: "Month already exists" }, { status: 409 });
  }

  const breakdown = calcSalary({
    basicSalary:      parseFloat(body.basicSalary)      || 0,
    allowances:       body.allowances                   ?? [],
    customDeductions: body.customDeductions              ?? [],
    otRate:           parseFloat(body.otRate)            || 1.5,
    doublePayRate:    parseFloat(body.doublePayRate)     || 2.0,
    hoursPerDay:      parseFloat(body.hoursPerDay)       || 7.5,
    dailyRateFormula: body.dailyRateFormula              ?? "basic/26",
    unpaidLeaveDays:  parseFloat(body.unpaidLeaveDays)   || 0,
    annualLeaveDays:  parseFloat(body.annualLeaveDays)   || 0,
    medicalLeaveDays: parseFloat(body.medicalLeaveDays)  || 0,
    replacementDays:  parseFloat(body.replacementDays)   || 0,
    otHours:          parseFloat(body.otHours)           || 0,
    doublePayHours:   parseFloat(body.doublePayHours)    || 0,
    month:            parseInt(body.month),
    year:             parseInt(body.year),
    salaryBasis:      body.salaryBasis                   ?? "monthly",
    deductEPF:        body.deductEPF                     ?? true,
    deductSOCSO:      body.deductSOCSO                   ?? true,
    deductEIS:        body.deductEIS                     ?? true,
  });

  const record = await prisma.salaryMonth.create({
    data: {
      userId,
      month:             parseInt(body.month),
      year:              parseInt(body.year),
      basicSalary:       parseFloat(body.basicSalary)      || 0,
      allowances:        body.allowances                   ?? [],
      customDeductions:  body.customDeductions              ?? [],
      otRate:            parseFloat(body.otRate)            || 1.5,
      doublePayRate:     parseFloat(body.doublePayRate)     || 2.0,
      epfRate:           11,
      socsoRate:         0.5,
      eisRate:           0.2,
      dailyRateFormula:  body.dailyRateFormula              ?? "basic/26",
      hoursPerDay:       parseFloat(body.hoursPerDay)       || 7.5,
      unpaidLeaveDays:   parseFloat(body.unpaidLeaveDays)   || 0,
      annualLeaveDays:   parseFloat(body.annualLeaveDays)   || 0,
      medicalLeaveDays:  parseFloat(body.medicalLeaveDays)  || 0,
      replacementDays:   parseFloat(body.replacementDays)   || 0,
      otHours:           parseFloat(body.otHours)           || 0,
      doublePayHours:    parseFloat(body.doublePayHours)    || 0,
      grossSalary:       breakdown.grossSalary,
      epfAmount:         breakdown.epfAmount,
      socsoAmount:       breakdown.socsoAmount,
      eisAmount:         breakdown.eisAmount,
      customDeductTotal: breakdown.customDeductTotal,
      expectedNet:       breakdown.expectedNet,
    },
  });

  // Persist plan items as SalaryPlanItem records so History tab can read them
  const planItems: any[] = body.planItems ?? [];
  if (planItems.length > 0) {
    await prisma.salaryPlanItem.createMany({
      data: planItems.map((item: any, idx: number) => ({
        salaryMonthId: record.id,
        userId,
        label:      item.label      ?? "",
        amount:     parseFloat(item.amount) || 0,
        sourceType: item.sourceType ?? "CUSTOM",
        sourceId:   item.sourceId   ?? null,
        isIncluded: item.isIncluded ?? true,
        sortOrder:  item.sortOrder  ?? idx,
      })),
    });
  }

  // Return record with plan items included
  const full = await prisma.salaryMonth.findUnique({
    where: { id: record.id },
    include: { salaryPlanItems: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(full, { status: 201 });
}