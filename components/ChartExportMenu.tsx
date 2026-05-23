"use client";

import { useState } from "react";
import { exportChartAsImage, exportChartAsPDF } from "@/lib/exportUtils";

type Props = {
  chartId: string;
  filename: string;
};

export default function ChartExportMenu({ chartId, filename }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "4px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.5)",
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        ⬇
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            right: 0,
            background: "#1e1b4b",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: 8,
            minWidth: 140,
            zIndex: 999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {[
            { label: "🖼 Save as PNG", action: () => exportChartAsImage(chartId, filename) },
            { label: "🖨 Save as PDF", action: () => exportChartAsPDF(chartId, filename) },
          ].map(({ label, action }) => (
            <button
              key={label}
              onClick={() => { action(); setOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                textAlign: "left",
                borderRadius: 8,
                fontSize: 13,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}