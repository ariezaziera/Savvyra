// app/api/salary/months/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { calcSalary } from "@/lib/salaryCalc";
import { TransactionType } from "@prisma/client";

// PATCH — update actual net OR allocations OR full recalculate
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const record = await prisma.salaryMonth.findUnique({ where: { id: params.id } });
  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Full recalculate edit — triggered when basicSalary is present in body
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
    });

    const updated = await prisma.salaryMonth.update({
      where: { id: params.id },
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
    });

    return NextResponse.json(updated);
  }

  // Partial update — actualNet and/or allocations only
  const updated = await prisma.salaryMonth.update({
    where: { id: params.id },
    data: {
      ...(body.actualNet !== undefined && { actualNet: parseFloat(body.actualNet) }),
      ...(body.allocations !== undefined && { allocations: body.allocations }),
    },
  });

  return NextResponse.json(updated);
}

// POST /api/salary/months/[id]/fulfill
// Called when user marks an allocation as paid/fulfilled
// Creates a transaction automatically
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json(); // { allocationIndex: number }
  const record = await prisma.salaryMonth.findUnique({ where: { id: params.id } });
  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allocations = record.allocations as any[];
  const alloc = allocations[body.allocationIndex];
  if (!alloc) return NextResponse.json({ error: "Allocation not found" }, { status: 404 });
  if (alloc.isFulfilled) return NextResponse.json({ error: "Already fulfilled" }, { status: 409 });

  // Map category to TransactionType
  const typeMap: Record<string, string> = {
    savings:     "SAVINGS",
    commitments: "COMMITMENT",
    spends:      "EXPENSE",
    debts:       "DEBT",
    investment:  "INVESTMENT",
  };

  const monthName = new Date(record.year, record.month - 1).toLocaleString("en-MY", { month: "long" });

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      title:       alloc.label || `${alloc.category} — ${monthName} ${record.year}`,
      category:    alloc.category.charAt(0).toUpperCase() + alloc.category.slice(1),
      amount:      parseFloat(alloc.amount),
      type: (typeMap[alloc.category] ?? "EXPENSE") as TransactionType,
      status:      "Completed",
      date:        new Date(),
      description: `Auto-created from salary plan — ${monthName} ${record.year}`,
    },
  });

  // Mark allocation as fulfilled
  allocations[body.allocationIndex] = {
    ...alloc,
    isFulfilled:   true,
    transactionId: transaction.id,
  };

  const updated = await prisma.salaryMonth.update({
    where: { id: params.id },
    data:  { allocations },
  });

  return NextResponse.json({ salaryMonth: updated, transaction });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await prisma.salaryMonth.findUnique({ where: { id: params.id } });
  if (!record || record.userId !== userId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.salaryMonth.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted" });
}