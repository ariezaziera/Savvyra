"use client";

import { useState, useRef } from "react";
import { importFromFile, downloadSampleCSV } from "@/lib/exportUtils";

type ImportedRow = {
  title:       string;
  amount:      string | number;
  type:        string;
  category:    string;
  date:        string;
  status?:     string;
  description?: string;
};

type Props = {
  onSuccess: () => void; // callback untuk refresh list lepas import
};

const VALID_TYPES = ["INCOME", "EXPENSE", "DEBT", "COMMITMENT", "SAVINGS", "INVESTMENT"];

export default function ImportTransactions({ onSuccess }: Props) {
  const [open, setOpen]         = useState(false);
  const [preview, setPreview]   = useState<ImportedRow[]>([]);
  const [errors, setErrors]     = useState<string[]>([]);
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState<"upload" | "preview" | "done">("upload");
  const fileRef                 = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrors([]);
    setPreview([]);

    try {
      const rows = await importFromFile(file) as ImportedRow[];

      // Validate setiap row
      const errs: string[] = [];
      rows.forEach((row, i) => {
        if (!row.title)                              errs.push(`Row ${i + 1}: Missing title`);
        if (!row.amount || isNaN(Number(row.amount))) errs.push(`Row ${i + 1}: Invalid amount`);
        if (!VALID_TYPES.includes(row.type?.toUpperCase())) errs.push(`Row ${i + 1}: Invalid type "${row.type}"`);
        if (!row.date)                               errs.push(`Row ${i + 1}: Missing date`);
      });

      if (errs.length > 0) {
        setErrors(errs);
        return;
      }

      setPreview(rows);
      setStep("preview");
    } catch (err: any) {
      setErrors([err.message]);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    const failed: string[] = [];

    for (const row of preview) {
      try {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title:       row.title,
            amount:      Number(row.amount),
            type:        row.type.toUpperCase(),
            category:    row.category || "Other",
            date:        new Date(row.date).toISOString(),
            status:      row.status || "Completed",
            description: row.description || "",
          }),
        });

        if (!res.ok) failed.push(row.title);
      } catch {
        failed.push(row.title);
      }
    }

    setLoading(false);

    if (failed.length > 0) {
      setErrors([`Failed to import: ${failed.join(", ")}`]);
    } else {
      setStep("done");
      onSuccess();
    }
  };

  const reset = () => {
    setStep("upload");
    setPreview([]);
    setErrors([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "8px 16px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        ⬆ Import
      </button>

      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { setOpen(false); reset(); }}}
        >
          <div style={{
            width: "90%", maxWidth: 520,
            background: "#1e1b4b",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 20, padding: 28,
            maxHeight: "80vh", overflowY: "auto",
          }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>
                Import Transactions
              </h2>
              <button
                onClick={() => { setOpen(false); reset(); }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 20 }}
              >
                ✕
              </button>
            </div>

            {/* STEP 1 — Upload */}
            {step === "upload" && (
              <>
                {/* Sample download */}
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12, padding: 14, marginBottom: 16,
                }}>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "0 0 8px" }}>
                    First time? Download the sample template:
                  </p>
                  <button
                    onClick={downloadSampleCSV}
                    style={{
                      padding: "6px 14px", borderRadius: 8,
                      border: "1px solid rgba(232,201,122,0.4)",
                      background: "rgba(232,201,122,0.1)",
                      color: "#E8C97A", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}
                  >
                    📥 Download Sample CSV
                  </button>
                </div>

                {/* File drop zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: "2px dashed rgba(255,255,255,0.15)",
                    borderRadius: 14, padding: "32px 20px",
                    textAlign: "center", cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📂</div>
                  <p style={{ color: "#fff", fontWeight: 600, margin: "0 0 4px" }}>
                    Click to upload file
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>
                    CSV or Excel (.xlsx) supported
                  </p>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />

                {/* Errors */}
                {errors.length > 0 && (
                  <div style={{
                    marginTop: 14, background: "rgba(255,80,80,0.1)",
                    border: "1px solid rgba(255,80,80,0.2)",
                    borderRadius: 10, padding: 12,
                  }}>
                    {errors.map((e, i) => (
                      <p key={i} style={{ color: "#ff8080", fontSize: 12, margin: "2px 0" }}>⚠ {e}</p>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* STEP 2 — Preview */}
            {step === "preview" && (
              <>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 14 }}>
                  {preview.length} transactions ready to import. Review before confirming:
                </p>

                <div style={{ overflowX: "auto", marginBottom: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr>
                        {["Title", "Amount", "Type", "Category", "Date"].map((h) => (
                          <th key={h} style={{
                            padding: "8px 10px", textAlign: "left",
                            color: "rgba(255,255,255,0.4)",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((row, i) => (
                        <tr key={i}>
                          <td style={{ padding: "8px 10px", color: "#fff" }}>{row.title}</td>
                          <td style={{ padding: "8px 10px", color: "#E8C97A" }}>RM {Number(row.amount).toFixed(2)}</td>
                          <td style={{ padding: "8px 10px", color: "rgba(255,255,255,0.6)" }}>{row.type}</td>
                          <td style={{ padding: "8px 10px", color: "rgba(255,255,255,0.6)" }}>{row.category}</td>
                          <td style={{ padding: "8px 10px", color: "rgba(255,255,255,0.6)" }}>{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 10 && (
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "center", marginTop: 8 }}>
                      ...and {preview.length - 10} more
                    </p>
                  )}
                </div>

                {errors.length > 0 && (
                  <div style={{
                    marginBottom: 14, background: "rgba(255,80,80,0.1)",
                    border: "1px solid rgba(255,80,80,0.2)",
                    borderRadius: 10, padding: 12,
                  }}>
                    {errors.map((e, i) => (
                      <p key={i} style={{ color: "#ff8080", fontSize: 12, margin: "2px 0" }}>⚠ {e}</p>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={reset}
                    style={{
                      flex: 1, height: 44, borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "transparent", color: "#fff",
                      cursor: "pointer", fontWeight: 600,
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={loading}
                    style={{
                      flex: 2, height: 44, borderRadius: 12, border: "none",
                      background: "linear-gradient(135deg,#E8A0A0,#E8C97A)",
                      color: "#453284", fontWeight: 700, cursor: "pointer",
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? "Importing..." : `Import ${preview.length} Transactions`}
                  </button>
                </div>
              </>
            )}

            {/* STEP 3 — Done */}
            {step === "done" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
                  Import Successful!
                </p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 24 }}>
                  {preview.length} transactions have been added.
                </p>
                <button
                  onClick={() => { setOpen(false); reset(); }}
                  style={{
                    padding: "10px 28px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg,#E8A0A0,#E8C97A)",
                    color: "#453284", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}