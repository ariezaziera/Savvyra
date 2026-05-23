"use client";

import { useState, useRef, useEffect } from "react";
import { exportCSV, exportExcel, exportTableAsPDF } from "@/lib/exportUtils";

type Props = {
  data: object[];
  filename: string;
  title: string;
};

export default function ExportMenu({ data, filename, title }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef  = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    right: 0,
  });

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reposition dropdown so it never goes off-screen
  useEffect(() => {
    if (!open || !containerRef.current || !dropdownRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const dropdownWidth = dropdownRef.current.offsetWidth || 150;
    const viewportWidth = window.innerWidth;
    const PADDING = 12; // min gap from screen edge

    // Default: align to right edge of button
    let rightAligned = containerRect.right - dropdownWidth;

    if (rightAligned < PADDING) {
      // Would go off left edge — align to left edge of button instead
      setDropdownStyle({ left: 0, right: "auto" });
    } else {
      // Safe to right-align
      setDropdownStyle({ right: 0, left: "auto" });
    }

    // Extra check: if dropdown would go off right edge
    const dropdownRight = containerRect.left + dropdownWidth;
    if (dropdownRight > viewportWidth - PADDING) {
      setDropdownStyle({ right: 0, left: "auto" });
    }
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "8px 16px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
          whiteSpace: "nowrap",
        }}
      >
        ⬇ Export
      </button>

      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "110%",
            ...dropdownStyle,
            background: "#1e1b4b",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: 8,
            minWidth: 150,
            zIndex: 999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {[
            { label: "📄 Export CSV",   action: () => exportCSV(data, filename) },
            { label: "📊 Export Excel", action: () => exportExcel(data, filename) },
            { label: "🖨 Export PDF",   action: () => exportTableAsPDF(data, filename, title) },
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
                whiteSpace: "nowrap",
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