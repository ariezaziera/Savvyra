"use client";

import { useEffect, useState } from "react";
import { Trash2, Sparkles, ChevronDown, ChevronUp, Check, GripVertical, AlertTriangle, Info } from "lucide-react";
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
  calcYear:  number;
  breakdown: any;
  planItems: PlanItem[];
  setPlanItems: React.Dispatch<React.SetStateAction<PlanItem[]>>;
  saving:    boolean;
  saveMonth: () => void;
};

export default function SalaryPlanTab({
  calcMonth, calcYear, breakdown,
  planItems, setPlanItems,
  saving, saveMonth,
}: Props) {
  const [suggestions, setSuggestions]               = useState<Suggestions | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions]       = useState(true);
  const [addedIds, setAddedIds]                     = useState<Set<string>>(new Set());
  const [newLabel, setNewLabel]                     = useState("");
  const [newAmount, setNewAmount]                   = useState("");
  const [newSourceType, setNewSourceType]           = useState<SourceType>("CUSTOM");
  const [editAmounts, setEditAmounts]               = useState<Record<string, string>>({});

  const included     = planItems.filter((i) => i.isIncluded);
  const planTotal    = included.reduce((s, i) => s + i.amount, 0);
  const unallocated  = breakdown.expectedNet - planTotal;
  const isOverBudget = unallocated < 0;

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
    const customAmount = editAmounts[s.id] ? parseFloat(editAmounts[s.id]) : s.amount;
    setPlanItems((prev) => [...prev, {
      label: s.label, amount: customAmount,
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

  const toggleIncluded = (i: number) =>
    setPlanItems((prev) => prev.map((item, idx) => idx === i ? { ...item, isIncluded: !item.isIncluded } : item));

  const updateAmount = (i: number, val: string) =>
    setPlanItems((prev) => prev.map((item, idx) => idx === i ? { ...item, amount: parseFloat(val) || 0 } : item));

  const remove = (i: number) =>
    setPlanItems((prev) => prev.filter((_, idx) => idx !== i));

  const allSuggestions = suggestions
    ? [...suggestions.commitments, ...suggestions.savings, ...suggestions.debts, ...suggestions.investments]
    : [];
  const totalSuggested = allSuggestions.reduce((s, i) => s + i.amount, 0);

  const byType: Record<string, number> = {};
  included.forEach((i) => { byType[i.sourceType] = (byType[i.sourceType] ?? 0) + i.amount; });

  const colorMap: Record<string, string> = {
    DEBT: "#FF8C8C", COMMITMENT: "#C4B5FD",
    SAVINGS: "#8EE3B5", INVESTMENT: "#93C5FD", CUSTOM: "#FBD38D",
  };

  return (
    <div className="space-y-5">

      {/* Summary card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#6A49FA]/30 bg-gradient-to-br from-[#6A49FA]/20 to-[#C4B5FD]/10 p-6 backdrop-blur-2xl">
        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
        <p className="text-sm text-white/50">{MONTHS[calcMonth - 1]} {calcYear} — Expected Net</p>
        <p className="mt-1 text-3xl font-bold text-[#C4B5FD]">{fmt(breakdown.expectedNet)}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="text-white/45">Planned: <span className="text-white">{fmt(planTotal)}</span></span>
          <span className={isOverBudget ? "text-[#FF8C8C] font-semibold" : "text-[#8EE3B5]"}>
            {isOverBudget ? "Over budget: " : "Remaining: "}{fmt(Math.abs(unallocated))}
          </span>
        </div>

        {isOverBudget && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#FF8C8C]/25 bg-[#FF8C8C]/10 px-4 py-3">
            <AlertTriangle size={16} className="text-[#FF8C8C] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#FF8C8C]">Plan exceeds expected salary by {fmt(Math.abs(unallocated))}</p>
              <p className="text-xs text-white/45 mt-0.5">Remove or reduce some items below to balance your plan.</p>
            </div>
          </div>
        )}
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
                      const customAmt = editAmounts[s.id] ?? "";
                      return (
                        <div key={s.id}
                          className={`rounded-2xl border transition-all ${isAdded ? "border-white/5 bg-white/3 opacity-50" : "border-white/10 bg-white/5"}`}>
                          <div className="flex items-center gap-3 px-4 py-3">
                            <span className={`rounded-xl px-2 py-0.5 text-xs font-medium shrink-0 ${SOURCE_COLORS[s.sourceType]}`}>{s.sourceType}</span>
                            <span className="flex-1 text-sm text-white truncate">{s.label}</span>
                            {!isAdded && (
                              <input
                                type="number"
                                value={customAmt || s.amount}
                                onChange={(e) => setEditAmounts((p) => ({ ...p, [s.id]: e.target.value }))}
                                className="w-24 rounded-xl border border-white/10 bg-white/8 px-3 py-1.5 text-xs text-white outline-none text-right focus:border-[#6A49FA]/60"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            {isAdded && <span className="text-sm font-semibold text-white shrink-0">{fmt(s.amount)}</span>}
                            <button onClick={() => addSuggestion(s)} disabled={isAdded}
                              className={`shrink-0 rounded-xl px-3 py-1 text-xs font-medium transition ${isAdded ? "text-[#8EE3B5] bg-[#8EE3B5]/10 cursor-default" : "text-[#C4B5FD] bg-[#6A49FA]/20 hover:bg-[#6A49FA]/40"}`}>
                              {isAdded ? <Check size={12} /> : "+ Add"}
                            </button>
                          </div>
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
          {/* Explainer */}
          <div className="mb-3 flex items-start gap-2 rounded-2xl border border-white/8 bg-white/4 px-3 py-2.5">
            <Info size={13} className="text-white/35 shrink-0 mt-0.5" />
            <p className="text-[11px] text-white/40 leading-relaxed">
              <span className="text-white/60 font-medium">✓ Included</span> — dikira dalam total, tap untuk skip.{" "}
              <span className="text-white/60 font-medium">Skipped</span> — tak dikira, tap untuk include balik.
              Tekan <span className="text-white/60 font-medium">Save Plan</span> kat bawah bila dah siap.
            </p>
          </div>

          <div className="space-y-2">
            {planItems.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-2xl px-3 py-3 border transition-all ${item.isIncluded ? "border-white/10 bg-white/5" : "border-white/5 bg-white/3 opacity-50"}`}>
                <GripVertical size={14} className="text-white/20 shrink-0" />
                <span className={`rounded-xl px-2 py-0.5 text-xs font-medium shrink-0 ${SOURCE_COLORS[item.sourceType]}`}>{item.sourceType}</span>
                <span className="flex-1 text-sm text-white truncate">{item.label}</span>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => updateAmount(i, e.target.value)}
                  className="w-24 rounded-xl border border-white/10 bg-white/8 px-2 py-1 text-xs text-white text-right outline-none focus:border-[#6A49FA]/50"
                />
                {/* State badge — shows current state, tap to toggle */}
                <button
                  onClick={() => toggleIncluded(i)}
                  title={item.isIncluded ? "Tap to skip" : "Tap to include"}
                  className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-medium transition ${
                    item.isIncluded
                      ? "bg-[#8EE3B5]/15 text-[#8EE3B5] border border-[#8EE3B5]/20"
                      : "bg-white/5 text-white/30 border border-white/10"
                  }`}>
                  {item.isIncluded ? "✓ Included" : "Skipped"}
                </button>
                <button onClick={() => remove(i)} className="text-white/25 hover:text-[#FF8C8C] transition shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-sm">
            <span className="text-white/50">Total planned ({included.length}/{planItems.length} items)</span>
            <span className={`font-semibold ${isOverBudget ? "text-[#FF8C8C]" : "text-white"}`}>{fmt(planTotal)}</span>
          </div>
        </SectionCard>
      )}

      {/* Add manual */}
      <SectionCard title="Add Custom Item">
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
        <SectionCard title="Breakdown by Category">
          <div className="space-y-3">
            {Object.entries(byType).map(([type, total]) => {
              const pct = breakdown.expectedNet > 0 ? Math.min(100, (total / breakdown.expectedNet) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/60">{type}</span>
                    <span className="text-white">{fmt(total)} <span className="text-white/35">({pct.toFixed(1)}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: colorMap[type] ?? "#C4B5FD" }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-white/10 flex justify-between text-xs">
              <span className="text-white/40">Total allocated</span>
              <span className="text-white/70">{breakdown.expectedNet > 0 ? ((planTotal / breakdown.expectedNet) * 100).toFixed(1) : 0}% of expected net</span>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Save button */}
      <button onClick={saveMonth} disabled={saving}
        className="w-full rounded-full bg-gradient-to-r from-[#6A49FA] to-[#9B7FFF] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
        {saving ? "Saving…" : `💾 Save ${MONTHS[calcMonth - 1]} ${calcYear} Plan`}
      </button>

      {planItems.length === 0 && (
        <p className="text-center text-xs text-white/30 -mt-2">
          Add items above, then tap Save to record your plan.
        </p>
      )}
    </div>
  );
}