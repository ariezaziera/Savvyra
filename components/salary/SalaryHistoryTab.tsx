"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { SectionCard, Field, Input, fmt, MONTHS, ALLOCATION_CATEGORIES, CATEGORY_COLORS } from "./SalaryShared";
import type { SalaryMonth, AllocationItem } from "./SalaryShared";
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
  const [editingMonth, setEditingMonth]     = useState<string | null>(null);
  const [editInputs, setEditInputs]         = useState<Record<string, any>>({});
  const [editingAllocations, setEditingAllocations] = useState<Record<string, AllocationItem[]>>({});
  const [editingAllocMonth, setEditingAllocMonth]   = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const saveMonthEdit = async (id: string) => {
    const inp = editInputs[id];
    if (!inp) return;
    setSaving(true);
    const res = await fetch(`/api/salary/months/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inp),
    });
    if (res.ok) {
      const updated = await res.json();
      setMonths((prev) => prev.map((m) => (m.id === id ? updated : m)));
      setEditingMonth(null);
      showToast("Month updated ✅");
    }
    setSaving(false);
  };

  const saveAllocations = async (monthId: string) => {
    const allocs = editingAllocations[monthId];
    if (!allocs) return;
    setSaving(true);
    const res = await fetch(`/api/salary/months/${monthId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allocations: allocs }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMonths((prev) => prev.map((m) => (m.id === monthId ? updated : m)));
      setEditingAllocMonth(null);
      showToast("Allocations updated ✅");
    }
    setSaving(false);
  };

  if (months.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/40 text-sm">
        No salary months saved yet. Start from the Calculator tab!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {months.map((m) => {
        const isExpanded = expandedMonth === m.id;
        const isEditing  = editingMonth === m.id;
        const monthLabel = `${MONTHS[m.month - 1]} ${m.year}`;
        const allocs     = m.allocations as AllocationItem[];
        const fulfilled  = allocs.filter((a) => a.isFulfilled).length;
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

        const removeEA = (i: number) => {
          setEditInputs((prev) => ({
            ...prev,
            [m.id]: { ...prev[m.id], allowances: prev[m.id].allowances.filter((_: any, idx: number) => idx !== i) },
          }));
        };

        const updateED = (i: number, field: keyof CustomDeduction, value: any) => {
          setEditInputs((prev) => {
            const arr = [...prev[m.id].customDeductions];
            arr[i] = { ...arr[i], [field]: value };
            return { ...prev, [m.id]: { ...prev[m.id], customDeductions: arr } };
          });
        };

        const removeED = (i: number) => {
          setEditInputs((prev) => ({
            ...prev,
            [m.id]: { ...prev[m.id], customDeductions: prev[m.id].customDeductions.filter((_: any, idx: number) => idx !== i) },
          }));
        };

        return (
          <div key={m.id} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

            {/* Header */}
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-left"
              onClick={() => { if (isEditing) return; setExpandedMonth(isExpanded ? null : m.id); }}
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

                {/* VIEW MODE */}
                {!isEditing && (
                  <>
                    <div className="space-y-2 text-sm">
                      {[
                        ["Basic Salary", fmt(m.basicSalary)],
                        ["Gross Salary", fmt(m.grossSalary)],
                        ["EPF", `− ${fmt(m.epfAmount)}`],
                        ["SOCSO", `− ${fmt(m.socsoAmount)}`],
                        ["EIS", `− ${fmt(m.eisAmount)}`],
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
                          <Input value={actualNetInput[m.id] ?? ""} onChange={(e: any) => setActualNetInput((p) => ({ ...p, [m.id]: e.target.value }))} placeholder="Enter actual net salary" className="flex-1" />
                          <button onClick={() => submitActualNet(m.id)} className="rounded-2xl bg-[#6A49FA]/30 px-4 text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition text-sm">Save</button>
                        </div>
                      )}
                    </div>

                    {/* Allocations */}
                    {allocs.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-white/45 uppercase tracking-wider">Allocation Plan</p>
                          {editingAllocMonth !== m.id ? (
                            <button onClick={() => { setEditingAllocations((prev) => ({ ...prev, [m.id]: [...allocs] })); setEditingAllocMonth(m.id); }} className="flex items-center gap-1.5 text-xs text-white/35 hover:text-[#C4B5FD] transition">
                              <Pencil size={12} /> Edit
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button onClick={() => setEditingAllocMonth(null)} className="text-xs text-white/35 hover:text-white transition">Cancel</button>
                              <button onClick={() => saveAllocations(m.id)} disabled={saving} className="text-xs text-[#C4B5FD] hover:text-white transition font-medium">{saving ? "Saving…" : "Save"}</button>
                            </div>
                          )}
                        </div>

                        {editingAllocMonth !== m.id ? (
                          <div className="space-y-2">
                            {allocs.map((a, i) => (
                              <div key={i} className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${a.isFulfilled ? "border-white/5 bg-white/3 opacity-60" : "border-white/10 bg-white/5"}`}>
                                <span className={`rounded-xl px-2 py-0.5 text-xs font-medium capitalize ${CATEGORY_COLORS[a.category]}`}>{a.category}</span>
                                <span className="flex-1 text-sm text-white">{a.label}</span>
                                <span className="text-sm font-semibold text-white">{fmt(a.amount)}</span>
                                {a.isFulfilled ? (
                                  <Check size={16} className="text-[#8EE3B5]" />
                                ) : (
                                  <button onClick={() => fulfillAllocation(m.id, i)} className="rounded-xl bg-[#6A49FA]/20 px-3 py-1 text-xs text-[#C4B5FD] hover:bg-[#6A49FA]/40 transition">Mark paid</button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(editingAllocations[m.id] ?? []).map((a, i) => (
                              <div key={i} className={`rounded-2xl border p-3 space-y-2 ${a.isFulfilled ? "border-white/5 bg-white/3 opacity-60" : "border-white/10 bg-white/5"}`}>
                                <div className="flex flex-wrap gap-1.5">
                                  {ALLOCATION_CATEGORIES.map((cat) => (
                                    <button
                                      key={cat}
                                      disabled={a.isFulfilled}
                                      onClick={() => setEditingAllocations((prev) => { const arr = [...prev[m.id]]; arr[i] = { ...arr[i], category: cat }; return { ...prev, [m.id]: arr }; })}
                                      className={`rounded-xl px-2.5 py-1 text-xs font-medium capitalize transition ${a.category === cat ? CATEGORY_COLORS[cat] : "text-white/30 bg-white/5 hover:bg-white/10"}`}
                                    >{cat}</button>
                                  ))}
                                </div>
                                <div className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr 90px 20px" }}>
                                  <Input value={a.label} onChange={(e: any) => setEditingAllocations((prev) => { const arr = [...prev[m.id]]; arr[i] = { ...arr[i], label: e.target.value }; return { ...prev, [m.id]: arr }; })} placeholder="Label" type="text" className="w-full" disabled={a.isFulfilled} />
                                  <Input value={a.amount || ""} onChange={(e: any) => setEditingAllocations((prev) => { const arr = [...prev[m.id]]; arr[i] = { ...arr[i], amount: +e.target.value }; return { ...prev, [m.id]: arr }; })} placeholder="RM" className="w-full" disabled={a.isFulfilled} />
                                  <button disabled={a.isFulfilled} onClick={() => setEditingAllocations((prev) => ({ ...prev, [m.id]: prev[m.id].filter((_, idx) => idx !== i) }))} className="text-white/25 hover:text-[#FF8C8C] transition disabled:opacity-30 disabled:cursor-not-allowed"><Trash2 size={14} /></button>
                                </div>
                                {a.isFulfilled && <p className="text-[10px] text-white/30">Already fulfilled — cannot edit</p>}
                              </div>
                            ))}
                            <button onClick={() => setEditingAllocations((prev) => ({ ...prev, [m.id]: [...(prev[m.id] ?? []), { category: "spends", label: "", amount: 0, isFulfilled: false }] }))} className="flex items-center gap-1.5 text-xs text-[#C4B5FD] hover:text-white transition">
                              <Plus size={13} /> Add allocation
                            </button>
                            {(() => {
                              const total = (editingAllocations[m.id] ?? []).reduce((s, a) => s + a.amount, 0);
                              const remaining = m.expectedNet - total;
                              return (
                                <div className="flex justify-between text-xs pt-1 border-t border-white/10">
                                  <span className="text-white/40">Total allocated</span>
                                  <span className={remaining < 0 ? "text-[#FF8C8C]" : "text-white/70"}>{fmt(total)} · {remaining < 0 ? "over by " : "remaining "}{fmt(Math.abs(remaining))}</span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    <button onClick={startEdit} className="flex items-center gap-2 text-xs text-white/40 hover:text-[#C4B5FD] transition">
                      <Pencil size={13} /> Edit this month's figures
                    </button>
                  </>
                )}

                {/* EDIT MODE */}
                {isEditing && ei && (
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
                        <select value={ei.dailyRateFormula} onChange={(e) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], dailyRateFormula: e.target.value } }))} className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 focus:ring-2 focus:ring-[#6A49FA]/20 backdrop-blur-xl">
                          <option value="basic/26" className="bg-[#1a1035]">Basic ÷ 26 (standard)</option>
                          <option value="basic/22" className="bg-[#1a1035]">Basic ÷ 22 (working days)</option>
                        </select>
                      </Field>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-white/45 uppercase tracking-wider">Allowances</p>
                      {ei.allowances.filter((a: any) => !a.isReimbursement).map((a: any, i: number) => (
                        <div key={i} className="space-y-1.5">
                          <div className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr 90px 20px" }}>
                            <Input value={a.name} onChange={(e: any) => updateEA(i, "name", e.target.value)} placeholder="Name" type="text" className="w-full" />
                            <Input value={a.amount || ""} onChange={(e: any) => updateEA(i, "amount", +e.target.value)} placeholder="RM" className="w-full" />
                            <button onClick={() => removeEA(i)} className="text-white/30 hover:text-[#FF8C8C] transition"><Trash2 size={14} /></button>
                          </div>
                          <button onClick={() => updateEA(i, "cutOnAbsent", !a.cutOnAbsent)} className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${a.cutOnAbsent ? "bg-[#FF8C8C]/20 text-[#FF8C8C] border border-[#FF8C8C]/30" : "bg-white/5 text-white/35 border border-white/10"}`}>
                            {a.cutOnAbsent ? "✕" : "○"} Cut on unpaid leave
                          </button>
                        </div>
                      ))}
                      <button onClick={() => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], allowances: [...p[m.id].allowances, { name: "", amount: 0, cutOnAbsent: false, isReimbursement: false }] } }))} className="flex items-center gap-1.5 text-xs text-[#C4B5FD] hover:text-white transition">
                        <Plus size={13} /> Add allowance
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-white/45 uppercase tracking-wider">Claims</p>
                      {ei.allowances.filter((a: any) => a.isReimbursement).map((a: any, i: number) => {
                        const realIdx = ei.allowances.indexOf(a);
                        return (
                          <div key={i} className="grid items-center gap-2" style={{ gridTemplateColumns: "1fr 90px 20px" }}>
                            <Input value={a.name} onChange={(e: any) => updateEA(realIdx, "name", e.target.value)} placeholder="e.g. Parking" type="text" className="w-full" />
                            <Input value={a.amount || ""} onChange={(e: any) => updateEA(realIdx, "amount", +e.target.value)} placeholder="RM" className="w-full" />
                            <button onClick={() => removeEA(realIdx)} className="text-white/30 hover:text-[#FF8C8C] transition"><Trash2 size={14} /></button>
                          </div>
                        );
                      })}
                      <button onClick={() => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], allowances: [...p[m.id].allowances, { name: "", amount: 0, cutOnAbsent: false, isReimbursement: true }] } }))} className="flex items-center gap-1.5 text-xs text-[#FBD38D] hover:text-white transition">
                        <Plus size={13} /> Add claim
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-white/45 uppercase tracking-wider">Leave</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Unpaid"><Input value={ei.unpaidLeaveDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], unpaidLeaveDays: +e.target.value } }))} placeholder="days" className="w-full" /></Field>
                        <Field label="Annual"><Input value={ei.annualLeaveDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], annualLeaveDays: +e.target.value } }))} placeholder="days" className="w-full" /></Field>
                        <Field label="Medical"><Input value={ei.medicalLeaveDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], medicalLeaveDays: +e.target.value } }))} placeholder="days" className="w-full" /></Field>
                        <Field label="Replacement"><Input value={ei.replacementDays || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], replacementDays: +e.target.value } }))} placeholder="days" className="w-full" /></Field>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-white/45 uppercase tracking-wider">Overtime</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="OT Hours"><Input value={ei.otHours || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], otHours: +e.target.value } }))} placeholder="hrs" className="w-full" /></Field>
                        <Field label="OT Rate (×)"><Input value={ei.otRate || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], otRate: +e.target.value } }))} placeholder="1.5" className="w-full" /></Field>
                        <Field label="Double Pay Hrs"><Input value={ei.doublePayHours || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], doublePayHours: +e.target.value } }))} placeholder="hrs" className="w-full" /></Field>
                        <Field label="Double Pay Rate (×)"><Input value={ei.doublePayRate || ""} onChange={(e: any) => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], doublePayRate: +e.target.value } }))} placeholder="2.0" className="w-full" /></Field>
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
                      <button onClick={() => setEditInputs((p) => ({ ...p, [m.id]: { ...p[m.id], customDeductions: [...p[m.id].customDeductions, { name: "", amount: 0 }] } }))} className="flex items-center gap-1.5 text-xs text-[#C4B5FD] hover:text-white transition">
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
                      <button onClick={() => setEditingMonth(null)} className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/60 hover:text-white transition flex items-center justify-center gap-2">
                        <X size={14} /> Cancel
                      </button>
                      <button onClick={() => saveMonthEdit(m.id)} disabled={saving} className="flex-1 rounded-full bg-[#6A49FA]/40 border border-[#6A49FA]/50 px-4 py-2.5 text-sm font-semibold text-[#C4B5FD] hover:bg-[#6A49FA]/60 transition flex items-center justify-center gap-2">
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
  );
}