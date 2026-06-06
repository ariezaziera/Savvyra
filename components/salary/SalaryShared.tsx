export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const SOURCE_TYPES = ["DEBT","COMMITMENT","SAVINGS","INVESTMENT","CUSTOM"] as const;
export type SourceType = typeof SOURCE_TYPES[number];

export const SOURCE_COLORS: Record<string, string> = {
  DEBT:       "text-[#FF8C8C] bg-[#FF8C8C]/15",
  COMMITMENT: "text-[#C4B5FD] bg-[#C4B5FD]/15",
  SAVINGS:    "text-[#8EE3B5] bg-[#8EE3B5]/15",
  INVESTMENT: "text-[#93C5FD] bg-[#93C5FD]/15",
  CUSTOM:     "text-[#FBD38D] bg-[#FBD38D]/15",
};

export const fmt = (n: number) =>
  "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export type PlanItem = {
  id?: string;
  label: string;
  amount: number;
  sourceType: SourceType;
  sourceId?: string | null;
  isIncluded: boolean;
  sortOrder?: number;
};

export type SalaryMonth = {
  id: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: any[];
  customDeductions: any[];
  otRate: number;
  doublePayRate: number;
  hoursPerDay: number;
  dailyRateFormula: string;
  unpaidLeaveDays: number;
  annualLeaveDays: number;
  medicalLeaveDays: number;
  replacementDays: number;
  otHours: number;
  doublePayHours: number;
  grossSalary: number;
  epfRate: number;
  socsoRate: number;
  eisRate: number;
  epfAmount: number;
  socsoAmount: number;
  eisAmount: number;
  customDeductTotal: number;
  expectedNet: number;
  actualNet: number | null;
  bankBalance: number | null;
  fixedReserve: number | null;
  usableBalance: number | null;
  planItems: PlanItem[];
  isPlanFinalized: boolean;
  isMarkedReceived: boolean;
  salaryPlanItems?: PlanItem[];
};

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
      <h3 className="mb-4 text-sm font-semibold text-white/60 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/50 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export function Input({ value, onChange, placeholder = "0", type = "number", className = "", disabled }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 backdrop-blur-xl transition focus:border-[#6A49FA]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#6A49FA]/20 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    />
  );
}