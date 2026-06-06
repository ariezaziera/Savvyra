"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  Plus, Check, Trash2, Pencil, X,
  HandCoins, CreditCard, RefreshCw, Repeat2, Zap, Link2, AlertTriangle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
type CommitmentInstance = {
  id: string;
  month: number;
  year: number;
  dueDate: string;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "SKIPPED";
  isArrear: boolean;
  paidAt: string | null;
};

type Commitment = {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
  dayOfMonth: number | null;
  note: string | null;
  isActive: boolean;
  debtId: string | null;
  instances: CommitmentInstance[];
};

// ── Constants ────────────────────────────────────────────────────
const CATEGORIES = ["General","Repayment","Subscription","Insurance","Rent","Utilities","Other"];
const FREQUENCIES = ["MONTHLY","WEEKLY","QUARTERLY","ANNUALLY"] as const;
const FREQ_LABEL: Record<string, string> = {
  MONTHLY: "Monthly", WEEKLY: "Weekly", QUARTERLY: "Quarterly", ANNUALLY: "Annually",
};

const CATEGORY_ICON: Record<string, React.ElementType> = {
  Repayment: RefreshCw, Subscription: Repeat2, Insurance: CreditCard, General: HandCoins,
};
const CATEGORY_COLOR: Record<string, string> = {
  Repayment: "text-[#FF8C8C] bg-[#FF8C8C]/15",
  Subscription: "text-[#93C5FD] bg-[#93C5FD]/15",
  Insurance: "text-[#C4B5FD] bg-[#C4B5FD]/15",
  General: "text-[#8EE3B5] bg-[#8EE3B5]/15",
};
const STATUS_STYLE: Record<string, string> = {
  PAID:    "text-[#8EE3B5] bg-[#8EE3B5]/15 border-[#8EE3B5]/25",
  OVERDUE: "text-[#FF8C8C] bg-[#FF8C8C]/15 border-[#FF8C8C]/25",
  PENDING: "text-[#FBD38D] bg-[#FBD38D]/15 border-[#FBD38D]/25",
  SKIPPED: "text-white/30 bg-white/5 border-white/10",
};

// ── Helpers ──────────────────────────────────────────────────────
function getCurrentInstance(c: Commitment): CommitmentInstance | null {
  const now = new Date();
  return c.instances.find(
    (i) => i.month === now.getMonth() + 1 && i.year === now.getFullYear()
  ) ?? null;
}

function getDaysUntil(dateStr: string) {
  const diff = new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  return Math.ceil(diff / 86400000);
}

// ── Input/Select helpers ─────────────────────────────────────────
function Input({ value, onChange, placeholder = "", type = "text", className = "" }: any) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className={`w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 backdrop-blur-xl transition focus:border-[#6A49FA]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#6A49FA]/20 ${className}`}/>
  );
}
function Select({ value, onChange, options }: { value: string; onChange: any; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={onChange}
      className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none backdrop-blur-xl transition focus:border-[#6A49FA]/60 focus:ring-2 focus:ring-[#6A49FA]/20">
      {options.map((o) => <option key={o.value} value={o.value} className="bg-[#1a1035]">{o.label}</option>)}
    </select>
  );
}

const emptyForm = { name: "", category: "General", amount: "", frequency: "MONTHLY", dayOfMonth: "", note: "" };

// ── Page ─────────────────────────────────────────────────────────
export default function CommitmentsPage() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState("");
  const [filter, setFilter]           = useState<"All"|"PENDING"|"PAID"|"OVERDUE">("All");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const f = (k: keyof typeof emptyForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const fetchCommitments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commitments");
      if (res.ok) {
        const data = await res.json();
        setCommitments(Array.isArray(data) ? data : data.commitments ?? data.data ?? []);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCommitments(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (c: Commitment) => {
    if (c.debtId) { showToast("Edit this repayment from the Debts page 🔗"); return; }
    setForm({
      name: c.name, category: c.category,
      amount: String(c.amount), frequency: c.frequency,
      dayOfMonth: c.dayOfMonth ? String(c.dayOfMonth) : "",
      note: c.note ?? "",
    });
    setEditId(c.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.amount) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name, category: form.category,
        amount: parseFloat(form.amount), frequency: form.frequency,
        dayOfMonth: form.dayOfMonth ? parseInt(form.dayOfMonth) : null,
        note: form.note || null,
      };
      if (editId) {
        const res = await fetch(`/api/commitments/${editId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) { await fetchCommitments(); showToast("Updated ✅"); }
      } else {
        const res = await fetch("/api/commitments", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) { await fetchCommitments(); showToast("Added ✅"); }
      }
      setShowForm(false); setEditId(null); setForm(emptyForm);
    } finally { setSaving(false); }
  };

  const handleMarkPaid = async (c: Commitment) => {
    const instance = getCurrentInstance(c);
    if (!instance) { showToast("No instance for this month"); return; }
    if (instance.status === "PAID") { showToast("Already paid this month"); return; }

    const res = await fetch(`/api/commitments/${c.id}/instance/pay`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instanceId: instance.id }),
    });
    if (res.ok) { await fetchCommitments(); showToast("Marked paid ✅"); }
    else { const e = await res.json(); showToast(e.error ?? "Failed"); }
  };

  const handleDelete = async (c: Commitment) => {
    if (c.debtId) { showToast("Remove this from the Debts page instead 🔗"); return; }
    const res = await fetch(`/api/commitments/${c.id}`, { method: "DELETE" });
    if (res.ok) { setCommitments((p) => p.filter((x) => x.id !== c.id)); showToast("Deleted"); }
  };

  // Stats from current month instances
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear  = now.getFullYear();

  const activeCommitments = commitments.filter((c) => c.isActive);
  const thisMonthInstances = activeCommitments.map((c) =>
    c.instances.find((i) => i.month === currentMonth && i.year === currentYear)
  ).filter(Boolean) as CommitmentInstance[];

  const totalAmt   = thisMonthInstances.reduce((s, i) => s + i.amount, 0);
  const paidAmt    = thisMonthInstances.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const unpaidAmt  = totalAmt - paidAmt;
  const overdueCount = thisMonthInstances.filter((i) => i.status === "OVERDUE").length;
  const arrearCount  = thisMonthInstances.filter((i) => i.isArrear).length;

  // Filter
  const filtered = activeCommitments.filter((c) => {
    if (filter === "All") return true;
    const inst = getCurrentInstance(c);
    return inst?.status === filter;
  });

  return (
    <PageContainer>
      <div className="blob blob-1"/><div className="blob blob-2"/>
      <style>{`.blob{position:fixed;border-radius:9999px;pointer-events:none;z-index:0}.blob-1{width:500px;height:500px;background:#6a49fa;top:-150px;left:-150px;filter:blur(130px);opacity:.45}.blob-2{width:400px;height:400px;background:#fedada;bottom:-100px;right:-100px;filter:blur(120px);opacity:.30}`}</style>

      {toast && <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">{toast}</div>}

      <div className="relative z-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Monthly</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Commitments</h1>
            <p className="mt-1.5 text-sm text-white/50">Recurring payments, tracked monthly.</p>
          </div>
          <button onClick={openAdd} className="mt-2 flex items-center gap-2 rounded-2xl bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.03] active:scale-[0.97]">
            <Plus size={16}/> Add
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          {[
            { label: "This Month", value: formatCurrency(totalAmt), color: "text-white" },
            { label: "Unpaid", value: formatCurrency(unpaidAmt), color: "text-[#FF8C8C]" },
            { label: "Overdue", value: String(overdueCount), color: overdueCount > 0 ? "text-[#FF8C8C]" : "text-white/40" },
            { label: "Arrears", value: String(arrearCount), color: arrearCount > 0 ? "text-[#FBD38D]" : "text-white/40" },
          ].map(({ label, value, color }) => (
            <div key={label} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
              <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
              <p className={`mt-1.5 text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.25 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] mb-6">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">{editId ? "Edit Commitment" : "Add Commitment"}</h2>
                <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition"><X size={16}/></button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Name</label><Input value={form.name} onChange={(e:any) => f("name", e.target.value)} placeholder="e.g. Netflix"/></div>
                <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Category</label>
                  <Select value={form.category} onChange={(e:any) => f("category", e.target.value)} options={CATEGORIES.map((c) => ({ value: c, label: c }))}/>
                </div>
                <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Amount (RM)</label><Input value={form.amount} onChange={(e:any) => f("amount", e.target.value)} placeholder="0.00" type="number"/></div>
                <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Frequency</label>
                  <Select value={form.frequency} onChange={(e:any) => f("frequency", e.target.value)} options={FREQUENCIES.map((f) => ({ value: f, label: FREQ_LABEL[f] }))}/>
                </div>
                <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Day of Month</label><Input value={form.dayOfMonth} onChange={(e:any) => f("dayOfMonth", e.target.value)} placeholder="e.g. 5" type="number"/></div>
                <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Note (optional)</label><Input value={form.note} onChange={(e:any) => f("note", e.target.value)} placeholder="Any notes…"/></div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleSave} disabled={saving || !form.name || !form.amount}
                  className="flex-1 rounded-full bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? "Saving…" : editId ? "Update" : "Save"}
                </button>
                <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {(["All","PENDING","OVERDUE","PAID"] as const).map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${filter === tab ? "bg-[#6A49FA]/40 text-[#C4B5FD] border border-[#6A49FA]/40" : "border border-white/10 text-white/40 hover:text-white/70 hover:border-white/25"}`}>
              {tab === "All" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-20 rounded-3xl bg-white/5 animate-pulse"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <HandCoins size={32} className="text-white/20 mx-auto mb-3"/>
            <p className="text-sm text-white/35">{filter === "All" ? "No commitments yet. Tap Add to get started!" : `No ${filter.toLowerCase()} commitments.`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const instance  = getCurrentInstance(c);
              const status    = instance?.status ?? "PENDING";
              const isPaid    = status === "PAID";
              const isLinked  = !!c.debtId;
              const Icon      = CATEGORY_ICON[c.category] ?? HandCoins;
              const iconColor = CATEGORY_COLOR[c.category] ?? CATEGORY_COLOR.General;
              const days      = instance ? getDaysUntil(instance.dueDate) : null;

              return (
                <motion.div key={c.id} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                  className={`relative overflow-hidden rounded-3xl border backdrop-blur-2xl transition-all ${isPaid ? "border-white/5 bg-white/3 opacity-70" : isLinked ? "border-[#6A49FA]/25 bg-[#6A49FA]/5" : "border-white/10 bg-white/5 hover:border-white/15"}`}>
                  <div className="absolute inset-x-0 top-0 h-px bg-white/10"/>
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${iconColor}`}><Icon size={18}/></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-semibold ${isPaid ? "line-through text-white/40" : "text-white"}`}>{c.name}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[status]}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
                        {instance?.isArrear && (
                          <span className="flex items-center gap-1 rounded-full border border-[#FBD38D]/40 bg-[#FBD38D]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FBD38D]">
                            <AlertTriangle size={8}/> Arrear
                          </span>
                        )}
                        {isLinked && (
                          <span className="flex items-center gap-1 rounded-full border border-[#6A49FA]/40 bg-[#6A49FA]/15 px-2 py-0.5 text-[10px] font-semibold text-[#C4B5FD]">
                            <Link2 size={9}/> Debt
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">
                        {c.category} · {FREQ_LABEL[c.frequency]}
                        {c.dayOfMonth && <span className="text-white/25"> · due {c.dayOfMonth}th</span>}
                        {days !== null && !isPaid && days >= 0 && days <= 7 && <span className="text-[#FBD38D] ml-1">· {days === 0 ? "Due today!" : `${days}d left`}</span>}
                        {days !== null && !isPaid && days < 0 && <span className="text-[#FF8C8C] ml-1">· {Math.abs(days)}d overdue</span>}
                      </p>
                      {isLinked && <p className="text-[10px] text-[#6A49FA]/70 mt-0.5">Managed from Debts page</p>}
                      {!isLinked && c.note && <p className="text-xs text-white/25 mt-0.5 truncate">{c.note}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${isPaid ? "text-white/30" : "text-white"}`}>{formatCurrency(instance?.amount ?? c.amount)}</p>
                      {instance && <p className="text-[10px] text-white/30 mt-0.5">{new Date(instance.dueDate).toLocaleDateString("en-MY", { day:"numeric", month:"short" })}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => handleMarkPaid(c)}
                        className={`h-9 w-9 rounded-xl flex items-center justify-center transition ${isPaid ? "bg-[#8EE3B5]/20 text-[#8EE3B5]" : "bg-white/5 text-white/30 hover:bg-[#8EE3B5]/20 hover:text-[#8EE3B5]"}`}>
                        <Check size={15}/>
                      </button>
                      <button onClick={() => openEdit(c)}
                        className={`h-9 w-9 rounded-xl flex items-center justify-center transition ${isLinked ? "bg-white/3 text-white/15 cursor-not-allowed" : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white"}`}>
                        <Pencil size={14}/>
                      </button>
                      <button onClick={() => handleDelete(c)}
                        className={`h-9 w-9 rounded-xl flex items-center justify-center transition ${isLinked ? "bg-white/3 text-white/15 cursor-not-allowed" : "bg-white/5 text-white/30 hover:bg-[#FF8C8C]/20 hover:text-[#FF8C8C]"}`}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}