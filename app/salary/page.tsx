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

const defaultProfile: SalaryInputs = {
  basicSalary: 0,
  allowances: [],
  customDeductions: [],
  otRate: 1.5,
  doublePayRate: 2.0,
  hoursPerDay: 7.5,
  dailyRateFormula: "basic/26",
  unpaidLeaveDays: 0,
  annualLeaveDays: 0,
  medicalLeaveDays: 0,
  replacementDays: 0,
  otHours: 0,
  doublePayHours: 0,
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  salaryBasis: "monthly",
  daysWorked: 0,
  deductEPF: true,
  deductSOCSO: true,
  deductEIS: true,
};

export default function SalaryPage() {
  const [tab, setTab]       = useState<"calculator" | "plan" | "history">("calculator");
  const [months, setMonths] = useState<SalaryMonth[]>([]);
  const [toast, setToast]   = useState("");
  const [saving, setSaving] = useState(false);
  const [calcMonth, setCalcMonth] = useState(now.getMonth() + 1);
  const [calcYear, setCalcYear]   = useState(now.getFullYear());
  const [inputs, setInputs]       = useState<SalaryInputs>(defaultProfile);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);

  const [salaryBasis, setSalaryBasis] = useState<"monthly" | "daily">("monthly");
  const [daysWorked, setDaysWorked]   = useState(0);
  const [deductEPF, setDeductEPF]     = useState(true);
  const [deductSOCSO, setDeductSOCSO] = useState(true);
  const [deductEIS, setDeductEIS]     = useState(true);
  const [salaryDay, setSalaryDay]     = useState(25);

  // Sync month/year into inputs whenever pay period changes
  useEffect(() => {
    setInputs((p) => ({ ...p, month: calcMonth, year: calcYear }));
  }, [calcMonth, calcYear]);

  useEffect(() => {
    // Load saved profile — runs once on mount. We capture month/year via functional
    // updater so the profile load never races with the calcMonth/calcYear effect.
    fetch("/api/salary/profile")
      .then((r) => r.json())
      .then((profile) => {
        if (profile && profile.basicSalary !== undefined) {
          // Functional updater reads latest calcMonth/calcYear without stale closure
          setCalcMonth((cm) => {
            setCalcYear((cy) => {
              setInputs({
                basicSalary:      profile.basicSalary      ?? 0,
                allowances:       profile.allowances        ?? [],
                customDeductions: profile.customDeductions  ?? [],
                otRate:           profile.otRate            ?? 1.5,
                doublePayRate:    profile.doublePayRate     ?? 2.0,
                hoursPerDay:      profile.hoursPerDay       ?? 7.5,
                dailyRateFormula: profile.dailyRateFormula  ?? "basic/26",
                // Variable fields always reset to 0 on load
                unpaidLeaveDays:  0,
                annualLeaveDays:  0,
                medicalLeaveDays: 0,
                replacementDays:  0,
                otHours:          0,
                doublePayHours:   0,
                // Preserve whatever month/year the selectors are at
                month:            cm,
                year:             cy,
                salaryBasis:      profile.salaryBasis  ?? "monthly",
                daysWorked:       0,
                deductEPF:        profile.deductEPF    ?? true,
                deductSOCSO:      profile.deductSOCSO  ?? true,
                deductEIS:        profile.deductEIS    ?? true,
              });
              return cy;
            });
            return cm;
          });
          setSalaryBasis(profile.salaryBasis ?? "monthly");
          setDeductEPF(profile.deductEPF     ?? true);
          setDeductSOCSO(profile.deductSOCSO ?? true);
          setDeductEIS(profile.deductEIS     ?? true);
          setSalaryDay(profile.salaryDay     ?? 25);
        }
      })
      .catch(() => {});

    fetch("/api/salary/months")
      .then((r) => r.json())
      .then((data) => setMonths(Array.isArray(data) ? data : []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const breakdown = calcSalary({
    ...inputs,
    month: calcMonth,
    year: calcYear,
    salaryBasis,
    daysWorked,
    deductEPF,
    deductSOCSO,
    deductEIS,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    await fetch("/api/salary/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...inputs, salaryBasis, deductEPF, deductSOCSO, deductEIS, salaryDay }),
    });
    setSaving(false);
    showToast("Profile saved ✨");
  };

  const saveMonth = async () => {
    setSaving(true);
    const existing = months.find((m) => m.month === calcMonth && m.year === calcYear);

    if (existing) {
      // Month already exists — update plan items only via PATCH
      const res = await fetch(`/api/salary/months/${existing.id}/plan-items`, {
        method: "PUT",
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...inputs,
        month: calcMonth,
        year: calcYear,
        salaryBasis,
        daysWorked,
        deductEPF,
        deductSOCSO,
        deductEIS,
        planItems,
      }),
    });
    if (res.ok) {
      const record = await res.json();
      setMonths((prev) => [record, ...prev]);
      // Also auto-save profile so fixed fields persist
      await fetch("/api/salary/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inputs, salaryBasis, deductEPF, deductSOCSO, deductEIS, salaryDay }),
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

        {/* Tabs */}
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
                calcYear={calcYear} setCalcYear={setCalcYear}
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