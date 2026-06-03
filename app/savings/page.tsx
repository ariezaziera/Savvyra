"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { formatCurrency } from "@/lib/formatCurrency";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Plus, Trash2, Pencil, X, Check,
  TrendingUp, Wallet, Building2, AlertTriangle,
} from "lucide-react";
import AddSavingsForm from "@/components/AddSavingsForm";

// ── Types ─────────────────────────────────────────────────────────
type SavingsGoal = {
  id: string; name: string; targetAmount: number; currentAmount: number;
  deadline?: string | null; monthlyContribution?: number | null;
};
type SavingsAccount = {
  id: string; name: string; bank: string; balance: number; note?: string | null;
};

// ── Helpers ────────────────────────────────────────────────────────
const CARD_GRADIENTS = [
  { bg:"linear-gradient(135deg,#E2D9FF 0%,#C4B5FD 100%)", text:"#2D1B6B", sub:"rgba(45,27,107,0.55)", glow:"rgba(196,181,253,0.28)", badge:"rgba(45,27,107,0.12)" },
  { bg:"linear-gradient(135deg,#FEDADA 0%,#E8A0A0 100%)", text:"#4A1818", sub:"rgba(74,24,24,0.55)",  glow:"rgba(232,160,160,0.28)", badge:"rgba(74,24,24,0.12)" },
  { bg:"linear-gradient(135deg,#D4F5E2 0%,#8EE3B5 100%)", text:"#0E3D22", sub:"rgba(14,61,34,0.55)",  glow:"rgba(142,227,181,0.28)", badge:"rgba(14,61,34,0.12)" },
  { bg:"linear-gradient(135deg,#FEF3DA 0%,#E8C97A 100%)", text:"#3D2A00", sub:"rgba(61,42,0,0.55)",   glow:"rgba(232,201,122,0.28)", badge:"rgba(61,42,0,0.12)" },
  { bg:"linear-gradient(135deg,#DAF0FE 0%,#93C8F0 100%)", text:"#0B2E45", sub:"rgba(11,46,69,0.55)",  glow:"rgba(147,200,240,0.28)", badge:"rgba(11,46,69,0.12)" },
];
const getGradient = (idx: number) => CARD_GRADIENTS[idx % CARD_GRADIENTS.length];

function daysUntil(deadline: string | null | undefined): number | null {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

function RingProgress({ progress, size=72, stroke=6, color, bg }: { progress:number; size?:number; stroke?:number; color:string; bg:string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(progress, 1));
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}/>
    </svg>
  );
}

// ── Savings Account Card ───────────────────────────────────────────
const BANK_COLORS: Record<string, string> = {
  "Maybank": "#FBD38D", "CIMB": "#FF8C8C", "Public Bank": "#C4B5FD",
  "RHB": "#93C5FD", "Hong Leong": "#8EE3B5", "AmBank": "#FBD38D",
  "BSN": "#C4B5FD", "Bank Rakyat": "#FF8C8C",
};
function getBankColor(bank: string) {
  for (const [k, v] of Object.entries(BANK_COLORS)) {
    if (bank.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return "#C4B5FD";
}

const BANKS = ["Maybank / MAE","CIMB","Public Bank","RHB","Hong Leong","AmBank","BSN","Bank Rakyat","Alliance Bank","Standard Chartered","HSBC","UOB","Tabung Haji","Other"];

function AccountCard({ account, onEdit, onDelete }: { account: SavingsAccount; onEdit: () => void; onDelete: () => void }) {
  const color = getBankColor(account.bank);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Building2 size={16} style={{ color }}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{account.name}</p>
          <p className="text-xs text-white/40 truncate">{account.bank}</p>
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{formatCurrency(account.balance)}</p>
      {account.note && <p className="text-xs text-white/30 truncate">{account.note}</p>}
      <div className="flex gap-2 mt-3">
        <button onClick={onEdit} className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/45 hover:text-white transition"><Pencil size={11}/> Edit</button>
        <button onClick={onDelete} className="flex items-center gap-1 rounded-xl bg-[#FF8C8C]/8 border border-[#FF8C8C]/15 px-3 py-1.5 text-xs text-[#FF8C8C]/60 hover:text-[#FF8C8C] transition ml-auto"><Trash2 size={11}/> Delete</button>
      </div>
    </div>
  );
}

// ── Goal Card ─────────────────────────────────────────────────────
function GoalCard({ goal, index, onEdit, onDelete, onTopUp }: {
  goal: SavingsGoal; index: number;
  onEdit: (g: SavingsGoal) => void; onDelete: (id: string) => void; onTopUp: (g: SavingsGoal) => void;
}) {
  const style = getGradient(index);
  const progress  = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
  const pct       = Math.round(progress * 100);
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const days      = daysUntil(goal.deadline);
  const done      = progress >= 1;

  return (
    <motion.div layout initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }} transition={{ duration:0.35 }}
      style={{ background:style.bg, borderRadius:24, padding:"20px 20px 18px", boxShadow:`0 10px 36px ${style.glow}`, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:"0 0 auto", height:1, background:"rgba(255,255,255,0.50)" }}/>
      <div style={{ position:"absolute", right:-24, top:-24, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.22)", filter:"blur(20px)", pointerEvents:"none" }}/>
      {done && <div style={{ position:"absolute", top:14, right:14, background:style.badge, color:style.text, borderRadius:999, padding:"3px 10px", fontSize:10, fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase" }}>🎉 Completed</div>}

      <div style={{ display:"flex", alignItems:"flex-start", gap:14, position:"relative", zIndex:1 }}>
        <div style={{ position:"relative" }}>
          <RingProgress progress={progress} size={72} stroke={6} color={style.text} bg={`${style.text}22`}/>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:15, fontWeight:800, color:style.text, lineHeight:1 }}>{pct}%</span>
          </div>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:15, fontWeight:700, color:style.text, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{goal.name}</p>
          <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:3 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:11, color:style.sub }}>Saved</span><span style={{ fontSize:13, fontWeight:700, color:style.text }}>{formatCurrency(goal.currentAmount)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:11, color:style.sub }}>Target</span><span style={{ fontSize:13, fontWeight:700, color:style.text }}>{formatCurrency(goal.targetAmount)}</span></div>
            {remaining > 0 && <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:11, color:style.sub }}>Remaining</span><span style={{ fontSize:12, fontWeight:600, color:style.sub }}>{formatCurrency(remaining)}</span></div>}
            {days !== null && <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:11, color:style.sub }}>Deadline</span><span style={{ fontSize:11, fontWeight:600, color: days < 0 ? "#E8A0A0" : days <= 7 ? "#E8C97A" : style.sub }}>{days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today!" : `${days}d left`}</span></div>}
          </div>
          <div style={{ marginTop:12, height:6, borderRadius:999, background:`${style.text}18`, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min(pct,100)}%`, background:style.text, borderRadius:999, transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)" }}/>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap:8, marginTop:14, position:"relative", zIndex:1 }}>
        <button onClick={() => onTopUp(goal)} style={{ flex:1, height:36, borderRadius:10, border:"none", background:`${style.text}18`, color:style.text, fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5, fontFamily:"inherit" }}
          onMouseEnter={e => (e.currentTarget.style.background=`${style.text}2E`)} onMouseLeave={e => (e.currentTarget.style.background=`${style.text}18`)}>
          <Plus size={13}/> Top Up
        </button>
        <button onClick={() => onEdit(goal)} style={{ width:36, height:36, borderRadius:10, border:"none", background:`${style.text}18`, color:style.text, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}
          onMouseEnter={e => (e.currentTarget.style.background=`${style.text}2E`)} onMouseLeave={e => (e.currentTarget.style.background=`${style.text}18`)}>
          <Pencil size={13}/>
        </button>
        <button onClick={() => onDelete(goal.id)} style={{ width:36, height:36, borderRadius:10, border:"none", background:`${style.text}18`, color:style.text, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"inherit" }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(232,100,100,0.22)"; }} onMouseLeave={e => { e.currentTarget.style.background=`${style.text}18`; }}>
          <Trash2 size={13}/>
        </button>
      </div>
    </motion.div>
  );
}

// ── Modals ────────────────────────────────────────────────────────
function TopUpModal({ goal, onClose, onConfirm }: { goal: SavingsGoal; onClose: () => void; onConfirm: (id: string, amount: number) => void }) {
  const [amount, setAmount] = useState("");
  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(10,6,30,0.65)", backdropFilter:"blur(6px)" }} onClick={onClose}/>
      <motion.div initial={{ opacity:0, scale:0.92, y:12 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.92 }}
        style={{ position:"relative", width:"100%", maxWidth:360, background:"rgba(30,20,70,0.96)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:24, padding:24, backdropFilter:"blur(32px)", boxShadow:"0 24px 64px rgba(0,0,0,0.55)" }}>
        <div style={{ position:"absolute", inset:"0 0 auto", height:1, background:"rgba(255,255,255,0.15)", borderRadius:"24px 24px 0 0" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div><p style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", marginBottom:4 }}>Top Up</p><h3 style={{ fontSize:16, fontWeight:700, color:"#fff", margin:0 }}>{goal.name}</h3></div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:8, color:"rgba(255,255,255,0.5)", cursor:"pointer", padding:6, display:"flex" }}><X size={14}/></button>
        </div>
        <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"12px 16px", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}><span style={{ fontSize:11, color:"rgba(255,255,255,0.40)" }}>Current</span><span style={{ fontSize:12, fontWeight:600, color:"#C4B5FD" }}>{formatCurrency(goal.currentAmount)}</span></div>
          <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:11, color:"rgba(255,255,255,0.40)" }}>Target</span><span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.60)" }}>{formatCurrency(goal.targetAmount)}</span></div>
        </div>
        <label style={{ display:"block", fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Amount (RM)</label>
        <input autoFocus type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
          style={{ width:"100%", height:48, borderRadius:12, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:14, paddingLeft:14, paddingRight:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit", marginBottom:16 }}
          onFocus={e => { e.currentTarget.style.borderColor="rgba(196,181,253,0.6)"; e.currentTarget.style.background="rgba(255,255,255,0.10)"; }}
          onBlur={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}/>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => amount && parseFloat(amount) > 0 && onConfirm(goal.id, parseFloat(amount))}
            style={{ flex:1, height:44, borderRadius:12, border:"none", background:"linear-gradient(135deg,#6A49FA,#9B7FFF)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Add Funds</button>
          <button onClick={onClose} style={{ height:44, padding:"0 18px", borderRadius:12, cursor:"pointer", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.55)", fontSize:14, fontFamily:"inherit" }}>Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

function EditGoalModal({ goal, onClose, onSave }: { goal: SavingsGoal; onClose: () => void; onSave: (u: Partial<SavingsGoal> & { id: string }) => void }) {
  const [form, setForm] = useState({ name:goal.name, targetAmount:String(goal.targetAmount), currentAmount:String(goal.currentAmount), deadline:goal.deadline?.split("T")[0] ?? "" });
  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(10,6,30,0.65)", backdropFilter:"blur(6px)" }} onClick={onClose}/>
      <motion.div initial={{ opacity:0, scale:0.92, y:12 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.92 }}
        style={{ position:"relative", width:"100%", maxWidth:400, background:"rgba(30,20,70,0.96)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:24, padding:24, backdropFilter:"blur(32px)", boxShadow:"0 24px 64px rgba(0,0,0,0.55)" }}>
        <style>{`.sg-input:focus{border-color:rgba(196,181,253,0.6)!important;background:rgba(255,255,255,0.10)!important}.sg-input::placeholder{color:rgba(255,255,255,0.22)}input[type="date"].sg-input::-webkit-calendar-picker-indicator{filter:invert(1) opacity(0.4);cursor:pointer}`}</style>
        <div style={{ position:"absolute", inset:"0 0 auto", height:1, background:"rgba(255,255,255,0.15)", borderRadius:"24px 24px 0 0" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
          <h3 style={{ fontSize:16, fontWeight:700, color:"#fff", margin:0 }}>Edit Goal</h3>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:8, color:"rgba(255,255,255,0.5)", cursor:"pointer", padding:6, display:"flex" }}><X size={14}/></button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div><label style={{ display:"block", fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Name</label>
            <input className="sg-input" value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))} style={{ width:"100%", height:48, borderRadius:12, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:14, paddingLeft:14, paddingRight:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={{ display:"block", fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Target (RM)</label><input className="sg-input" type="number" value={form.targetAmount} onChange={e => setForm(p => ({ ...p, targetAmount:e.target.value }))} style={{ width:"100%", height:48, borderRadius:12, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:14, paddingLeft:14, paddingRight:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/></div>
            <div><label style={{ display:"block", fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Current (RM)</label><input className="sg-input" type="number" value={form.currentAmount} onChange={e => setForm(p => ({ ...p, currentAmount:e.target.value }))} style={{ width:"100%", height:48, borderRadius:12, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:14, paddingLeft:14, paddingRight:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/></div>
          </div>
          <div><label style={{ display:"block", fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Deadline</label><input className="sg-input" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline:e.target.value }))} style={{ width:"100%", height:48, borderRadius:12, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:14, paddingLeft:14, paddingRight:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}/></div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={() => onSave({ id:goal.id, name:form.name, targetAmount:parseFloat(form.targetAmount)||0, currentAmount:parseFloat(form.currentAmount)||0, deadline:form.deadline||null })}
            style={{ flex:1, height:44, borderRadius:12, border:"none", background:"linear-gradient(135deg,#6A49FA,#9B7FFF)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Save Changes</button>
          <button onClick={onClose} style={{ height:44, padding:"0 18px", borderRadius:12, cursor:"pointer", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.55)", fontSize:14, fontFamily:"inherit" }}>Cancel</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function SavingsPage() {
  const [goals, setGoals]       = useState<SavingsGoal[]>([]);
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast]       = useState("");
  const [topUpGoal, setTopUpGoal]   = useState<SavingsGoal | null>(null);
  const [editGoal, setEditGoal]     = useState<SavingsGoal | null>(null);
  const [editAccount, setEditAccount] = useState<SavingsAccount | null>(null);
  const [showAccForm, setShowAccForm] = useState(false);
  const [accForm, setAccForm] = useState({ name:"", bank:"Maybank / MAE", balance:"", note:"" });
  const [accSaving, setAccSaving] = useState(false);
  const [confirmDeleteGoalId, setConfirmDeleteGoalId]   = useState<string | null>(null);
  const [confirmDeleteAccId,  setConfirmDeleteAccId]    = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const [gRes, aRes] = await Promise.all([fetch("/api/savings-goals"), fetch("/api/savings-accounts")]);
      const gData = await gRes.json();
      const aData = await aRes.json();
      setGoals(Array.isArray(gData) ? gData : []);
      setAccounts(Array.isArray(aData) ? aData : []);
    } catch { setGoals([]); setAccounts([]); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  // Summary stats
  const totalSaved     = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget    = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalAccBal    = accounts.reduce((s, a) => s + a.balance, 0);
  const completed      = goals.filter(g => g.currentAmount >= g.targetAmount).length;
  const overallPct     = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleTopUp = async (id: string, amount: number) => {
    const res = await fetch("/api/savings-goals", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, topUpAmount: amount }) });
    if (res.ok) { setTopUpGoal(null); showToast(`+${formatCurrency(amount)} added!`); fetchGoals(); }
  };
  const handleEditGoal = async (updated: Partial<SavingsGoal> & { id: string }) => {
    const res = await fetch("/api/savings-goals", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(updated) });
    if (res.ok) { setEditGoal(null); showToast("Goal updated!"); fetchGoals(); }
  };
  const handleDeleteGoal = async (id: string) => {
    const res = await fetch("/api/savings-goals", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    if (res.ok) { showToast("Goal removed."); fetchGoals(); setConfirmDeleteGoalId(null); }
  };

  const handleAddAccount = async () => {
    if (!accForm.name || !accForm.bank) return;
    setAccSaving(true);
    const res = await fetch("/api/savings-accounts", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(accForm) });
    if (res.ok) { setAccForm({ name:"", bank:"Maybank / MAE", balance:"", note:"" }); setShowAccForm(false); showToast("Account added ✅"); fetchGoals(); }
    setAccSaving(false);
  };
  const handleUpdateAccount = async () => {
    if (!editAccount) return;
    setAccSaving(true);
    const res = await fetch(`/api/savings-accounts/${editAccount.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(editAccount) });
    if (res.ok) { setEditAccount(null); showToast("Account updated ✅"); fetchGoals(); }
    setAccSaving(false);
  };
  const handleDeleteAccount = async (id: string) => {
    const res = await fetch(`/api/savings-accounts/${id}`, { method:"DELETE" });
    if (res.ok) { showToast("Account removed."); fetchGoals(); setConfirmDeleteAccId(null); }
  };

  return (
    <PageContainer>
      <>
        {toast && <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">{toast}</div>}

        {/* Confirm delete modals */}
        {(confirmDeleteGoalId || confirmDeleteAccId) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setConfirmDeleteGoalId(null); setConfirmDeleteAccId(null); }}/>
            <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-[#1a1035] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#FF8C8C]/15 border border-[#FF8C8C]/25 flex items-center justify-center"><AlertTriangle size={22} className="text-[#FF8C8C]"/></div>
                <div><p className="font-bold text-white">Delete this?</p><p className="text-sm text-white/45 mt-1">This cannot be undone.</p></div>
                <div className="flex gap-3 w-full">
                  <button onClick={() => { setConfirmDeleteGoalId(null); setConfirmDeleteAccId(null); }} className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white transition">Cancel</button>
                  <button onClick={() => { if (confirmDeleteGoalId) handleDeleteGoal(confirmDeleteGoalId); if (confirmDeleteAccId) handleDeleteAccount(confirmDeleteAccId); }}
                    className="flex-1 rounded-full bg-[#FF8C8C]/20 border border-[#FF8C8C]/30 py-2.5 text-sm font-semibold text-[#FF8C8C] hover:bg-[#FF8C8C]/35 transition">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Financial Goals</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Savings</h1>
          <p className="mt-1.5 text-sm text-white/50">Track your tabungs and savings goals.</p>
        </div>

        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }} className="relative z-10 space-y-6">

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0 }}
              className="relative overflow-hidden rounded-3xl p-6" style={{ background:"linear-gradient(135deg,#E2D9FF 0%,#C4B5FD 100%)", boxShadow:"0 12px 40px rgba(196,181,253,0.25)" }}>
              <div className="absolute inset-x-0 top-0 h-px bg-white/50"/><div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl"/>
              <div className="relative z-10 mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/30"><Building2 size={17} color="#2D1B6B"/></div>
              <p className="relative z-10 text-xs font-medium text-[#2D1B6B]/60 uppercase tracking-wide">Total in Accounts</p>
              <h2 className="relative z-10 mt-1.5 text-3xl font-bold tracking-tight text-[#2D1B6B]">{formatCurrency(totalAccBal)}</h2>
            </motion.div>

            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.07 }}
              className="relative overflow-hidden rounded-3xl p-6" style={{ background:"linear-gradient(135deg,#D4F5E2 0%,#8EE3B5 100%)", boxShadow:"0 12px 40px rgba(142,227,181,0.25)" }}>
              <div className="absolute inset-x-0 top-0 h-px bg-white/50"/><div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl"/>
              <div className="relative z-10 mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/30"><TrendingUp size={17} color="#0E3D22"/></div>
              <p className="relative z-10 text-xs font-medium text-[#0E3D22]/60 uppercase tracking-wide">Goals Progress</p>
              <h2 className="relative z-10 mt-1.5 text-3xl font-bold tracking-tight text-[#0E3D22]">{overallPct}%</h2>
            </motion.div>

            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }}
              className="relative overflow-hidden rounded-3xl p-6" style={{ background:"linear-gradient(135deg,#FEDADA 0%,#E8A0A0 100%)", boxShadow:"0 12px 40px rgba(232,160,160,0.25)" }}>
              <div className="absolute inset-x-0 top-0 h-px bg-white/50"/><div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl"/>
              <div className="relative z-10 mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/30"><Target size={17} color="#4A1818"/></div>
              <p className="relative z-10 text-xs font-medium text-[#4A1818]/60 uppercase tracking-wide">Goals Completed</p>
              <h2 className="relative z-10 mt-1.5 text-3xl font-bold tracking-tight text-[#4A1818]">{completed} / {goals.length}</h2>
            </motion.div>
          </div>

          {/* ── Savings Accounts ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">My Tabungs & Accounts</h2>
                <p className="text-sm text-white/40">{accounts.length} account{accounts.length !== 1 ? "s" : ""} · {formatCurrency(totalAccBal)} total</p>
              </div>
              <button onClick={() => setShowAccForm(!showAccForm)} className="flex items-center gap-1.5 rounded-2xl bg-white/8 border border-white/12 px-3.5 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/12 transition">
                <Plus size={13}/> Add Account
              </button>
            </div>

            {/* Add account form */}
            <AnimatePresence>
              {showAccForm && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl mb-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Account Name *</label>
                      <input value={accForm.name} onChange={e => setAccForm(p => ({ ...p, name:e.target.value }))} placeholder="e.g. Tabung MAE, CIMB Savings" className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 backdrop-blur-xl focus:border-[#6A49FA]/60 focus:ring-2 focus:ring-[#6A49FA]/20"/></div>
                    <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Bank</label>
                      <select value={accForm.bank} onChange={e => setAccForm(p => ({ ...p, bank:e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none backdrop-blur-xl focus:border-[#6A49FA]/60">{BANKS.map(b => <option key={b} value={b} className="bg-[#1a1035]">{b}</option>)}</select></div>
                    <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Current Balance (RM)</label>
                      <input type="number" value={accForm.balance} onChange={e => setAccForm(p => ({ ...p, balance:e.target.value }))} placeholder="0.00" className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 backdrop-blur-xl focus:border-[#6A49FA]/60 focus:ring-2 focus:ring-[#6A49FA]/20"/></div>
                    <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Note (optional)</label>
                      <input value={accForm.note} onChange={e => setAccForm(p => ({ ...p, note:e.target.value }))} placeholder="e.g. Emergency fund" className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 backdrop-blur-xl focus:border-[#6A49FA]/60 focus:ring-2 focus:ring-[#6A49FA]/20"/></div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setShowAccForm(false)} className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white transition">Cancel</button>
                    <button onClick={handleAddAccount} disabled={accSaving || !accForm.name} className="flex-1 rounded-full bg-linear-to-r from-[#6A49FA] to-[#9B7FFF] py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
                      {accSaving ? "Saving…" : "Add Account"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Edit account inline */}
            <AnimatePresence>
              {editAccount && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                  className="relative overflow-hidden rounded-3xl border border-[#C4B5FD]/20 bg-[#C4B5FD]/5 p-5 backdrop-blur-2xl mb-4">
                  <div className="absolute inset-x-0 top-0 h-px bg-[#C4B5FD]/25"/>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-3">✏ Editing {editAccount.name}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Name</label><input value={editAccount.name} onChange={e => setEditAccount(p => p ? ({ ...p, name:e.target.value }) : p)} className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none backdrop-blur-xl focus:border-[#6A49FA]/60"/></div>
                    <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Bank</label><select value={editAccount.bank} onChange={e => setEditAccount(p => p ? ({ ...p, bank:e.target.value }) : p)} className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none backdrop-blur-xl focus:border-[#6A49FA]/60">{BANKS.map(b => <option key={b} value={b} className="bg-[#1a1035]">{b}</option>)}</select></div>
                    <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Balance (RM)</label><input type="number" value={editAccount.balance} onChange={e => setEditAccount(p => p ? ({ ...p, balance:parseFloat(e.target.value)||0 }) : p)} className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none backdrop-blur-xl focus:border-[#6A49FA]/60"/></div>
                    <div className="space-y-1.5"><label className="text-xs text-white/45 uppercase tracking-wider">Note</label><input value={editAccount.note ?? ""} onChange={e => setEditAccount(p => p ? ({ ...p, note:e.target.value }) : p)} className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none backdrop-blur-xl focus:border-[#6A49FA]/60"/></div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => setEditAccount(null)} className="flex-1 rounded-full border border-white/15 bg-white/5 py-2.5 text-sm text-white/60 hover:text-white transition flex items-center justify-center gap-2"><X size={13}/> Cancel</button>
                    <button onClick={handleUpdateAccount} disabled={accSaving} className="flex-1 rounded-full bg-[#6A49FA]/40 border border-[#6A49FA]/50 py-2.5 text-sm font-semibold text-[#C4B5FD] hover:bg-[#6A49FA]/60 transition flex items-center justify-center gap-2"><Check size={13}/> Save</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {accounts.length === 0 && !showAccForm && (
              <div className="rounded-3xl border border-white/8 bg-white/3 p-8 text-center">
                <Building2 size={28} className="mx-auto mb-2 text-white/15"/>
                <p className="text-sm text-white/30">No accounts added yet. Add your tabungs to track your cash balances.</p>
              </div>
            )}

            {accounts.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {accounts.map((acc) => (
                  <AccountCard key={acc.id} account={acc} onEdit={() => setEditAccount(acc)} onDelete={() => setConfirmDeleteAccId(acc.id)}/>
                ))}
              </div>
            )}
          </section>

          {/* ── Savings Goals ── */}
          <section>
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Savings Goals</h2>
                <p className="text-sm text-white/45">{goals.length} goal{goals.length !== 1 ? "s" : ""} · {formatCurrency(totalTarget - totalSaved)} remaining</p>
              </div>
            </div>

            <AddSavingsForm onGoalAdded={() => { showToast("🎯 Goal created!"); fetchGoals(); }}/>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">{[1,2,3].map(i => <div key={i} className="rounded-3xl h-52 animate-pulse" style={{ background:"rgba(255,255,255,0.06)" }}/>)}</div>
            ) : goals.length === 0 ? (
              <div className="rounded-3xl p-12 text-center mt-4" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🎯</div>
                <p style={{ fontSize:15, fontWeight:600, color:"rgba(255,255,255,0.55)" }}>No savings goals yet</p>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.30)", marginTop:4 }}>Use the form above to create your first goal</p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                <AnimatePresence>
                  {goals.map((goal, i) => (
                    <GoalCard key={goal.id} goal={goal} index={i} onEdit={setEditGoal} onDelete={(id) => setConfirmDeleteGoalId(id)} onTopUp={setTopUpGoal}/>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>

        </motion.div>

        <AnimatePresence>
          {topUpGoal && <TopUpModal goal={topUpGoal} onClose={() => setTopUpGoal(null)} onConfirm={handleTopUp}/>}
          {editGoal  && <EditGoalModal goal={editGoal} onClose={() => setEditGoal(null)} onSave={handleEditGoal}/>}
        </AnimatePresence>
      </>
    </PageContainer>
  );
}
