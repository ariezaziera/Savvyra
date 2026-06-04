"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CreditCard, Trash2, Pencil, X, Check, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

type Debt = {
  id: string;
  name: string;
  creditor: string | null;
  debtType: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  minimumPayment: number | null;
  creditLimit: number | null;
  interestRate: number | null;
  dueDate: string | null;
  nextPaymentDate: string | null;
  category: string;
  status: string;
  note: string | null;
};

const CATEGORIES = ["General", "Car", "Education", "Personal", "Credit Card", "Home", "Medical", "BNPL", "Pawnshop", "Other"];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:   "text-[#FF8C8C] bg-[#FF8C8C]/15",
  SETTLED:  "text-[#8EE3B5] bg-[#8EE3B5]/15",
  PAUSED:   "text-[#FBD38D] bg-[#FBD38D]/15",
};

const TYPE_COLORS: Record<string, string> = {
  FIXED:     "text-[#C4B5FD] bg-[#C4B5FD]/15",
  REVOLVING: "text-[#FBD38D] bg-[#FBD38D]/15",
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

function Input({ value, onChange, placeholder = "", type = "text", className = "", disabled }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 backdrop-blur-xl transition focus:border-[#6A49FA]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#6A49FA]/20 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    />
  );
}

const emptyForm = {
  name: "", creditor: "", debtType: "FIXED",
  totalAmount: "", remainingAmount: "",
  monthlyPayment: "", minimumPayment: "", creditLimit: "",
  interestRate: "", dueDate: "", nextPaymentDate: "",
  category: "General", status: "ACTIVE", note: "",
};

export default function DebtsPage() {
  const [debts, setDebts]           = useState<Debt[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editForm, setEditForm]     = useState<Record<string, any>>({});
  const [activeTab, setActiveTab]   = useState<"ALL" | "FIXED" | "REVOLVING">("ALL");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchDebts = async () => {
    const res  = await fetch("/api/debts");
    const data = await res.json();
    setDebts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchDebts(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.totalAmount) return;
    setSaving(true);
    const res = await fetch("/api/debts", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    if (res.ok) {
      await fetchDebts();
      setForm(emptyForm);
      setShowForm(false);
      showToast("Debt added ✅");
    }
    setSaving(false);
  };

  const handleEdit = async (id: string) => {
    setSaving(true);
    const res = await fetch(`/api/debts/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(editForm[id]),
    });
    if (res.ok) {
      await fetchDebts();
      setEditingId(null);
      showToast("Debt updated ✅");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/debts/${id}`, { method: "DELETE" });
    setDebts((prev) => prev.filter((d) => d.id !== id));
    showToast("Debt deleted");
  };

  const handleMarkSettled = async (debt: Debt) => {
    const res = await fetch(`/api/debts/${debt.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: "SETTLED", remainingAmount: 0 }),
    });
    if (res.ok) {
      await fetchDebts();
      showToast("Marked as settled 🎉");
    }
  };

  // Filtered debts
  const filteredDebts = activeTab === "ALL"
    ? debts
    : debts.filter((d) => d.debtType === activeTab);

  // Stats
  const activeDebts      = debts.filter((d) => d.status === "ACTIVE");
  const fixedDebts       = activeDebts.filter((d) => d.debtType === "FIXED");
  const revolvingDebts   = activeDebts.filter((d) => d.debtType === "REVOLVING");
  const totalOwed        = activeDebts.reduce((s, d) => s + d.remainingAmount, 0);
  const totalFixedMonthly    = fixedDebts.reduce((s, d) => s + d.monthlyPayment, 0);
  const totalRevolvingMin    = revolvingDebts.reduce((s, d) => s + (d.minimumPayment ?? 0), 0);
  const settledCount     = debts.filter((d) => d.status === "SETTLED").length;

  return (
    <PageContainer>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <style>{`
        .blob { position: fixed; border-radius: 9999px; pointer-events: none; z-index: 0; }
        .blob-1 { width: 500px; height: 500px; background: #FF8C8C; top: -150px; left: -150px; filter: blur(130px); opacity: 0.20; }
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
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Debts</h1>
            <p className="mt-1.5 text-sm text-white/50">Track fixed loans and revolving credit.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-2xl bg-[#6A49FA]/30 border border-[#6A49FA]/40 px-4 py-2.5 text-sm font-medium text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition mt-2"
          >
            <Plus size={16} /> Add Debt
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          {[
            { label: "Total Owed",        value: fmt(totalOwed),            color: "text-[#FF8C8C]" },
            { label: "Fixed Monthly",     value: fmt(totalFixedMonthly),    color: "text-[#C4B5FD]" },
            { label: "Revolving Min Pay", value: fmt(totalRevolvingMin),    color: "text-[#FBD38D]" },
            { label: "Settled",           value: `${settledCount} debts`,   color: "text-[#8EE3B5]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <p className="text-xs text-white/40">{label}</p>
              <p className={`mt-1.5 text-base font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tab Filter */}
        <div className="mb-5 flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
          {(["ALL", "FIXED", "REVOLVING"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                activeTab === tab
                  ? "bg-[#6A49FA]/30 text-[#C4B5FD] shadow-[inset_0_0_0_1px_rgba(196,181,253,0.3)]"
                  : "text-white/45 hover:text-white"
              }`}
            >
              {tab === "ALL" ? "All" : tab === "FIXED" ? "Fixed Loans" : "Revolving"}
            </button>
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
              <h2 className="text-base font-semibold text-white mb-4">New Debt</h2>

              {/* Debt Type Toggle */}
              <div className="mb-4">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Debt Type</p>
                <div className="flex gap-2">
                  {(["FIXED", "REVOLVING"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm((p) => ({ ...p, debtType: type }))}
                      className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
                        form.debtType === type
                          ? type === "FIXED"
                            ? "bg-[#C4B5FD]/20 text-[#C4B5FD] border border-[#C4B5FD]/40"
                            : "bg-[#FBD38D]/20 text-[#FBD38D] border border-[#FBD38D]/40"
                          : "bg-white/5 text-white/40 border border-white/10 hover:text-white"
                      }`}
                    >
                      {type === "FIXED" ? "🔒 Fixed Loan" : "🔄 Revolving"}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-white/30">
                  {form.debtType === "FIXED"
                    ? "Hire purchase, PTPTN, personal loan — fixed monthly installment."
                    : "BNPL, credit card, pajak gadai — variable monthly payment."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Name *">
                  <Input value={form.name} onChange={(e: any) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. PTPTN, TikTok Pay Later" />
                </Field>
                <Field label="Creditor">
                  <Input value={form.creditor} onChange={(e: any) => setForm((p) => ({ ...p, creditor: e.target.value }))} placeholder="e.g. Maybank, TikTok" />
                </Field>
                <Field label="Total Amount (RM) *">
                  <Input value={form.totalAmount} onChange={(e: any) => setForm((p) => ({ ...p, totalAmount: e.target.value }))} placeholder="0.00" type="number" />
                </Field>
                <Field label="Remaining Amount (RM)">
                  <Input value={form.remainingAmount} onChange={(e: any) => setForm((p) => ({ ...p, remainingAmount: e.target.value }))} placeholder="Same as total if new" type="number" />
                </Field>

                {/* Fixed fields */}
                {form.debtType === "FIXED" && (
                  <Field label="Monthly Installment (RM) *">
                    <Input value={form.monthlyPayment} onChange={(e: any) => setForm((p) => ({ ...p, monthlyPayment: e.target.value }))} placeholder="0.00" type="number" />
                  </Field>
                )}

                {/* Revolving fields */}
                {form.debtType === "REVOLVING" && (
                  <>
                    <Field label="Minimum Payment (RM)">
                      <Input value={form.minimumPayment} onChange={(e: any) => setForm((p) => ({ ...p, minimumPayment: e.target.value }))} placeholder="0.00" type="number" />
                    </Field>
                    <Field label="Credit Limit (RM)">
                      <Input value={form.creditLimit} onChange={(e: any) => setForm((p) => ({ ...p, creditLimit: e.target.value }))} placeholder="e.g. 500.00" type="number" />
                    </Field>
                  </>
                )}

                <Field label="Interest Rate (% p.a.)">
                  <Input value={form.interestRate} onChange={(e: any) => setForm((p) => ({ ...p, interestRate: e.target.value }))} placeholder="0 = interest free" type="number" />
                </Field>
                <Field label="Category">
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 backdrop-blur-xl"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#1a1035]">{c}</option>)}
                  </select>
                </Field>
                <Field label={form.debtType === "FIXED" ? "Final Settlement Date" : "Monthly Due Date"}>
                  <Input value={form.dueDate} onChange={(e: any) => setForm((p) => ({ ...p, dueDate: e.target.value }))} type="date" />
                </Field>
                <Field label="Next Payment Date">
                  <Input value={form.nextPaymentDate} onChange={(e: any) => setForm((p) => ({ ...p, nextPaymentDate: e.target.value }))} type="date" />
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
                  {saving ? "Saving…" : "Add Debt"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debt List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 rounded-full border-2 border-[#6A49FA]/40 border-t-[#6A49FA] animate-spin" />
          </div>
        ) : filteredDebts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <CreditCard size={36} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm">
              {activeTab === "ALL" ? "No debts recorded yet." : `No ${activeTab.toLowerCase()} debts.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDebts.map((debt) => {
              const isExpanded  = expandedId === debt.id;
              const isEditing   = editingId === debt.id;
              const isRevolving = debt.debtType === "REVOLVING";
              const progress    = debt.totalAmount > 0
                ? ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100
                : 0;
              const utilization = isRevolving && debt.creditLimit && debt.creditLimit > 0
                ? (debt.remainingAmount / debt.creditLimit) * 100
                : null;
              const monthsLeft  = !isRevolving && debt.monthlyPayment > 0
                ? Math.ceil(debt.remainingAmount / debt.monthlyPayment)
                : null;

              return (
                <div key={debt.id} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

                  {/* Header */}
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => { if (isEditing) return; setExpandedId(isExpanded ? null : debt.id); }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 ${isRevolving ? "bg-[#FBD38D]/15" : "bg-[#FF8C8C]/15"}`}>
                        {isRevolving
                          ? <RefreshCw size={16} className="text-[#FBD38D]" />
                          : <CreditCard size={16} className="text-[#FF8C8C]" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{debt.name}</p>
                        <p className="text-xs text-white/40 truncate">
                          {debt.creditor && `${debt.creditor} · `}{debt.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#FF8C8C]">{fmt(debt.remainingAmount)}</p>
                        <p className="text-xs text-white/35">
                          {isRevolving ? "outstanding" : "remaining"}
                        </p>
                      </div>
                      <span className={`rounded-xl px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[debt.debtType]}`}>
                        {debt.debtType}
                      </span>
                      <span className={`rounded-xl px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[debt.status] ?? STATUS_COLORS.ACTIVE}`}>
                        {debt.status}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                    </div>
                  </button>

                  {/* Progress / Utilization bar */}
                  <div className="px-5 pb-3">
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${isRevolving ? (utilization ?? 0) : progress}%`,
                          background: isRevolving
                            ? `linear-gradient(90deg, #8EE3B5, #FBD38D ${utilization ?? 0}%)`
                            : "linear-gradient(90deg, #FF8C8C, #FBD38D)",
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">
                      {isRevolving
                        ? utilization !== null ? `${utilization.toFixed(1)}% utilized` : "No credit limit set"
                        : `${progress.toFixed(1)}% paid off${monthsLeft ? ` · ~${monthsLeft} months left` : ""}`
                      }
                    </p>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
                      {!isEditing ? (
                        <>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {(isRevolving ? [
                              ["Total Amount",     fmt(debt.totalAmount)],
                              ["Outstanding",      fmt(debt.remainingAmount)],
                              ["Min Payment",      debt.minimumPayment ? fmt(debt.minimumPayment) : "—"],
                              ["Credit Limit",     debt.creditLimit ? fmt(debt.creditLimit) : "—"],
                              ["Interest Rate",    debt.interestRate ? `${debt.interestRate}% p.a.` : "0% (interest free)"],
                              ["Monthly Due",      debt.dueDate ? new Date(debt.dueDate).toLocaleDateString("ms-MY") : "—"],
                              ["Next Payment",     debt.nextPaymentDate ? new Date(debt.nextPaymentDate).toLocaleDateString("ms-MY") : "—"],
                            ] : [
                              ["Total Amount",     fmt(debt.totalAmount)],
                              ["Monthly Install",  fmt(debt.monthlyPayment)],
                              ["Interest Rate",    debt.interestRate ? `${debt.interestRate}% p.a.` : "—"],
                              ["Settlement Date",  debt.dueDate ? new Date(debt.dueDate).toLocaleDateString("ms-MY") : "—"],
                              ["Next Payment",     debt.nextPaymentDate ? new Date(debt.nextPaymentDate).toLocaleDateString("ms-MY") : "—"],
                              ["Months Left",      monthsLeft ? `~${monthsLeft} months` : "—"],
                            ]).map(([label, val]) => (
                              <div key={label}>
                                <p className="text-xs text-white/35">{label}</p>
                                <p className="text-white font-medium">{val}</p>
                              </div>
                            ))}
                          </div>

                          {debt.note && (
                            <p className="text-xs text-white/40 italic border-t border-white/10 pt-3">{debt.note}</p>
                          )}

                          <div className="flex gap-2 pt-1 flex-wrap">
                            {debt.status !== "SETTLED" && (
                              <button
                                onClick={() => handleMarkSettled(debt)}
                                className="flex items-center gap-1.5 rounded-2xl bg-[#8EE3B5]/15 border border-[#8EE3B5]/30 px-3 py-2 text-xs font-medium text-[#8EE3B5] hover:bg-[#8EE3B5]/25 transition"
                              >
                                <Check size={13} /> Mark Settled
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditForm((p) => ({
                                  ...p,
                                  [debt.id]: {
                                    ...debt,
                                    dueDate:         debt.dueDate?.split("T")[0]         ?? "",
                                    nextPaymentDate: debt.nextPaymentDate?.split("T")[0] ?? "",
                                  },
                                }));
                                setEditingId(debt.id);
                              }}
                              className="flex items-center gap-1.5 rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/50 hover:text-white transition"
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(debt.id)}
                              className="flex items-center gap-1.5 rounded-2xl bg-[#FF8C8C]/10 border border-[#FF8C8C]/20 px-3 py-2 text-xs text-[#FF8C8C]/70 hover:text-[#FF8C8C] transition ml-auto"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </>
                      ) : (
                        /* Edit Mode */
                        <div className="space-y-3">
                          <p className="text-xs text-[#FBD38D]/80">✏ Editing {debt.name}</p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                              { label: "Name",              key: "name",            type: "text"   },
                              { label: "Creditor",          key: "creditor",        type: "text"   },
                              { label: "Total Amount (RM)", key: "totalAmount",     type: "number" },
                              { label: "Remaining (RM)",    key: "remainingAmount", type: "number" },
                              ...(debt.debtType === "FIXED" ? [
                                { label: "Monthly Install (RM)", key: "monthlyPayment", type: "number" },
                              ] : [
                                { label: "Min Payment (RM)",  key: "minimumPayment", type: "number" },
                                { label: "Credit Limit (RM)", key: "creditLimit",    type: "number" },
                              ]),
                              { label: "Interest Rate (%)", key: "interestRate",    type: "number" },
                              { label: debt.debtType === "FIXED" ? "Settlement Date" : "Monthly Due", key: "dueDate", type: "date" },
                              { label: "Next Payment",      key: "nextPaymentDate", type: "date"   },
                              { label: "Note",              key: "note",            type: "text"   },
                            ].map(({ label, key, type }) => (
                              <Field key={key} label={label}>
                                <Input
                                  value={editForm[debt.id]?.[key] ?? ""}
                                  onChange={(e: any) => setEditForm((p) => ({ ...p, [debt.id]: { ...p[debt.id], [key]: e.target.value } }))}
                                  type={type}
                                />
                              </Field>
                            ))}
                            <Field label="Status">
                              <select
                                value={editForm[debt.id]?.status ?? "ACTIVE"}
                                onChange={(e) => setEditForm((p) => ({ ...p, [debt.id]: { ...p[debt.id], status: e.target.value } }))}
                                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 backdrop-blur-xl"
                              >
                                {["ACTIVE", "SETTLED", "PAUSED"].map((s) => (
                                  <option key={s} value={s} className="bg-[#1a1035]">{s}</option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Category">
                              <select
                                value={editForm[debt.id]?.category ?? "General"}
                                onChange={(e) => setEditForm((p) => ({ ...p, [debt.id]: { ...p[debt.id], category: e.target.value } }))}
                                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 backdrop-blur-xl"
                              >
                                {CATEGORIES.map((c) => (
                                  <option key={c} value={c} className="bg-[#1a1035]">{c}</option>
                                ))}
                              </select>
                            </Field>
                          </div>
                          <div className="flex gap-3 pt-1">
                            <button onClick={() => setEditingId(null)} className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white transition flex items-center justify-center gap-2">
                              <X size={14} /> Cancel
                            </button>
                            <button onClick={() => handleEdit(debt.id)} disabled={saving} className="flex-1 rounded-full bg-[#6A49FA]/40 border border-[#6A49FA]/50 py-2.5 text-sm font-semibold text-[#C4B5FD] hover:bg-[#6A49FA]/60 transition flex items-center justify-center gap-2">
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