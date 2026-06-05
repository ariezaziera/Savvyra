"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, CreditCard, Trash2, Pencil, X, Check,
  ChevronDown, ChevronUp, Calendar, Wallet, AlertCircle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
type DebtType   = "FIXED" | "FLEXIBLE" | "BNPL";
type DebtStatus = "ACTIVE" | "SETTLED" | "PAUSED";
type ScheduleStatus = "PENDING" | "PAID" | "OVERDUE" | "SKIPPED";

type Schedule = {
  id: string;
  instalmentNo: number;
  dueDate: string;
  amount: number;
  status: ScheduleStatus;
  paidAt: string | null;
};

type Debt = {
  id: string;
  name: string;
  creditor: string | null;
  debtType: DebtType;
  category: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number;
  startDate: string;
  firstPaymentDate: string | null;
  totalInstalments: number | null;
  status: DebtStatus;
  note: string | null;
  schedules: Schedule[];
};

// ── Constants ────────────────────────────────────────────────────
const CATEGORIES = ["General","Car","Education","Personal","Home","Medical","BNPL","Other"];

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:  "text-[#FBD38D] bg-[#FBD38D]/15 border-[#FBD38D]/25",
  SETTLED: "text-[#8EE3B5] bg-[#8EE3B5]/15 border-[#8EE3B5]/25",
  PAUSED:  "text-white/40 bg-white/5 border-white/10",
};

const SCHEDULE_STYLE: Record<ScheduleStatus, string> = {
  PENDING: "text-[#FBD38D] bg-[#FBD38D]/10 border-[#FBD38D]/25",
  PAID:    "text-[#8EE3B5] bg-[#8EE3B5]/10 border-[#8EE3B5]/25",
  OVERDUE: "text-[#FF8C8C] bg-[#FF8C8C]/10 border-[#FF8C8C]/25",
  SKIPPED: "text-white/30 bg-white/5 border-white/10",
};

const TYPE_INFO: Record<DebtType, { label: string; color: string; desc: string }> = {
  FIXED:    { label: "Fixed Loan",  color: "text-[#C4B5FD] bg-[#C4B5FD]/15 border-[#C4B5FD]/25", desc: "Car, PTPTN, personal loan — fixed instalments" },
  FLEXIBLE: { label: "Flexible",   color: "text-[#93C5FD] bg-[#93C5FD]/15 border-[#93C5FD]/25", desc: "Pinjam makcik — pay anytime, any amount" },
  BNPL:     { label: "BNPL",       color: "text-[#FBD38D] bg-[#FBD38D]/15 border-[#FBD38D]/25", desc: "Buy Now Pay Later — short-term instalment plan" },
};

const fmt = (n: number) =>
  "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });

// ── Small components ─────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/50 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder = "", type = "text", disabled }: any) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 backdrop-blur-xl transition focus:border-[#6A49FA]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#6A49FA]/20 disabled:opacity-40" />
  );
}

const emptyForm = {
  name: "", creditor: "", debtType: "FIXED" as DebtType,
  totalAmount: "", remainingAmount: "", monthlyPayment: "",
  totalInstalments: "", interestRate: "",
  firstPaymentDate: "", category: "General", note: "",
};

// ── Page ─────────────────────────────────────────────────────────
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
  const [activeTab, setActiveTab]   = useState<"ALL" | "FIXED" | "FLEXIBLE" | "BNPL">("ALL");
  const [payingId, setPayingId]     = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

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
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:             form.name,
        creditor:         form.creditor || null,
        debtType:         form.debtType,
        category:         form.category,
        totalAmount:      parseFloat(form.totalAmount),
        remainingAmount:  form.remainingAmount ? parseFloat(form.remainingAmount) : parseFloat(form.totalAmount),
        monthlyPayment:   form.monthlyPayment ? parseFloat(form.monthlyPayment) : 0,
        totalInstalments: form.totalInstalments ? parseInt(form.totalInstalments) : null,
        interestRate:     form.interestRate ? parseFloat(form.interestRate) : 0,
        firstPaymentDate: form.firstPaymentDate || null,
        note:             form.note || null,
      }),
    });
    if (res.ok) { await fetchDebts(); setForm(emptyForm); setShowForm(false); showToast("Debt added ✅"); }
    else { const e = await res.json(); showToast(e.error ?? "Failed to add"); }
    setSaving(false);
  };

  const handleEdit = async (id: string) => {
    setSaving(true);
    const res = await fetch(`/api/debts/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm[id]),
    });
    if (res.ok) { await fetchDebts(); setEditingId(null); showToast("Updated ✅"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/debts/${id}`, { method: "DELETE" });
    setDebts((p) => p.filter((d) => d.id !== id));
    showToast("Deleted");
  };

  const handleMarkSettled = async (id: string) => {
    const res = await fetch(`/api/debts/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SETTLED", remainingAmount: 0 }),
    });
    if (res.ok) { await fetchDebts(); showToast("Marked settled 🎉"); }
  };

  const handlePaySchedule = async (debt: Debt, schedule: Schedule) => {
    if (schedule.status === "PAID") return;
    setPayingId(schedule.id);
    const res = await fetch("/api/transactions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:         `${debt.name} — Instalment ${schedule.instalmentNo}`,
        amount:        schedule.amount,
        type:          "DEBT_PAYMENT",
        category:      "Debt",
        date:          new Date().toISOString(),
        debtId:        debt.id,
        debtScheduleId: schedule.id,
      }),
    });
    if (res.ok) { await fetchDebts(); showToast(`Instalment ${schedule.instalmentNo} paid ✅`); }
    else { const e = await res.json(); showToast(e.error ?? "Failed"); }
    setPayingId(null);
  };

  // Stats
  const activeDebts   = debts.filter((d) => d.status === "ACTIVE");
  const totalOwed     = activeDebts.reduce((s, d) => s + d.remainingAmount, 0);
  const totalMonthly  = activeDebts.reduce((s, d) => s + d.monthlyPayment, 0);
  const settledCount  = debts.filter((d) => d.status === "SETTLED").length;
  const overdueCount  = debts.flatMap((d) => d.schedules).filter((s) => s.status === "OVERDUE").length;

  const filtered = activeTab === "ALL" ? debts : debts.filter((d) => d.debtType === activeTab);

  return (
    <PageContainer>
      <div className="blob blob-1" /><div className="blob blob-2" />
      <style>{`.blob{position:fixed;border-radius:9999px;pointer-events:none;z-index:0}.blob-1{width:500px;height:500px;background:#FF8C8C;top:-150px;left:-150px;filter:blur(130px);opacity:.20}.blob-2{width:400px;height:400px;background:#6a49fa;bottom:-100px;right:-100px;filter:blur(120px);opacity:.30}`}</style>

      {toast && <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">{toast}</div>}

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Finance</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Debts</h1>
            <p className="mt-1.5 text-sm text-white/50">Fixed loans, flexible borrowing, and BNPL.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="mt-2 flex items-center gap-2 rounded-2xl bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.03] active:scale-[0.97]">
            <Plus size={16} /> Add Debt
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          {[
            { label: "Total Owed",      value: fmt(totalOwed),          color: "text-[#FF8C8C]" },
            { label: "Monthly Payment", value: fmt(totalMonthly),       color: "text-[#C4B5FD]" },
            { label: "Overdue",         value: `${overdueCount} items`, color: overdueCount > 0 ? "text-[#FF8C8C]" : "text-white/40" },
            { label: "Settled",         value: `${settledCount} debts`, color: "text-[#8EE3B5]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <p className="text-xs text-white/40">{label}</p>
              <p className={`mt-1.5 text-base font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tab filter */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {(["ALL","FIXED","FLEXIBLE","BNPL"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${activeTab === tab ? "bg-[#6A49FA]/40 text-[#C4B5FD] border border-[#6A49FA]/40" : "border border-white/10 text-white/40 hover:text-white/70"}`}>
              {tab === "ALL" ? "All" : TYPE_INFO[tab].label}
            </button>
          ))}
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">New Debt</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition"><X size={16}/></button>
              </div>

              {/* Debt Type selector */}
              <div className="mb-5">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Debt Type</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["FIXED","FLEXIBLE","BNPL"] as const).map((type) => (
                    <button key={type} onClick={() => setForm((p) => ({ ...p, debtType: type }))}
                      className={`rounded-2xl px-3 py-2.5 text-xs font-semibold transition-all border ${form.debtType === type ? TYPE_INFO[type].color : "border-white/10 text-white/40 hover:text-white"}`}>
                      {TYPE_INFO[type].label}
                      <p className="text-[10px] font-normal opacity-70 mt-0.5 leading-tight">{TYPE_INFO[type].desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Name *"><Input value={form.name} onChange={(e: any) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. PTPTN, TikTok Pay Later" /></Field>
                <Field label="Creditor"><Input value={form.creditor} onChange={(e: any) => setForm((p) => ({ ...p, creditor: e.target.value }))} placeholder="e.g. PTPTN, Shopee" /></Field>
                <Field label="Total Amount (RM) *"><Input value={form.totalAmount} onChange={(e: any) => setForm((p) => ({ ...p, totalAmount: e.target.value }))} placeholder="0.00" type="number" /></Field>
                <Field label="Remaining Amount (RM)"><Input value={form.remainingAmount} onChange={(e: any) => setForm((p) => ({ ...p, remainingAmount: e.target.value }))} placeholder="Leave blank = same as total" type="number" /></Field>

                {form.debtType !== "FLEXIBLE" && (
                  <>
                    <Field label="Monthly Payment (RM)"><Input value={form.monthlyPayment} onChange={(e: any) => setForm((p) => ({ ...p, monthlyPayment: e.target.value }))} placeholder="0.00" type="number" /></Field>
                    <Field label="Total Instalments"><Input value={form.totalInstalments} onChange={(e: any) => setForm((p) => ({ ...p, totalInstalments: e.target.value }))} placeholder="e.g. 24" type="number" /></Field>
                    <Field label={form.debtType === "BNPL" ? "First Payment Date" : "Start of Repayment"}>
                      <Input value={form.firstPaymentDate} onChange={(e: any) => setForm((p) => ({ ...p, firstPaymentDate: e.target.value }))} type="date" />
                    </Field>
                    {form.debtType === "BNPL" && (
                      <div className="sm:col-span-1">
                        <p className="text-xs text-[#FBD38D]/70 bg-[#FBD38D]/10 border border-[#FBD38D]/20 rounded-xl px-3 py-2 mt-6">
                          💡 Set first payment date to today for immediate billing, or next month for deferred BNPL.
                        </p>
                      </div>
                    )}
                  </>
                )}

                <Field label="Interest Rate (% p.a.)"><Input value={form.interestRate} onChange={(e: any) => setForm((p) => ({ ...p, interestRate: e.target.value }))} placeholder="0 = interest free" type="number" /></Field>
                <Field label="Category">
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 backdrop-blur-xl">
                    {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#1a1035]">{c}</option>)}
                  </select>
                </Field>
                <Field label="Note" ><Input value={form.note} onChange={(e: any) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="Optional note" /></Field>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowForm(false)} className="flex-1 rounded-full border border-white/15 bg-white/5 py-3 text-sm text-white/60 hover:text-white transition">Cancel</button>
                <button onClick={handleAdd} disabled={saving || !form.name || !form.totalAmount}
                  className="flex-1 rounded-full bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.02] disabled:opacity-50">
                  {saving ? "Saving…" : "Add Debt"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debt List */}
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-3xl bg-white/5 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <CreditCard size={36} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm">{activeTab === "ALL" ? "No debts recorded yet." : `No ${TYPE_INFO[activeTab]?.label} debts.`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((debt) => {
              const isExpanded = expandedId === debt.id;
              const isEditing  = editingId  === debt.id;
              const info       = TYPE_INFO[debt.debtType];
              const progress   = debt.totalAmount > 0 ? ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100 : 0;
              const monthsLeft = debt.monthlyPayment > 0 ? Math.ceil(debt.remainingAmount / debt.monthlyPayment) : null;
              const nextDue    = debt.schedules.find((s) => s.status === "PENDING" || s.status === "OVERDUE");
              const paidCount  = debt.schedules.filter((s) => s.status === "PAID").length;

              return (
                <div key={debt.id} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

                  {/* Header row */}
                  <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => { if (isEditing) return; setExpandedId(isExpanded ? null : debt.id); }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-2xl bg-[#FF8C8C]/15 flex items-center justify-center shrink-0">
                        <CreditCard size={17} className="text-[#FF8C8C]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white">{debt.name}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${info.color}`}>{info.label}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[debt.status]}`}>{debt.status}</span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">
                          {debt.creditor && `${debt.creditor} · `}{debt.category}
                          {nextDue && <span className={nextDue.status === "OVERDUE" ? " · text-[#FF8C8C]" : ""}> · next due {fmtDate(nextDue.dueDate)}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#FF8C8C]">{fmt(debt.remainingAmount)}</p>
                        <p className="text-[10px] text-white/35">remaining</p>
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                    </div>
                  </button>

                  {/* Progress bar */}
                  <div className="px-5 pb-3">
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, background: "linear-gradient(90deg, #FF8C8C, #FBD38D)" }} />
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">
                      {progress.toFixed(1)}% paid off
                      {debt.debtType !== "FLEXIBLE" && debt.schedules.length > 0 && ` · ${paidCount}/${debt.schedules.length} instalments`}
                      {monthsLeft && debt.debtType === "FLEXIBLE" && ` · ~${monthsLeft} months at current rate`}
                    </p>
                  </div>

                  {/* Expanded */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/10">
                        <div className="px-5 py-4 space-y-4">
                          {!isEditing ? (
                            <>
                              {/* Details grid */}
                              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                                {[
                                  ["Total Amount",    fmt(debt.totalAmount)],
                                  ["Remaining",       fmt(debt.remainingAmount)],
                                  ...(debt.monthlyPayment > 0 ? [["Monthly Payment", fmt(debt.monthlyPayment)]] : []),
                                  ...(debt.interestRate > 0 ? [["Interest Rate", `${debt.interestRate}% p.a.`]] : []),
                                  ...(debt.totalInstalments ? [["Total Instalments", String(debt.totalInstalments)]] : []),
                                  ...(monthsLeft ? [["Est. Months Left", `~${monthsLeft}`]] : []),
                                ].map(([label, val]) => (
                                  <div key={label}>
                                    <p className="text-xs text-white/35">{label}</p>
                                    <p className="text-white font-medium">{val}</p>
                                  </div>
                                ))}
                              </div>
                              {debt.note && <p className="text-xs text-white/40 italic border-t border-white/10 pt-3">{debt.note}</p>}

                              {/* Schedule */}
                              {debt.schedules.length > 0 && (
                                <div>
                                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Calendar size={11}/> Payment Schedule
                                  </p>
                                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                    {debt.schedules.map((s) => (
                                      <div key={s.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-white/40 w-5 text-right">{s.instalmentNo}.</span>
                                          <span className="text-xs text-white/70">{fmtDate(s.dueDate)}</span>
                                          <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${SCHEDULE_STYLE[s.status]}`}>
                                            {s.status}
                                          </span>
                                          {s.status === "OVERDUE" && <AlertCircle size={11} className="text-[#FF8C8C]" />}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-semibold text-white">{fmt(s.amount)}</span>
                                          {s.status !== "PAID" && (
                                            <button onClick={() => handlePaySchedule(debt, s)} disabled={payingId === s.id}
                                              className="h-7 w-7 rounded-xl bg-[#8EE3B5]/15 border border-[#8EE3B5]/25 flex items-center justify-center text-[#8EE3B5] hover:bg-[#8EE3B5]/30 transition disabled:opacity-40">
                                              {payingId === s.id ? <span className="text-[9px]">…</span> : <Check size={12}/>}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Flexible — quick pay */}
                              {debt.debtType === "FLEXIBLE" && debt.status === "ACTIVE" && (
                                <div className="border-t border-white/10 pt-3">
                                  <p className="text-xs text-white/40 mb-2 flex items-center gap-1.5"><Wallet size={11}/> Quick Payment</p>
                                  <FlexiblePayForm debt={debt} onPaid={() => { fetchDebts(); showToast("Payment recorded ✅"); }} />
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2 pt-1 flex-wrap">
                                {debt.status !== "SETTLED" && (
                                  <button onClick={() => handleMarkSettled(debt.id)}
                                    className="flex items-center gap-1.5 rounded-2xl bg-[#8EE3B5]/15 border border-[#8EE3B5]/30 px-3 py-2 text-xs font-medium text-[#8EE3B5] hover:bg-[#8EE3B5]/25 transition">
                                    <Check size={13} /> Mark Settled
                                  </button>
                                )}
                                <button onClick={() => { setEditForm((p) => ({ ...p, [debt.id]: { ...debt } })); setEditingId(debt.id); }}
                                  className="flex items-center gap-1.5 rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/50 hover:text-white transition">
                                  <Pencil size={13} /> Edit
                                </button>
                                <button onClick={() => handleDelete(debt.id)}
                                  className="flex items-center gap-1.5 rounded-2xl bg-[#FF8C8C]/10 border border-[#FF8C8C]/20 px-3 py-2 text-xs text-[#FF8C8C]/70 hover:text-[#FF8C8C] transition ml-auto">
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            </>
                          ) : (
                            /* Edit mode */
                            <div className="space-y-3">
                              <p className="text-xs text-[#FBD38D]/80">✏ Editing {debt.name}</p>
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {[
                                  { label: "Name",              key: "name",             type: "text"   },
                                  { label: "Creditor",          key: "creditor",         type: "text"   },
                                  { label: "Total Amount (RM)", key: "totalAmount",      type: "number" },
                                  { label: "Remaining (RM)",    key: "remainingAmount",  type: "number" },
                                  { label: "Monthly Payment (RM)", key: "monthlyPayment", type: "number" },
                                  { label: "Interest Rate (%)", key: "interestRate",     type: "number" },
                                  { label: "Note",              key: "note",             type: "text"   },
                                ].map(({ label, key, type }) => (
                                  <Field key={key} label={label}>
                                    <Input value={editForm[debt.id]?.[key] ?? ""}
                                      onChange={(e: any) => setEditForm((p) => ({ ...p, [debt.id]: { ...p[debt.id], [key]: e.target.value } }))}
                                      type={type} />
                                  </Field>
                                ))}
                                <Field label="Status">
                                  <select value={editForm[debt.id]?.status ?? "ACTIVE"}
                                    onChange={(e) => setEditForm((p) => ({ ...p, [debt.id]: { ...p[debt.id], status: e.target.value } }))}
                                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 backdrop-blur-xl">
                                    {["ACTIVE","SETTLED","PAUSED"].map((s) => <option key={s} value={s} className="bg-[#1a1035]">{s}</option>)}
                                  </select>
                                </Field>
                                <Field label="Category">
                                  <select value={editForm[debt.id]?.category ?? "General"}
                                    onChange={(e) => setEditForm((p) => ({ ...p, [debt.id]: { ...p[debt.id], category: e.target.value } }))}
                                    className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none focus:border-[#6A49FA]/60 backdrop-blur-xl">
                                    {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#1a1035]">{c}</option>)}
                                  </select>
                                </Field>
                              </div>
                              <div className="flex gap-3 pt-1">
                                <button onClick={() => setEditingId(null)} className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white transition flex items-center justify-center gap-2">
                                  <X size={14} /> Cancel
                                </button>
                                <button onClick={() => handleEdit(debt.id)} disabled={saving}
                                  className="flex-1 rounded-full bg-[#6A49FA]/40 border border-[#6A49FA]/50 py-2.5 text-sm font-semibold text-[#C4B5FD] hover:bg-[#6A49FA]/60 transition flex items-center justify-center gap-2">
                                  <Check size={14} /> {saving ? "Saving…" : "Save"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

// ── Flexible Quick Pay sub-component ─────────────────────────────
function FlexiblePayForm({ debt, onPaid }: { debt: Debt; onPaid: () => void }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePay = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    setSaving(true);
    await fetch("/api/transactions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:    `${debt.name} — Payment`,
        amount:   amt,
        type:     "DEBT_PAYMENT",
        category: "Debt",
        date:     new Date().toISOString(),
        debtId:   debt.id,
      }),
    });
    setAmount("");
    setSaving(false);
    onPaid();
  };

  return (
    <div className="flex gap-2">
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (RM)"
        className="flex-1 rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#6A49FA]/60 transition" />
      <button onClick={handlePay} disabled={saving || !amount}
        className="rounded-2xl bg-[#8EE3B5]/20 border border-[#8EE3B5]/30 px-4 py-2.5 text-xs font-semibold text-[#8EE3B5] hover:bg-[#8EE3B5]/35 transition disabled:opacity-40">
        {saving ? "…" : "Pay"}
      </button>
    </div>
  );
}