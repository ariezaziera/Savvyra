"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, CalendarDays, History } from "lucide-react";
import { calcSalary, type SalaryInputs } from "@/lib/salaryCalc";
import { type PlanItem, type SalaryMonth } from "@/components/salary/SalaryShared";
import SalaryCalculatorTab from "@/components/salary/SalaryCalculatorTab";
import SalaryPlanTab from "@/components/salary/SalaryPlanTab";
import SalaryHistoryTab from "@/components/salary/SalaryHistoryTab";

const now = new Date();

export default function SalaryPage() {
  const [tab, setTab]       = useState<"calculator" | "plan" | "history">("calculator");
  const [months, setMonths] = useState<SalaryMonth[]>([]);
  const [toast, setToast]   = useState("");
  const [saving, setSaving] = useState(false);
  const [calcMonth, setCalcMonth] = useState(now.getMonth() + 1);
  const [calcYear, setCalcYear]   = useState(now.getFullYear());
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);

  // All salary inputs in one flat state — no split state race condition
  const [basicSalary,       setBasicSalary]       = useState(0);
  const [allowances,        setAllowances]         = useState<any[]>([]);
  const [customDeductions,  setCustomDeductions]   = useState<any[]>([]);
  const [otRate,            setOtRate]             = useState(1.5);
  const [doublePayRate,     setDoublePayRate]      = useState(2.0);
  const [hoursPerDay,       setHoursPerDay]        = useState(7.5);
  const [dailyRateFormula,  setDailyRateFormula]   = useState("basic/26");
  const [unpaidLeaveDays,   setUnpaidLeaveDays]    = useState(0);
  const [annualLeaveDays,   setAnnualLeaveDays]    = useState(0);
  const [medicalLeaveDays,  setMedicalLeaveDays]   = useState(0);
  const [replacementDays,   setReplacementDays]    = useState(0);
  const [otHours,           setOtHours]            = useState(0);
  const [doublePayHours,    setDoublePayHours]      = useState(0);
  const [salaryBasis,       setSalaryBasis]        = useState<"monthly"|"daily">("monthly");
  const [daysWorked,        setDaysWorked]         = useState(0);
  const [deductEPF,         setDeductEPF]          = useState(true);
  const [deductSOCSO,       setDeductSOCSO]        = useState(true);
  const [deductEIS,         setDeductEIS]          = useState(true);
  const [salaryDay,         setSalaryDay]          = useState(25);

  // Build inputs object for SalaryCalculatorTab (it still uses the same Props shape)
  const inputs: SalaryInputs = {
    basicSalary, allowances, customDeductions,
    otRate, doublePayRate, hoursPerDay, dailyRateFormula,
    unpaidLeaveDays, annualLeaveDays, medicalLeaveDays, replacementDays,
    otHours, doublePayHours,
    month: calcMonth, year: calcYear,
    salaryBasis, daysWorked, deductEPF, deductSOCSO, deductEIS,
  };

  const setInputs = (updater: any) => {
    const next = typeof updater === "function" ? updater(inputs) : updater;
    if (next.basicSalary       !== undefined) setBasicSalary(next.basicSalary);
    if (next.allowances        !== undefined) setAllowances(next.allowances);
    if (next.customDeductions  !== undefined) setCustomDeductions(next.customDeductions);
    if (next.otRate            !== undefined) setOtRate(next.otRate);
    if (next.doublePayRate     !== undefined) setDoublePayRate(next.doublePayRate);
    if (next.hoursPerDay       !== undefined) setHoursPerDay(next.hoursPerDay);
    if (next.dailyRateFormula  !== undefined) setDailyRateFormula(next.dailyRateFormula);
    if (next.unpaidLeaveDays   !== undefined) setUnpaidLeaveDays(next.unpaidLeaveDays);
    if (next.annualLeaveDays   !== undefined) setAnnualLeaveDays(next.annualLeaveDays);
    if (next.medicalLeaveDays  !== undefined) setMedicalLeaveDays(next.medicalLeaveDays);
    if (next.replacementDays   !== undefined) setReplacementDays(next.replacementDays);
    if (next.otHours           !== undefined) setOtHours(next.otHours);
    if (next.doublePayHours    !== undefined) setDoublePayHours(next.doublePayHours);
  };

  useEffect(() => {
    // Load profile — each field set independently, no race condition
    fetch("/api/salary/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((p) => {
        if (!p || p.basicSalary === undefined) return;
        setBasicSalary(p.basicSalary      ?? 0);
        setAllowances(p.allowances         ?? []);
        setCustomDeductions(p.customDeductions ?? []);
        setOtRate(p.otRate                 ?? 1.5);
        setDoublePayRate(p.doublePayRate   ?? 2.0);
        setHoursPerDay(p.hoursPerDay       ?? 7.5);
        setDailyRateFormula(p.dailyRateFormula ?? "basic/26");
        setSalaryBasis(p.salaryBasis       ?? "monthly");
        setDeductEPF(p.deductEPF           ?? true);
        setDeductSOCSO(p.deductSOCSO       ?? true);
        setDeductEIS(p.deductEIS           ?? true);
        setSalaryDay(p.salaryDay           ?? 25);
      })
      .catch(() => {});

    fetch("/api/salary/months", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setMonths(Array.isArray(data) ? data : []));
  }, []);

  const breakdown = calcSalary({
    basicSalary, allowances, customDeductions,
    otRate, doublePayRate, hoursPerDay, dailyRateFormula,
    unpaidLeaveDays, annualLeaveDays, medicalLeaveDays, replacementDays,
    otHours, doublePayHours,
    month: calcMonth, year: calcYear,
    salaryBasis, daysWorked, deductEPF, deductSOCSO, deductEIS,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/salary/profile", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicSalary, allowances, customDeductions,
          otRate, doublePayRate, hoursPerDay, dailyRateFormula,
          salaryBasis, deductEPF, deductSOCSO, deductEIS, salaryDay,
        }),
      });
      showToast(res.ok ? "Default profile saved ✨" : "Failed to save profile ❌");
    } catch {
      showToast("Failed to save profile ❌");
    } finally {
      setSaving(false);
    }
  };

  const saveMonth = async () => {
    setSaving(true);
    const existing = months.find((m) => m.month === calcMonth && m.year === calcYear);

    if (existing) {
      const res = await fetch(`/api/salary/months/${existing.id}/plan-items`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planItems }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMonths((prev) => prev.map((m) => m.id === existing.id ? updated : m));
        showToast("Plan updated! ✅");
        setPlanItems([]);
      } else {
        showToast("Failed to update plan ❌");
      }
      setSaving(false);
      return;
    }

    const res = await fetch("/api/salary/months", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        basicSalary, allowances, customDeductions,
        otRate, doublePayRate, hoursPerDay, dailyRateFormula,
        unpaidLeaveDays, annualLeaveDays, medicalLeaveDays, replacementDays,
        otHours, doublePayHours,
        month: calcMonth, year: calcYear,
        salaryBasis, daysWorked, deductEPF, deductSOCSO, deductEIS,
        planItems,
      }),
    });
    if (res.ok) {
      const record = await res.json();
      setMonths((prev) => [record, ...prev]);
      // Also auto-save profile
      await fetch("/api/salary/profile", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicSalary, allowances, customDeductions,
          otRate, doublePayRate, hoursPerDay, dailyRateFormula,
          salaryBasis, deductEPF, deductSOCSO, deductEIS, salaryDay,
        }),
      });
      showToast("Salary plan saved! ✅");
      setPlanItems([]);
    } else {
      showToast("Failed to save ❌");
    }
    setSaving(false);
  };

  return (
    <PageContainer>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <style>{`
        .blob { position: fixed; border-radius: 9999px; pointer-events: none; z-index: 0; }
        .blob-1 { width: 500px; height: 500px; background: #6a49fa; top: -150px; left: -150px; filter: blur(130px); opacity: 0.45; }
        .blob-2 { width: 400px; height: 400px; background: #fedada; bottom: -100px; right: -100px; filter: blur(120px); opacity: 0.30; }
      `}</style>

      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          {toast}
        </div>
      )}

      <div className="relative z-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Payroll</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Salary Manager</h1>
          <p className="mt-1.5 text-sm text-white/50">Calculate, plan, and track your monthly salary.</p>
        </div>

        <div className="mb-6 flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
          {([
            { key: "calculator", label: "Calculator",   Icon: Calculator   },
            { key: "plan",       label: "Monthly Plan", Icon: CalendarDays },
            { key: "history",    label: "History",      Icon: History      },
          ] as const).map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${tab === key ? "bg-[#6A49FA]/30 text-[#C4B5FD] shadow-[inset_0_0_0_1px_rgba(196,181,253,0.3)]" : "text-white/45 hover:text-white"}`}>
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "calculator" && (
            <motion.div key="calc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SalaryCalculatorTab
                inputs={inputs} setInputs={setInputs}
                calcMonth={calcMonth} setCalcMonth={setCalcMonth}
                calcYear={calcYear}   setCalcYear={setCalcYear}
                breakdown={breakdown} saving={saving}
                saveProfile={saveProfile}
                onPlanClick={() => setTab("plan")}
                salaryBasis={salaryBasis} setSalaryBasis={setSalaryBasis}
                daysWorked={daysWorked}   setDaysWorked={setDaysWorked}
                deductEPF={deductEPF}     setDeductEPF={setDeductEPF}
                deductSOCSO={deductSOCSO} setDeductSOCSO={setDeductSOCSO}
                deductEIS={deductEIS}     setDeductEIS={setDeductEIS}
                salaryDay={salaryDay}     setSalaryDay={setSalaryDay}
              />
            </motion.div>
          )}
          {tab === "plan" && (
            <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SalaryPlanTab
                calcMonth={calcMonth} calcYear={calcYear}
                breakdown={breakdown}
                planItems={planItems} setPlanItems={setPlanItems}
                saving={saving} saveMonth={saveMonth}
              />
            </motion.div>
          )}
          {tab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SalaryHistoryTab
                months={months} setMonths={setMonths}
                showToast={showToast}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
