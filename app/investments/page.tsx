"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingUp, Trash2, Pencil, X, Check, ChevronDown, ChevronUp } from "lucide-react";

type Investment = {
  id: string;
  name: string;
  platform: string | null;
  type: string;
  principalAmount: number;
  currentValue: number;
  monthlyContribution: number | null;
  returnRate: number | null;
  startDate: string;
  maturityDate: string | null;
  status: string;
  note: string | null;
};

const TYPES = ["General", "Stocks", "Unit Trust", "Crypto", "Gold", "Fixed Deposit", "Bonds", "Property", "EPF", "Other"];
const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "text-[#8EE3B5] bg-[#8EE3B5]/15",
  MATURED:   "text-[#C4B5FD] bg-[#C4B5FD]/15",
  WITHDRAWN: "text-[#FBD38D] bg-[#FBD38D]/15",
};

const fmt = (n: number) =>
  "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/50 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder = "", type = "text", className = "" }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 backdrop-blur-xl transition focus:border-[#6A49FA]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#6A49FA]/20 ${className}`}
    />
  );
}

const emptyForm = {
  name: "", platform: "", type: "General",
  principalAmount: "", currentValue: "",
  monthlyContribution: "", returnRate: "",
  startDate: "", maturityDate: "", status: "ACTIVE", note: "",
};

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState("");
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editForm, setEditForm]       = useState<Record<string, any>>({});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchInvestments = async () => {
    const res = await fetch("/api/investments");
    const data = await res.json();
    setInvestments(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchInvestments(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.principalAmount) return;
    setSaving(true);
    const res = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchInvestments();
      setForm(emptyForm);
      setShowForm(false);
      showToast("Investment added ✅");
    }
    setSaving(false);
  };

  const handleEdit = async (id: string) => {
    setSaving(true);
    const res = await fetch(`/api/investments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm[id]),
    });
    if (res.ok) {
      await fetchInvestments();
      setEditingId(null);
      showToast("Investment updated ✅");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/investments/${id}`, { method: "DELETE" });
    setInvestments((prev) => prev.filter((i) => i.id !== id));
    showToast("Investment deleted");
  };

  // Stats
  const activeInvestments = investments.filter((i) => i.status === "ACTIVE");
  const totalPrincipal    = activeInvestments.reduce((s, i) => s + i.principalAmount, 0);
  const totalCurrentValue = activeInvestments.reduce((s, i) => s + i.currentValue, 0);
  const totalMonthly      = activeInvestments.reduce((s, i) => s + (i.monthlyContribution ?? 0), 0);
  const totalGainLoss     = totalCurrentValue - totalPrincipal;

  return (
    <PageContainer>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <style>{`
        .blob { position: fixed; border-radius: 9999px; pointer-events: none; z-index: 0; }
        .blob-1 { width: 500px; height: 500px; background: #8EE3B5; top: -150px; left: -150px; filter: blur(130px); opacity: 0.20; }
        .blob-2 { width: 400px; height: 400px; background: #6a49fa; bottom: -100px; right: -100px; filter: blur(120px); opacity: 0.30; }
      `}</style>

      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          {toast}
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Finance</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Investments</h1>
            <p className="mt-1.5 text-sm text-white/50">Track your investment portfolio and returns.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-2xl bg-[#6A49FA]/30 border border-[#6A49FA]/40 px-4 py-2.5 text-sm font-medium text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition mt-2"
          >
            <Plus size={16} /> Add Investment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          {[
            { label: "Total Invested",   value: fmt(totalPrincipal),                    color: "text-[#C4B5FD]" },
            { label: "Current Value",    value: fmt(totalCurrentValue),                 color: "text-white"     },
            { label: "Gain / Loss",      value: `${totalGainLoss >= 0 ? "+" : ""}${fmt(totalGainLoss)}`, color: totalGainLoss >= 0 ? "text-[#8EE3B5]" : "text-[#FF8C8C]" },
            { label: "Monthly Top-up",   value: fmt(totalMonthly),                      color: "text-[#FBD38D]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <p className="text-xs text-white/40">{label}</p>
              <p className={`mt-1.5 text-base font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <h2 className="text-base font-semibold text-white mb-4">New Investment</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Name *">
                  <Input value={form.name} onChange={(e: any) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. ASNB, Luno BTC" />
                </Field>
                <Field label="Platform">
                  <Input value={form.platform} onChange={(e: any) => setForm((p) => ({ ...p, platform: e.target.value }))} placeholder="e.g. Maybank2u, Luno" />
                </Field>
                <Field label="Type">
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 backdrop-blur-xl"
                  >
                    {TYPES.map((t) => <option key={t} value={t} className="bg-[#1a1035]">{t}</option>)}
                  </select>
                </Field>
                <Field label="Principal Amount (RM) *">
                  <Input value={form.principalAmount} onChange={(e: any) => setForm((p) => ({ ...p, principalAmount: e.target.value }))} placeholder="0.00" type="number" />
                </Field>
                <Field label="Current Value (RM)">
                  <Input value={form.currentValue} onChange={(e: any) => setForm((p) => ({ ...p, currentValue: e.target.value }))} placeholder="Same as principal if new" type="number" />
                </Field>
                <Field label="Monthly Contribution (RM)">
                  <Input value={form.monthlyContribution} onChange={(e: any) => setForm((p) => ({ ...p, monthlyContribution: e.target.value }))} placeholder="0.00" type="number" />
                </Field>
                <Field label="Expected Return Rate (% p.a.)">
                  <Input value={form.returnRate} onChange={(e: any) => setForm((p) => ({ ...p, returnRate: e.target.value }))} placeholder="e.g. 5.0" type="number" />
                </Field>
                <Field label="Start Date">
                  <Input value={form.startDate} onChange={(e: any) => setForm((p) => ({ ...p, startDate: e.target.value }))} type="date" />
                </Field>
                <Field label="Maturity Date">
                  <Input value={form.maturityDate} onChange={(e: any) => setForm((p) => ({ ...p, maturityDate: e.target.value }))} type="date" />
                </Field>
                <Field label="Note">
                  <Input value={form.note} onChange={(e: any) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="Optional note" />
                </Field>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowForm(false)} className="flex-1 rounded-full border border-white/15 bg-white/5 py-3 text-sm text-white/60 hover:text-white transition">
                  Cancel
                </button>
                <button onClick={handleAdd} disabled={saving} className="flex-1 rounded-full bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.02] active:scale-[0.98]">
                  {saving ? "Saving…" : "Add Investment"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Investment List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 rounded-full border-2 border-[#6A49FA]/40 border-t-[#6A49FA] animate-spin" />
          </div>
        ) : investments.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <TrendingUp size={36} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm">No investments recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {investments.map((inv) => {
              const isExpanded = expandedId === inv.id;
              const isEditing  = editingId === inv.id;
              const gainLoss   = inv.currentValue - inv.principalAmount;
              const gainPct    = inv.principalAmount > 0 ? (gainLoss / inv.principalAmount) * 100 : 0;

              return (
                <div key={inv.id} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

                  {/* Header */}
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => { if (isEditing) return; setExpandedId(isExpanded ? null : inv.id); }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-2xl bg-[#8EE3B5]/15 flex items-center justify-center shrink-0">
                        <TrendingUp size={16} className="text-[#8EE3B5]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{inv.name}</p>
                        <p className="text-xs text-white/40 truncate">
                          {inv.platform && `${inv.platform} · `}{inv.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#8EE3B5]">{fmt(inv.currentValue)}</p>
                        <p className={`text-xs ${gainLoss >= 0 ? "text-[#8EE3B5]" : "text-[#FF8C8C]"}`}>
                          {gainLoss >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
                        </p>
                      </div>
                      <span className={`rounded-xl px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[inv.status] ?? STATUS_COLORS.ACTIVE}`}>
                        {inv.status}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                    </div>
                  </button>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
                      {!isEditing ? (
                        <>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {[
                              ["Principal",         fmt(inv.principalAmount)],
                              ["Current Value",     fmt(inv.currentValue)],
                              ["Gain / Loss",       `${gainLoss >= 0 ? "+" : ""}${fmt(gainLoss)} (${gainPct.toFixed(1)}%)`],
                              ["Monthly Top-up",    inv.monthlyContribution ? fmt(inv.monthlyContribution) : "—"],
                              ["Return Rate",       inv.returnRate ? `${inv.returnRate}% p.a.` : "—"],
                              ["Start Date",        new Date(inv.startDate).toLocaleDateString("ms-MY")],
                              ["Maturity Date",     inv.maturityDate ? new Date(inv.maturityDate).toLocaleDateString("ms-MY") : "—"],
                            ].map(([label, val]) => (
                              <div key={label}>
                                <p className="text-xs text-white/35">{label}</p>
                                <p className={`font-medium ${label === "Gain / Loss" ? (gainLoss >= 0 ? "text-[#8EE3B5]" : "text-[#FF8C8C]") : "text-white"}`}>{val}</p>
                              </div>
                            ))}
                          </div>
                          {inv.note && (
                            <p className="text-xs text-white/40 italic border-t border-white/10 pt-3">{inv.note}</p>
                          )}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => {
                                setEditForm((p) => ({ ...p, [inv.id]: { ...inv, startDate: inv.startDate?.split("T")[0] ?? "", maturityDate: inv.maturityDate?.split("T")[0] ?? "" } }));
                                setEditingId(inv.id);
                              }}
                              className="flex items-center gap-1.5 rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/50 hover:text-white transition"
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="flex items-center gap-1.5 rounded-2xl bg-[#FF8C8C]/10 border border-[#FF8C8C]/20 px-3 py-2 text-xs text-[#FF8C8C]/70 hover:text-[#FF8C8C] transition ml-auto"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </>
                      ) : (
                        /* Edit Mode */
                        <div className="space-y-3">
                          <p className="text-xs text-[#FBD38D]/80">✏ Editing {inv.name}</p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                              { label: "Name",                  key: "name",                type: "text"   },
                              { label: "Platform",              key: "platform",            type: "text"   },
                              { label: "Principal (RM)",        key: "principalAmount",     type: "number" },
                              { label: "Current Value (RM)",    key: "currentValue",        type: "number" },
                              { label: "Monthly Top-up (RM)",   key: "monthlyContribution", type: "number" },
                              { label: "Return Rate (% p.a.)",  key: "returnRate",          type: "number" },
                              { label: "Start Date",            key: "startDate",           type: "date"   },
                              { label: "Maturity Date",         key: "maturityDate",        type: "date"   },
                              { label: "Note",                  key: "note",                type: "text"   },
                            ].map(({ label, key, type }) => (
                              <Field key={key} label={label}>
                                <Input
                                  value={editForm[inv.id]?.[key] ?? ""}
                                  onChange={(e: any) => setEditForm((p) => ({ ...p, [inv.id]: { ...p[inv.id], [key]: e.target.value } }))}
                                  type={type}
                                />
                              </Field>
                            ))}
                            <Field label="Status">
                              <select
                                value={editForm[inv.id]?.status ?? "ACTIVE"}
                                onChange={(e) => setEditForm((p) => ({ ...p, [inv.id]: { ...p[inv.id], status: e.target.value } }))}
                                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 backdrop-blur-xl"
                              >
                                {["ACTIVE", "MATURED", "WITHDRAWN"].map((s) => <option key={s} value={s} className="bg-[#1a1035]">{s}</option>)}
                              </select>
                            </Field>
                            <Field label="Type">
                              <select
                                value={editForm[inv.id]?.type ?? "General"}
                                onChange={(e) => setEditForm((p) => ({ ...p, [inv.id]: { ...p[inv.id], type: e.target.value } }))}
                                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 backdrop-blur-xl"
                              >
                                {TYPES.map((t) => <option key={t} value={t} className="bg-[#1a1035]">{t}</option>)}
                              </select>
                            </Field>
                          </div>
                          <div className="flex gap-3 pt-1">
                            <button onClick={() => setEditingId(null)} className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white transition flex items-center justify-center gap-2">
                              <X size={14} /> Cancel
                            </button>
                            <button onClick={() => handleEdit(inv.id)} disabled={saving} className="flex-1 rounded-full bg-[#6A49FA]/40 border border-[#6A49FA]/50 py-2.5 text-sm font-semibold text-[#C4B5FD] hover:bg-[#6A49FA]/60 transition flex items-center justify-center gap-2">
                              <Check size={14} /> {saving ? "Saving…" : "Save"}
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
        )}
      </div>
    </PageContainer>
  );
}