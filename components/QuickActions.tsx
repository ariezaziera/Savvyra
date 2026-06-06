"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, ArrowUpDown, HandCoins, Target,
  CreditCard, TrendingUp, Wallet,
} from "lucide-react";

// ── Shared mini UI ────────────────────────────────────────────────
function Overlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />
  );
}

function Modal({ title, subtitle, icon: Icon, iconColor, onClose, children }: {
  title: string; subtitle: string; icon: React.ElementType;
  iconColor: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md rounded-3xl border border-white/12 bg-[#16102e]/95 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-white/15 z-10" />

      {/* Header — fixed, never scrolls */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/8 ${iconColor}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest">{subtitle}</p>
            <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white/50 hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body — scrollable */}
      <div className="px-5 pb-6 overflow-y-auto flex-1">
        {children}
      </div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-[#6A49FA]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#6A49FA]/20";
const selectCls = "w-full rounded-2xl border border-white/10 bg-[#16102e] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#6A49FA]/60 focus:ring-2 focus:ring-[#6A49FA]/20";

function SubmitBtn({ label, loading, disabled }: { label: string; loading: boolean; disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="w-full rounded-2xl bg-gradient-to-r from-[#6A49FA] to-[#9B7FFF] py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(106,73,250,0.4)] transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
    >
      {loading ? "Saving…" : label}
    </button>
  );
}

// ── 1. Add Transaction ─────────────────────────────────────────────
function AddTransactionModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ title: "", amount: "", type: "EXPENSE", category: "General", date: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(false);
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    setLoading(true);
    try {
      await fetch("/api/transactions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      onDone();
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Add Transaction" subtitle="New Entry" icon={ArrowUpDown} iconColor="text-[#C4B5FD]" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title">
          <input className={inputCls} placeholder="e.g. Lunch at Mcd" value={form.title} onChange={f("title")} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Amount (RM)">
            <input className={inputCls} type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={f("amount")} />
          </Field>
          <Field label="Type">
            <select className={selectCls} value={form.type} onChange={f("type")}>
              {["INCOME","EXPENSE","SAVINGS","INVESTMENT","DEBT_PAYMENT","DEBT_ADDITION","COMMITMENT"].map(t => (
                <option key={t} value={t} className="bg-[#16102e]">{t.replace("_"," ")}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Category">
            <input className={inputCls} placeholder="General" value={form.category} onChange={f("category")} />
          </Field>
          <Field label="Date">
            <input className={inputCls} type="date" value={form.date} onChange={f("date")} />
          </Field>
        </div>
        <SubmitBtn label="Add Transaction" loading={loading} disabled={!form.title || !form.amount} />
      </form>
    </Modal>
  );
}

// ── 2. Add Commitment ──────────────────────────────────────────────
function AddCommitmentModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", amount: "", category: "General", frequency: "MONTHLY", dayOfMonth: "" });
  const [loading, setLoading] = useState(false);
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    setLoading(true);
    try {
      await fetch("/api/commitments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), dayOfMonth: form.dayOfMonth ? parseInt(form.dayOfMonth) : null }),
      });
      onDone();
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Add Commitment" subtitle="Recurring Bill" icon={HandCoins} iconColor="text-[#FF8C8C]" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Name">
          <input className={inputCls} placeholder="e.g. Netflix, TNB, Insurance" value={form.name} onChange={f("name")} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Amount (RM)">
            <input className={inputCls} type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={f("amount")} />
          </Field>
          <Field label="Due Day">
            <input className={inputCls} type="number" placeholder="e.g. 5" min="1" max="31" value={form.dayOfMonth} onChange={f("dayOfMonth")} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Category">
            <select className={selectCls} value={form.category} onChange={f("category")}>
              {["General","Repayment","Subscription","Insurance","Rent","Utilities","Other"].map(c => (
                <option key={c} value={c} className="bg-[#16102e]">{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Frequency">
            <select className={selectCls} value={form.frequency} onChange={f("frequency")}>
              {["MONTHLY","WEEKLY","QUARTERLY","ANNUALLY"].map(fr => (
                <option key={fr} value={fr} className="bg-[#16102e]">{fr.charAt(0)+fr.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </Field>
        </div>
        <SubmitBtn label="Add Commitment" loading={loading} disabled={!form.name || !form.amount} />
      </form>
    </Modal>
  );
}

// ── 3. Add Savings Goal ───────────────────────────────────────────
function AddSavingsModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", targetAmount: "", monthlyContribution: "", deadline: "" });
  const [loading, setLoading] = useState(false);
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.targetAmount) return;
    setLoading(true);
    try {
      await fetch("/api/savings-goals", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          targetAmount: parseFloat(form.targetAmount),
          monthlyContribution: form.monthlyContribution ? parseFloat(form.monthlyContribution) : null,
          deadline: form.deadline || null,
        }),
      });
      onDone();
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Add Savings Goal" subtitle="New Goal" icon={Target} iconColor="text-[#8EE3B5]" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Goal Name">
          <input className={inputCls} placeholder="e.g. Emergency Fund" value={form.name} onChange={f("name")} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Target (RM)">
            <input className={inputCls} type="number" placeholder="10000" min="0" step="0.01" value={form.targetAmount} onChange={f("targetAmount")} />
          </Field>
          <Field label="Monthly (RM)">
            <input className={inputCls} type="number" placeholder="500" min="0" step="0.01" value={form.monthlyContribution} onChange={f("monthlyContribution")} />
          </Field>
        </div>
        <Field label="Deadline (optional)">
          <input className={inputCls} type="date" value={form.deadline} onChange={f("deadline")} />
        </Field>
        <SubmitBtn label="Add Goal" loading={loading} disabled={!form.name || !form.targetAmount} />
      </form>
    </Modal>
  );
}

// ── 4. Add Debt ───────────────────────────────────────────────────
function AddDebtModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", creditor: "", debtType: "FIXED", totalAmount: "", monthlyPayment: "", firstPaymentDate: "", category: "General" });
  const [loading, setLoading] = useState(false);
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.totalAmount) return;
    setLoading(true);
    try {
      await fetch("/api/debts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalAmount: parseFloat(form.totalAmount),
          remainingAmount: parseFloat(form.totalAmount),
          monthlyPayment: form.monthlyPayment ? parseFloat(form.monthlyPayment) : 0,
          firstPaymentDate: form.firstPaymentDate || null,
        }),
      });
      onDone();
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Add Debt" subtitle="New Debt" icon={CreditCard} iconColor="text-[#FBD38D]" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Debt Name">
          <input className={inputCls} placeholder="e.g. Car Loan, PTPTN" value={form.name} onChange={f("name")} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Total Amount (RM)">
            <input className={inputCls} type="number" placeholder="0.00" min="0" step="0.01" value={form.totalAmount} onChange={f("totalAmount")} />
          </Field>
          <Field label="Type">
            <select className={selectCls} value={form.debtType} onChange={f("debtType")}>
              <option value="FIXED" className="bg-[#16102e]">Fixed Loan</option>
              <option value="FLEXIBLE" className="bg-[#16102e]">Flexible</option>
              <option value="BNPL" className="bg-[#16102e]">BNPL</option>
            </select>
          </Field>
        </div>
        {form.debtType !== "FLEXIBLE" && (
          <div className="grid grid-cols-2 gap-2">
            <Field label="Monthly Payment (RM)">
              <input className={inputCls} type="number" placeholder="0.00" min="0" step="0.01" value={form.monthlyPayment} onChange={f("monthlyPayment")} />
            </Field>
            <Field label="First Payment Date">
              <input className={inputCls} type="date" value={form.firstPaymentDate} onChange={f("firstPaymentDate")} />
            </Field>
          </div>
        )}
        <Field label="Creditor (optional)">
          <input className={inputCls} placeholder="e.g. Maybank, Makcik" value={form.creditor} onChange={f("creditor")} />
        </Field>
        <SubmitBtn label="Add Debt" loading={loading} disabled={!form.name || !form.totalAmount} />
      </form>
    </Modal>
  );
}

// ── 5. Add Investment ─────────────────────────────────────────────
function AddInvestmentModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [accounts, setAccounts] = useState<{ id: string; name: string; platform: string }[]>([]);
  const [form, setForm] = useState({ name: "", investmentAccountId: "", type: "General", monthlyContribution: "", purpose: "" });
  const [loading, setLoading] = useState(false);
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    fetch("/api/investment-accounts").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAccounts(data);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.investmentAccountId) return;
    setLoading(true);
    try {
      await fetch("/api/investments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          monthlyContribution: form.monthlyContribution ? parseFloat(form.monthlyContribution) : 0,
        }),
      });
      onDone();
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Add Investment" subtitle="New Entry" icon={TrendingUp} iconColor="text-[#93C5FD]" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Investment Name">
          <input className={inputCls} placeholder="e.g. Gold for House DP" value={form.name} onChange={f("name")} />
        </Field>
        <Field label="Account">
          {accounts.length === 0
            ? <p className="text-xs text-white/40 py-2">No investment accounts yet — add one in Investments page first.</p>
            : (
              <select className={selectCls} value={form.investmentAccountId} onChange={f("investmentAccountId")}>
                <option value="" className="bg-[#16102e]">Select account…</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id} className="bg-[#16102e]">{a.name} · {a.platform}</option>
                ))}
              </select>
            )
          }
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Type">
            <select className={selectCls} value={form.type} onChange={f("type")}>
              {["General","Gold","Stocks","ASNB","Unit Trust","Fixed Deposit","Crypto","EPF","Other"].map(t => (
                <option key={t} value={t} className="bg-[#16102e]">{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Monthly (RM)">
            <input className={inputCls} type="number" placeholder="0.00" min="0" step="0.01" value={form.monthlyContribution} onChange={f("monthlyContribution")} />
          </Field>
        </div>
        <Field label="Purpose (optional)">
          <input className={inputCls} placeholder="e.g. House downpayment" value={form.purpose} onChange={f("purpose")} />
        </Field>
        <SubmitBtn label="Add Investment" loading={loading} disabled={!form.name || !form.investmentAccountId} />
      </form>
    </Modal>
  );
}

// ── 6. Log Salary ─────────────────────────────────────────────────
function AddSalaryModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const now = new Date();
  const [form, setForm] = useState({ basicSalary: "", month: String(now.getMonth() + 1), year: String(now.getFullYear()), otHours: "", unpaidLeaveDays: "" });
  const [loading, setLoading] = useState(false);
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.basicSalary) return;
    setLoading(true);
    try {
      await fetch("/api/salary/months", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicSalary: parseFloat(form.basicSalary),
          month: parseInt(form.month),
          year: parseInt(form.year),
          otHours: parseFloat(form.otHours) || 0,
          unpaidLeaveDays: parseFloat(form.unpaidLeaveDays) || 0,
          allowances: [], customDeductions: [],
          otRate: 1.5, doublePayRate: 2.0, hoursPerDay: 7.5,
          dailyRateFormula: "basic/26", doublePayHours: 0,
          annualLeaveDays: 0, medicalLeaveDays: 0, replacementDays: 0,
          deductEPF: true, deductSOCSO: true, deductEIS: true,
        }),
      });
      onDone();
    } finally { setLoading(false); }
  };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <Modal title="Log Salary" subtitle="This Month" icon={Wallet} iconColor="text-[#C4B5FD]" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Basic Salary (RM)">
          <input className={inputCls} type="number" placeholder="0.00" min="0" step="0.01" value={form.basicSalary} onChange={f("basicSalary")} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Month">
            <select className={selectCls} value={form.month} onChange={f("month")}>
              {MONTHS.map((m, i) => <option key={i+1} value={i+1} className="bg-[#16102e]">{m}</option>)}
            </select>
          </Field>
          <Field label="Year">
            <input className={inputCls} type="number" value={form.year} onChange={f("year")} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="OT Hours">
            <input className={inputCls} type="number" placeholder="0" min="0" step="0.5" value={form.otHours} onChange={f("otHours")} />
          </Field>
          <Field label="Unpaid Leave Days">
            <input className={inputCls} type="number" placeholder="0" min="0" step="0.5" value={form.unpaidLeaveDays} onChange={f("unpaidLeaveDays")} />
          </Field>
        </div>
        <p className="text-[10px] text-white/30">Full salary details can be configured in Salary Manager.</p>
        <SubmitBtn label="Log Salary" loading={loading} disabled={!form.basicSalary} />
      </form>
    </Modal>
  );
}

// ── Action Definitions ────────────────────────────────────────────
type ActionKey = "transaction" | "commitment" | "savings" | "debt" | "investment" | "salary";

const ACTIONS: { key: ActionKey; label: string; icon: React.ElementType; gradient: string; iconColor: string; glow: string }[] = [
  { key: "transaction",  label: "Transaction",  icon: ArrowUpDown, gradient: "from-[#C4B5FD]/20 to-[#6A49FA]/10", iconColor: "text-[#C4B5FD]", glow: "rgba(196,181,253,0.25)" },
  { key: "commitment",   label: "Commitment",   icon: HandCoins,   gradient: "from-[#FF8C8C]/20 to-[#ef4444]/10", iconColor: "text-[#FF8C8C]", glow: "rgba(255,140,140,0.20)" },
  { key: "savings",      label: "Savings Goal", icon: Target,      gradient: "from-[#8EE3B5]/20 to-[#4ade80]/10", iconColor: "text-[#8EE3B5]", glow: "rgba(142,227,181,0.20)" },
  { key: "debt",         label: "Debt",         icon: CreditCard,  gradient: "from-[#FBD38D]/20 to-[#f59e0b]/10", iconColor: "text-[#FBD38D]", glow: "rgba(251,211,141,0.20)" },
  { key: "investment",   label: "Investment",   icon: TrendingUp,  gradient: "from-[#93C5FD]/20 to-[#3b82f6]/10", iconColor: "text-[#93C5FD]", glow: "rgba(147,197,253,0.20)" },
  { key: "salary",       label: "Salary",       icon: Wallet,      gradient: "from-[#6A49FA]/30 to-[#9B7FFF]/20", iconColor: "text-[#C4B5FD]", glow: "rgba(106,73,250,0.35)" },
];

// ── Main Component ────────────────────────────────────────────────
export default function QuickActions({ onDataChanged }: { onDataChanged?: () => void }) {
  const [active, setActive] = useState<ActionKey | null>(null);

  const close = () => setActive(null);
  const done  = () => { close(); onDataChanged?.(); };

  return (
    <>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Quick Add</h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {ACTIONS.map(({ key, label, icon: Icon, gradient, iconColor, glow }, i) => (
            <div
              key={key}
              style={{ opacity: 0, animation: `fadeSlideUp 0.35s ease-out ${i * 0.05}s forwards` }}
            >
              <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
              <button
                onClick={() => setActive(key)}
                className={`relative w-full flex flex-col items-center justify-center gap-2 rounded-3xl border border-white/10 bg-gradient-to-br ${gradient} p-4 text-center backdrop-blur-xl transition-all duration-200 overflow-hidden hover:-translate-y-0.5 hover:border-white/20 active:scale-[0.97]`}
                style={{ boxShadow: `0 4px 24px ${glow}` }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
                <div className="flex items-center justify-center gap-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/6">
                    <Icon size={16} className={iconColor} />
                  </div>
                  <Plus size={12} className="text-white/40" />
                </div>
                <p className="text-xs font-semibold text-white leading-tight">{label}</p>
              </button>
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {active && <Overlay onClose={close} />}
        {active === "transaction"  && <AddTransactionModal  onClose={close} onDone={done} />}
        {active === "commitment"   && <AddCommitmentModal   onClose={close} onDone={done} />}
        {active === "savings"      && <AddSavingsModal      onClose={close} onDone={done} />}
        {active === "debt"         && <AddDebtModal         onClose={close} onDone={done} />}
        {active === "investment"   && <AddInvestmentModal   onClose={close} onDone={done} />}
        {active === "salary"       && <AddSalaryModal       onClose={close} onDone={done} />}
      </AnimatePresence>
    </>
  );
}
