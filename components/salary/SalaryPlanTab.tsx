"use client";

import { useEffect, useState } from "react";
import { Trash2, Sparkles, ChevronDown, ChevronUp, Check } from "lucide-react";
import { SectionCard, Input, fmt, MONTHS, ALLOCATION_CATEGORIES, CATEGORY_COLORS } from "./SalaryShared";
import type { AllocationItem } from "./SalaryShared";

type Suggestion = {
  id: string;
  label: string;
  amount: number;
  category: AllocationItem["category"];
  source: string;
  sourceId: string;
};

type Suggestions = {
  commitments: Suggestion[];
  savings:     Suggestion[];
  debts:       Suggestion[];
  investments: Suggestion[];
};

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

  const [suggestions, setSuggestions]           = useState<Suggestions | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions]   = useState(true);
  const [addedIds, setAddedIds]                 = useState<Set<string>>(new Set());

  const allocationTotal = allocations.reduce((s, a) => s + a.amount, 0);
  const unallocated     = breakdown.expectedNet - allocationTotal;

  // Fetch suggestions on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      const res = await fetch(`/api/salary/plan-suggestions?month=${calcMonth}&year=${calcYear}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
      setLoadingSuggestions(false);
    };
    fetchSuggestions();
  }, [calcMonth, calcYear]);

  const addSuggestion = (s: Suggestion) => {
    // Check if already in allocations
    const alreadyAdded = allocations.some((a) => a.label === s.label && a.amount === s.amount);
    if (alreadyAdded) return;
    setAllocations((prev) => [...prev, {
      category:    s.category,
      label:       s.label,
      amount:      s.amount,
      isFulfilled: false,
    }]);
    setAddedIds((prev) => new Set([...prev, s.id]));
  };

  const addAllSuggestions = (items: Suggestion[]) => {
    items.forEach((s) => addSuggestion(s));
  };

  const addAllFixed = () => {
    if (!suggestions) return;
    // Auto-add commitments + debts + savings + investments all at once
    [
      ...suggestions.commitments,
      ...suggestions.savings,
      ...suggestions.debts,
      ...suggestions.investments,
    ].forEach((s) => addSuggestion(s));
  };

  const addAllocation = () => {
    if (!newAllocAmt) return;
    setAllocations((prev) => [
      ...prev,
      { category: newAllocCat, label: newAllocLabel || newAllocCat, amount: parseFloat(newAllocAmt), isFulfilled: false },
    ]);
    setNewAllocLabel("");
    setNewAllocAmt("");
  };

  const allSuggestions = suggestions
    ? [...suggestions.commitments, ...suggestions.savings, ...suggestions.debts, ...suggestions.investments]
    : [];

  const totalSuggested = allSuggestions.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">

      {/* Summary */}
      <div className="relative overflow-hidden rounded-3xl border border-[#6A49FA]/30 bg-linear-to-br from-[#6A49FA]/20 to-[#C4B5FD]/10 p-6 backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
        <p className="text-sm text-white/50">{MONTHS[calcMonth - 1]} {calcYear} — Expected Net</p>
        <p className="mt-1 text-3xl font-bold text-[#C4B5FD]">{fmt(breakdown.expectedNet)}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="text-white/45">Allocated: <span className="text-white">{fmt(allocationTotal)}</span></span>
          <span className={unallocated < 0 ? "text-[#FF8C8C]" : "text-[#8EE3B5]"}>
            Remaining: {fmt(unallocated)}
          </span>
        </div>
      </div>

      {/* Auto-populate suggestions */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-5 py-4"
          onClick={() => setShowSuggestions(!showSuggestions)}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FBD38D]" />
            <span className="text-sm font-semibold text-white">Auto-populate from Fixed Items</span>
            {allSuggestions.length > 0 && (
              <span className="rounded-full bg-[#6A49FA]/30 text-[#C4B5FD] text-[10px] font-bold px-2 py-0.5">
                {allSuggestions.length} items · {fmt(totalSuggested)}
              </span>
            )}
          </div>
          {showSuggestions
            ? <ChevronUp size={16} className="text-white/40" />
            : <ChevronDown size={16} className="text-white/40" />
          }
        </button>

        {showSuggestions && (
          <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">

            {loadingSuggestions ? (
              <div className="flex justify-center py-6">
                <div className="h-5 w-5 rounded-full border-2 border-[#6A49FA]/40 border-t-[#6A49FA] animate-spin" />
              </div>
            ) : allSuggestions.length === 0 ? (
              <p className="text-xs text-white/35 text-center py-4">
                Tiada fixed items lagi. Tambah commitments, savings goals, debts, atau investments dulu.
              </p>
            ) : (
              <>
                {/* Add all button */}
                <button
                  onClick={addAllFixed}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6A49FA]/20 border border-[#6A49FA]/30 px-4 py-2.5 text-sm font-medium text-[#C4B5FD] hover:bg-[#6A49FA]/35 transition"
                >
                  <Sparkles size={14} /> Add All Fixed Items ({fmt(totalSuggested)})
                </button>

                {/* Commitments */}
                {suggestions!.commitments.length > 0 && (
                  <SuggestionGroup
                    title="Commitments"
                    color="text-[#C4B5FD]"
                    items={suggestions!.commitments}
                    addedIds={addedIds}
                    onAdd={addSuggestion}
                    onAddAll={() => addAllSuggestions(suggestions!.commitments)}
                  />
                )}

                {/* Savings */}
                {suggestions!.savings.length > 0 && (
                  <SuggestionGroup
                    title="Savings Goals"
                    color="text-[#8EE3B5]"
                    items={suggestions!.savings}
                    addedIds={addedIds}
                    onAdd={addSuggestion}
                    onAddAll={() => addAllSuggestions(suggestions!.savings)}
                  />
                )}

                {/* Debts */}
                {suggestions!.debts.length > 0 && (
                  <SuggestionGroup
                    title="Debts"
                    color="text-[#FF8C8C]"
                    items={suggestions!.debts}
                    addedIds={addedIds}
                    onAdd={addSuggestion}
                    onAddAll={() => addAllSuggestions(suggestions!.debts)}
                  />
                )}

                {/* Investments */}
                {suggestions!.investments.length > 0 && (
                  <SuggestionGroup
                    title="Investments"
                    color="text-[#93C5FD]"
                    items={suggestions!.investments}
                    addedIds={addedIds}
                    onAdd={addSuggestion}
                    onAddAll={() => addAllSuggestions(suggestions!.investments)}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Existing allocations */}
      {allocations.length > 0 && (
        <SectionCard title="Allocation Plan">
          <div className="space-y-3">
            {allocations.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`rounded-xl px-2.5 py-1 text-xs font-medium capitalize shrink-0 ${CATEGORY_COLORS[a.category]}`}>
                  {a.category}
                </span>
                <span className="flex-1 text-sm text-white truncate">{a.label}</span>
                <span className="text-sm font-semibold text-white shrink-0">{fmt(a.amount)}</span>
                <button
                  onClick={() => setAllocations((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-white/25 hover:text-[#FF8C8C] transition shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Add manual allocation */}
      <SectionCard title="Add Manual Allocation">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {ALLOCATION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setNewAllocCat(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium capitalize transition ${
                  newAllocCat === cat ? CATEGORY_COLORS[cat] : "text-white/40 bg-white/5 hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <Input
            value={newAllocLabel}
            onChange={(e: any) => setNewAllocLabel(e.target.value)}
            placeholder="Label (e.g. Groceries, Petrol)"
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
                        background:
                          cat === "savings"     ? "#8EE3B5" :
                          cat === "commitments" ? "#C4B5FD" :
                          cat === "spends"      ? "#FBD38D" :
                          cat === "debts"       ? "#FF8C8C" : "#93C5FD",
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

// ── Sub-component ──
function SuggestionGroup({
  title, color, items, addedIds, onAdd, onAddAll,
}: {
  title: string;
  color: string;
  items: Suggestion[];
  addedIds: Set<string>;
  onAdd: (s: Suggestion) => void;
  onAddAll: () => void;
}) {
  const groupTotal = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold uppercase tracking-wider ${color}`}>{title}</p>
        <button
          onClick={onAddAll}
          className="text-[10px] text-white/35 hover:text-[#C4B5FD] transition"
        >
          Add all ({fmt(groupTotal)})
        </button>
      </div>
      {items.map((s) => {
        const isAdded = addedIds.has(s.id);
        return (
          <div
            key={s.id}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all ${
              isAdded
                ? "border-white/5 bg-white/3 opacity-50"
                : "border-white/10 bg-white/5 hover:bg-white/8"
            }`}
          >
            <span className={`rounded-xl px-2 py-0.5 text-xs font-medium capitalize shrink-0 ${CATEGORY_COLORS[s.category]}`}>
              {s.category}
            </span>
            <span className="flex-1 text-sm text-white truncate">{s.label}</span>
            <span className="text-sm font-semibold text-white shrink-0">{fmt(s.amount)}</span>
            <button
              onClick={() => onAdd(s)}
              disabled={isAdded}
              className={`shrink-0 rounded-xl px-3 py-1 text-xs font-medium transition ${
                isAdded
                  ? "text-[#8EE3B5] bg-[#8EE3B5]/10 cursor-default"
                  : "text-[#C4B5FD] bg-[#6A49FA]/20 hover:bg-[#6A49FA]/40"
              }`}
            >
              {isAdded ? <Check size={12} /> : "+ Add"}
            </button>
          </div>
        );
      })}
    </div>
  );
}