"use client";

import { useEffect, useRef, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { formatCurrency } from "@/lib/formatCurrency";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Trash2, Pencil, X, Check, Calendar, TrendingUp, Wallet } from "lucide-react";
import AddSavingsForm from "@/components/AddSavingsForm";

/* ─────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────── */
type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  monthlyContribution?: number | null;
};

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
const CARD_GRADIENTS = [
  { bg: "linear-gradient(135deg,#E2D9FF 0%,#C4B5FD 100%)", text: "#2D1B6B", sub: "rgba(45,27,107,0.55)", glow: "rgba(196,181,253,0.28)", badge: "rgba(45,27,107,0.12)" },
  { bg: "linear-gradient(135deg,#FEDADA 0%,#E8A0A0 100%)", text: "#4A1818", sub: "rgba(74,24,24,0.55)", glow: "rgba(232,160,160,0.28)", badge: "rgba(74,24,24,0.12)" },
  { bg: "linear-gradient(135deg,#D4F5E2 0%,#8EE3B5 100%)", text: "#0E3D22", sub: "rgba(14,61,34,0.55)", glow: "rgba(142,227,181,0.28)", badge: "rgba(14,61,34,0.12)" },
  { bg: "linear-gradient(135deg,#FEF3DA 0%,#E8C97A 100%)", text: "#3D2A00", sub: "rgba(61,42,0,0.55)", glow: "rgba(232,201,122,0.28)", badge: "rgba(61,42,0,0.12)" },
  { bg: "linear-gradient(135deg,#DAF0FE 0%,#93C8F0 100%)", text: "#0B2E45", sub: "rgba(11,46,69,0.55)", glow: "rgba(147,200,240,0.28)", badge: "rgba(11,46,69,0.12)" },
];

function getGradient(idx: number) {
  return CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
}

function daysUntil(deadline: string | null | undefined): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 12,
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  fontSize: 14,
  paddingLeft: 14,
  paddingRight: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s ease, background 0.2s ease",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(255,255,255,0.45)",
  letterSpacing: "0.6px",
  textTransform: "uppercase",
  marginBottom: 6,
};

/* ─────────────────────────────────────────────────────────────────
   Animated Ring Progress
───────────────────────────────────────────────────────────────── */
function RingProgress({
  progress,
  size = 72,
  stroke = 6,
  color,
  bg,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  color: string;
  bg: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(progress, 1);
  const offset = circ * (1 - pct);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Goal Card
───────────────────────────────────────────────────────────────── */
function GoalCard({
  goal,
  index,
  onEdit,
  onDelete,
  onTopUp,
}: {
  goal: SavingsGoal;
  index: number;
  onEdit: (g: SavingsGoal) => void;
  onDelete: (id: string) => void;
  onTopUp: (g: SavingsGoal) => void;
}) {
  const style = getGradient(index);
  const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
  const pct = Math.round(progress * 100);
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const days = daysUntil(goal.deadline);
  const done = progress >= 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        background: style.bg,
        borderRadius: 24,
        padding: "20px 20px 18px",
        boxShadow: `0 10px 36px ${style.glow}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer line */}
      <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: "rgba(255,255,255,0.50)" }} />

      {/* Glow orb */}
      <div style={{ position: "absolute", right: -24, top: -24, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.22)", filter: "blur(20px)", pointerEvents: "none" }} />

      {/* Completed badge */}
      {done && (
        <div style={{ position: "absolute", top: 14, right: 14, background: style.badge, color: style.text, borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
          🎉 Completed
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, position: "relative", zIndex: 1 }}>
        {/* Ring */}
        <div style={{ position: "relative" }}>
          <RingProgress progress={progress} size={72} stroke={6} color={style.text} bg={`${style.text}22`} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: style.text, lineHeight: 1 }}>{pct}%</span>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: style.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{goal.name}</p>

          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: style.sub, fontWeight: 500 }}>Saved</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: style.text }}>{formatCurrency(goal.currentAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: style.sub, fontWeight: 500 }}>Target</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: style.text }}>{formatCurrency(goal.targetAmount)}</span>
            </div>
            {remaining > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: style.sub, fontWeight: 500 }}>Remaining</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: style.sub }}>{formatCurrency(remaining)}</span>
              </div>
            )}
            {goal.monthlyContribution && goal.monthlyContribution > 0 && remaining > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: style.sub, fontWeight: 500 }}>Monthly Target</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: style.text }}>
                  {formatCurrency(goal.monthlyContribution)}/mo
                </span>
              </div>
            )}
            {days !== null && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: style.sub, fontWeight: 500 }}>Deadline</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: days < 0 ? "#E8A0A0" : days <= 7 ? "#E8C97A" : style.sub }}>
                  {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today!" : `${days}d left`}
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: `${style.text}18`, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: style.text, borderRadius: 999, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 14, position: "relative", zIndex: 1 }}>
        <button
          onClick={() => onTopUp(goal)}
          style={{ flex: 1, height: 36, borderRadius: 10, border: "none", background: `${style.text}18`, color: style.text, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "inherit", transition: "background 0.15s ease" }}
          onMouseEnter={e => (e.currentTarget.style.background = `${style.text}2E`)}
          onMouseLeave={e => (e.currentTarget.style.background = `${style.text}18`)}
        >
          <Plus size={13} /> Top Up
        </button>
        <button
          onClick={() => onEdit(goal)}
          style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: `${style.text}18`, color: style.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", transition: "background 0.15s ease, transform 0.15s ease" }}
          onMouseEnter={e => { e.currentTarget.style.background = `${style.text}2E`; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${style.text}18`; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: `${style.text}18`, color: style.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", transition: "background 0.15s ease, transform 0.15s ease" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,100,100,0.22)"; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${style.text}18`; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Top-Up Modal
───────────────────────────────────────────────────────────────── */
function TopUpModal({ goal, onClose, onConfirm }: { goal: SavingsGoal; onClose: () => void; onConfirm: (id: string, amount: number) => void }) {
  const [amount, setAmount] = useState("");
  const style = getGradient(0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,6,30,0.65)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        style={{ position: "relative", width: "100%", maxWidth: 360, background: "rgba(30,20,70,0.96)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: 24, backdropFilter: "blur(32px)", boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}
      >
        <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: "rgba(255,255,255,0.15)", borderRadius: "24px 24px 0 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Top Up</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{goal.name}</h3>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8, color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 6, display: "flex", transition: "background 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)" }}>Current</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#C4B5FD" }}>{formatCurrency(goal.currentAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)" }}>Target</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.60)" }}>{formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>

        <label style={labelStyle}>Amount to add (RM)</label>
        <input
          autoFocus
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ ...inputStyle, marginBottom: 16 }}
          onFocus={e => { e.currentTarget.style.borderColor = "rgba(196,181,253,0.6)"; e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
          onKeyDown={e => e.key === "Enter" && amount && parseFloat(amount) > 0 && onConfirm(goal.id, parseFloat(amount))}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => amount && parseFloat(amount) > 0 && onConfirm(goal.id, parseFloat(amount))}
            style={{ flex: 1, height: 44, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6A49FA,#9B7FFF)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(106,73,250,0.40)", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(106,73,250,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(106,73,250,0.40)"; }}
          >
            Add Funds
          </button>
          <button
            onClick={onClose}
            style={{ height: 44, padding: "0 18px", borderRadius: 12, cursor: "pointer", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", fontSize: 14, fontFamily: "inherit", transition: "background 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Edit Modal
───────────────────────────────────────────────────────────────── */
function EditModal({ goal, onClose, onSave }: { goal: SavingsGoal; onClose: () => void; onSave: (updated: Partial<SavingsGoal> & { id: string }) => void }) {
  const [form, setForm] = useState({ name: goal.name, targetAmount: String(goal.targetAmount), currentAmount: String(goal.currentAmount), deadline: goal.deadline?.split("T")[0] ?? "" });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,6,30,0.65)", backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        style={{ position: "relative", width: "100%", maxWidth: 400, background: "rgba(30,20,70,0.96)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: 24, backdropFilter: "blur(32px)", boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}
      >
        <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: "rgba(255,255,255,0.15)", borderRadius: "24px 24px 0 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Edit Goal</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{goal.name}</h3>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8, color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 6, display: "flex" }}>
            <X size={14} />
          </button>
        </div>

        <style>{`.sg-input:focus { border-color: rgba(196,181,253,0.6) !important; background: rgba(255,255,255,0.10) !important; } .sg-input::placeholder { color: rgba(255,255,255,0.22); } input[type="date"].sg-input::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.4); cursor:pointer; }`}</style>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><label style={labelStyle}>Goal Name</label><input className="sg-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Emergency Fund" style={inputStyle} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Target (RM)</label><input className="sg-input" type="number" min="0" step="0.01" value={form.targetAmount} onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))} placeholder="5000" style={inputStyle} /></div>
            <div><label style={labelStyle}>Current (RM)</label><input className="sg-input" type="number" min="0" step="0.01" value={form.currentAmount} onChange={e => setForm(p => ({ ...p, currentAmount: e.target.value }))} placeholder="0" style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Deadline (optional)</label><input className="sg-input" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} style={inputStyle} /></div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={() => onSave({ id: goal.id, name: form.name, targetAmount: parseFloat(form.targetAmount) || 0, currentAmount: parseFloat(form.currentAmount) || 0, deadline: form.deadline || null })}
            style={{ flex: 1, height: 44, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6A49FA,#9B7FFF)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(106,73,250,0.40)", transition: "transform 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            Save Changes
          </button>
          <button onClick={onClose} style={{ height: 44, padding: "0 18px", borderRadius: 12, cursor: "pointer", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", fontSize: 14, fontFamily: "inherit" }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Toast
───────────────────────────────────────────────────────────────── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12 }}
      style={{ position: "fixed", top: 20, right: 20, zIndex: 200, borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.10)", padding: "12px 18px", color: "#fff", fontSize: 13, fontWeight: 500, backdropFilter: "blur(20px)", boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}
    >
      {message}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────────── */
export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");

  /* Form state */
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Modal state */
  const [topUpGoal, setTopUpGoal] = useState<SavingsGoal | null>(null);
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/savings-goals");
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : data.goals ?? data.data ?? []);
    } catch {
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  /* Summary stats */
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const completed = goals.filter(g => g.currentAmount >= g.targetAmount).length;
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleAddGoal = async () => {
    if (!goalName || !goalTarget) return;
    setIsSubmitting(true);
    const res = await fetch("/api/savings-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: goalName, targetAmount: parseFloat(goalTarget), currentAmount: parseFloat(goalCurrent) || 0, deadline: goalDeadline || null }),
    });
    if (res.ok) {
      setGoalName(""); setGoalTarget(""); setGoalCurrent(""); setGoalDeadline("");
      showToast("🎯 Goal created!");
      await fetchGoals();
    } else {
      showToast("Failed to add goal.");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/savings-goals", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { showToast("Goal removed."); fetchGoals(); }
  };

  const handleTopUp = async (id: string, amount: number) => {
    const res = await fetch("/api/savings-goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        topUpAmount: amount,   // 👈 key baru — API detect ni sebagai top up flow
      }),
    });
  
    if (res.ok) {
      setTopUpGoal(null);
      showToast(`+${formatCurrency(amount)} added!`);
      fetchGoals();
    } else {
      showToast("Failed to top up.");
    }
  };

  const handleEdit = async (updated: Partial<SavingsGoal> & { id: string }) => {
    const res = await fetch("/api/savings-goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) { setEditGoal(null); showToast("Goal updated!"); fetchGoals(); }
  };

  return (
    <PageContainer>
      <>
        <style>{`
          .sg-form-input:focus { border-color: rgba(196,181,253,0.65) !important; background: rgba(255,255,255,0.10) !important; box-shadow: 0 0 0 3px rgba(196,181,253,0.10); }
          .sg-form-input::placeholder { color: rgba(255,255,255,0.22); }
          input[type="date"].sg-form-input::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.4); cursor: pointer; }
        `}</style>

        {/* Header */}
        <div className="relative z-10 mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Financial Goals</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Savings Goals</h1>
          <p className="mt-1.5 text-sm text-white/50">Track and grow your savings targets over time.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative z-10 space-y-5"
        >
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Total saved — lavender */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
              className="relative overflow-hidden rounded-3xl p-6"
              style={{ background: "linear-gradient(135deg,#E2D9FF 0%,#C4B5FD 100%)", boxShadow: "0 12px 40px rgba(196,181,253,0.25)" }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
              <div className="relative z-10 mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/30"><Wallet size={17} color="#2D1B6B" /></div>
              <p className="relative z-10 text-xs font-medium text-[#2D1B6B]/60 uppercase tracking-wide">Total Saved</p>
              <h2 className="relative z-10 mt-1.5 text-3xl font-bold tracking-tight text-[#2D1B6B]">{formatCurrency(totalSaved)}</h2>
            </motion.div>

            {/* Overall progress — green */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
              className="relative overflow-hidden rounded-3xl p-6"
              style={{ background: "linear-gradient(135deg,#D4F5E2 0%,#8EE3B5 100%)", boxShadow: "0 12px 40px rgba(142,227,181,0.25)" }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
              <div className="relative z-10 mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/30"><TrendingUp size={17} color="#0E3D22" /></div>
              <p className="relative z-10 text-xs font-medium text-[#0E3D22]/60 uppercase tracking-wide">Overall Progress</p>
              <h2 className="relative z-10 mt-1.5 text-3xl font-bold tracking-tight text-[#0E3D22]">{overallPct}%</h2>
            </motion.div>

            {/* Goals — pink */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              className="relative overflow-hidden rounded-3xl p-6"
              style={{ background: "linear-gradient(135deg,#FEDADA 0%,#E8A0A0 100%)", boxShadow: "0 12px 40px rgba(232,160,160,0.25)" }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
              <div className="relative z-10 mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/30"><Target size={17} color="#4A1818" /></div>
              <p className="relative z-10 text-xs font-medium text-[#4A1818]/60 uppercase tracking-wide">Goals Completed</p>
              <h2 className="relative z-10 mt-1.5 text-3xl font-bold tracking-tight text-[#4A1818]">{completed} / {goals.length}</h2>
            </motion.div>
          </div>

          {/* ── Add Goal Form ── */}
          <AddSavingsForm onGoalAdded={() => { showToast("🎯 Goal created!"); fetchGoals(); }} />

          {/* ── Goals Grid ── */}
          <div>
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Active Goals</h2>
                <p className="text-sm text-white/45">{goals.length} goal{goals.length !== 1 ? "s" : ""} · {formatCurrency(totalTarget - totalSaved)} remaining across all</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-3xl h-52 animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
                ))}
              </div>
            ) : goals.length === 0 ? (
              <div
                className="rounded-3xl p-12 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>No savings goals yet</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.30)", marginTop: 4 }}>Add your first goal above to get started</p>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence>
                  {goals.map((goal, i) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      index={i}
                      onEdit={setEditGoal}
                      onDelete={handleDelete}
                      onTopUp={setTopUpGoal}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {topUpGoal && <TopUpModal goal={topUpGoal} onClose={() => setTopUpGoal(null)} onConfirm={handleTopUp} />}
          {editGoal && <EditModal goal={editGoal} onClose={() => setEditGoal(null)} onSave={handleEdit} />}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast && <Toast message={toast} onClose={() => setToast("")} />}
        </AnimatePresence>
      </>
    </PageContainer>
  );
}