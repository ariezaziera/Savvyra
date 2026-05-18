"use client";

import { useState, useMemo } from "react";
import { Plus, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────── */
type NewGoalPayload = {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  monthlyContribution: number | null;
};

type AddSavingsFormProps = {
  onGoalAdded?: () => void;
};

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
function monthsUntil(deadline: string): number {
  const now = new Date();
  const end = new Date(deadline);
  return Math.max(
    (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()),
    1
  );
}

function projectedFinish(remaining: number, monthly: number): { months: number; date: Date } | null {
  if (monthly <= 0 || remaining <= 0) return null;
  const months = Math.ceil(remaining / monthly);
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return { months, date: d };
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-MY", { month: "short", year: "numeric" });
}

function fmtRM(n: number) {
  return n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ─────────────────────────────────────────────────────────────────
   Shared styles
───────────────────────────────────────────────────────────────── */
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
   Component
───────────────────────────────────────────────────────────────── */
export default function AddSavingsForm({ onGoalAdded }: AddSavingsFormProps) {
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [customMonthly, setCustomMonthly] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Derived ── */
  const target = parseFloat(goalTarget) || 0;
  const current = parseFloat(goalCurrent) || 0;
  const remaining = Math.max(target - current, 0);

  const autoMonthly = useMemo(() => {
    if (!goalDeadline || remaining <= 0) return null;
    const months = monthsUntil(goalDeadline);
    return parseFloat((remaining / months).toFixed(2));
  }, [goalDeadline, remaining]);

  const effectiveMonthly = isCustom ? (parseFloat(customMonthly) || 0) : (autoMonthly ?? 0);

  const deadlineMonths = goalDeadline && remaining > 0 ? monthsUntil(goalDeadline) : null;
  const neededMonthly = deadlineMonths ? remaining / deadlineMonths : null;

  const isOnTrack = neededMonthly !== null && effectiveMonthly >= neededMonthly;
  const isBehind = neededMonthly !== null && effectiveMonthly > 0 && effectiveMonthly < neededMonthly;

  const projection = effectiveMonthly > 0 && remaining > 0 ? projectedFinish(remaining, effectiveMonthly) : null;
  const delayMonths = projection && deadlineMonths ? projection.months - deadlineMonths : null;

  const showInsight = effectiveMonthly > 0 && remaining > 0;

  const canSubmit = !isSubmitting && !!goalName && !!goalTarget;

  /* ── Submit ── */
  const handleAddGoal = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: goalName,
          targetAmount: target,
          currentAmount: current,
          deadline: goalDeadline || null,
          monthlyContribution: effectiveMonthly > 0 ? effectiveMonthly : null,
        } satisfies NewGoalPayload),
      });
      if (res.ok) {
        setGoalName(""); setGoalTarget(""); setGoalCurrent("");
        setGoalDeadline(""); setCustomMonthly(""); setIsCustom(false);
        onGoalAdded?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Status colours ── */
  const statusConfig = isOnTrack
    ? { bg: "rgba(142,227,181,0.12)", border: "rgba(142,227,181,0.30)", text: "#8EE3B5", Icon: CheckCircle2 }
    : isBehind
    ? { bg: "rgba(232,201,122,0.12)", border: "rgba(232,201,122,0.30)", text: "#E8C97A", Icon: AlertTriangle }
    : { bg: "rgba(196,181,253,0.10)", border: "rgba(196,181,253,0.22)", text: "#C4B5FD", Icon: Zap };

  return (
    <>
      <style suppressHydrationWarning>{`
        .sg-form-input:focus {
          border-color: rgba(196,181,253,0.65) !important;
          background: rgba(255,255,255,0.10) !important;
          box-shadow: 0 0 0 3px rgba(196,181,253,0.10);
        }
        .sg-form-input::placeholder { color: rgba(255,255,255,0.22); }
        input[type="date"].sg-form-input::-webkit-calendar-picker-indicator {
          filter: invert(1) opacity(0.4);
          cursor: pointer;
        }
      `}</style>

      <div
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

        {/* Heading */}
        <div className="mb-5">
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>New Goal</p>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>Add Savings Goal</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", margin: "3px 0 0" }}>Set a target and track your financial progress</p>
        </div>

        {/* Core fields */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Goal Name</label>
            <input className="sg-form-input" value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="e.g. Emergency Fund" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Target Amount (RM)</label>
            <input className="sg-form-input" type="number" min="0" step="0.01" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} placeholder="5000" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Current Saved (RM)</label>
            <input className="sg-form-input" type="number" min="0" step="0.01" value={goalCurrent} onChange={e => setGoalCurrent(e.target.value)} placeholder="0" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Deadline (optional)</label>
            <input className="sg-form-input" type="date" value={goalDeadline} onChange={e => setGoalDeadline(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Monthly contribution row */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Monthly Contribution (RM)</label>
            {/* Auto / Custom pill toggle */}
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" }}>
              {(["Auto", "Custom"] as const).map(opt => {
                const active = opt === "Custom" ? isCustom : !isCustom;
                return (
                  <button
                    key={opt}
                    onClick={() => setIsCustom(opt === "Custom")}
                    style={{
                      padding: "4px 12px",
                      fontSize: 11,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      background: active ? "rgba(196,181,253,0.20)" : "transparent",
                      color: active ? "#C4B5FD" : "rgba(255,255,255,0.35)",
                      transition: "background 0.15s ease, color 0.15s ease",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {isCustom ? (
            <input
              autoFocus
              className="sg-form-input"
              type="number"
              min="0"
              step="0.01"
              value={customMonthly}
              onChange={e => setCustomMonthly(e.target.value)}
              placeholder="Enter monthly amount"
              style={inputStyle}
            />
          ) : (
            /* Auto display pill */
            <div style={{
              height: 48, borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px dashed rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", paddingLeft: 14, gap: 8,
            }}>
              <Zap size={14} color="rgba(196,181,253,0.7)" />
              {autoMonthly !== null ? (
                <span style={{ fontSize: 14, fontWeight: 700, color: "#C4B5FD" }}>
                  RM {fmtRM(autoMonthly)}
                  <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.32)", marginLeft: 6 }}>/ month · auto-calculated</span>
                </span>
              ) : (
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}>
                  {!goalDeadline
                    ? "Set a deadline to auto-calculate"
                    : remaining <= 0
                    ? "Goal already reached!"
                    : "—"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Insight banner */}
        {showInsight && projection && (
          <div style={{
            marginBottom: 16,
            borderRadius: 14,
            padding: "12px 14px",
            background: statusConfig.bg,
            border: `1px solid ${statusConfig.border}`,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            transition: "all 0.3s ease",
          }}>
            <statusConfig.Icon size={15} color={statusConfig.text} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              {isOnTrack && goalDeadline ? (
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: statusConfig.text, lineHeight: 1.55 }}>
                  On track — you'll reach your goal by{" "}
                  <strong>{fmtDate(projection.date)}</strong>, right on schedule. 🎯
                </p>
              ) : isBehind && goalDeadline ? (
                <>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: statusConfig.text, lineHeight: 1.55 }}>
                    Behind schedule — at this rate you'll finish by{" "}
                    <strong>{fmtDate(projection.date)}</strong>
                    {delayMonths && delayMonths > 0 && (
                      <span style={{ fontWeight: 500, opacity: 0.75 }}>
                        {" "}({delayMonths} month{delayMonths !== 1 ? "s" : ""} late)
                      </span>
                    )}.
                  </p>
                  {neededMonthly && (
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(232,201,122,0.70)", lineHeight: 1.4 }}>
                      Increase to <strong style={{ color: statusConfig.text }}>RM {fmtRM(neededMonthly)}</strong>/mo to hit your deadline.
                    </p>
                  )}
                </>
              ) : (
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: statusConfig.text, lineHeight: 1.55 }}>
                  At this rate you'll finish in{" "}
                  <strong>{projection.months} month{projection.months !== 1 ? "s" : ""}</strong>
                  {" "}— around <strong>{fmtDate(projection.date)}</strong>.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleAddGoal}
          disabled={!canSubmit}
          style={{
            height: 46, borderRadius: 12, border: "none",
            cursor: canSubmit ? "pointer" : "not-allowed",
            background: "linear-gradient(135deg,#6A49FA,#9B7FFF)",
            color: "#fff", fontSize: 14, fontWeight: 700,
            padding: "0 28px", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 8,
            opacity: canSubmit ? 1 : 0.5,
            boxShadow: "0 8px 24px rgba(106,73,250,0.40)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease",
          }}
          onMouseEnter={e => { if (canSubmit) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(106,73,250,0.55)"; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(106,73,250,0.40)"; }}
        >
          <Plus size={16} />
          {isSubmitting ? "Adding…" : "Add Goal"}
        </button>
      </div>
    </>
  );
}