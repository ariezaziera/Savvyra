"use client";

import { useState } from "react";
import {
  Check, ChevronDown, ChevronUp, Pencil, Plus, Trash2, X,
  AlertTriangle, CheckCircle2, RefreshCw, Lock,
} from "lucide-react";
import { Input, fmt, MONTHS, SOURCE_COLORS } from "./SalaryShared";
import type { SalaryMonth, PlanItem } from "./SalaryShared";
import type { Allowance, CustomDeduction } from "@/lib/salaryCalc";
import { calcSalary } from "@/lib/salaryCalc";

type Props = {
  months:    SalaryMonth[];
  setMonths: React.Dispatch<React.SetStateAction<SalaryMonth[]>>;
  showToast: (msg: string) => void;
};

const colorMap: Record<string, string> = {
  DEBT: "#FF8C8C", COMMITMENT: "#C4B5FD",
  SAVINGS: "#8EE3B5", INVESTMENT: "#93C5FD", CUSTOM: "#FBD38D",
};

export default function SalaryHistoryTab({ months, setMonths, showToast }: Props) {
  const [expandedMonth, setExpandedMonth]     = useState<string | null>(null);
  const [actualNetInput, setActualNetInput]   = useState<Record<string, string>>({});
  const [bankBalInput, setBankBalInput]       = useState<Record<string, string>>({});
  const [reserveInput, setReserveInput]       = useState<Record<string, string>>({});
  const [editingMonth, setEditingMonth]       = useState<string | null>(null);
  const [editInputs, setEditInputs]           = useState<Record<string, any>>({});
  const [saving, setSaving]                   = useState(false);
  const [marking, setMarking]                 = useState<string | null>(null);
  const [payingItem, setPayingItem]           = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting]               = useState(false);

  const patch = async (id: string, data: any) => {
    const res = await fetch(`/api/salary/months/${id}`, {
      credentials: "include",
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setMonths((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    }
    return res.ok;
  };

  const submitActualNet = async (id: string) => {
    const val = actualNetInput[id];
    if (!val) return;
    const ok = await patch(id, { actualNet: parseFloat(val) });
    if (ok) showToast("Actual salary recorded ✅");
  };

  const submitBalances = async (id: string) => {
    const bank    = parseFloat(bankBalInput[id] ?? "0") || 0;
    const reserve = parseFloat(reserveInput[id] ?? "0") || 0;
    const m       = months.find((x) => x.id === id);
    const actual  = m?.actualNet ?? 0;
    const usable  = actual + bank - reserve;
    const ok = await patch(id, { bankBalance: bank, fixedReserve: reserve, usableBalance: usable });
    if (ok) showToast("Balances saved ✅");
  };

  const markReceived = async (id: string) => {
    setMarking(id);
    try {
      const res = await fetch(`/api/salary/months/${id}/mark-received`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const updated = await res.json();
        setMonths((prev) =>
          prev.map((x) =>
            x.id === id ? { ...x, ...updated, salaryPlanItems: x.salaryPlanItems } : x
          )
        );
        showToast("Salary confirmed received ✅ Income transaction created.");
      } else {
        const e = await res.json().catch(() => ({}));
        showToast(e.error ?? "Failed ❌");
      }
    } finally {
      setMarking(null);
    }
  };

  const markItemPaid = async (monthId: string, itemId: string, itemLabel: string) => {
    setPayingItem(itemId);
    try {
      const res = await fetch(`/api/salary/months/${monthId}/plan-items/${itemId}`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const updatedMonth = await res.json();
        setMonths((prev) =>
          prev.map((m) => (m.id === monthId ? { ...m, ...updatedMonth } : m))
        );
        showToast(`${itemLabel} marked paid ✅`);
      } else {
        const e = await res.json().catch(() => ({}));
        showToast(e.error ?? "Failed ❌");
      }
    } finally {
      setPayingItem(null);
    }
  };

  const saveMonthEdit = async (id: string) => {
    const inp = editInputs[id];
    if (!inp) return;
    setSaving(true);
    const ok = await patch(id, inp);
    if (ok) { setEditingMonth(null); showToast("Month updated ✅"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const res = await fetch(`/api/salary/months/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setMonths((prev) => prev.filter((m) => m.id !== id));
      showToast("Month deleted 🗑️");
    }
    setDeleting(false);
    setConfirmDeleteId(null);
  };

  if (months.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/40 text-sm">
        No salary months saved yet. Start from the Calculator tab!
      </div>
    );
  }

  return (
    <>
      {confirmDeleteId && (() => {
        const m = months.find((x) => x.id === confirmDeleteId);
        if (!m) return null;
        const label = `${MONTHS[m.month - 1]} ${m.year}`;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-[#1a1035] shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#FF8C8C]/15 border border-[#FF8C8C]/25 flex items-center justify-center">
                  <AlertTriangle size={22} className="text-[#FF8C8C]" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">Delete {label}?</p>
                  <p className="text-sm text-white/45 mt-1.5">This salary record will be permanently removed.</p>
                </div>
                <div className="flex gap-3 w-full pt-1">
                  <button onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white transition">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(confirmDeleteId)} disabled={deleting}
                    className="flex-1 rounded-full bg-[#FF8C8C]/20 border border-[#FF8C8C]/30 py-2.5 text-sm font-semibold text-[#FF8C8C] hover:bg-[#FF8C8C]/35 transition disabled:opacity-50">
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="space-y-4">
        {months.map((m) => {
          const isExpanded    = expandedMonth === m.id;
          const isEditing     = editingMonth  === m.id;
          const monthLabel    = `${MONTHS[m.month - 1]} ${m.year}`;
          const allPlanItems  = (m.salaryPlanItems ?? m.planItems ?? []) as PlanItem[];
          const included      = allPlanItems.filter((i) => i.isIncluded && i.sortOrder !== -1);
          const paidItems     = allPlanItems.filter((i) => i.sortOrder === -1);
          const planTotal     = included.reduce((s, i) => s + i.amount, 0);
          const ei            = editInputs[m.id];
          const editBreakdown = isEditing && ei ? calcSalary({ ...ei, month: m.month, year: m.year }) : null;
          const usable        = m.usableBalance ?? m.actualNet ?? 0;
          const planExceeds   = m.actualNet != null && planTotal > 0 && planTotal > usable;
          const surplus       = usable - planTotal;

          const byType: Record<string, number> = {};
          included.forEach((i) => { byType[i.sourceType] = (byType[i.sourceType] ?? 0) + i.amount; });

          const startEdit = () => {
            setEditInputs((prev) => ({
              ...prev,
              [m.id]: {
                basicSalary:      m.basicSalary,
                allowances:       m.allowances      as Allowance[],
                customDeductions: m.customDeductions as CustomDeduction[],
                otRate:           m.otRate,
                doublePayRate:    m.doublePayRate,
                hoursPerDay:      m.hoursPerDay      ?? 7.5,
                dailyRateFormula: m.dailyRateFormula,
                unpaidLeaveDays:  m.unpaidLeaveDays,
                annualLeaveDays:  m.annualLeaveDays,
                medicalLeaveDays: m.medicalLeaveDays,
                replacementDays:  m.replacementDays,
                otHours:          m.otHours,
                doublePayHours:   m.doublePayHours,
                month:            m.month,
                year:             m.year,
                salaryBasis:      "monthly" as const,
                deductEPF:        true,
                deductSOCSO:      true,
                deductEIS:        true,
              },
            }));
            setEditingMonth(m.id);
          };

          const updateEA = (i: number, field: keyof Allowance, value: any) =>
            setEditInputs((prev) => {
              const arr = [...prev[m.id].allowances];
              arr[i] = { ...arr[i], [field]: value };
              return { ...prev, [m.id]: { ...prev[m.id], allowances: arr } };
            });
          const removeEA = (i: number) =>
            setEditInputs((prev) => ({
              ...prev,
              [m.id]: { ...prev[m.id], allowances: prev[m.id].allowances.filter((_: any, idx: number) => idx !== i) },
            }));

          const updateED = (i: number, field: keyof CustomDeduction, value: any) =>
            setEditInputs((prev) => {
              const arr = [...prev[m.id].customDeductions];
              arr[i] = { ...arr[i], [field]: value };
              return { ...prev, [m.id]: { ...prev[m.id], customDeductions: arr } };
            });
          const removeED = (i: number) =>
            setEditInputs((prev) => ({
              ...prev,
              [m.id]: { ...prev[m.id], customDeductions: prev[m.id].customDeductions.filter((_: any, idx: number) => idx !== i) },
            }));

          return (
            <div key={m.id} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

              {/* Header */}
              <div className="w-full flex items-center justify-between px-6 py-5">
                <button className="flex-1 flex items-center justify-between text-left"
                  onClick={() => { if (isEditing) return; setExpandedMonth(isExpanded ? null : m.id); }}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white">{monthLabel}</p>
                      {m.isMarkedReceived && (
                        <span className="flex items-center gap-1 rounded-full bg-[#8EE3B5]/15 px-2 py-0.5 text-[10px] font-semibold text-[#8EE3B5]">
                          <CheckCircle2 size={10} /> Received
                        </span>
                      )}
                      {paidItems.length > 0 && (
                        <span className="rounded-full bg-[#C4B5FD]/15 px-2 py-0.5 text-[10px] font-semibold text-[#C4B5FD]">
                          {paidItems.length}/{allPlanItems.filter(i => i.isIncluded).length} paid
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                      Expected: {fmt(m.expectedNet)}
                      {m.actualNet != null && <> · Actual: <span className="text-[#8EE3B5]">{fmt(m.actualNet)}</span></>}
                      {m.usableBalance != null && <> · Usable: <span className="text-[#C4B5FD]">{fmt(m.usableBalance)}</span></>}
                    </p>
                  </div>
                  {isExpanded
                    ? <ChevronUp size={18} className="text-white/40 mr-3" />
                    : <ChevronDown size={18} className="text-white/40 mr-3" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(m.id); }}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-white/20 hover:text-[#FF8C8C] hover:bg-[#FF8C8C]/15 transition shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="px-5 pb-6 space-y-5 border-t border-white/10 pt-5">
                  {!isEditing ? (
                    <>
                      {/* Salary breakdown */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/45">Basic Salary</span>
                          <span className="text-white">{fmt(m.basicSalary)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-b border-white/10">
                          <span className="text-white/55 font-medium">Gross Salary</span>
                          <span className="text-white font-medium">{fmt(m.grossSalary)}</span>
                        </div>
                        <div className="pt-1 space-y-1.5">
                          {[
                            ["EPF",   fmt(m.epfAmount)],
                            ["SOCSO", fmt(m.socsoAmount)],
                            ["EIS",   fmt(m.eisAmount)],
                            ...(m.customDeductTotal > 0 ? [["Other Deductions", fmt(m.customDeductTotal)]] : []),
                          ].map(([label, val]) => (
                            <div key={label} className="flex justify-between text-xs">
                              <span className="text-white/35">{label}</span>
                              <span className="text-[#FF8C8C]">− {val}</span>
                            </div>
                          ))}
                        </div>
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
                              placeholder="Enter actual net"
                              className="flex-1"
                            />
                            <button onClick={() => submitActualNet(m.id)}
                              className="rounded-2xl bg-[#6A49FA]/30 px-4 text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition text-sm">
                              Save
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Balance Planning */}
                      {m.actualNet != null && (
                        <div className="space-y-3">
                          <p className="text-xs text-white/45 uppercase tracking-wider">Balance Planning</p>
                          {m.usableBalance != null ? (
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                ["Bank",    fmt(m.bankBalance  ?? 0)],
                                ["Reserve", fmt(m.fixedReserve ?? 0)],
                                ["Usable",  fmt(m.usableBalance)],
                              ].map(([label, val]) => (
                                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                  <p className="text-[10px] text-white/35">{label}</p>
                                  <p className={`font-semibold mt-1 text-xs ${label === "Usable" ? "text-[#C4B5FD]" : "text-white"}`}>{val}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <p className="text-[10px] text-white/40 mb-1">Bank Balance (RM)</p>
                                  <Input
                                    value={bankBalInput[m.id] ?? ""}
                                    onChange={(e: any) => setBankBalInput((p) => ({ ...p, [m.id]: e.target.value }))}
                                    placeholder="0.00"
                                    className="w-full"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] text-white/40 mb-1">Fixed Reserve (RM)</p>
                                  <Input
                                    value={reserveInput[m.id] ?? ""}
                                    onChange={(e: any) => setReserveInput((p) => ({ ...p, [m.id]: e.target.value }))}
                                    placeholder="0.00"
                                    className="w-full"
                                  />
                                </div>
                              </div>
                              <button onClick={() => submitBalances(m.id)}
                                className="rounded-2xl bg-[#6A49FA]/30 px-4 py-2 text-sm text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition w-full">
                                Calculate Usable Balance
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Replan warning */}
                      {planExceeds && (
                        <div className="flex items-start gap-3 rounded-2xl border border-[#FF8C8C]/25 bg-[#FF8C8C]/10 px-4 py-3">
                          <AlertTriangle size={16} className="text-[#FF8C8C] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-[#FF8C8C]">Plan exceeds usable balance by {fmt(Math.abs(surplus))}</p>
                            <p className="text-xs text-white/45 mt-0.5">Your actual salary can't cover this plan. Go to the Plan tab to adjust.</p>
                          </div>
                        </div>
                      )}

                      {/* Plan items */}
                      {allPlanItems.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-white/45 uppercase tracking-wider">Plan Items</p>
                            {!m.isMarkedReceived && (
                              <p className="text-[10px] text-white/30 flex items-center gap-1">
                                <Lock size={10} /> Confirm receipt first to unlock
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            {included.map((item) => {
                              const isPaying = payingItem === item.id;
                              const canPay   = m.isMarkedReceived;
                              return (
                                <div key={item.id ?? item.label}
                                  className="flex items-center gap-2 rounded-2xl px-3 py-3 border border-white/10 bg-white/5">
                                  <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${SOURCE_COLORS[item.sourceType]}`}>
                                    {item.sourceType}
                                  </span>
                                  <span className="flex-1 text-sm text-white truncate min-w-0">{item.label}</span>
                                  <span className="text-sm font-semibold text-white shrink-0">{fmt(item.amount)}</span>
                                  <button
                                    onClick={() => item.id && canPay && markItemPaid(m.id, item.id, item.label)}
                                    disabled={!canPay || isPaying}
                                    title={canPay ? "Mark as paid" : "Confirm salary received first"}
                                    className={`shrink-0 h-8 w-8 rounded-xl border flex items-center justify-center transition ${
                                      canPay
                                        ? "border-[#8EE3B5]/30 bg-[#8EE3B5]/10 text-[#8EE3B5] hover:bg-[#8EE3B5]/25"
                                        : "border-white/10 bg-white/5 text-white/20 cursor-not-allowed"
                                    }`}
                                  >
                                    {isPaying
                                      ? <RefreshCw size={12} className="animate-spin" />
                                      : canPay ? <Check size={13} /> : <Lock size={11} />
                                    }
                                  </button>
                                </div>
                              );
                            })}

                            {paidItems.length > 0 && (
                              <>
                                <p className="text-[10px] text-white/30 uppercase tracking-wider pt-2">Paid</p>
                                {paidItems.map((item) => (
                                  <div key={item.id ?? item.label}
                                    className="flex items-center gap-2 rounded-2xl px-3 py-3 border border-[#8EE3B5]/15 bg-[#8EE3B5]/5 opacity-70">
                                    <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${SOURCE_COLORS[item.sourceType]}`}>
                                      {item.sourceType}
                                    </span>
                                    <span className="flex-1 text-sm text-white/60 line-through truncate min-w-0">{item.label}</span>
                                    <span className="text-sm text-white/40 shrink-0">{fmt(item.amount)}</span>
                                    <CheckCircle2 size={16} className="text-[#8EE3B5] shrink-0" />
                                  </div>
                                ))}
                              </>
                            )}
                          </div>

                          {Object.keys(byType).length > 0 && (
                            <div className="mt-4 space-y-2.5">
                              {Object.entries(byType).map(([type, total]) => {
                                const pct = usable > 0 ? Math.min(100, (total / usable) * 100) : 0;
                                return (
                                  <div key={type}>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-white/50">{type}</span>
                                      <span className="text-white/70">{fmt(total)} <span className="text-white/30">({pct.toFixed(1)}%)</span></span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colorMap[type] ?? "#C4B5FD" }} />
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="pt-2 border-t border-white/10 flex justify-between text-xs">
                                <span className="text-white/40">Total planned</span>
                                <span className={planExceeds ? "text-[#FF8C8C]" : "text-[#8EE3B5]"}>
                                  {fmt(planTotal)} {usable > 0 && `(${((planTotal / usable) * 100).toFixed(1)}%)`}
                                </span>
                              </div>
                              {!planExceeds && usable > 0 && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-white/40">Remaining after plan</span>
                                  <span className="text-[#8EE3B5]">{fmt(surplus)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Confirm Salary Received */}
                      {!m.isMarkedReceived && m.actualNet != null && (
                        <button
                          onClick={() => markReceived(m.id)}
                          disabled={marking === m.id}
                          className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8EE3B5]/20 to-[#4ade80]/10 border border-[#8EE3B5]/30 py-3 text-sm font-semibold text-[#8EE3B5] hover:bg-[#8EE3B5]/25 transition disabled:opacity-50"
                        >
                          {marking === m.id
                            ? <><RefreshCw size={14} className="animate-spin" /> Processing…</>
                            : <><CheckCircle2 size={14} /> Confirm Salary Received</>
                          }
                        </button>
                      )}

                      {m.isMarkedReceived && (
                        <div className="flex items-center gap-2 text-xs text-[#8EE3B5]/70 pt-1">
                          <CheckCircle2 size={13} />
                          Salary confirmed received. Mark each plan item as paid individually above.
                        </div>
                      )}

                      <button onClick={startEdit} className="flex items-center gap-2 text-xs text-white/40 hover:text-[#C4B5FD] transition">
                        <Pencil size={13} /> Edit this month's figures
                      </button>
                    </>
                  ) : (
                    /* EDIT MODE */
                    <div className="space-y-5">
                      <p className="text-xs text-[#FBD38D]/80">✏ Editing {monthLabel} — changes will recalculate the breakdown.</p>

                      <div className="space-y-3">
                        <p className="text-xs text-white/45 uppercase tracking-wider">Basic Pay</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-white/40 mb-1">Basic Salary (RM)</p>
                            <Input value={ei.basicSalary || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], basicSalary: +e.target.value } }))} className="w-full" />
                          </div>
                          <div>
                            <p className="text-[10px] text-white/40 mb-1">Hours / Day</p>
                            <Input value={ei.hoursPerDay || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], hoursPerDay: +e.target.value } }))} placeholder="7.5" className="w-full" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-white/45 uppercase tracking-wider">Allowances</p>
                        {ei.allowances.filter((a: any) => !a.isReimbursement).map((a: any, i: number) => (
                          <div key={i} className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr 90px 20px" }}>
                            <Input value={a.name} onChange={(e: any) => updateEA(i, "name", e.target.value)} placeholder="Name" type="text" className="w-full" />
                            <Input value={a.amount || ""} onChange={(e: any) => updateEA(i, "amount", +e.target.value)} placeholder="RM" className="w-full" />
                            <button onClick={() => removeEA(i)} className="text-white/30 hover:text-[#FF8C8C] transition"><Trash2 size={14} /></button>
                          </div>
                        ))}
                        <button onClick={() => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], allowances: [...p[m.id].allowances, { name: "", amount: 0, cutOnAbsent: false, isReimbursement: false }] } }))}
                          className="flex items-center gap-1.5 text-xs text-[#C4B5FD] hover:text-white transition">
                          <Plus size={13} /> Add allowance
                        </button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-white/45 uppercase tracking-wider">Leave</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div><p className="text-[10px] text-white/40 mb-1">Unpaid</p><Input value={ei.unpaidLeaveDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], unpaidLeaveDays: +e.target.value } }))} placeholder="days" className="w-full" /></div>
                          <div><p className="text-[10px] text-white/40 mb-1">Annual</p><Input value={ei.annualLeaveDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], annualLeaveDays: +e.target.value } }))} placeholder="days" className="w-full" /></div>
                          <div><p className="text-[10px] text-white/40 mb-1">Medical</p><Input value={ei.medicalLeaveDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], medicalLeaveDays: +e.target.value } }))} placeholder="days" className="w-full" /></div>
                          <div><p className="text-[10px] text-white/40 mb-1">Replacement</p><Input value={ei.replacementDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], replacementDays: +e.target.value } }))} placeholder="days" className="w-full" /></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-white/45 uppercase tracking-wider">Overtime</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div><p className="text-[10px] text-white/40 mb-1">OT Hours</p><Input value={ei.otHours || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], otHours: +e.target.value } }))} placeholder="hrs" className="w-full" /></div>
                          <div><p className="text-[10px] text-white/40 mb-1">OT Rate (×)</p><Input value={ei.otRate || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], otRate: +e.target.value } }))} placeholder="1.5" className="w-full" /></div>
                          <div><p className="text-[10px] text-white/40 mb-1">Double Pay Hrs</p><Input value={ei.doublePayHours || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], doublePayHours: +e.target.value } }))} placeholder="hrs" className="w-full" /></div>
                          <div><p className="text-[10px] text-white/40 mb-1">Double Pay Rate (×)</p><Input value={ei.doublePayRate || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], doublePayRate: +e.target.value } }))} placeholder="2.0" className="w-full" /></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-white/45 uppercase tracking-wider">Custom Deductions</p>
                        {ei.customDeductions.map((d: any, i: number) => (
                          <div key={i} className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr 90px 20px" }}>
                            <Input value={d.name} onChange={(e: any) => updateED(i, "name", e.target.value)} placeholder="e.g. KRSM" type="text" className="w-full" />
                            <Input value={d.amount || ""} onChange={(e: any) => updateED(i, "amount", +e.target.value)} placeholder="RM" className="w-full" />
                            <button onClick={() => removeED(i)} className="text-white/30 hover:text-[#FF8C8C] transition"><Trash2 size={14} /></button>
                          </div>
                        ))}
                        <button onClick={() => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], customDeductions: [...p[m.id].customDeductions, { name: "", amount: 0 }] } }))}
                          className="flex items-center gap-1.5 text-xs text-[#C4B5FD] hover:text-white transition">
                          <Plus size={13} /> Add deduction
                        </button>
                      </div>

                      {editBreakdown && (
                        <div className="rounded-2xl border border-[#6A49FA]/25 bg-[#6A49FA]/10 px-4 py-3 space-y-1.5 text-sm">
                          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Recalculated Preview</p>
                          <div className="flex justify-between"><span className="text-white/50">Gross</span><span className="text-white">{fmt(editBreakdown.grossSalary)}</span></div>
                          <div className="flex justify-between"><span className="text-white/50">EPF</span><span className="text-[#FF8C8C]">− {fmt(editBreakdown.epfAmount)}</span></div>
                          <div className="flex justify-between"><span className="text-white/50">SOCSO</span><span className="text-[#FF8C8C]">− {fmt(editBreakdown.socsoAmount)}</span></div>
                          <div className="flex justify-between"><span className="text-white/50">EIS</span><span className="text-[#FF8C8C]">− {fmt(editBreakdown.eisAmount)}</span></div>
                          <div className="flex justify-between font-semibold border-t border-white/10 pt-2">
                            <span className="text-white">New Expected Net</span>
                            <span className="text-[#C4B5FD]">{fmt(editBreakdown.expectedNet)}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-1">
                        <button onClick={() => setEditingMonth(null)}
                          className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/60 hover:text-white transition flex items-center justify-center gap-2">
                          <X size={14} /> Cancel
                        </button>
                        <button onClick={() => saveMonthEdit(m.id)} disabled={saving}
                          className="flex-1 rounded-full bg-[#6A49FA]/40 border border-[#6A49FA]/50 px-4 py-2.5 text-sm font-semibold text-[#C4B5FD] hover:bg-[#6A49FA]/60 transition flex items-center justify-center gap-2 disabled:opacity-50">
                          <Check size={14} /> {saving ? "Saving…" : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}