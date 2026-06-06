"use client";

import { Plus, Trash2 } from "lucide-react";
import { SectionCard, Field, Input, fmt, MONTHS } from "./SalaryShared";
import type { SalaryInputs, Allowance, CustomDeduction } from "@/lib/salaryCalc";

type Props = {
  inputs: SalaryInputs;
  setInputs: React.Dispatch<React.SetStateAction<SalaryInputs>>;
  calcMonth: number;
  setCalcMonth: (v: number) => void;
  calcYear: number;
  setCalcYear: (v: number) => void;
  breakdown: any;
  saving: boolean;
  saveProfile: () => void;
  onPlanClick: () => void;
  salaryBasis: "monthly" | "daily";
  setSalaryBasis: (v: "monthly" | "daily") => void;
  daysWorked: number;
  setDaysWorked: (v: number) => void;
  deductEPF: boolean;    setDeductEPF: (v: boolean) => void;
  deductSOCSO: boolean;  setDeductSOCSO: (v: boolean) => void;
  deductEIS: boolean;    setDeductEIS: (v: boolean) => void;
  salaryDay: number;
  setSalaryDay: (v: number) => void;
};

export default function SalaryCalculatorTab({
  inputs, setInputs,
  calcMonth, setCalcMonth,
  calcYear, setCalcYear,
  breakdown, saving,
  saveProfile, onPlanClick,
  salaryBasis, setSalaryBasis,
  daysWorked, setDaysWorked,
  deductEPF, setDeductEPF,
  deductSOCSO, setDeductSOCSO,
  deductEIS, setDeductEIS,
  salaryDay, setSalaryDay,
}: Props) {

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

  const hasAnyDeduction =
    breakdown.unpaidLeaveDeduction > 0 ||
    deductEPF ||
    deductSOCSO ||
    deductEIS ||
    inputs.customDeductions.length > 0;

  return (
    <div className="space-y-5">
      {/* Pay Period */}
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
        {/* Salary received day */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <Field label="Salary Received On (day of month)">
            <div className="flex items-center gap-3">
              <Input
                value={salaryDay || ""}
                onChange={(e: any) => setSalaryDay(+e.target.value)}
                placeholder="2"
                className="w-28"
              />
              <p className="text-xs text-white/35 leading-relaxed">
                Default: <span className="text-white/50">2hb</span> setiap bulan<br />
                (7 hari selepas cut-off 25hb)
              </p>
            </div>
          </Field>
          {salaryDay > 0 && (
            <p className="mt-2 text-xs text-[#C4B5FD]/70">
              Notifikasi akan dihantar 7 hari, 3 hari, 1 hari sebelum dan pada {salaryDay}hb setiap bulan.
            </p>
          )}
        </div>
      </SectionCard>

      {/* Basic Pay */}
      <SectionCard title="Basic Pay">
        <div className="mb-4">
          <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Salary Basis</label>
          <div className="flex gap-2">
            {(["monthly", "daily"] as const).map((basis) => (
              <button
                key={basis}
                onClick={() => setSalaryBasis(basis)}
                className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-medium capitalize transition-all ${
                  salaryBasis === basis
                    ? "bg-[#6A49FA]/30 text-[#C4B5FD] border border-[#6A49FA]/40"
                    : "bg-white/5 text-white/40 border border-white/10 hover:text-white"
                }`}
              >
                {basis === "monthly" ? "📅 Monthly" : "📆 Daily"}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-white/30">
            {salaryBasis === "monthly"
              ? "Fixed monthly salary — deduct for unpaid leave."
              : "Paid per day worked — enter total days worked this period."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={salaryBasis === "daily" ? "Daily Rate (RM)" : "Basic Salary (RM)"}>
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

        {salaryBasis === "daily" && (
          <div className="mt-4">
            <Field label="Days Worked This Period">
              <Input
                value={daysWorked || ""}
                onChange={(e: any) => setDaysWorked(+e.target.value)}
                placeholder="e.g. 20"
                className="w-full"
              />
            </Field>
            <p className="mt-1.5 text-xs text-white/30">
              Basic pay = Daily Rate × Days Worked = {fmt(breakdown.dailyRate * (daysWorked || 0))}
            </p>
          </div>
        )}

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
        <p className="mb-3 text-xs text-white/40">
          Fixed monthly allowances (transport, meal, phone, etc.). Included in SOCSO &amp; EIS base.
        </p>
        <div className="space-y-3">
          {inputs.allowances
            .map((a, i) => ({ a, i }))
            .filter(({ a }) => !a.isReimbursement)
            .map(({ a, i }) => (
              <div key={i} className="space-y-2">
                <div className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr 90px 20px" }}>
                  <Input value={a.name} onChange={(e: any) => updateAllowance(i, "name", e.target.value)} placeholder="e.g. Transport, Meal" type="text" className="w-full" />
                  <Input value={a.amount || ""} onChange={(e: any) => updateAllowance(i, "amount", +e.target.value)} placeholder="Amount" className="w-full" />
                  <button onClick={() => removeAllowance(i)} className="text-white/30 hover:text-[#FF8C8C] transition"><Trash2 size={15} /></button>
                </div>
                <button
                  onClick={() => updateAllowance(i, "cutOnAbsent", !a.cutOnAbsent)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${a.cutOnAbsent ? "bg-[#FF8C8C]/20 text-[#FF8C8C] border border-[#FF8C8C]/30" : "bg-white/5 text-white/35 border border-white/10 hover:text-white/60"}`}
                >
                  <span>{a.cutOnAbsent ? "✕" : "○"}</span> Cut on unpaid leave
                </button>
              </div>
            ))}
          <button onClick={addAllowance} className="flex items-center gap-1.5 text-xs text-[#C4B5FD] hover:text-white transition">
            <Plus size={14} /> Add allowance
          </button>
        </div>
      </SectionCard>

      {/* Claims */}
      <SectionCard title="Claims">
        <p className="mb-3 text-xs text-white/40">
          Bayaran balik resit sahaja (parking, toll, petrol). Excluded dari EPF, SOCSO &amp; EIS.
        </p>
        <div className="space-y-3">
          {inputs.allowances
            .map((a, i) => ({ a, i }))
            .filter(({ a }) => a.isReimbursement)
            .map(({ a, i }) => (
              <div key={i} className="space-y-2">
                <div className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr 90px 20px" }}>
                  <Input value={a.name} onChange={(e: any) => updateAllowance(i, "name", e.target.value)} placeholder="e.g. Parking, Toll" type="text" className="w-full" />
                  <Input value={a.amount || ""} onChange={(e: any) => updateAllowance(i, "amount", +e.target.value)} placeholder="Amount" className="w-full" />
                  <button onClick={() => removeAllowance(i)} className="text-white/30 hover:text-[#FF8C8C] transition"><Trash2 size={15} /></button>
                </div>
                <button
                  onClick={() => updateAllowance(i, "cutOnAbsent", !a.cutOnAbsent)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${a.cutOnAbsent ? "bg-[#FF8C8C]/20 text-[#FF8C8C] border border-[#FF8C8C]/30" : "bg-white/5 text-white/35 border border-white/10 hover:text-white/60"}`}
                >
                  <span>{a.cutOnAbsent ? "✕" : "○"}</span> Cut on unpaid leave
                </button>
              </div>
            ))}
          <button
            onClick={() => setInputs((p) => ({ ...p, allowances: [...p.allowances, { name: "", amount: 0, cutOnAbsent: false, isReimbursement: true }] }))}
            className="flex items-center gap-1.5 text-xs text-[#FBD38D] hover:text-white transition"
          >
            <Plus size={14} /> Add claim
          </button>
        </div>
      </SectionCard>

      {/* Leave — hidden for daily basis */}
      {salaryBasis === "monthly" && (
        <SectionCard title="Leave">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Unpaid Leave">
              <Input value={inputs.unpaidLeaveDays || ""} onChange={(e: any) => setInputs((p) => ({ ...p, unpaidLeaveDays: +e.target.value }))} placeholder="days" className="w-full" />
            </Field>
            <Field label="Annual Leave">
              <Input value={inputs.annualLeaveDays || ""} onChange={(e: any) => setInputs((p) => ({ ...p, annualLeaveDays: +e.target.value }))} placeholder="days" className="w-full" />
            </Field>
            <Field label="Medical Leave">
              <Input value={inputs.medicalLeaveDays || ""} onChange={(e: any) => setInputs((p) => ({ ...p, medicalLeaveDays: +e.target.value }))} placeholder="days" className="w-full" />
            </Field>
            <Field label="Replacement">
              <Input value={inputs.replacementDays || ""} onChange={(e: any) => setInputs((p) => ({ ...p, replacementDays: +e.target.value }))} placeholder="days" className="w-full" />
            </Field>
          </div>
          <p className="mt-2 text-xs text-white/30">All values in days</p>
        </SectionCard>
      )}

      {/* Overtime */}
      <SectionCard title="Overtime">
        <div className="grid grid-cols-2 gap-4">
          <Field label="OT Hours">
            <Input value={inputs.otHours || ""} onChange={(e: any) => setInputs((p) => ({ ...p, otHours: +e.target.value }))} className="w-full" />
          </Field>
          <Field label="OT Rate (×)">
            <Input value={inputs.otRate || ""} onChange={(e: any) => setInputs((p) => ({ ...p, otRate: +e.target.value }))} placeholder="1.5" className="w-full" />
          </Field>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
          <Field label="Double Pay Hours">
            <Input value={inputs.doublePayHours || ""} onChange={(e: any) => setInputs((p) => ({ ...p, doublePayHours: +e.target.value }))} className="w-full" />
          </Field>
          <Field label="Double Pay Rate (×)">
            <Input value={inputs.doublePayRate || ""} onChange={(e: any) => setInputs((p) => ({ ...p, doublePayRate: +e.target.value }))} placeholder="2.0" className="w-full" />
          </Field>
        </div>
      </SectionCard>

      {/* Statutory Deductions */}
      <SectionCard title="Statutory Deductions">
        <p className="mb-4 text-xs text-white/40">
          Uncheck if exempt — e.g. non-Malaysian, above 60, or employer opted out.
        </p>
        <div className="space-y-3">
          {[
            { label: "EPF (KWSP)",        sublabel: "11% — Third Schedule",      checked: deductEPF,    setChecked: setDeductEPF,    amount: breakdown.epfAmount    },
            { label: "SOCSO (PERKESO)",   sublabel: "~0.5% — First Category",    checked: deductSOCSO,  setChecked: setDeductSOCSO,  amount: breakdown.socsoAmount  },
            { label: "EIS (SIP)",         sublabel: "0.2% — capped RM6k",        checked: deductEIS,    setChecked: setDeductEIS,    amount: breakdown.eisAmount    },
          ].map(({ label, sublabel, checked, setChecked, amount }) => (
            <button
              key={label}
              onClick={() => setChecked(!checked)}
              className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 border transition-all ${
                checked
                  ? "border-white/10 bg-white/5 hover:bg-white/8"
                  : "border-white/5 bg-white/3 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                  checked ? "bg-[#6A49FA] border-[#6A49FA]" : "bg-transparent border-white/20"
                }`}>
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-white/35">{sublabel}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${checked ? "text-[#FF8C8C]" : "text-white/20"}`}>
                {checked ? `− ${fmt(amount)}` : "exempt"}
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Custom Deductions */}
      <SectionCard title="Custom Deductions">
        <p className="mb-3 text-xs text-white/40">
          EPF, SOCSO and EIS are calculated automatically above. Add any other deductions here.
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

        {/* Earnings */}
        <div className="space-y-3 text-sm">
          {[
            { label: "Basic Pay",       value: breakdown.basicPay,           color: "text-white"     },
            { label: "Allowances",      value: breakdown.allowanceTotal,     color: "text-[#8EE3B5]" },
            breakdown.reimbursementTotal > 0
              ? { label: "Reimbursements", value: breakdown.reimbursementTotal, color: "text-[#8EE3B5]" }
              : null,
            breakdown.allowanceCut > 0
              ? { label: "Allowance Cut (absent)", value: -breakdown.allowanceCut, color: "text-[#FF8C8C]" }
              : null,
            breakdown.otEarnings > 0
              ? { label: `OT (${inputs.otHours}h × ${inputs.otRate}×)`, value: breakdown.otEarnings, color: "text-[#FBD38D]" }
              : null,
            breakdown.doublePayEarnings > 0
              ? { label: `Double Pay (${inputs.doublePayHours}h × ${inputs.doublePayRate}×)`, value: breakdown.doublePayEarnings, color: "text-[#FBD38D]" }
              : null,
          ].filter(Boolean).map((row: any) => (
            <div key={row.label} className="flex justify-between">
              <span className="text-white/55">{row.label}</span>
              <span className={row.color}>
                {row.value < 0 ? `− ${fmt(Math.abs(row.value))}` : fmt(row.value)}
              </span>
            </div>
          ))}
        </div>

        {/* Gross */}
        <div className="my-4 border-t border-white/10" />
        <div className="flex justify-between text-sm">
          <span className="text-white/55">Gross Salary</span>
          <span className="font-semibold text-white">{fmt(breakdown.grossSalary)}</span>
        </div>

        {/* Deductions — unpaid leave first, then statutory, then custom */}
        <div className="mt-3 space-y-2 text-sm">
          {breakdown.unpaidLeaveDeduction > 0 && (
            <div className="flex justify-between">
              <span className="text-white/45">
                Unpaid Leave ({inputs.unpaidLeaveDays}d)
              </span>
              <span className="text-[#FF8C8C]">− {fmt(breakdown.unpaidLeaveDeduction)}</span>
            </div>
          )}
          {deductEPF && (
            <div className="flex justify-between">
              <span className="text-white/45">EPF (Third Schedule, 11%)</span>
              <span className="text-[#FF8C8C]">− {fmt(breakdown.epfAmount)}</span>
            </div>
          )}
          {deductSOCSO && (
            <div className="flex justify-between">
              <span className="text-white/45">SOCSO (PERKESO, ~0.5%)</span>
              <span className="text-[#FF8C8C]">− {fmt(breakdown.socsoAmount)}</span>
            </div>
          )}
          {deductEIS && (
            <div className="flex justify-between">
              <span className="text-white/45">EIS (0.2%, capped RM6k)</span>
              <span className="text-[#FF8C8C]">− {fmt(breakdown.eisAmount)}</span>
            </div>
          )}
          {inputs.customDeductions.map((d, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-white/45">{d.name || "Custom"}</span>
              <span className="text-[#FF8C8C]">− {fmt(d.amount)}</span>
            </div>
          ))}
          {!hasAnyDeduction && (
            <p className="text-xs text-white/30 italic">No deductions applied.</p>
          )}
        </div>

        {/* Total Deductions subtotal */}
        {breakdown.totalDeductions > 0 && (
          <div className="mt-3 flex justify-between text-sm border-t border-white/10 pt-3">
            <span className="text-white/55">Total Deductions</span>
            <span className="font-semibold text-[#FF8C8C]">− {fmt(breakdown.totalDeductions)}</span>
          </div>
        )}

        {/* Net */}
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
          onClick={onPlanClick}
          className="flex-1 rounded-full bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(106,73,250,0.55)] active:scale-[0.98]"
        >
          Plan This Month →
        </button>
      </div>
    </div>
  );
}