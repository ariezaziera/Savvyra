"use client";

import { useEffect, useState, useCallback } from "react";
import PageContainer from "@/components/PageContainer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator, CalendarDays, History, Plus, Trash2,
  ChevronDown, ChevronUp, Check, Pencil, X, Info,
} from "lucide-react";
import { calcSalary, type SalaryInputs, type Allowance, type CustomDeduction } from "@/lib/salaryCalc";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
type AllocationItem = {
  category: "savings" | "commitments" | "spends" | "debts" | "investment";
  label: string;
  amount: number;
  isFulfilled: boolean;
  transactionId?: string;
};

type SalaryMonth = {
  id: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: Allowance[];
  customDeductions: CustomDeduction[];
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
  epfAmount: number;
  socsoAmount: number;
  eisAmount: number;
  customDeductTotal: number;
  expectedNet: number;
  actualNet: number | null;
  allocations: AllocationItem[];
};

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ALLOCATION_CATEGORIES = ["savings","commitments","spends","debts","investment"] as const;
const CATEGORY_COLORS: Record<string, string> = {
  savings:     "text-[#8EE3B5] bg-[#8EE3B5]/15",
  commitments: "text-[#C4B5FD] bg-[#C4B5FD]/15",
  spends:      "text-[#FBD38D] bg-[#FBD38D]/15",
  debts:       "text-[#FF8C8C] bg-[#FF8C8C]/15",
  investment:  "text-[#93C5FD] bg-[#93C5FD]/15",
};

const fmt = (n: number) =>
  "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─────────────────────────────────────────
// Default profile — matches SalaryInputs exactly
// ─────────────────────────────────────────
const now = new Date();

const defaultProfile: SalaryInputs = {
  basicSalary:      0,
  allowances:       [],
  customDeductions: [],
  otRate:           1.5,
  doublePayRate:    2.0,
  hoursPerDay:      7.5,
  dailyRateFormula: "basic/26",
  unpaidLeaveDays:  0,
  annualLeaveDays:  0,
  medicalLeaveDays: 0,
  replacementDays:  0,
  otHours:          0,
  doublePayHours:   0,
  month:            now.getMonth() + 1,
  year:             now.getFullYear(),
};

// ─────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
      <h3 className="mb-4 text-sm font-semibold text-white/60 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/50 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder = "0", type = "number", className = "" }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 backdrop-blur-xl transition focus:border-[#6A49FA]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#6A49FA]/20 ${className}`}
    />
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────
export default function SalaryPage() {
  const [tab, setTab] = useState<"calculator" | "plan" | "history">("calculator");
  const [months, setMonths] = useState<SalaryMonth[]>([]);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  // Current month/year selectors (calculator tab)
  const [calcMonth, setCalcMonth] = useState(now.getMonth() + 1);
  const [calcYear,  setCalcYear]  = useState(now.getFullYear());

  // All editable inputs — month/year kept in sync with calcMonth/calcYear
  const [inputs, setInputs] = useState<SalaryInputs>(defaultProfile);

  // Allocation plan
  const [allocations,    setAllocations]    = useState<AllocationItem[]>([]);
  const [newAllocCat,    setNewAllocCat]    = useState<AllocationItem["category"]>("savings");
  const [newAllocLabel,  setNewAllocLabel]  = useState("");
  const [newAllocAmt,    setNewAllocAmt]    = useState("");

  // History
  const [expandedMonth,   setExpandedMonth]   = useState<string | null>(null);
  const [actualNetInput,  setActualNetInput]   = useState<Record<string, string>>({});

  // Keep inputs.month / inputs.year in sync when the selectors change
  useEffect(() => {
    setInputs((p) => ({ ...p, month: calcMonth, year: calcYear }));
  }, [calcMonth, calcYear]);

  // ── Fetch profile + months ──
  useEffect(() => {
    fetch("/api/salary/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          const p: SalaryInputs = {
            basicSalary:      data.basicSalary      ?? 0,
            allowances:       data.allowances       ?? [],
            customDeductions: data.customDeductions ?? [],
            otRate:           data.otRate           ?? 1.5,
            doublePayRate:    data.doublePayRate     ?? 2.0,
            hoursPerDay:      data.hoursPerDay       ?? 7.5,
            dailyRateFormula: data.dailyRateFormula  ?? "basic/26",
            unpaidLeaveDays:  0,
            annualLeaveDays:  0,
            medicalLeaveDays: 0,
            replacementDays:  0,
            otHours:          0,
            doublePayHours:   0,
            month:            calcMonth,
            year:             calcYear,
          };
          setInputs(p);
        }
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));

    fetch("/api/salary/months")
      .then((r) => r.json())
      .then((data) => setMonths(Array.isArray(data) ? data : []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Live breakdown — month/year always current ──
  const breakdown = calcSalary({ ...inputs, month: calcMonth, year: calcYear });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Save profile ──
  const saveProfile = async () => {
    setSaving(true);
    await fetch("/api/salary/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    });
    setSaving(false);
    showToast("Profile saved ✨");
  };

  // ── Save month ──
  const saveMonth = async () => {
    const existing = months.find((m) => m.month === calcMonth && m.year === calcYear);
    if (existing) { showToast("Month already saved! Go to History to view."); return; }

    setSaving(true);
    const payload = { ...inputs, month: calcMonth, year: calcYear, allocations };
    const res = await fetch("/api/salary/months", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const record = await res.json();
      setMonths((prev) => [record, ...prev]);
      await fetch("/api/salary/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      showToast("Salary plan saved! ✅");
    }
    setSaving(false);
  };

  // ── Update actual net ──
  const submitActualNet = async (id: string) => {
    const val = actualNetInput[id];
    if (!val) return;
    const res = await fetch(`/api/salary/months/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actualNet: parseFloat(val) }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMonths((prev) => prev.map((m) => (m.id === id ? updated : m)));
      showToast("Actual salary recorded ✅");
    }
  };

  // ── Fulfill allocation ──
  const fulfillAllocation = async (monthId: string, allocationIndex: number) => {
    const res = await fetch(`/api/salary/months/${monthId}/fulfill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allocationIndex }),
    });
    if (res.ok) {
      const { salaryMonth } = await res.json();
      setMonths((prev) => prev.map((m) => (m.id === monthId ? salaryMonth : m)));
      showToast("Added to transactions ✅");
    }
  };

  // ── Allowance helpers ──
  const addAllowance = () => {
    setInputs((p) => ({
      ...p,
      allowances: [...p.allowances, { name: "", amount: 0, cutOnAbsent: false, isReimbursement: false }],
    }));
  };

  const updateAllowance = (i: number, field: keyof Allowance, value: any) => {
    setInputs((p) => {
      const arr = [...p.allowances];
      arr[i] = { ...arr[i], [field]: value };
      return { ...p, allowances: arr };
    });
  };

  const removeAllowance = (i: number) => {
    setInputs((p) => ({ ...p, allowances: p.allowances.filter((_, idx) => idx !== i) }));
  };

  // ── Custom deduction helpers ──
  const addDeduction = () => {
    setInputs((p) => ({ ...p, customDeductions: [...p.customDeductions, { name: "", amount: 0 }] }));
  };

  const updateDeduction = (i: number, field: keyof CustomDeduction, value: any) => {
    setInputs((p) => {
      const arr = [...p.customDeductions];
      arr[i] = { ...arr[i], [field]: value };
      return { ...p, customDeductions: arr };
    });
  };

  const removeDeduction = (i: number) => {
    setInputs((p) => ({ ...p, customDeductions: p.customDeductions.filter((_, idx) => idx !== i) }));
  };

  // ── Allocation helpers ──
  const addAllocation = () => {
    if (!newAllocAmt) return;
    setAllocations((prev) => [
      ...prev,
      { category: newAllocCat, label: newAllocLabel || newAllocCat, amount: parseFloat(newAllocAmt), isFulfilled: false },
    ]);
    setNewAllocLabel("");
    setNewAllocAmt("");
  };

  const allocationTotal = allocations.reduce((s, a) => s + a.amount, 0);
  const unallocated     = breakdown.expectedNet - allocationTotal;

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <PageContainer>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <style>{`
        .blob { position: fixed; border-radius: 9999px; pointer-events: none; z-index: 0; }
        .blob-1 { width: 500px; height: 500px; background: #6a49fa; top: -150px; left: -150px; filter: blur(130px); opacity: 0.45; }
        .blob-2 { width: 400px; height: 400px; background: #fedada; bottom: -100px; right: -100px; filter: blur(120px); opacity: 0.30; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          {toast}
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Payroll</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Salary Manager</h1>
          <p className="mt-1.5 text-sm text-white/50">Calculate, plan, and track your monthly salary.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
          {([
            { key: "calculator", label: "Calculator",    Icon: Calculator   },
            { key: "plan",       label: "Monthly Plan",  Icon: CalendarDays },
            { key: "history",    label: "History",       Icon: History      },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${tab === key
                  ? "bg-[#6A49FA]/30 text-[#C4B5FD] shadow-[inset_0_0_0_1px_rgba(196,181,253,0.3)]"
                  : "text-white/45 hover:text-white"
                }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════
              TAB 1: CALCULATOR
          ══════════════════════════════════════ */}
          {tab === "calculator" && (
            <motion.div key="calc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

              {/* Month selector */}
              <SectionCard title="Pay Period">
                <div className="flex gap-3">
                  <select
                    value={calcMonth}
                    onChange={(e) => setCalcMonth(+e.target.value)}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 focus:ring-2 focus:ring-[#6A49FA]/20 backdrop-blur-xl"
                  >
                    {MONTHS.map((m, i) => <option key={m} value={i + 1} className="bg-[#1a1035]">{m}</option>)}
                  </select>
                  <Input value={calcYear} onChange={(e: any) => setCalcYear(+e.target.value)} placeholder="2025" className="w-28" />
                </div>
                <p className="mt-2 text-xs text-white/35">
                  Pay period: 26 {MONTHS[calcMonth === 1 ? 11 : calcMonth - 2]} – 25 {MONTHS[calcMonth - 1]} · {breakdown.periodDays} days
                </p>
              </SectionCard>

              {/* Basic + Daily Rate */}
              <SectionCard title="Basic Pay">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Basic Salary (RM)">
                    <Input
                      value={inputs.basicSalary || ""}
                      onChange={(e: any) => setInputs((p) => ({ ...p, basicSalary: +e.target.value }))}
                      className="w-full"
                    />
                  </Field>
                  <Field label="Daily Rate Formula">
                    <select
                      value={inputs.dailyRateFormula}
                      onChange={(e) => setInputs((p) => ({ ...p, dailyRateFormula: e.target.value }))}
                      className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 focus:ring-2 focus:ring-[#6A49FA]/20 backdrop-blur-xl"
                    >
                      <option value="basic/26" className="bg-[#1a1035]">Basic ÷ 26 (standard)</option>
                      <option value="basic/22" className="bg-[#1a1035]">Basic ÷ 22 (working days)</option>
                    </select>
                  </Field>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Hours Per Day">
                    <Input
                      value={inputs.hoursPerDay || ""}
                      onChange={(e: any) => setInputs((p) => ({ ...p, hoursPerDay: +e.target.value }))}
                      placeholder="7.5"
                      className="w-full"
                    />
                  </Field>
                </div>
                <p className="mt-3 text-xs text-white/35">
                  Daily rate: {fmt(breakdown.dailyRate)} / day · Hourly: {fmt(breakdown.hourlyRate)} / hr
                </p>
              </SectionCard>

              {/* Allowances */}
              <SectionCard title="Allowances">
                <div className="space-y-3">
                  {inputs.allowances.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 min-w-0">
                      <Input
                        value={a.name}
                        onChange={(e: any) => updateAllowance(i, "name", e.target.value)}
                        placeholder="Allowance name"
                        type="text"
                        className="flex-1 min-w-0 w-full"
                      />
                      <Input
                        value={a.amount || ""}
                        onChange={(e: any) => updateAllowance(i, "amount", +e.target.value)}
                        placeholder="Amount"
                        className="w-24 shrink-0"
                      />
                      <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer whitespace-nowrap shrink-0">
                        <input
                          type="checkbox"
                          checked={a.cutOnAbsent}
                          onChange={(e) => updateAllowance(i, "cutOnAbsent", e.target.checked)}
                          className="rounded accent-[#6A49FA]"
                        />
                        Cut on absent
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer whitespace-nowrap shrink-0">
                        <input
                          type="checkbox"
                          checked={a.isReimbursement}
                          onChange={(e) => updateAllowance(i, "isReimbursement", e.target.checked)}
                          className="rounded accent-[#6A49FA]"
                        />
                        Reimbursement
                      </label>
                      <button onClick={() => removeAllowance(i)} className="text-white/30 hover:text-[#FF8C8C] transition shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addAllowance}
                    className="flex items-center gap-1.5 text-xs text-[#C4B5FD] hover:text-white transition"
                  >
                    <Plus size={14} /> Add allowance
                  </button>
                </div>
                {inputs.allowances.some((a) => a.isReimbursement) && (
                  <p className="mt-3 text-xs text-white/35">
                    Reimbursements are excluded from EPF base but included in SOCSO/EIS base.
                  </p>
                )}
              </SectionCard>

              {/* Leave & OT */}
              <SectionCard title="Leave & Overtime">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Field label="Unpaid Leave (days)">
                    <Input value={inputs.unpaidLeaveDays || ""} onChange={(e: any) => setInputs((p) => ({ ...p, unpaidLeaveDays: +e.target.value }))} className="w-full" />
                  </Field>
                  <Field label="Annual Leave (days)">
                    <Input value={inputs.annualLeaveDays || ""} onChange={(e: any) => setInputs((p) => ({ ...p, annualLeaveDays: +e.target.value }))} className="w-full" />
                  </Field>
                  <Field label="Medical Leave (days)">
                    <Input value={inputs.medicalLeaveDays || ""} onChange={(e: any) => setInputs((p) => ({ ...p, medicalLeaveDays: +e.target.value }))} className="w-full" />
                  </Field>
                  <Field label="Replacement Leave (days)">
                    <Input value={inputs.replacementDays || ""} onChange={(e: any) => setInputs((p) => ({ ...p, replacementDays: +e.target.value }))} className="w-full" />
                  </Field>
                  <Field label="OT Hours">
                    <Input value={inputs.otHours || ""} onChange={(e: any) => setInputs((p) => ({ ...p, otHours: +e.target.value }))} className="w-full" />
                  </Field>
                  <Field label="Double Pay Hours">
                    <Input value={inputs.doublePayHours || ""} onChange={(e: any) => setInputs((p) => ({ ...p, doublePayHours: +e.target.value }))} className="w-full" />
                  </Field>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 border-t border-white/10 pt-4">
                  <Field label="OT Rate (×)">
                    <Input value={inputs.otRate || ""} onChange={(e: any) => setInputs((p) => ({ ...p, otRate: +e.target.value }))} placeholder="1.5" className="w-full" />
                  </Field>
                  <Field label="Double Pay Rate (×)">
                    <Input value={inputs.doublePayRate || ""} onChange={(e: any) => setInputs((p) => ({ ...p, doublePayRate: +e.target.value }))} placeholder="2.0" className="w-full" />
                  </Field>
                </div>
              </SectionCard>

              {/* Custom Deductions */}
              <SectionCard title="Custom Deductions">
                <p className="mb-3 text-xs text-white/40">
                  EPF, SOCSO and EIS are calculated automatically via the Third Schedule / PERKESO tables.
                  Add any other deductions below (e.g. KRSM, loan instalment).
                </p>
                <div className="space-y-3">
                  {inputs.customDeductions.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={d.name} onChange={(e: any) => updateDeduction(i, "name", e.target.value)} placeholder="e.g. KRSM, Loan" type="text" className="flex-1 w-full" />
                      <Input value={d.amount || ""} onChange={(e: any) => updateDeduction(i, "amount", +e.target.value)} placeholder="Amount" className="w-28 shrink-0" />
                      <button onClick={() => removeDeduction(i)} className="text-white/30 hover:text-[#FF8C8C] transition shrink-0"><Trash2 size={15} /></button>
                    </div>
                  ))}
                  <button onClick={addDeduction} className="flex items-center gap-1.5 text-xs text-[#C4B5FD] hover:text-white transition">
                    <Plus size={14} /> Add custom deduction
                  </button>
                </div>
              </SectionCard>

              {/* Live Breakdown */}
              <div className="relative overflow-hidden rounded-3xl border border-[#6A49FA]/30 bg-linear-to-br from-[#6A49FA]/20 to-[#C4B5FD]/10 p-6 backdrop-blur-2xl shadow-[0_8px_40px_rgba(106,73,250,0.25)]">
                <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                <h3 className="mb-5 text-sm font-semibold text-white/60 uppercase tracking-wider">Expected Breakdown</h3>

                <div className="space-y-3 text-sm">
                  {[
                    { label: "Basic Pay",                                        value: breakdown.basicPay,              color: "text-white"     },
                    { label: "Allowances",                                       value: breakdown.allowanceTotal,        color: "text-[#8EE3B5]" },
                    breakdown.reimbursementTotal > 0
                      ? { label: "Reimbursements",                               value: breakdown.reimbursementTotal,    color: "text-[#8EE3B5]" }
                      : null,
                    breakdown.allowanceCut > 0
                      ? { label: "Allowance Cut (absent)",                       value: -breakdown.allowanceCut,         color: "text-[#FF8C8C]" }
                      : null,
                    breakdown.unpaidLeaveDeduction > 0
                      ? { label: "Unpaid Leave Deduction",                       value: -breakdown.unpaidLeaveDeduction, color: "text-[#FF8C8C]" }
                      : null,
                    breakdown.otEarnings > 0
                      ? { label: `OT (${inputs.otHours}h × ${inputs.otRate}×)`, value: breakdown.otEarnings,           color: "text-[#FBD38D]" }
                      : null,
                    breakdown.doublePayEarnings > 0
                      ? { label: `Double Pay (${inputs.doublePayHours}h × ${inputs.doublePayRate}×)`, value: breakdown.doublePayEarnings, color: "text-[#FBD38D]" }
                      : null,
                  ].filter(Boolean).map((row: any) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-white/55">{row.label}</span>
                      <span className={row.color}>{fmt(Math.abs(row.value))}{row.value < 0 ? " (−)" : ""}</span>
                    </div>
                  ))}
                </div>

                <div className="my-4 border-t border-white/10" />
                <div className="flex justify-between text-sm">
                  <span className="text-white/55">Gross Salary</span>
                  <span className="font-semibold text-white">{fmt(breakdown.grossSalary)}</span>
                </div>

                {/* Statutory deductions — amounts from table lookups, no editable rates */}
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/45">EPF (Third Schedule, 11%)</span>
                    <span className="text-[#FF8C8C]">− {fmt(breakdown.epfAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/45">SOCSO (PERKESO, ~0.5%)</span>
                    <span className="text-[#FF8C8C]">− {fmt(breakdown.socsoAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/45">EIS (0.2%, capped RM6k)</span>
                    <span className="text-[#FF8C8C]">− {fmt(breakdown.eisAmount)}</span>
                  </div>
                  {inputs.customDeductions.map((d, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-white/45">{d.name || "Custom"}</span>
                      <span className="text-[#FF8C8C]">− {fmt(d.amount)}</span>
                    </div>
                  ))}
                </div>

                {/* EPF / SOCSO bases info */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 space-y-1">
                  <p className="text-xs text-white/40">EPF base (basic only): {fmt(breakdown.epfBase)}</p>
                  <p className="text-xs text-white/40">SOCSO/EIS base (gross incl. reimb.): {fmt(breakdown.socsoEisBase)}</p>
                </div>

                <div className="my-4 border-t border-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-white">Expected Net</span>
                  <span className="text-2xl font-bold text-[#C4B5FD]">{fmt(breakdown.expectedNet)}</span>
                </div>
              </div>

              {/* Save buttons */}
              <div className="flex gap-3">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  Save as Default Profile
                </button>
                <button
                  onClick={() => setTab("plan")}
                  className="flex-1 rounded-full bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(106,73,250,0.55)] active:scale-[0.98]"
                >
                  Plan This Month →
                </button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              TAB 2: MONTHLY PLAN
          ══════════════════════════════════════ */}
          {tab === "plan" && (
            <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

              {/* Summary */}
              <div className="relative overflow-hidden rounded-3xl border border-[#6A49FA]/30 bg-linear-to-br from-[#6A49FA]/20 to-[#C4B5FD]/10 p-6 backdrop-blur-2xl">
                <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
                <p className="text-sm text-white/50">{MONTHS[calcMonth - 1]} {calcYear} — Expected Net</p>
                <p className="mt-1 text-3xl font-bold text-[#C4B5FD]">{fmt(breakdown.expectedNet)}</p>
                <div className="mt-3 flex gap-4 text-sm">
                  <span className="text-white/45">Allocated: <span className="text-white">{fmt(allocationTotal)}</span></span>
                  <span className={unallocated < 0 ? "text-[#FF8C8C]" : "text-[#8EE3B5]"}>
                    Remaining: {fmt(unallocated)}
                  </span>
                </div>
              </div>

              {/* Existing allocations */}
              {allocations.length > 0 && (
                <SectionCard title="Allocation Plan">
                  <div className="space-y-3">
                    {allocations.map((a, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className={`rounded-xl px-2.5 py-1 text-xs font-medium capitalize ${CATEGORY_COLORS[a.category]}`}>
                          {a.category}
                        </span>
                        <span className="flex-1 text-sm text-white truncate">{a.label}</span>
                        <span className="text-sm font-semibold text-white">{fmt(a.amount)}</span>
                        <button
                          onClick={() => setAllocations((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-white/25 hover:text-[#FF8C8C] transition"
                        ><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Add allocation */}
              <SectionCard title="Add Allocation">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {ALLOCATION_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewAllocCat(cat)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition ${newAllocCat === cat ? CATEGORY_COLORS[cat] : "text-white/40 bg-white/5 hover:bg-white/10"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={newAllocLabel}
                    onChange={(e: any) => setNewAllocLabel(e.target.value)}
                    placeholder="Label (e.g. ASNB, Car loan, Groceries)"
                    type="text"
                    className="w-full"
                  />
                  <div className="flex gap-3">
                    <Input value={newAllocAmt} onChange={(e: any) => setNewAllocAmt(e.target.value)} placeholder="Amount (RM)" className="flex-1" />
                    <button
                      onClick={addAllocation}
                      className="rounded-2xl bg-[#6A49FA]/30 px-4 text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </SectionCard>

              {/* Category breakdown visual */}
              {allocations.length > 0 && (
                <SectionCard title="By Category">
                  <div className="space-y-2">
                    {ALLOCATION_CATEGORIES.map((cat) => {
                      const total = allocations.filter((a) => a.category === cat).reduce((s, a) => s + a.amount, 0);
                      if (!total) return null;
                      const pct = breakdown.expectedNet > 0 ? Math.min(100, (total / breakdown.expectedNet) * 100) : 0;
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize text-white/60">{cat}</span>
                            <span className="text-white">{fmt(total)} ({pct.toFixed(1)}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                background: cat === "savings" ? "#8EE3B5" : cat === "commitments" ? "#C4B5FD" : cat === "spends" ? "#FBD38D" : cat === "debts" ? "#FF8C8C" : "#93C5FD",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              <button
                onClick={saveMonth}
                disabled={saving}
                className="w-full rounded-full bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(106,73,250,0.55)] active:scale-[0.98]"
              >
                {saving ? "Saving…" : `Save ${MONTHS[calcMonth - 1]} ${calcYear} Plan`}
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              TAB 3: HISTORY
          ══════════════════════════════════════ */}
          {tab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {months.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/40 text-sm">
                  No salary months saved yet. Start from the Calculator tab!
                </div>
              )}

              {months.map((m) => {
                const isExpanded  = expandedMonth === m.id;
                const monthLabel  = `${MONTHS[m.month - 1]} ${m.year}`;
                const allocs      = m.allocations as AllocationItem[];
                const fulfilled   = allocs.filter((a) => a.isFulfilled).length;

                return (
                  <div key={m.id} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                    <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

                    {/* Header */}
                    <button
                      className="w-full flex items-center justify-between px-6 py-5 text-left"
                      onClick={() => setExpandedMonth(isExpanded ? null : m.id)}
                    >
                      <div>
                        <p className="font-semibold text-white">{monthLabel}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          Expected: {fmt(m.expectedNet)}
                          {m.actualNet != null && <> · Actual: <span className="text-[#8EE3B5]">{fmt(m.actualNet)}</span></>}
                          {allocs.length > 0 && <> · {fulfilled}/{allocs.length} fulfilled</>}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp size={18} className="text-white/40" /> : <ChevronDown size={18} className="text-white/40" />}
                    </button>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-5 border-t border-white/10 pt-5">

                        {/* Breakdown */}
                        <div className="space-y-2 text-sm">
                          {[
                            ["Basic Salary",  fmt(m.basicSalary)],
                            ["Gross Salary",  fmt(m.grossSalary)],
                            ["EPF",           `− ${fmt(m.epfAmount)}`],
                            ["SOCSO",         `− ${fmt(m.socsoAmount)}`],
                            ["EIS",           `− ${fmt(m.eisAmount)}`],
                            m.customDeductTotal > 0 ? ["Other Deductions", `− ${fmt(m.customDeductTotal)}`] : null,
                          ].filter(Boolean).map(([label, val]: any) => (
                            <div key={label} className="flex justify-between">
                              <span className="text-white/45">{label}</span>
                              <span className="text-white">{val}</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-semibold border-t border-white/10 pt-2">
                            <span className="text-white">Expected Net</span>
                            <span className="text-[#C4B5FD]">{fmt(m.expectedNet)}</span>
                          </div>
                        </div>

                        {/* Actual Net */}
                        <div>
                          <p className="text-xs text-white/45 uppercase tracking-wider mb-2">Actual Salary Received</p>
                          {m.actualNet != null ? (
                            <p className="text-lg font-bold text-[#8EE3B5]">{fmt(m.actualNet)}</p>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                value={actualNetInput[m.id] ?? ""}
                                onChange={(e: any) => setActualNetInput((p) => ({ ...p, [m.id]: e.target.value }))}
                                placeholder="Enter actual net salary"
                                className="flex-1"
                              />
                              <button
                                onClick={() => submitActualNet(m.id)}
                                className="rounded-2xl bg-[#6A49FA]/30 px-4 text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition text-sm"
                              >Save</button>
                            </div>
                          )}
                        </div>

                        {/* Allocations */}
                        {allocs.length > 0 && (
                          <div>
                            <p className="text-xs text-white/45 uppercase tracking-wider mb-3">Allocation Plan</p>
                            <div className="space-y-2">
                              {allocs.map((a, i) => (
                                <div
                                  key={i}
                                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${a.isFulfilled ? "border-white/5 bg-white/3 opacity-60" : "border-white/10 bg-white/5"}`}
                                >
                                  <span className={`rounded-xl px-2 py-0.5 text-xs font-medium capitalize ${CATEGORY_COLORS[a.category]}`}>{a.category}</span>
                                  <span className="flex-1 text-sm text-white">{a.label}</span>
                                  <span className="text-sm font-semibold text-white">{fmt(a.amount)}</span>
                                  {a.isFulfilled ? (
                                    <Check size={16} className="text-[#8EE3B5]" />
                                  ) : (
                                    <button
                                      onClick={() => fulfillAllocation(m.id, i)}
                                      className="rounded-xl bg-[#6A49FA]/20 px-3 py-1 text-xs text-[#C4B5FD] hover:bg-[#6A49FA]/40 transition"
                                    >
                                      Mark paid
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </PageContainer>
  );
}