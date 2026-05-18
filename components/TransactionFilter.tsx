"use client";

import { useState, useMemo } from "react";
import { CalendarDays, SlidersHorizontal } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────── */
export type FilterMode = "picker" | "range";

export interface DateFilter {
  mode: FilterMode;
  /** picker mode */
  month: number;   // 0–11
  year: number;
  /** range mode */
  from: string;    // "YYYY-MM-DD"
  to: string;      // "YYYY-MM-DD"
}

interface Props {
  value: DateFilter;
  onChange: (f: DateFilter) => void;
}

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function buildYears(): number[] {
  const now = new Date().getFullYear();
  const years: number[] = [];
  for (let y = now; y >= now - 5; y--) years.push(y);
  return years;
}

const selectStyle: React.CSSProperties = {
  background:   "rgba(255,255,255,0.08)",
  border:       "1px solid rgba(255,255,255,0.14)",
  borderRadius: 12,
  color:        "#fff",
  fontSize:     13,
  fontWeight:   500,
  padding:      "8px 12px",
  outline:      "none",
  cursor:       "pointer",
  fontFamily:   "inherit",
  appearance:   "none",
  WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat:   "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight:       32,
};

const dateInputStyle: React.CSSProperties = {
  background:   "rgba(255,255,255,0.08)",
  border:       "1px solid rgba(255,255,255,0.14)",
  borderRadius: 12,
  color:        "#fff",
  fontSize:     13,
  fontWeight:   500,
  padding:      "8px 12px",
  outline:      "none",
  fontFamily:   "inherit",
  colorScheme:  "dark",
};

/* ─────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────── */
export default function TransactionFilter({ value, onChange }: Props) {
  const years = useMemo(() => buildYears(), []);

  function setMode(mode: FilterMode) {
    onChange({ ...value, mode });
  }

  function setMonth(month: number) {
    onChange({ ...value, mode: "picker", month });
  }

  function setYear(year: number) {
    onChange({ ...value, mode: "picker", year });
  }

  function setFrom(from: string) {
    onChange({ ...value, mode: "range", from });
  }

  function setTo(to: string) {
    onChange({ ...value, mode: "range", to });
  }

  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        flexWrap:       "wrap",
        gap:            10,
      }}
    >
      {/* ── Mode toggle ── */}
      <div
        style={{
          display:      "flex",
          background:   "rgba(255,255,255,0.06)",
          border:       "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding:      4,
          gap:          4,
        }}
      >
        <ModeBtn
          active={value.mode === "picker"}
          onClick={() => setMode("picker")}
          icon={<CalendarDays size={14} />}
          label="Month"
        />
        <ModeBtn
          active={value.mode === "range"}
          onClick={() => setMode("range")}
          icon={<SlidersHorizontal size={14} />}
          label="Custom range"
        />
      </div>

      {/* ── Picker mode: month + year dropdowns ── */}
      {value.mode === "picker" && (
        <>
          <select
            value={value.month}
            onChange={(e) => setMonth(Number(e.target.value))}
            style={selectStyle}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i} style={{ background: "#2B1E59" }}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={value.year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={selectStyle}
          >
            {years.map((y) => (
              <option key={y} value={y} style={{ background: "#2B1E59" }}>
                {y}
              </option>
            ))}
          </select>
        </>
      )}

      {/* ── Range mode: from → to date inputs ── */}
      {value.mode === "range" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="date"
            value={value.from}
            max={value.to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            style={dateInputStyle}
          />

          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            →
          </span>

          <input
            type="date"
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => setTo(e.target.value)}
            style={dateInputStyle}
          />

          {/* Clear range */}
          {(value.from || value.to) && (
            <button
              onClick={() => onChange({ ...value, from: "", to: "" })}
              style={{
                background:   "rgba(255,255,255,0.08)",
                border:       "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                color:        "rgba(255,255,255,0.5)",
                fontSize:     12,
                padding:      "7px 12px",
                cursor:       "pointer",
                fontFamily:   "inherit",
                transition:   "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.14)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.08)";
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Mode toggle button ── */
function ModeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display:      "flex",
        alignItems:   "center",
        gap:          6,
        padding:      "6px 12px",
        borderRadius: 9,
        border:       "none",
        background:   active
          ? "linear-gradient(135deg,#E8A0A0,#C4B5FD)"
          : "transparent",
        color:        active ? "#2B1059" : "rgba(255,255,255,0.45)",
        fontSize:     12,
        fontWeight:   active ? 700 : 500,
        cursor:       "pointer",
        transition:   "all 0.18s ease",
        fontFamily:   "inherit",
        whiteSpace:   "nowrap",
      }}
    >
      {icon}
      {label}
    </button>
  );
}