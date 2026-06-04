"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, TrendingUp, Trash2, Pencil, X, Check,
  ChevronDown, ChevronUp, RefreshCw, Coins, BarChart2,
  AlertTriangle, Sparkles, Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

// ── Types ─────────────────────────────────────────────────────────
type InvestmentAccount = {
  id: string; name: string; platform: string; type: string; note: string | null;
  totalInvested: number; totalCurrentValue: number; gainLoss: number;
  investments: any[];
};
type Investment = {
  id: string; name: string; platform: string | null; type: string; subType: string | null;
  principalAmount: number; currentValue: number; monthlyContribution: number | null;
  returnRate: number | null; startDate: string; maturityDate: string | null;
  status: string; note: string | null; investmentAccountId: string | null;
  goldGrams: number | null; goldBuyPricePerGram: number | null;
  goldCurrentPricePerGram: number | null; goldSellingPricePerGram: number | null;
  goldSellingValue: number | null;
};
type GoldPrice = { pricePerGram: number | null; pricePerOz: number | null };

// ── Constants ─────────────────────────────────────────────────────
const TYPES          = ["General","Gold","Stocks","ASNB","Unit Trust","Fixed Deposit","Crypto","Bonds","Property","EPF","Other"];
const ACC_TYPES      = ["General","Gold","Stocks","ASNB","Unit Trust","Mixed"];
const PLATFORMS      = ["MAE MIGA","Public Gold","HelloGold","Maybank2u","CIMB","ASNB Direct","myCLICK ASB","Rakuten Trade","Bursa","Wahed Invest","StashAway","Other"];
const GOLD_PLATFORMS = ["MAE MIGA","Public Gold","HelloGold","Other"];
const STATUS_COLORS: Record<string,string> = {
  ACTIVE:    "text-[#8EE3B5] bg-[#8EE3B5]/15",
  MATURED:   "text-[#C4B5FD] bg-[#C4B5FD]/15",
  WITHDRAWN: "text-[#FBD38D] bg-[#FBD38D]/15",
};

const sf  = (val: any, fallback = 0) => { const n = parseFloat(val); return isNaN(n) ? fallback : n; };
const fmt = (n: number) => formatCurrency(n);

// ── Shared UI ─────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/50 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder = "", type = "text", className = "", disabled = false }: any) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      className={`w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 backdrop-blur-xl transition focus:border-[#6A49FA]/60 focus:bg-white/10 focus:ring-2 focus:ring-[#6A49FA]/20 disabled:opacity-40 ${className}`}/>
  );
}
function Select({ value, onChange, options }: { value: string; onChange: any; options: string[] }) {
  return (
    <select value={value} onChange={onChange}
      className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none backdrop-blur-xl focus:border-[#6A49FA]/60 focus:ring-2 focus:ring-[#6A49FA]/20">
      {options.map(o => <option key={o} value={o} className="bg-[#1a1035]">{o}</option>)}
    </select>
  );
}

const emptyForm    = { name:"", platform:"", type:"General", subType:"", principalAmount:"", currentValue:"", monthlyContribution:"", returnRate:"", startDate:"", maturityDate:"", status:"ACTIVE", note:"", investmentAccountId:"", goldGrams:"", goldBuyPricePerGram:"", goldCurrentPricePerGram:"", goldSellingPricePerGram:"" };
const emptyAccForm = { name:"", platform:"MAE MIGA", type:"General", note:"" };

// ── Gold Form ─────────────────────────────────────────────────────
function GoldForm({ form, setForm, marketPrice, accounts }: { form: any; setForm: any; marketPrice: number | null; accounts: InvestmentAccount[] }) {
  const f = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));
  const grams = sf(form.goldGrams); const buyPx = sf(form.goldBuyPricePerGram);
  const curPx = sf(form.goldCurrentPricePerGram); const sellPx = sf(form.goldSellingPricePerGram);
  const totalPurchased = grams * buyPx; const currentVal = grams * curPx;
  const sellingVal = grams * sellPx; const gainLoss = sellingVal - totalPurchased;

  return (
    <div className="space-y-4">
      {marketPrice && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#FBD38D]/20 bg-[#FBD38D]/8 px-4 py-2.5">
          <Sparkles size={13} className="text-[#FBD38D] shrink-0"/>
          <p className="text-xs text-[#FBD38D]">Market ref: <span className="font-bold">{fmt(marketPrice)}/gram</span> — platform prices may differ</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Platform"><Select value={form.platform || "MAE MIGA"} onChange={(e:any) => f("platform", e.target.value)} options={GOLD_PLATFORMS}/></Field>
        <Field label="Name / Label"><Input value={form.name} onChange={(e:any) => f("name", e.target.value)} placeholder="e.g. MAE MIGA Gold"/></Field>
        {accounts.length > 0 && (
          <div className="sm:col-span-2">
            <Field label="Investment Account (optional)">
              <select value={form.investmentAccountId} onChange={(e:any) => f("investmentAccountId", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none backdrop-blur-xl focus:border-[#6A49FA]/60">
                <option value="" className="bg-[#1a1035]">— No account —</option>
                {accounts.map(a => <option key={a.id} value={a.id} className="bg-[#1a1035]">{a.name} ({a.platform})</option>)}
              </select>
            </Field>
          </div>
        )}
        <Field label="Grams Owned *"><Input value={form.goldGrams} onChange={(e:any) => f("goldGrams", e.target.value)} placeholder="e.g. 5.00" type="number"/></Field>
        <Field label="Avg Buy Price / gram (RM) *"><Input value={form.goldBuyPricePerGram} onChange={(e:any) => f("goldBuyPricePerGram", e.target.value)} placeholder="e.g. 380.00" type="number"/></Field>
        <Field label="Current Price / gram (RM)"><Input value={form.goldCurrentPricePerGram} onChange={(e:any) => f("goldCurrentPricePerGram", e.target.value)} placeholder="Check your app" type="number"/></Field>
        <Field label="Selling / Buyback Price / gram (RM)"><Input value={form.goldSellingPricePerGram} onChange={(e:any) => f("goldSellingPricePerGram", e.target.value)} placeholder="Platform buyback rate" type="number"/></Field>
      </div>
      {grams > 0 && buyPx > 0 && (
        <div className="rounded-2xl border border-[#FBD38D]/20 bg-[#FBD38D]/8 p-4 space-y-2 text-sm">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Preview</p>
          <div className="flex justify-between"><span className="text-white/50">Total purchased</span><span className="text-white font-medium">{fmt(totalPurchased)}</span></div>
          {curPx > 0 && <div className="flex justify-between"><span className="text-white/50">Current value</span><span className="text-white font-medium">{fmt(currentVal)}</span></div>}
          {sellPx > 0 && <>
            <div className="flex justify-between"><span className="text-white/50">Selling value</span><span className="text-white font-medium">{fmt(sellingVal)}</span></div>
            <div className="flex justify-between border-t border-white/10 pt-2">
              <span className="text-white/50">Gain / Loss</span>
              <span className={`font-bold ${gainLoss >= 0 ? "text-[#8EE3B5]" : "text-[#FF8C8C]"}`}>{gainLoss >= 0 ? "+" : ""}{fmt(gainLoss)}</span>
            </div>
          </>}
        </div>
      )}
      <Field label="Note (optional)"><Input value={form.note} onChange={(e:any) => f("note", e.target.value)} placeholder="e.g. started Jan 2024"/></Field>
    </div>
  );
}

// ── General Form ──────────────────────────────────────────────────
function GeneralForm({ form, setForm, accounts }: { form: any; setForm: any; accounts: InvestmentAccount[] }) {
  const f = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Name *"><Input value={form.name} onChange={(e:any) => f("name", e.target.value)} placeholder="e.g. ASB, KLSE Stock"/></Field>
      <Field label="Platform"><Input value={form.platform} onChange={(e:any) => f("platform", e.target.value)} placeholder="e.g. Maybank2u"/></Field>
      {accounts.length > 0 && (
        <div className="sm:col-span-2">
          <Field label="Investment Account (optional)">
            <select value={form.investmentAccountId} onChange={(e:any) => f("investmentAccountId", e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none backdrop-blur-xl focus:border-[#6A49FA]/60">
              <option value="" className="bg-[#1a1035]">— No account —</option>
              {accounts.map(a => <option key={a.id} value={a.id} className="bg-[#1a1035]">{a.name} ({a.platform})</option>)}
            </select>
          </Field>
        </div>
      )}
      <Field label="Principal Amount (RM) *"><Input value={form.principalAmount} onChange={(e:any) => f("principalAmount", e.target.value)} placeholder="0.00" type="number"/></Field>
      <Field label="Current Value (RM)"><Input value={form.currentValue} onChange={(e:any) => f("currentValue", e.target.value)} placeholder="Same as principal if new" type="number"/></Field>
      <Field label="Monthly Contribution (RM)"><Input value={form.monthlyContribution} onChange={(e:any) => f("monthlyContribution", e.target.value)} placeholder="0.00" type="number"/></Field>
      <Field label="Expected Return (% p.a.)"><Input value={form.returnRate} onChange={(e:any) => f("returnRate", e.target.value)} placeholder="e.g. 5.0" type="number"/></Field>
      <Field label="Start Date"><Input value={form.startDate} onChange={(e:any) => f("startDate", e.target.value)} type="date"/></Field>
      <Field label="Maturity Date"><Input value={form.maturityDate} onChange={(e:any) => f("maturityDate", e.target.value)} type="date"/></Field>
      <div className="sm:col-span-2"><Field label="Note"><Input value={form.note} onChange={(e:any) => f("note", e.target.value)} placeholder="Optional note"/></Field></div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function InvestmentsPage() {
  const [investments, setInvestments]   = useState<Investment[]>([]);
  const [accounts, setAccounts]         = useState<InvestmentAccount[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [showAccForm, setShowAccForm]   = useState(false);
  const [form, setForm]                 = useState(emptyForm);
  const [accForm, setAccForm]           = useState(emptyAccForm);
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState("");
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [editForm, setEditForm]         = useState<Record<string, any>>({});
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [editAccForm, setEditAccForm]   = useState<Record<string, any>>({});
  const [tab, setTab]                   = useState<"accounts"|"all"|"gold"|"other">("accounts");
  const [marketPrice, setMarketPrice]   = useState<GoldPrice>({ pricePerGram: null, pricePerOz: null });
  const [confirmDeleteId, setConfirmDeleteId]       = useState<string | null>(null);
  const [confirmDeleteAccId, setConfirmDeleteAccId] = useState<string | null>(null);
  const [updatingPriceId, setUpdatingPriceId]       = useState<string | null>(null);
  const [priceInputs, setPriceInputs]               = useState<Record<string, { cur: string; sell: string }>>({});

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchAll = async () => {
    setLoading(true);
    const [invRes, accRes] = await Promise.all([fetch("/api/investments"), fetch("/api/investment-accounts")]);
    const invData = await invRes.json();
    const accData = await accRes.json();
    setInvestments(Array.isArray(invData) ? invData : []);
    setAccounts(Array.isArray(accData) ? accData : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    fetch("/api/gold-price").then(r => r.json()).then(setMarketPrice).catch(() => {});
  }, []);

  const handleAddInvestment = async () => {
    if (!form.name && !form.goldGrams) return;
    setSaving(true);
    const res = await fetch("/api/investments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, investmentAccountId: form.investmentAccountId || undefined }),
    });
    if (res.ok) { await fetchAll(); setForm(emptyForm); setShowForm(false); showToast("Investment added ✅"); }
    setSaving(false);
  };

  const handleAddAccount = async () => {
    if (!accForm.name || !accForm.platform) return;
    setSaving(true);
    const res = await fetch("/api/investment-accounts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accForm),
    });
    if (res.ok) { await fetchAll(); setAccForm(emptyAccForm); setShowAccForm(false); showToast("Account added ✅"); }
    setSaving(false);
  };

  const handleUpdatePrice = async (id: string) => {
    const px = priceInputs[id];
    if (!px) return;
    const res = await fetch(`/api/investments/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goldCurrentPricePerGram: sf(px.cur), goldSellingPricePerGram: sf(px.sell) }),
    });
    if (res.ok) { await fetchAll(); setUpdatingPriceId(null); showToast("Prices updated ✅"); }
  };

  const handleDeleteInvestment = async (id: string) => {
    await fetch(`/api/investments/${id}`, { method: "DELETE" });
    setInvestments(p => p.filter(i => i.id !== id));
    setConfirmDeleteId(null); showToast("Deleted");
  };

  const handleDeleteAccount = async (id: string) => {
    await fetch(`/api/investment-accounts/${id}`, { method: "DELETE" });
    await fetchAll(); setConfirmDeleteAccId(null); showToast("Account deleted");
  };

  const active         = investments.filter(i => i.status === "ACTIVE");
  const goldHoldings   = active.filter(i => i.type === "Gold");
  const otherHoldings  = active.filter(i => i.type !== "Gold");
  const totalPrincipal    = active.reduce((s, i) => s + i.principalAmount, 0);
  const totalCurrentValue = active.reduce((s, i) => s + i.currentValue, 0);
  const totalGoldGrams    = goldHoldings.reduce((s, i) => s + (i.goldGrams ?? 0), 0);
  const totalGainLoss     = totalCurrentValue - totalPrincipal;
  const displayed = tab === "gold" ? goldHoldings : tab === "other" ? otherHoldings : active;

  return (
    <PageContainer>
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          {toast}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {(confirmDeleteId || confirmDeleteAccId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setConfirmDeleteId(null); setConfirmDeleteAccId(null); }}/>
          <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-[#1a1035] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[#FF8C8C]/15 border border-[#FF8C8C]/25 flex items-center justify-center">
                <AlertTriangle size={22} className="text-[#FF8C8C]"/>
              </div>
              <div>
                <p className="font-bold text-white">Delete this?</p>
                <p className="text-sm text-white/45 mt-1">
                  {confirmDeleteAccId ? "Holdings will be unlinked, not deleted." : "This cannot be undone."}
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => { setConfirmDeleteId(null); setConfirmDeleteAccId(null); }}
                  className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white transition">
                  Cancel
                </button>
                <button onClick={() => { if (confirmDeleteId) handleDeleteInvestment(confirmDeleteId); if (confirmDeleteAccId) handleDeleteAccount(confirmDeleteAccId); }}
                  className="flex-1 rounded-full bg-[#FF8C8C]/20 border border-[#FF8C8C]/30 py-2.5 text-sm font-semibold text-[#FF8C8C] hover:bg-[#FF8C8C]/35 transition">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Finance</p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Investments</h1>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => { setAccForm(emptyAccForm); setShowAccForm(!showAccForm); setShowForm(false); }}
              className="flex items-center gap-1.5 rounded-xl border border-[#C4B5FD]/30 bg-[#C4B5FD]/10 px-3 py-2 text-xs font-semibold text-[#C4B5FD] transition hover:bg-[#C4B5FD]/20 active:scale-[0.97]">
              <Wallet size={13}/> Account
            </button>
            <button
              onClick={() => { setForm(emptyForm); setShowForm(!showForm); setShowAccForm(false); }}
              className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] px-3 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(106,73,250,0.40)] transition hover:scale-[1.03] active:scale-[0.97]">
              <Plus size={13}/> Add
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-white/40">Manage your accounts, gold, stocks and more.</p>
      </div>

      {/* Market gold price */}
      {marketPrice.pricePerGram && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[#FBD38D]/20 bg-[#FBD38D]/8 px-4 py-3">
          <Sparkles size={14} className="text-[#FBD38D] shrink-0"/>
          <p className="text-xs text-[#FBD38D]">
            Live market gold: <span className="font-bold">{fmt(marketPrice.pricePerGram)}/gram</span>
            <span className="opacity-60"> · Reference only</span>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Invested",      value: fmt(totalPrincipal),    color: "text-[#C4B5FD]" },
          { label: "Current Value", value: fmt(totalCurrentValue), color: "text-white"     },
          { label: "Gain / Loss",   value: `${totalGainLoss >= 0 ? "+" : ""}${fmt(totalGainLoss)}`, color: totalGainLoss >= 0 ? "text-[#8EE3B5]" : "text-[#FF8C8C]" },
          { label: "Gold",          value: `${totalGoldGrams.toFixed(2)}g`, color: "text-[#FBD38D]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
            <p className="text-[10px] text-white/40 uppercase tracking-wide">{label}</p>
            <p className={`mt-1 text-sm font-bold truncate ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {([
          ["accounts", "Accounts"],
          ["all",      "All"],
          ["gold",     "Gold 🪙"],
          ["other",    "Stocks & ASNB"],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              tab === key
                ? "bg-[#6A49FA]/40 text-[#C4B5FD] border border-[#6A49FA]/40"
                : "border border-white/10 text-white/40 hover:text-white/70 hover:border-white/25"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Add Account Form */}
      <AnimatePresence>
        {showAccForm && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            className="relative overflow-hidden rounded-3xl border border-[#C4B5FD]/20 bg-[#C4B5FD]/5 p-6 backdrop-blur-xl mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-x-0 top-0 h-px bg-[#C4B5FD]/25"/>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">New Investment Account</h2>
              <button onClick={() => setShowAccForm(false)} className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition"><X size={15}/></button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Account Name *"><Input value={accForm.name} onChange={(e:any) => setAccForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. MAE MIGA Account"/></Field>
              <Field label="Platform *"><Select value={accForm.platform} onChange={(e:any) => setAccForm(p => ({ ...p, platform: e.target.value }))} options={PLATFORMS}/></Field>
              <Field label="Type"><Select value={accForm.type} onChange={(e:any) => setAccForm(p => ({ ...p, type: e.target.value }))} options={ACC_TYPES}/></Field>
              <Field label="Note (optional)"><Input value={accForm.note} onChange={(e:any) => setAccForm(p => ({ ...p, note: e.target.value }))} placeholder="Optional"/></Field>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAccForm(false)} className="flex-1 rounded-full border border-white/15 bg-white/5 py-3 text-sm text-white/60 hover:text-white transition">Cancel</button>
              <button onClick={handleAddAccount} disabled={saving || !accForm.name || !accForm.platform}
                className="flex-1 rounded-full bg-[#C4B5FD]/20 border border-[#C4B5FD]/30 py-3 text-sm font-semibold text-[#C4B5FD] hover:bg-[#C4B5FD]/35 transition disabled:opacity-50">
                {saving ? "Saving…" : "Add Account"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Investment Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">New Investment</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition"><X size={15}/></button>
            </div>
            <div className="mb-4">
              <Field label="Type"><Select value={form.type} onChange={(e:any) => setForm(p => ({ ...p, type: e.target.value }))} options={TYPES}/></Field>
            </div>
            {form.type === "Gold"
              ? <GoldForm form={form} setForm={setForm} marketPrice={marketPrice.pricePerGram} accounts={accounts}/>
              : <GeneralForm form={form} setForm={setForm} accounts={accounts}/>
            }
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 rounded-full border border-white/15 bg-white/5 py-3 text-sm text-white/60 hover:text-white transition">Cancel</button>
              <button onClick={handleAddInvestment} disabled={saving}
                className="flex-1 rounded-full bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
                {saving ? "Saving…" : "Add Investment"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_,i) => <div key={i} className="h-20 rounded-3xl bg-white/5 animate-pulse"/>)}
        </div>
      ) : (
        <div className="space-y-3">

          {/* ── Accounts Tab ── */}
          {tab === "accounts" && (
            accounts.length === 0 ? (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
                <Wallet size={32} className="mx-auto mb-3 text-white/20"/>
                <p className="text-white/35 text-sm">No investment accounts yet.</p>
                <p className="text-white/20 text-xs mt-1">Tap "Account" to add MAE MIGA, Public Gold etc.</p>
              </div>
            ) : accounts.map(acc => {
              const isExpanded = expandedId === acc.id;
              const isEditing  = editingAccId === acc.id;
              const isGain = acc.gainLoss >= 0;
              const gainPct = acc.totalInvested > 0 ? (acc.gainLoss / acc.totalInvested) * 100 : 0;

              return (
                <div key={acc.id} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
                  <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => { if (isEditing) return; setExpandedId(isExpanded ? null : acc.id); }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-2xl bg-[#C4B5FD]/15 flex items-center justify-center shrink-0">
                        <Wallet size={16} className="text-[#C4B5FD]"/>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{acc.name}</p>
                        <p className="text-xs text-white/40 truncate">{acc.platform} · {acc.investments.length} holding{acc.investments.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#C4B5FD]">{fmt(acc.totalCurrentValue)}</p>
                        <p className={`text-xs ${isGain ? "text-[#8EE3B5]" : "text-[#FF8C8C]"}`}>{isGain ? "+" : ""}{gainPct.toFixed(1)}%</p>
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-white/40"/> : <ChevronDown size={16} className="text-white/40"/>}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
                      {!isEditing ? (
                        <>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {[
                              ["Total Invested",  fmt(acc.totalInvested)],
                              ["Current Value",   fmt(acc.totalCurrentValue)],
                              ["Gain / Loss",     `${isGain ? "+" : ""}${fmt(acc.gainLoss)}`],
                              ["Type",            acc.type],
                            ].map(([label, val]) => (
                              <div key={label}>
                                <p className="text-xs text-white/35">{label}</p>
                                <p className={`font-medium ${label === "Gain / Loss" ? (isGain ? "text-[#8EE3B5]" : "text-[#FF8C8C]") : "text-white"}`}>{val}</p>
                              </div>
                            ))}
                          </div>
                          {acc.investments.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-xs text-white/35 uppercase tracking-wider">Holdings</p>
                              {acc.investments.map((i: any) => (
                                <div key={i.id} className="flex justify-between text-xs rounded-2xl border border-white/8 bg-white/4 px-3 py-2">
                                  <span className="text-white/60">{i.name}</span>
                                  <span className="text-white font-medium">
                                    {i.type === "Gold" && i.goldGrams && i.goldCurrentPricePerGram
                                      ? fmt(i.goldGrams * i.goldCurrentPricePerGram)
                                      : fmt(i.currentValue)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {acc.note && <p className="text-xs text-white/35 italic">{acc.note}</p>}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => { setEditAccForm(p => ({ ...p, [acc.id]: { name: acc.name, platform: acc.platform, type: acc.type, note: acc.note ?? "" } })); setEditingAccId(acc.id); }}
                              className="flex items-center gap-1.5 rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/50 hover:text-white transition">
                              <Pencil size={12}/> Edit
                            </button>
                            <button onClick={() => setConfirmDeleteAccId(acc.id)}
                              className="flex items-center gap-1.5 rounded-2xl bg-[#FF8C8C]/10 border border-[#FF8C8C]/20 px-3 py-2 text-xs text-[#FF8C8C]/70 hover:text-[#FF8C8C] transition ml-auto">
                              <Trash2 size={12}/> Delete
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-[#FBD38D]/80">✏ Editing {acc.name}</p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Field label="Name"><Input value={editAccForm[acc.id]?.name ?? ""} onChange={(e:any) => setEditAccForm(p => ({ ...p, [acc.id]: { ...p[acc.id], name: e.target.value } }))}/></Field>
                            <Field label="Platform"><Select value={editAccForm[acc.id]?.platform ?? acc.platform} onChange={(e:any) => setEditAccForm(p => ({ ...p, [acc.id]: { ...p[acc.id], platform: e.target.value } }))} options={PLATFORMS}/></Field>
                            <Field label="Type"><Select value={editAccForm[acc.id]?.type ?? acc.type} onChange={(e:any) => setEditAccForm(p => ({ ...p, [acc.id]: { ...p[acc.id], type: e.target.value } }))} options={ACC_TYPES}/></Field>
                            <Field label="Note"><Input value={editAccForm[acc.id]?.note ?? ""} onChange={(e:any) => setEditAccForm(p => ({ ...p, [acc.id]: { ...p[acc.id], note: e.target.value } }))}/></Field>
                          </div>
                          <div className="flex gap-3 pt-1">
                            <button onClick={() => setEditingAccId(null)} className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white transition flex items-center justify-center gap-2"><X size={13}/> Cancel</button>
                            <button onClick={async () => { setSaving(true); const res = await fetch(`/api/investment-accounts/${acc.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(editAccForm[acc.id]) }); if (res.ok) { await fetchAll(); setEditingAccId(null); showToast("Updated ✅"); } setSaving(false); }} disabled={saving}
                              className="flex-1 rounded-full bg-[#C4B5FD]/20 border border-[#C4B5FD]/30 py-2.5 text-sm font-semibold text-[#C4B5FD] hover:bg-[#C4B5FD]/35 transition flex items-center justify-center gap-2"><Check size={13}/> {saving ? "Saving…" : "Save"}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* ── Holdings Tabs ── */}
          {tab !== "accounts" && (
            displayed.length === 0 ? (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
                <TrendingUp size={32} className="mx-auto mb-3 text-white/20"/>
                <p className="text-white/35 text-sm">No investments here yet.</p>
              </div>
            ) : displayed.map(inv => {
              const isExpanded = expandedId === inv.id;
              const isEditing  = editingId  === inv.id;
              const isGold     = inv.type   === "Gold";

              const grams    = inv.goldGrams ?? 0;
              const buyPx    = inv.goldBuyPricePerGram ?? 0;
              const curPx    = inv.goldCurrentPricePerGram ?? 0;
              const sellPx   = inv.goldSellingPricePerGram ?? 0;
              const totalPurch  = grams * buyPx;
              const currentVal  = isGold ? (curPx > 0 ? grams * curPx : totalPurch) : inv.currentValue;
              const sellingVal  = grams * sellPx;
              const gainLoss    = isGold ? (sellingVal > 0 ? sellingVal - totalPurch : currentVal - totalPurch) : inv.currentValue - inv.principalAmount;
              const gainPct     = (isGold ? totalPurch : inv.principalAmount) > 0 ? (gainLoss / (isGold ? totalPurch : inv.principalAmount)) * 100 : 0;
              const worthSelling = sellingVal > totalPurch;

              return (
                <div key={inv.id} className={`relative overflow-hidden rounded-3xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] ${isGold ? "border border-[#FBD38D]/20 bg-[#FBD38D]/5" : "border border-white/10 bg-white/5"}`}>
                  <div className={`absolute inset-x-0 top-0 h-px ${isGold ? "bg-[#FBD38D]/25" : "bg-white/15"}`}/>

                  {/* Card header */}
                  <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => { if (isEditing) return; setExpandedId(isExpanded ? null : inv.id); }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 ${isGold ? "bg-[#FBD38D]/15" : "bg-[#8EE3B5]/15"}`}>
                        {isGold ? <Coins size={16} className="text-[#FBD38D]"/> : inv.type === "Stocks" ? <BarChart2 size={16} className="text-[#8EE3B5]"/> : <TrendingUp size={16} className="text-[#8EE3B5]"/>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{inv.name}</p>
                        <p className="text-xs text-white/40 truncate">
                          {inv.platform && `${inv.platform} · `}{inv.type}
                          {isGold && ` · ${grams}g`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isGold ? "text-[#FBD38D]" : "text-[#8EE3B5]"}`}>{fmt(currentVal)}</p>
                        <p className={`text-xs ${gainLoss >= 0 ? "text-[#8EE3B5]" : "text-[#FF8C8C]"}`}>{gainLoss >= 0 ? "+" : ""}{gainPct.toFixed(1)}%</p>
                      </div>
                      {!isGold && <span className={`rounded-xl px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[inv.status] ?? STATUS_COLORS.ACTIVE}`}>{inv.status}</span>}
                      {isExpanded ? <ChevronUp size={16} className="text-white/40"/> : <ChevronDown size={16} className="text-white/40"/>}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
                      {!isEditing ? (
                        <>
                          {/* Gold details */}
                          {isGold && (
                            <>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                  ["Grams",           `${grams}g`],
                                  ["Avg Buy Price",   fmt(buyPx) + "/g"],
                                  ["Total Purchased", fmt(totalPurch)],
                                  ["Current Price",   curPx > 0 ? fmt(curPx) + "/g" : "—"],
                                  ["Current Value",   currentVal > 0 ? fmt(currentVal) : "—"],
                                  ["Selling Price",   sellPx > 0 ? fmt(sellPx) + "/g" : "—"],
                                  ["Selling Value",   sellingVal > 0 ? fmt(sellingVal) : "—"],
                                  ["Gain / Loss",     `${gainLoss >= 0 ? "+" : ""}${fmt(gainLoss)} (${gainPct.toFixed(1)}%)`],
                                ].map(([label, val]) => (
                                  <div key={label}>
                                    <p className="text-xs text-white/35">{label}</p>
                                    <p className={`font-medium ${label === "Gain / Loss" ? (gainLoss >= 0 ? "text-[#8EE3B5]" : "text-[#FF8C8C]") : "text-white"}`}>{val}</p>
                                  </div>
                                ))}
                              </div>

                              {sellingVal > 0 && (
                                <div className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 border ${worthSelling ? "border-[#8EE3B5]/25 bg-[#8EE3B5]/10" : "border-[#FF8C8C]/25 bg-[#FF8C8C]/10"}`}>
                                  {worthSelling
                                    ? <Check size={14} className="text-[#8EE3B5] shrink-0"/>
                                    : <AlertTriangle size={14} className="text-[#FF8C8C] shrink-0"/>}
                                  <p className={`text-xs font-medium ${worthSelling ? "text-[#8EE3B5]" : "text-[#FF8C8C]"}`}>
                                    {worthSelling
                                      ? `Selling now nets +${fmt(sellingVal - totalPurch)} profit`
                                      : `Selling now = loss of ${fmt(Math.abs(sellingVal - totalPurch))}`}
                                  </p>
                                </div>
                              )}

                              {/* Update price */}
                              {updatingPriceId !== inv.id ? (
                                <button onClick={() => { setUpdatingPriceId(inv.id); setPriceInputs(p => ({ ...p, [inv.id]: { cur: String(curPx || ""), sell: String(sellPx || "") } })); }}
                                  className="flex items-center gap-2 text-xs text-white/35 hover:text-[#FBD38D] transition">
                                  <RefreshCw size={12}/> Update prices from your app
                                </button>
                              ) : (
                                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                                  <p className="text-xs text-white/50 uppercase tracking-wider">Update Prices</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <Field label="Current Price / gram">
                                      <Input value={priceInputs[inv.id]?.cur ?? ""} onChange={(e:any) => setPriceInputs(p => ({ ...p, [inv.id]: { ...p[inv.id], cur: e.target.value } }))} placeholder="From your app" type="number"/>
                                    </Field>
                                    <Field label="Selling Price / gram">
                                      <Input value={priceInputs[inv.id]?.sell ?? ""} onChange={(e:any) => setPriceInputs(p => ({ ...p, [inv.id]: { ...p[inv.id], sell: e.target.value } }))} placeholder="Buyback rate" type="number"/>
                                    </Field>
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => setUpdatingPriceId(null)} className="flex-1 rounded-full border border-white/15 bg-white/5 py-2 text-xs text-white/50 hover:text-white transition">Cancel</button>
                                    <button onClick={() => handleUpdatePrice(inv.id)} className="flex-1 rounded-full bg-[#FBD38D]/20 border border-[#FBD38D]/30 py-2 text-xs font-semibold text-[#FBD38D] hover:bg-[#FBD38D]/35 transition">Save Prices</button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* General details */}
                          {!isGold && (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {[
                                ["Principal",     fmt(inv.principalAmount)],
                                ["Current Value", fmt(inv.currentValue)],
                                ["Gain / Loss",   `${gainLoss >= 0 ? "+" : ""}${fmt(gainLoss)} (${gainPct.toFixed(1)}%)`],
                                ["Monthly",       inv.monthlyContribution ? fmt(inv.monthlyContribution) : "—"],
                                ["Return Rate",   inv.returnRate ? `${inv.returnRate}% p.a.` : "—"],
                                ["Start Date",    new Date(inv.startDate).toLocaleDateString("ms-MY")],
                              ].map(([label, val]) => (
                                <div key={label}>
                                  <p className="text-xs text-white/35">{label}</p>
                                  <p className={`font-medium ${label === "Gain / Loss" ? (gainLoss >= 0 ? "text-[#8EE3B5]" : "text-[#FF8C8C]") : "text-white"}`}>{val}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {inv.note && <p className="text-xs text-white/35 italic border-t border-white/10 pt-3">{inv.note}</p>}

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => { setEditForm(p => ({ ...p, [inv.id]: { ...inv, startDate: inv.startDate?.split("T")[0] ?? "" } })); setEditingId(inv.id); }}
                              className="flex items-center gap-1.5 rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/50 hover:text-white transition">
                              <Pencil size={12}/> Edit
                            </button>
                            <button onClick={() => setConfirmDeleteId(inv.id)}
                              className="flex items-center gap-1.5 rounded-2xl bg-[#FF8C8C]/10 border border-[#FF8C8C]/20 px-3 py-2 text-xs text-[#FF8C8C]/70 hover:text-[#FF8C8C] transition ml-auto">
                              <Trash2 size={12}/> Delete
                            </button>
                          </div>
                        </>
                      ) : (
                        /* Edit mode */
                        <div className="space-y-3">
                          <p className="text-xs text-[#FBD38D]/80">✏ Editing {inv.name}</p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {(isGold ? [
                              { label:"Name",              key:"name",                   type:"text"   },
                              { label:"Platform",          key:"platform",               type:"text"   },
                              { label:"Grams",             key:"goldGrams",              type:"number" },
                              { label:"Avg Buy Price/g",   key:"goldBuyPricePerGram",    type:"number" },
                              { label:"Current Price/g",   key:"goldCurrentPricePerGram",type:"number" },
                              { label:"Selling Price/g",   key:"goldSellingPricePerGram",type:"number" },
                              { label:"Note",              key:"note",                   type:"text"   },
                            ] : [
                              { label:"Name",              key:"name",            type:"text"   },
                              { label:"Platform",          key:"platform",        type:"text"   },
                              { label:"Principal (RM)",    key:"principalAmount", type:"number" },
                              { label:"Current Value (RM)",key:"currentValue",    type:"number" },
                              { label:"Monthly (RM)",      key:"monthlyContribution", type:"number" },
                              { label:"Return Rate (%)",   key:"returnRate",      type:"number" },
                              { label:"Start Date",        key:"startDate",       type:"date"   },
                              { label:"Note",              key:"note",            type:"text"   },
                            ]).map(({ label, key, type }) => (
                              <Field key={key} label={label}>
                                <Input
                                  value={editForm[inv.id]?.[key] ?? ""}
                                  onChange={(e:any) => setEditForm(p => ({ ...p, [inv.id]: { ...p[inv.id], [key]: e.target.value } }))}
                                  type={type}/>
                              </Field>
                            ))}
                          </div>
                          <div className="flex gap-3 pt-1">
                            <button onClick={() => setEditingId(null)}
                              className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white transition flex items-center justify-center gap-2">
                              <X size={14}/> Cancel
                            </button>
                            <button
                              onClick={async () => { setSaving(true); const res = await fetch(`/api/investments/${inv.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(editForm[inv.id]) }); if (res.ok) { await fetchAll(); setEditingId(null); showToast("Updated ✅"); } setSaving(false); }}
                              disabled={saving}
                              className="flex-1 rounded-full bg-[#6A49FA]/40 border border-[#6A49FA]/50 py-2.5 text-sm font-semibold text-[#C4B5FD] hover:bg-[#6A49FA]/60 transition flex items-center justify-center gap-2">
                              <Check size={14}/> {saving ? "Saving…" : "Save"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </PageContainer>
  );
}
