// lib/salaryCalc.ts

// Pure functions — no DB calls, safe to use on client and server

export type Allowance = {
  name: string;
  amount: number;
  cutOnAbsent: boolean; // if true, deduct proportionally on unpaid leave
  isReimbursement: boolean; // if true, excluded from EPF/SOCSO/EIS base
};

export type CustomDeduction = {
  name: string;
  amount: number;
};

export type SalaryInputs = {
  basicSalary: number;
  allowances: Allowance[];
  customDeductions: CustomDeduction[];
  otRate: number; // multiplier e.g. 1.5
  doublePayRate: number; // multiplier e.g. 2.0
  hoursPerDay: number; // e.g. 7.5 or 8
  dailyRateFormula: "basic/26" | "basic/22" | string;
  unpaidLeaveDays: number;
  annualLeaveDays: number;
  medicalLeaveDays: number;
  replacementDays: number;
  otHours: number;
  doublePayHours: number;
  month: number; // 1-12
  year: number;
  salaryBasis: "monthly" | "daily";   // monthly = fixed, daily = rate × days worked
  daysWorked?: number;                 // only used when salaryBasis = "daily"
  deductEPF: boolean;                  // false = exempt
  deductSOCSO: boolean;
  deductEIS: boolean;
};

export type SalaryBreakdown = {
  dailyRate: number;
  hourlyRate: number;
  periodDays: number;

  // Earnings
  basicPay: number;
  allowanceTotal: number;
  allowanceCut: number;
  reimbursementTotal: number; // excluded from statutory base
  unpaidLeaveDeduction: number;
  otEarnings: number;
  doublePayEarnings: number;
  grossSalary: number; // includes reimbursements (for display)

  // FIX: separate bases exposed for transparency
  epfBase: number;      // basic only (after unpaid leave deduction)
  socsoEisBase: number; // basic + taxable allowances + OT (excl. reimbursements)

  // Deductions
  epfAmount: number;
  socsoAmount: number;
  eisAmount: number;
  customDeductTotal: number;
  totalDeductions: number;

  // Final
  expectedNet: number;
};

// ─────────────────────────────────────────
// Pay period days: 26th prev month → 25th current month
// ─────────────────────────────────────────

export function calcPeriodDays(month: number, year: number): number {
  // Start: 26th of previous month
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const start = new Date(prevYear, prevMonth - 1, 26); // month is 0-indexed

  // End: 25th of current month
  const end = new Date(year, month - 1, 25);

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay) + 1; // inclusive
}

// ─────────────────────────────────────────
// Daily rate
// ─────────────────────────────────────────

export function calcDailyRate(basic: number, formula: string): number {
  if (formula === "basic/22") return basic / 22;
  return basic / 26; // default
}

// ─────────────────────────────────────────
// EPF — Third Schedule table lookup
// Employee rate: 11% (age < 60, Malaysian)
// Base = BASIC SALARY ONLY (after unpaid leave deduction)
// OT and allowances are excluded from EPF base
// ─────────────────────────────────────────

export function calcEPF(wages: number): number {
  // Above RM20,000 — use exact percentage
  if (wages > 20000) return Math.ceil(wages * 0.11);

  // Third Schedule — employee 11% rounded to next RM per bracket
  const table: [number, number][] = [
    [10, 1], [20, 2], [30, 3], [40, 4], [50, 6],
    [60, 7], [70, 8], [80, 9], [90, 10], [100, 11],
    [110, 12], [120, 13], [130, 14], [140, 15], [150, 16],
    [160, 18], [170, 19], [180, 20], [190, 21], [200, 22],
    [210, 23], [220, 24], [230, 25], [240, 26], [250, 28],
    [260, 29], [270, 30], [280, 31], [290, 32], [300, 33],
    [320, 35], [340, 38], [360, 40], [380, 42], [400, 44],
    [420, 46], [440, 48], [460, 51], [480, 53], [500, 55],
    [520, 57], [540, 59], [560, 62], [580, 64], [600, 66],
    [620, 68], [640, 70], [660, 73], [680, 75], [700, 77],
    [720, 79], [740, 81], [760, 84], [780, 86], [800, 88],
    [820, 90], [840, 93], [860, 95], [880, 97], [900, 99],
    [920, 101], [940, 104], [960, 106], [980, 108], [1000, 110],
    [1020, 112], [1040, 115], [1060, 117], [1080, 119], [1100, 121],
    [1120, 123], [1140, 126], [1160, 128], [1180, 130], [1200, 132],
    [1220, 134], [1240, 137], [1260, 139], [1280, 141], [1300, 143],
    [1320, 145], [1340, 148], [1360, 150], [1380, 152], [1400, 154],
    [1420, 156], [1440, 159], [1460, 161], [1480, 163], [1500, 165],
    [1520, 167], [1540, 170], [1560, 172], [1580, 174], [1600, 176],
    [1620, 178], [1640, 181], [1660, 183], [1680, 185], [1700, 187],
    [1720, 189], [1740, 192], [1760, 194], [1780, 196], [1800, 198],
    [1820, 200], [1840, 203], [1860, 205], [1880, 207], [1900, 209],
    [1920, 211], [1940, 214], [1960, 216], [1980, 218], [2000, 220],
    [2050, 226], [2100, 231], [2150, 237], [2200, 242], [2250, 248],
    [2300, 253], [2350, 259], [2400, 264], [2450, 270], [2500, 275],
    [2550, 281], [2600, 286], [2650, 292], [2700, 297], [2750, 303],
    [2800, 308], [2850, 314], [2900, 319], [2950, 325], [3000, 330],
    [3050, 336], [3100, 341], [3150, 347], [3200, 352], [3250, 358],
    [3300, 363], [3350, 369], [3400, 374], [3450, 380], [3500, 385],
    [3550, 391], [3600, 396], [3650, 402], [3700, 407], [3750, 413],
    [3800, 418], [3850, 424], [3900, 429], [3950, 435], [4000, 440],
    [4100, 451], [4200, 462], [4300, 473], [4400, 484], [4500, 495],
    [4600, 506], [4700, 517], [4800, 528], [4900, 539], [5000, 550],
    [5200, 572], [5400, 594], [5600, 616], [5800, 638], [6000, 660],
    [6200, 682], [6400, 704], [6600, 726], [6800, 748], [7000, 770],
    [7200, 792], [7400, 814], [7600, 836], [7800, 858], [8000, 880],
    [8500, 935], [9000, 990], [9500, 1045], [10000, 1100],
    [10500, 1155], [11000, 1210], [11500, 1265], [12000, 1320],
    [12500, 1375], [13000, 1430], [13500, 1485], [14000, 1540],
    [14500, 1595], [15000, 1650], [15500, 1705], [16000, 1760],
    [16500, 1815], [17000, 1870], [17500, 1925], [18000, 1980],
    [18500, 2035], [19000, 2090], [19500, 2145], [20000, 2200],
  ];

  for (const [max, contribution] of table) {
    if (wages <= max) return contribution;
  }
  return Math.ceil(wages * 0.11);
}

// ─────────────────────────────────────────
// SOCSO — First Category (Employment Injury + Invalidity)
// Employee rate: ~0.5%, table-based, capped at RM6,000 (since Oct 2024)
// Base = basic + taxable allowances + OT (exclude reimbursements)
// ─────────────────────────────────────────

export function calcSOCSO(wages: number): number {
  const cappedWages = Math.min(wages, 6000);

  const table: [number, number][] = [
    [30, 0.10], [50, 0.20], [70, 0.30], [100, 0.40],
    [140, 0.60], [200, 0.80], [300, 1.20], [400, 1.75],
    [500, 2.25], [600, 2.75], [700, 3.25], [800, 3.75],
    [900, 4.25], [1000, 4.75], [1100, 5.25], [1200, 5.75],
    [1300, 6.25], [1400, 6.75], [1500, 7.25], [1600, 7.75],
    [1700, 8.25], [1800, 8.75], [1900, 9.25], [2000, 9.75],
    [2100, 10.25], [2200, 10.75], [2300, 11.25], [2400, 11.75],
    [2500, 12.25], [2600, 12.75], [2700, 13.25], [2800, 13.75],
    [2900, 14.25], [3000, 14.75], [3100, 15.25], [3200, 15.75],
    [3300, 16.25], [3400, 16.75], [3500, 17.25], [3600, 17.75],
    [3700, 18.25], [3800, 18.75], [3900, 19.25], [4000, 19.75],
    [4100, 20.25], [4200, 20.75], [4300, 21.25], [4400, 21.75],
    [4500, 22.25], [4600, 22.75], [4700, 23.25], [4800, 23.75],
    [4900, 24.25], [5000, 24.75], [5100, 25.25], [5200, 25.75],
    [5300, 26.25], [5400, 26.75], [5500, 27.25], [5600, 27.75],
    [5700, 28.25], [5800, 28.75], [5900, 29.25], [6000, 29.75],
  ];

  for (const [max, contribution] of table) {
    if (cappedWages <= max) return contribution;
  }
  return 29.75; // max at RM6,000
}

// ─────────────────────────────────────────
// EIS — 0.2% employee, RM50 brackets per PERKESO (post Oct 2024)
// Capped at RM6,000
// FIX: replaced old RM100/RM10 bracket table with correct RM50 brackets
// ─────────────────────────────────────────

export function calcEIS(wages: number): number {
  const capped = Math.min(wages, 6000);

  // RM50 brackets, 0.2% rate, rounded to nearest 10 sen
  // e.g. bracket RM2,950 → RM2,950 × 0.002 = RM5.90
  for (let bracket = 50; bracket <= 6000; bracket += 50) {
    if (capped <= bracket) {
      return Math.round(bracket * 0.002 * 10) / 10;
    }
  }
  return 12.00; // above RM6,000 (capped)
}

// ─────────────────────────────────────────
// Main calc function
// ─────────────────────────────────────────

export function calcSalary(inputs: SalaryInputs): SalaryBreakdown {
  const {
    basicSalary,
    allowances,
    customDeductions,
    otRate,
    doublePayRate,
    hoursPerDay = 7.5,
    dailyRateFormula,
    unpaidLeaveDays,
    otHours,
    doublePayHours,
    month,
    year,
    salaryBasis = "monthly",
    daysWorked = 0,
    deductEPF = true,
    deductSOCSO = true,
    deductEIS = true,
  } = inputs;

  const periodDays = calcPeriodDays(month, year);
  const dailyRate  = calcDailyRate(basicSalary, dailyRateFormula);
  const hourlyRate = dailyRate / hoursPerDay;

  // ── Basic Pay — monthly vs daily basis ──
  let basicPay: number;
  let unpaidLeaveDeduction = 0;

  if (salaryBasis === "daily") {
    // Daily workers: paid per day worked only
    basicPay = dailyRate * daysWorked;
  } else {
    // Monthly: deduct unpaid leave
    unpaidLeaveDeduction = (basicSalary / periodDays) * unpaidLeaveDays;
    basicPay = basicSalary - unpaidLeaveDeduction;
  }

  // ── Allowances ──
  let allowanceTotal    = 0;
  let allowanceCut      = 0;
  let reimbursementTotal = 0;

  for (const a of allowances) {
    if (a.isReimbursement) {
      if (a.cutOnAbsent && unpaidLeaveDays > 0) {
        const cut = (a.amount / periodDays) * unpaidLeaveDays;
        allowanceCut += cut;
        reimbursementTotal += a.amount - cut;
      } else {
        reimbursementTotal += a.amount;
      }
    } else {
      if (a.cutOnAbsent && unpaidLeaveDays > 0) {
        const cut = (a.amount / periodDays) * unpaidLeaveDays;
        allowanceCut += cut;
        allowanceTotal += a.amount - cut;
      } else {
        allowanceTotal += a.amount;
      }
    }
  }

  // ── OT ──
  const otEarnings         = hourlyRate * otRate * otHours;
  const doublePayEarnings  = hourlyRate * doublePayRate * doublePayHours;

  const grossSalary =
    basicPay + allowanceTotal + reimbursementTotal + otEarnings + doublePayEarnings;

  const epfBase      = basicPay;
  const socsoEisBase = basicPay + allowanceTotal + otEarnings + doublePayEarnings;

  // ── Statutory — respect toggles ──
  const epfAmount    = deductEPF    ? calcEPF(epfBase)         : 0;
  const socsoAmount  = deductSOCSO  ? calcSOCSO(socsoEisBase)  : 0;
  const eisAmount    = deductEIS    ? calcEIS(socsoEisBase)     : 0;

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
