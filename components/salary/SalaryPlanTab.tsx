"use client";

import { useEffect, useState } from "react";
import { Trash2, Sparkles, ChevronDown, ChevronUp, Check, GripVertical } from "lucide-react";
import { SectionCard, Input, fmt, MONTHS, SOURCE_TYPES, SOURCE_COLORS } from "./SalaryShared";
import type { PlanItem, SourceType } from "./SalaryShared";

type Suggestion = {
  id: string;
  label: string;
  amount: number;
  sourceType: SourceType;
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
  planItems: PlanItem[];
  setPlanItems: React.Dispatch<React.SetStateAction<PlanItem[]>>;
  saving: boolean;
  saveMonth: () => void;
};

export default function SalaryPlanTab({
  calcMonth, calcYear, breakdown,
  planItems, setPlanItems,
  saving, saveMonth,
}: Props) {
  const [suggestions, setSuggestions]         = useState<Suggestions | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [addedIds, setAddedIds]               = useState<Set<string>>(new Set());
  const [newLabel, setNewLabel]               = useState("");
  const [newAmount, setNewAmount]             = useState("");
  const [newSourceType, setNewSourceType]     = useState<SourceType>("CUSTOM");

  const included = planItems.filter((i) => i.isIncluded);
  const planTotal   = included.reduce((s, i) => s + i.amount, 0);
  const unallocated = breakdown.expectedNet - planTotal;

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      const res = await fetch(`/api/salary/plan-suggestions?month=${calcMonth}&year=${calcYear}`);
      if (res.ok) setSuggestions(await res.json());
      setLoadingSuggestions(false);
    };
    fetchSuggestions();
  }, [calcMonth, calcYear]);

  const addSuggestion = (s: Suggestion) => {
    if (planItems.some((i) => i.sourceId === s.sourceId && i.sourceType === s.sourceType)) return;
    setPlanItems((prev) => [...prev, {
      label: s.label, amount: s.amount,
      sourceType: s.sourceType, sourceId: s.sourceId,
      isIncluded: true, sortOrder: prev.length,
    }]);
    setAddedIds((prev) => new Set([...prev, s.id]));
  };

  const addAllSuggestions = () => {
    if (!suggestions) return;
    [...suggestions.commitments, ...suggestions.savings, ...suggestions.debts, ...suggestions.investments]
      .forEach(addSuggestion);
  };

  const addManual = () => {
    if (!newAmount) return;
    setPlanItems((prev) => [...prev, {
      label: newLabel || newSourceType, amount: parseFloat(newAmount),
      sourceType: newSourceType, isIncluded: true, sortOrder: prev.length,
    }]);
    setNewLabel(""); setNewAmount("");
  };

  const toggleIncluded = (i: number) => {
    setPlanItems((prev) => prev.map((item, idx) => idx === i ? { ...item, isIncluded: !item.isIncluded } : item));
  };

  const remove = (i: number) => {
    setPlanItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const allSuggestions = suggestions
    ? [...suggestions.commitments, ...suggestions.savings, ...suggestions.debts, ...suggestions.investments]
    : [];
  const totalSuggested = allSuggestions.reduce((s, i) => s + i.amount, 0);

  // By source type breakdown
  const byType: Record<string, number> = {};
  included.forEach((i) => { byType[i.sourceType] = (byType[i.sourceType] ?? 0) + i.amount; });

  return (
    <div className="space-y-5">

      {/* Summary card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#6A49FA]/30 bg-linear-to-br from-[#6A49FA]/20 to-[#C4B5FD]/10 p-6 backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
        <p className="text-sm text-white/50">{MONTHS[calcMonth - 1]} {calcYear} — Expected Net</p>
        <p className="mt-1 text-3xl font-bold text-[#C4B5FD]">{fmt(breakdown.expectedNet)}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="text-white/45">Planned: <span className="text-white">{fmt(planTotal)}</span></span>
          <span className={unallocated < 0 ? "text-[#FF8C8C]" : "text-[#8EE3B5]"}>
            Remaining: {fmt(unallocated)}
          </span>
        </div>
      </div>

      {/* Auto-populate */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
        <button className="w-full flex items-center justify-between px-5 py-4"
          onClick={() => setShowSuggestions(!showSuggestions)}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FBD38D]" />
            <span className="text-sm font-semibold text-white">Auto-populate from Fixed Items</span>
            {allSuggestions.length > 0 && (
              <span className="rounded-full bg-[#6A49FA]/30 text-[#C4B5FD] text-[10px] font-bold px-2 py-0.5">
                {allSuggestions.length} items · {fmt(totalSuggested)}
              </span>
            )}
          </div>
          {showSuggestions ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
        </button>

        {showSuggestions && (
          <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
            {loadingSuggestions ? (
              <div className="flex justify-center py-6">
                <div className="h-5 w-5 rounded-full border-2 border-[#6A49FA]/40 border-t-[#6A49FA] animate-spin" />
              </div>
            ) : allSuggestions.length === 0 ? (
              <p className="text-xs text-white/35 text-center py-4">
                No fixed items yet. Add commitments, savings goals, debts, or investments first.
              </p>
            ) : (
              <>
                <button onClick={addAllSuggestions}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#6A49FA]/20 border border-[#6A49FA]/30 px-4 py-2.5 text-sm font-medium text-[#C4B5FD] hover:bg-[#6A49FA]/35 transition">
                  <Sparkles size={14} /> Add All Fixed Items ({fmt(totalSuggested)})
                </button>

                {[
                  { title: "Commitments", color: "text-[#C4B5FD]", items: suggestions!.commitments },
                  { title: "Savings Goals", color: "text-[#8EE3B5]", items: suggestions!.savings },
                  { title: "Debts", color: "text-[#FF8C8C]", items: suggestions!.debts },
                  { title: "Investments", color: "text-[#93C5FD]", items: suggestions!.investments },
                ].filter(g => g.items.length > 0).map((group) => (
                  <div key={group.title} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${group.color}`}>{group.title}</p>
                      <button onClick={() => group.items.forEach(addSuggestion)}
                        className="text-[10px] text-white/35 hover:text-[#C4B5FD] transition">
                        Add all ({fmt(group.items.reduce((s, i) => s + i.amount, 0))})
                      </button>
                    </div>
                    {group.items.map((s) => {
                      const isAdded = addedIds.has(s.id) || planItems.some((i) => i.sourceId === s.sourceId);
                      return (
                        <div key={s.id}
                          className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all ${isAdded ? "border-white/5 bg-white/3 opacity-50" : "border-white/10 bg-white/5 hover:bg-white/8"}`}>
                          <span className={`rounded-xl px-2 py-0.5 text-xs font-medium shrink-0 ${SOURCE_COLORS[s.sourceType]}`}>{s.sourceType}</span>
                          <span className="flex-1 text-sm text-white truncate">{s.label}</span>
                          <span className="text-sm font-semibold text-white shrink-0">{fmt(s.amount)}</span>
                          <button onClick={() => addSuggestion(s)} disabled={isAdded}
                            className={`shrink-0 rounded-xl px-3 py-1 text-xs font-medium transition ${isAdded ? "text-[#8EE3B5] bg-[#8EE3B5]/10 cursor-default" : "text-[#C4B5FD] bg-[#6A49FA]/20 hover:bg-[#6A49FA]/40"}`}>
                            {isAdded ? <Check size={12} /> : "+ Add"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Plan items list */}
      {planItems.length > 0 && (
        <SectionCard title="Monthly Plan">
          <div className="space-y-2">
            {planItems.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all ${item.isIncluded ? "border-white/10 bg-white/5" : "border-white/5 bg-white/3 opacity-50"}`}>
                <GripVertical size={14} className="text-white/20 shrink-0" />
                <span className={`rounded-xl px-2 py-0.5 text-xs font-medium shrink-0 ${SOURCE_COLORS[item.sourceType]}`}>{item.sourceType}</span>
                <span className="flex-1 text-sm text-white truncate">{item.label}</span>
                <span className="text-sm font-semibold text-white shrink-0">{fmt(item.amount)}</span>
                <button onClick={() => toggleIncluded(i)}
                  className={`shrink-0 rounded-xl px-2 py-1 text-xs font-medium transition ${item.isIncluded ? "bg-[#8EE3B5]/15 text-[#8EE3B5]" : "bg-white/5 text-white/30"}`}>
                  {item.isIncluded ? "✓" : "skip"}
                </button>
                <button onClick={() => remove(i)} className="text-white/25 hover:text-[#FF8C8C] transition shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Add manual */}
      <SectionCard title="Add Manual Item">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {SOURCE_TYPES.map((type) => (
              <button key={type} onClick={() => setNewSourceType(type)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${newSourceType === type ? SOURCE_COLORS[type] : "text-white/40 bg-white/5 hover:bg-white/10"}`}>
                {type}
              </button>
            ))}
          </div>
          <Input value={newLabel} onChange={(e: any) => setNewLabel(e.target.value)}
            placeholder="Label (e.g. Groceries, Petrol)" type="text" className="w-full" />
          <div className="flex gap-3">
            <Input value={newAmount} onChange={(e: any) => setNewAmount(e.target.value)}
              placeholder="Amount (RM)" className="flex-1" />
            <button onClick={addManual}
              className="rounded-2xl bg-[#6A49FA]/30 px-4 text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition text-sm font-medium">
              Add
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Breakdown by type */}
      {Object.keys(byType).length > 0 && (
        <SectionCard title="By Category">
          <div className="space-y-2">
            {Object.entries(byType).map(([type, total]) => {
              const pct = breakdown.expectedNet > 0 ? Math.min(100, (total / breakdown.expectedNet) * 100) : 0;
              const colorMap: Record<string, string> = {
                DEBT: "#FF8C8C", COMMITMENT: "#C4B5FD",
                SAVINGS: "#8EE3B5", INVESTMENT: "#93C5FD", CUSTOM: "#FBD38D",
              };
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{type}</span>
                    <span className="text-white">{fmt(total)} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: colorMap[type] ?? "#C4B5FD" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      <button onClick={saveMonth} disabled={saving}
        className="w-full rounded-full bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
        {saving ? "Saving…" : `Save ${MONTHS[calcMonth - 1]} ${calcYear} Plan`}
      </button>
    </div>
  );
}