// lib/salaryCalc.ts
// Pure functions — no DB calls, safe to use on client and server

export type Allowance = {
  name: string;
  amount: number;
  cutOnAbsent: boolean; // if true, deduct proportionally on unpaid leave
};

export type CustomDeduction = {
  name: string;
  amount: number;
};

export type SalaryInputs = {
  basicSalary: number;
  allowances: Allowance[];
  epfRate: number;       // % e.g. 11
  socsoRate: number;     // % e.g. 0.5
  eisRate: number;       // % e.g. 0.2
  customDeductions: CustomDeduction[];
  otRate: number;        // multiplier e.g. 1.5
  doublePayRate: number; // multiplier e.g. 2.0
  dailyRateFormula: "basic/26" | "basic/22" | string;
  unpaidLeaveDays: number;
  annualLeaveDays: number;
  medicalLeaveDays: number;
  replacementDays: number;
  otHours: number;
  doublePayHours: number;
};

export type SalaryBreakdown = {
  dailyRate: number;
  hourlyRate: number;

  // Earnings
  basicPay: number;
  allowanceTotal: number;
  allowanceCut: number;    // deducted from cutOnAbsent allowances
  unpaidLeaveDeduction: number;
  otEarnings: number;
  doublePayEarnings: number;
  grossSalary: number;

  // Deductions
  epfAmount: number;
  socsoAmount: number;
  eisAmount: number;
  customDeductTotal: number;
  totalDeductions: number;

  // Final
  expectedNet: number;
};

export function calcDailyRate(basic: number, formula: string): number {
  if (formula === "basic/22") return basic / 22;
  return basic / 26; // default
}

export function calcSalary(inputs: SalaryInputs): SalaryBreakdown {
  const {
    basicSalary,
    allowances,
    epfRate,
    socsoRate,
    eisRate,
    customDeductions,
    otRate,
    doublePayRate,
    dailyRateFormula,
    unpaidLeaveDays,
    otHours,
    doublePayHours,
  } = inputs;

  const dailyRate = calcDailyRate(basicSalary, dailyRateFormula);
  const hourlyRate = dailyRate / 8;

  // Unpaid leave deduction from basic
  const unpaidLeaveDeduction = dailyRate * unpaidLeaveDays;
  const basicPay = basicSalary - unpaidLeaveDeduction;

  // Allowances — cut proportionally if unpaid leave and cutOnAbsent
  let allowanceTotal = 0;
  let allowanceCut = 0;
  const workingDays = parseFloat(dailyRateFormula.split("/")[1]) || 26;
  const absentFraction = unpaidLeaveDays / workingDays;

  for (const a of allowances) {
    if (a.cutOnAbsent && unpaidLeaveDays > 0) {
      const cut = a.amount * absentFraction;
      allowanceCut += cut;
      allowanceTotal += a.amount - cut;
    } else {
      allowanceTotal += a.amount;
    }
  }

  // OT
  const otEarnings = hourlyRate * otRate * otHours;
  const doublePayEarnings = hourlyRate * doublePayRate * doublePayHours;

  const grossSalary = basicPay + allowanceTotal + otEarnings + doublePayEarnings;

  const SOCSO_SALARY_CAP = 4000;
  const EIS_SALARY_CAP   = 4000;

  const epfAmount   = (epfRate / 100) * grossSalary;
  const socsoAmount = (socsoRate / 100) * Math.min(grossSalary, SOCSO_SALARY_CAP);
  const eisAmount   = (eisRate / 100) * Math.min(grossSalary, EIS_SALARY_CAP);
  const customDeductTotal = customDeductions.reduce((s, d) => s + d.amount, 0);

  const totalDeductions = epfAmount + socsoAmount + eisAmount + customDeductTotal;
  const expectedNet = grossSalary - totalDeductions;

  return {
    dailyRate,
    hourlyRate,
    basicPay,
    allowanceTotal,
    allowanceCut,
    unpaidLeaveDeduction,
    otEarnings,
    doublePayEarnings,
    grossSalary,
    epfAmount,
    socsoAmount,
    eisAmount,
    customDeductTotal,
    totalDeductions,
    expectedNet,
  };
}