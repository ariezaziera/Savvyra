"use client";

import { Trash2 } from "lucide-react";
import { SectionCard, Input, fmt, MONTHS, ALLOCATION_CATEGORIES, CATEGORY_COLORS } from "./SalaryShared";
import type { AllocationItem } from "./SalaryShared";

type Props = {
  calcMonth: number;
  calcYear: number;
  breakdown: any;
  allocations: AllocationItem[];
  setAllocations: React.Dispatch<React.SetStateAction<AllocationItem[]>>;
  newAllocCat: AllocationItem["category"];
  setNewAllocCat: (v: AllocationItem["category"]) => void;
  newAllocLabel: string;
  setNewAllocLabel: (v: string) => void;
  newAllocAmt: string;
  setNewAllocAmt: (v: string) => void;
  saving: boolean;
  saveMonth: () => void;
};

export default function SalaryPlanTab({
  calcMonth, calcYear, breakdown,
  allocations, setAllocations,
  newAllocCat, setNewAllocCat,
  newAllocLabel, setNewAllocLabel,
  newAllocAmt, setNewAllocAmt,
  saving, saveMonth,
}: Props) {

  const allocationTotal = allocations.reduce((s, a) => s + a.amount, 0);
  const unallocated = breakdown.expectedNet - allocationTotal;

  const addAllocation = () => {
    if (!newAllocAmt) return;
    setAllocations((prev) => [
      ...prev,
      { category: newAllocCat, label: newAllocLabel || newAllocCat, amount: parseFloat(newAllocAmt), isFulfilled: false },
    ]);
    setNewAllocLabel("");
    setNewAllocAmt("");
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="relative overflow-hidden rounded-3xl border border-[#6A49FA]/30 bg-linear-to-br from-[#6A49FA]/20 to-[#C4B5FD]/10 p-6 backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
        <p className="text-sm text-white/50">{MONTHS[calcMonth - 1]} {calcYear} — Expected Net</p>
        <p className="mt-1 text-3xl font-bold text-[#C4B5FD]">{fmt(breakdown.expectedNet)}</p>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-white/45">Allocated: <span className="text-white">{fmt(allocationTotal)}</span></span>
          <span className={unallocated < 0 ? "text-[#FF8C8C]" : "text-[#8EE3B5]"}>Remaining: {fmt(unallocated)}</span>
        </div>
      </div>

      {/* Existing allocations */}
      {allocations.length > 0 && (
        <SectionCard title="Allocation Plan">
          <div className="space-y-3">
            {allocations.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`rounded-xl px-2.5 py-1 text-xs font-medium capitalize ${CATEGORY_COLORS[a.category]}`}>{a.category}</span>
                <span className="flex-1 text-sm text-white truncate">{a.label}</span>
                <span className="text-sm font-semibold text-white">{fmt(a.amount)}</span>
                <button onClick={() => setAllocations((prev) => prev.filter((_, idx) => idx !== i))} className="text-white/25 hover:text-[#FF8C8C] transition"><Trash2 size={14} /></button>
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
          <Input value={newAllocLabel} onChange={(e: any) => setNewAllocLabel(e.target.value)} placeholder="Label (e.g. ASNB, Car loan, Groceries)" type="text" className="w-full" />
          <div className="flex gap-3">
            <Input value={newAllocAmt} onChange={(e: any) => setNewAllocAmt(e.target.value)} placeholder="Amount (RM)" className="flex-1" />
            <button onClick={addAllocation} className="rounded-2xl bg-[#6A49FA]/30 px-4 text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition text-sm font-medium">Add</button>
          </div>
        </div>
      </SectionCard>

      {/* Category breakdown */}
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
    </div>
  );
}