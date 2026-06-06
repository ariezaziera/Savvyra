/**
 * lib/salaryCalc.ts
 * Pure functions — no DB calls, safe to use on client and server.
 * Statutory tables imported from lib/statutoryRates.ts
 */

import {
  EPF_TABLE, EPF_TABLE_MAX_WAGES, EPF_EMPLOYEE_RATE,
  SOCSO_TABLE, SOCSO_WAGE_CEILING, SOCSO_MAX_CONTRIBUTION,
  EIS_WAGE_CEILING, EIS_EMPLOYEE_RATE, EIS_BRACKET_SIZE, EIS_MAX_CONTRIBUTION,
} from "@/lib/statutoryRates";

export type Allowance = {
  name: string;
  amount: number;
  cutOnAbsent: boolean;
  isReimbursement: boolean;
};

export type CustomDeduction = {
  name: string;
  amount: number;
};

export type SalaryInputs = {
  basicSalary: number;
  allowances: Allowance[];
  customDeductions: CustomDeduction[];
  otRate: number;
  doublePayRate: number;
  hoursPerDay: number;
  dailyRateFormula: "basic/26" | "basic/22" | string;
  unpaidLeaveDays: number;
  annualLeaveDays: number;
  medicalLeaveDays: number;
  replacementDays: number;
  otHours: number;
  doublePayHours: number;
  month: number;
  year: number;
  salaryBasis: "monthly" | "daily";
  daysWorked?: number;
  deductEPF: boolean;
  deductSOCSO: boolean;
  deductEIS: boolean;
};

export type SalaryBreakdown = {
  dailyRate: number;
  hourlyRate: number;
  periodDays: number;
  basicPay: number;
  allowanceTotal: number;
  allowanceCut: number;
  reimbursementTotal: number;
  unpaidLeaveDeduction: number;
  otEarnings: number;
  doublePayEarnings: number;
  grossSalary: number;
  epfBase: number;
  socsoEisBase: number;
  epfAmount: number;
  socsoAmount: number;
  eisAmount: number;
  customDeductTotal: number;
  totalDeductions: number;
  expectedNet: number;
};

// ─────────────────────────────────────────
// Pay period days
// ─────────────────────────────────────────
export function calcPeriodDays(month: number, year: number): number {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear  = month === 1 ? year - 1 : year;
  const start     = new Date(prevYear, prevMonth - 1, 26);
  const end       = new Date(year, month - 1, 25);
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
}

// ─────────────────────────────────────────
// Daily rate
// ─────────────────────────────────────────
export function calcDailyRate(basic: number, formula: string): number {
  if (formula === "basic/22") return basic / 22;
  return basic / 26;
}

// ─────────────────────────────────────────
// EPF — from statutoryRates table
// ─────────────────────────────────────────
export function calcEPF(wages: number): number {
  if (wages > EPF_TABLE_MAX_WAGES) return Math.ceil(wages * (EPF_EMPLOYEE_RATE / 100));
  for (const [max, contribution] of EPF_TABLE) {
    if (wages <= max) return contribution;
  }
  return Math.ceil(wages * (EPF_EMPLOYEE_RATE / 100));
}

// ─────────────────────────────────────────
// SOCSO — from statutoryRates table
// ─────────────────────────────────────────
export function calcSOCSO(wages: number): number {
  const capped = Math.min(wages, SOCSO_WAGE_CEILING);
  for (const [max, contribution] of SOCSO_TABLE) {
    if (capped <= max) return contribution;
  }
  return SOCSO_MAX_CONTRIBUTION;
}

// ─────────────────────────────────────────
// EIS — derived from constants
// ─────────────────────────────────────────
export function calcEIS(wages: number): number {
  const capped = Math.min(wages, EIS_WAGE_CEILING);
  for (let bracket = EIS_BRACKET_SIZE; bracket <= EIS_WAGE_CEILING; bracket += EIS_BRACKET_SIZE) {
    if (capped <= bracket) {
      return Math.round(bracket * (EIS_EMPLOYEE_RATE / 100) * 10) / 10;
    }
  }
  return EIS_MAX_CONTRIBUTION;
}

// ─────────────────────────────────────────
// Main calc
// ─────────────────────────────────────────
export function calcSalary(inputs: SalaryInputs): SalaryBreakdown {
  const {
    basicSalary, allowances, customDeductions,
    otRate, doublePayRate, hoursPerDay = 7.5,
    dailyRateFormula, unpaidLeaveDays,
    otHours, doublePayHours, month, year,
    salaryBasis = "monthly", daysWorked = 0,
    deductEPF = true, deductSOCSO = true, deductEIS = true,
  } = inputs;

  const periodDays = calcPeriodDays(month, year);
  const dailyRate  = calcDailyRate(basicSalary, dailyRateFormula);
  const hourlyRate = dailyRate / hoursPerDay;

  let basicPay: number;
  let unpaidLeaveDeduction = 0;

  if (salaryBasis === "daily") {
    basicPay = dailyRate * daysWorked;
  } else {
    unpaidLeaveDeduction = (basicSalary / periodDays) * unpaidLeaveDays;
    basicPay = basicSalary - unpaidLeaveDeduction;
  }

  let allowanceTotal     = 0;
  let allowanceCut       = 0;
  let reimbursementTotal = 0;

  for (const a of allowances) {
    if (a.isReimbursement) {
      if (a.cutOnAbsent && unpaidLeaveDays > 0) {
        const cut = (a.amount / periodDays) * unpaidLeaveDays;
        allowanceCut       += cut;
        reimbursementTotal += a.amount - cut;
      } else {
        reimbursementTotal += a.amount;
      }
    } else {
      if (a.cutOnAbsent && unpaidLeaveDays > 0) {
        const cut = (a.amount / periodDays) * unpaidLeaveDays;
        allowanceCut    += cut;
        allowanceTotal  += a.amount - cut;
      } else {
        allowanceTotal += a.amount;
      }
    }
  }

  const otEarnings        = hourlyRate * otRate * otHours;
  const doublePayEarnings = hourlyRate * doublePayRate * doublePayHours;
  const grossSalary       = basicPay + allowanceTotal + reimbursementTotal + otEarnings + doublePayEarnings;
  const epfBase           = basicPay;
  const socsoEisBase      = basicPay + allowanceTotal + otEarnings + doublePayEarnings;

  const epfAmount         = deductEPF    ? calcEPF(epfBase)        : 0;
  const socsoAmount       = deductSOCSO  ? calcSOCSO(socsoEisBase) : 0;
  const eisAmount         = deductEIS    ? calcEIS(socsoEisBase)   : 0;
  const customDeductTotal = customDeductions.reduce((s, d) => s + d.amount, 0);
  const totalDeductions   = epfAmount + socsoAmount + eisAmount + customDeductTotal;
  const expectedNet       = grossSalary - totalDeductions;

  return {
    dailyRate, hourlyRate, periodDays,
    basicPay, allowanceTotal, allowanceCut,
    reimbursementTotal, unpaidLeaveDeduction,
    otEarnings, doublePayEarnings, grossSalary,
    epfBase, socsoEisBase,
    epfAmount, socsoAmount, eisAmount,
    customDeductTotal, totalDeductions,
    expectedNet,
  };
}
