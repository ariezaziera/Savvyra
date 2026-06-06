"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Pencil, Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { SectionCard, Field, Input, fmt, MONTHS, SOURCE_TYPES, SOURCE_COLORS } from "./SalaryShared";
import type { SalaryMonth, PlanItem } from "./SalaryShared";
import type { Allowance, CustomDeduction } from "@/lib/salaryCalc";
import { calcSalary } from "@/lib/salaryCalc";

type Props = {
  months: SalaryMonth[];
  setMonths: React.Dispatch<React.SetStateAction<SalaryMonth[]>>;
  showToast: (msg: string) => void;
};

export default function SalaryHistoryTab({ months, setMonths, showToast }: Props) {
  const [expandedMonth, setExpandedMonth]   = useState<string | null>(null);
  const [actualNetInput, setActualNetInput] = useState<Record<string, string>>({});
  const [bankBalInput, setBankBalInput]     = useState<Record<string, string>>({});
  const [reserveInput, setReserveInput]     = useState<Record<string, string>>({});
  const [editingMonth, setEditingMonth]     = useState<string | null>(null);
  const [editInputs, setEditInputs]         = useState<Record<string, any>>({});
  const [saving, setSaving]     = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const patch = async (id: string, data: any) => {
    const res = await fetch(`/api/salary/months/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setMonths((prev) => prev.map((m) => (m.id === id ? updated : m)));
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
    const m = months.find((x) => x.id === id);
    const actual = m?.actualNet ?? 0;
    const usable = actual + bank - reserve;
    const ok = await patch(id, { bankBalance: bank, fixedReserve: reserve, usableBalance: usable });
    if (ok) showToast("Balances saved ✅");
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
    const res = await fetch(`/api/salary/months/${id}`, { method: "DELETE" });
    if (res.ok) { setMonths((prev) => prev.filter((m) => m.id !== id)); showToast("Month deleted 🗑️"); }
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
      {/* Confirm Delete Modal */}
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
                    className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white transition">Cancel</button>
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
          const isExpanded = expandedMonth === m.id;
          const isEditing  = editingMonth  === m.id;
          const monthLabel = `${MONTHS[m.month - 1]} ${m.year}`;
          const planItems  = (m.salaryPlanItems ?? m.planItems ?? []) as PlanItem[];
          const included   = planItems.filter((i) => i.isIncluded);
          const planTotal  = included.reduce((s, i) => s + i.amount, 0);
          const ei         = editInputs[m.id];
          const editBreakdown = isEditing && ei ? calcSalary({ ...ei, month: m.month, year: m.year }) : null;

          const startEdit = () => {
            setEditInputs((prev) => ({
              ...prev,
              [m.id]: {
                basicSalary: m.basicSalary, allowances: m.allowances as Allowance[],
                customDeductions: m.customDeductions as CustomDeduction[],
                otRate: m.otRate, doublePayRate: m.doublePayRate,
                hoursPerDay: m.hoursPerDay ?? 7.5, dailyRateFormula: m.dailyRateFormula,
                unpaidLeaveDays: m.unpaidLeaveDays, annualLeaveDays: m.annualLeaveDays,
                medicalLeaveDays: m.medicalLeaveDays, replacementDays: m.replacementDays,
                otHours: m.otHours, doublePayHours: m.doublePayHours,
                month: m.month, year: m.year,
                salaryBasis: "monthly" as const,
                deductEPF: true, deductSOCSO: true, deductEIS: true,
              },
            }));
            setEditingMonth(m.id);
          };

          const updateEA = (i: number, field: keyof Allowance, value: any) => {
            setEditInputs((prev) => {
              const arr = [...prev[m.id].allowances];
              arr[i] = { ...arr[i], [field]: value };
              return { ...prev, [m.id]: { ...prev[m.id], allowances: arr } };
            });
          };
          const removeEA = (i: number) => setEditInputs((prev) => ({ ...prev, [m.id]: { ...prev[m.id], allowances: prev[m.id].allowances.filter((_: any, idx: number) => idx !== i) } }));

          const updateED = (i: number, field: keyof CustomDeduction, value: any) => {
            setEditInputs((prev) => {
              const arr = [...prev[m.id].customDeductions];
              arr[i] = { ...arr[i], [field]: value };
              return { ...prev, [m.id]: { ...prev[m.id], customDeductions: arr } };
            });
          };
          const removeED = (i: number) => setEditInputs((prev) => ({ ...prev, [m.id]: { ...prev[m.id], customDeductions: prev[m.id].customDeductions.filter((_: any, idx: number) => idx !== i) } }));

          return (
            <div key={m.id} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

              {/* Header */}
              <div className="w-full flex items-center justify-between px-6 py-5">
                <button className="flex-1 flex items-center justify-between text-left"
                  onClick={() => { if (isEditing) return; setExpandedMonth(isExpanded ? null : m.id); }}>
                  <div>
                    <p className="font-semibold text-white">{monthLabel}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Expected: {fmt(m.expectedNet)}
                      {m.actualNet != null && <> · Actual: <span className="text-[#8EE3B5]">{fmt(m.actualNet)}</span></>}
                      {m.usableBalance != null && <> · Usable: <span className="text-[#C4B5FD]">{fmt(m.usableBalance)}</span></>}
                      {planItems.length > 0 && <> · {planItems.length} plan items</>}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp size={18} className="text-white/40 mr-3" /> : <ChevronDown size={18} className="text-white/40 mr-3" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(m.id); }}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-white/20 hover:text-[#FF8C8C] hover:bg-[#FF8C8C]/15 transition shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-5 border-t border-white/10 pt-5">
                  {!isEditing ? (
                    <>
                      {/* Salary breakdown */}
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
                            <Input value={actualNetInput[m.id] ?? ""} onChange={(e: any) => setActualNetInput((p) => ({ ...p, [m.id]: e.target.value }))}
                              placeholder="Enter actual net" className="flex-1" />
                            <button onClick={() => submitActualNet(m.id)}
                              className="rounded-2xl bg-[#6A49FA]/30 px-4 text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition text-sm">Save</button>
                          </div>
                        )}
                      </div>

                      {/* Bank balance + reserve */}
                      {m.actualNet != null && (
                        <div className="space-y-3">
                          <p className="text-xs text-white/45 uppercase tracking-wider">Balance Planning</p>
                          {m.usableBalance != null ? (
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              {[
                                ["Bank Balance",   fmt(m.bankBalance ?? 0)],
                                ["Fixed Reserve",  fmt(m.fixedReserve ?? 0)],
                                ["Usable Balance", fmt(m.usableBalance)],
                              ].map(([label, val]) => (
                                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                  <p className="text-xs text-white/35">{label}</p>
                                  <p className={`font-semibold mt-1 ${label === "Usable Balance" ? "text-[#C4B5FD]" : "text-white"}`}>{val}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <Field label="Current Bank Balance (RM)">
                                  <Input value={bankBalInput[m.id] ?? ""} onChange={(e: any) => setBankBalInput((p) => ({ ...p, [m.id]: e.target.value }))} placeholder="0.00" className="w-full" />
                                </Field>
                                <Field label="Fixed Reserve (RM)">
                                  <Input value={reserveInput[m.id] ?? ""} onChange={(e: any) => setReserveInput((p) => ({ ...p, [m.id]: e.target.value }))} placeholder="0.00" className="w-full" />
                                </Field>
                              </div>
                              <button onClick={() => submitBalances(m.id)}
                                className="rounded-2xl bg-[#6A49FA]/30 px-4 py-2 text-sm text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition w-full">
                                Calculate Usable Balance
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Plan items */}
                      {planItems.length > 0 && (
                        <div>
                          <p className="text-xs text-white/45 uppercase tracking-wider mb-3">Plan Items</p>
                          <div className="space-y-2">
                            {planItems.map((item, i) => (
                              <div key={i} className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${item.isIncluded ? "border-white/10 bg-white/5" : "border-white/5 bg-white/3 opacity-50"}`}>
                                <span className={`rounded-xl px-2 py-0.5 text-xs font-medium shrink-0 ${SOURCE_COLORS[item.sourceType]}`}>{item.sourceType}</span>
                                <span className="flex-1 text-sm text-white">{item.label}</span>
                                <span className="text-sm font-semibold text-white">{fmt(item.amount)}</span>
                                {!item.isIncluded && <span className="text-[10px] text-white/30 italic">skipped</span>}
                              </div>
                            ))}
                            <div className="flex justify-between text-xs pt-1 border-t border-white/10">
                              <span className="text-white/40">Total planned</span>
                              <span className="text-white/70">{fmt(planTotal)}</span>
                            </div>
                            {m.usableBalance != null && (
                              <div className="flex justify-between text-xs">
                                <span className="text-white/40">After plan</span>
                                <span className={m.usableBalance - planTotal < 0 ? "text-[#FF8C8C]" : "text-[#8EE3B5]"}>
                                  {fmt(m.usableBalance - planTotal)}
                                </span>
                              </div>
                            )}
                          </div>
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
                          <Field label="Basic Salary (RM)">
                            <Input value={ei.basicSalary || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], basicSalary: +e.target.value } }))} className="w-full" />
                          </Field>
                          <Field label="Hours / Day">
                            <Input value={ei.hoursPerDay || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], hoursPerDay: +e.target.value } }))} placeholder="7.5" className="w-full" />
                          </Field>
                        </div>
                        <Field label="Daily Rate Formula">
                          <select value={ei.dailyRateFormula} onChange={(e) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], dailyRateFormula: e.target.value } }))}
                            className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 backdrop-blur-xl">
                            <option value="basic/26" className="bg-[#1a1035]">Basic ÷ 26 (standard)</option>
                            <option value="basic/22" className="bg-[#1a1035]">Basic ÷ 22 (working days)</option>
                          </select>
                        </Field>
                      </div>

                      {/* Allowances */}
                      <div className="space-y-2">
                        <p className="text-xs text-white/45 uppercase tracking-wider">Allowances</p>
                        {ei.allowances.filter((a: any) => !a.isReimbursement).map((a: any, i: number) => (
                          <div key={i} className="space-y-1.5">
                            <div className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr 90px 20px" }}>
                              <Input value={a.name} onChange={(e: any) => updateEA(i, "name", e.target.value)} placeholder="Name" type="text" className="w-full" />
                              <Input value={a.amount || ""} onChange={(e: any) => updateEA(i, "amount", +e.target.value)} placeholder="RM" className="w-full" />
                              <button onClick={() => removeEA(i)} className="text-white/30 hover:text-[#FF8C8C] transition"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                        <button onClick={() => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], allowances: [...p[m.id].allowances, { name: "", amount: 0, cutOnAbsent: false, isReimbursement: false }] } }))}
                          className="flex items-center gap-1.5 text-xs text-[#C4B5FD] hover:text-white transition">
                          <Plus size={13} /> Add allowance
                        </button>
                      </div>

                      {/* Leave */}
                      <div className="space-y-2">
                        <p className="text-xs text-white/45 uppercase tracking-wider">Leave</p>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Unpaid"><Input value={ei.unpaidLeaveDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], unpaidLeaveDays: +e.target.value } }))} placeholder="days" className="w-full" /></Field>
                          <Field label="Annual"><Input value={ei.annualLeaveDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], annualLeaveDays: +e.target.value } }))} placeholder="days" className="w-full" /></Field>
                          <Field label="Medical"><Input value={ei.medicalLeaveDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], medicalLeaveDays: +e.target.value } }))} placeholder="days" className="w-full" /></Field>
                          <Field label="Replacement"><Input value={ei.replacementDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], replacementDays: +e.target.value } }))} placeholder="days" className="w-full" /></Field>
                        </div>
                      </div>

                      {/* OT */}
                      <div className="space-y-2">
                        <p className="text-xs text-white/45 uppercase tracking-wider">Overtime</p>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="OT Hours"><Input value={ei.otHours || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], otHours: +e.target.value } }))} placeholder="hrs" className="w-full" /></Field>
                          <Field label="OT Rate (×)"><Input value={ei.otRate || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], otRate: +e.target.value } }))} placeholder="1.5" className="w-full" /></Field>
                          <Field label="Double Pay Hrs"><Input value={ei.doublePayHours || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], doublePayHours: +e.target.value } }))} placeholder="hrs" className="w-full" /></Field>
                          <Field label="Double Pay Rate (×)"><Input value={ei.doublePayRate || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], doublePayRate: +e.target.value } }))} placeholder="2.0" className="w-full" /></Field>
                        </div>
                      </div>

                      {/* Custom deductions */}
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

                      {/* Recalculate preview */}
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
                          className="flex-1 rounded-full bg-[#6A49FA]/40 border border-[#6A49FA]/50 px-4 py-2.5 text-sm font-semibold text-[#C4B5FD] hover:bg-[#6A49FA]/60 transition flex items-center justify-center gap-2">
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