import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { calcSalary } from "@/lib/salaryCalc";

// PATCH — full recalculate OR partial update (actualNet, bankBalance, etc.)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const record = await prisma.salaryMonth.findUnique({ where: { id } });
  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Full recalculate — triggered when basicSalary is present in body
  if (body.basicSalary !== undefined) {
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
      month:            record.month,
      year:             record.year,
      salaryBasis:      body.salaryBasis ?? "monthly",
      deductEPF:        body.deductEPF ?? true,
      deductSOCSO:      body.deductSOCSO ?? true,
      deductEIS:        body.deductEIS ?? true,
    });

    const updated = await prisma.salaryMonth.update({
      where: { id },
      data: {
        basicSalary:       parseFloat(body.basicSalary) || 0,
        allowances:        body.allowances ?? [],
        customDeductions:  body.customDeductions ?? [],
        otRate:            parseFloat(body.otRate) || 1.5,
        doublePayRate:     parseFloat(body.doublePayRate) || 2.0,
        hoursPerDay:       parseFloat(body.hoursPerDay) || 7.5,
        dailyRateFormula:  body.dailyRateFormula ?? "basic/26",
        unpaidLeaveDays:   parseFloat(body.unpaidLeaveDays) || 0,
        annualLeaveDays:   parseFloat(body.annualLeaveDays) || 0,
        medicalLeaveDays:  parseFloat(body.medicalLeaveDays) || 0,
        replacementDays:   parseFloat(body.replacementDays) || 0,
        otHours:           parseFloat(body.otHours) || 0,
        doublePayHours:    parseFloat(body.doublePayHours) || 0,
        grossSalary:       breakdown.grossSalary,
        epfAmount:         breakdown.epfAmount,
        socsoAmount:       breakdown.socsoAmount,
        eisAmount:         breakdown.eisAmount,
        customDeductTotal: breakdown.customDeductTotal,
        expectedNet:       breakdown.expectedNet,
      },
      include: { salaryPlanItems: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json(updated);
  }

  // Partial update — actualNet, bankBalance, fixedReserve, usableBalance, plan flags
  const updated = await prisma.salaryMonth.update({
    where: { id },
    data: {
      ...(body.actualNet        !== undefined && { actualNet:        parseFloat(body.actualNet) }),
      ...(body.bankBalance      !== undefined && { bankBalance:      parseFloat(body.bankBalance) }),
      ...(body.fixedReserve     !== undefined && { fixedReserve:     parseFloat(body.fixedReserve) }),
      ...(body.usableBalance    !== undefined && { usableBalance:    parseFloat(body.usableBalance) }),
      ...(body.isPlanFinalized  !== undefined && { isPlanFinalized:  body.isPlanFinalized }),
      ...(body.isMarkedReceived !== undefined && { isMarkedReceived: body.isMarkedReceived }),
      ...(body.planItems        !== undefined && { planItems:        body.planItems }),
    },
    include: { salaryPlanItems: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const record = await prisma.salaryMonth.findUnique({ where: { id } });
  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.salaryMonth.delete({ where: { id } });
  return NextResponse.json({ success: true });
}