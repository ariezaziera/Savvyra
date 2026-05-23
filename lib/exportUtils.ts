import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import Papa from "papaparse";

// ── Helper: replace oklch/oklab/color-mix + force black text ──
function sanitizeColors(element: HTMLElement) {
  const allEls = element.querySelectorAll<HTMLElement>("*");
  const targets = [element, ...Array.from(allEls)];

  const bgProps = [
    "backgroundColor",
    "borderColor",
    "borderTopColor",
    "borderBottomColor",
    "borderLeftColor",
    "borderRightColor",
    "outlineColor",
    "fill",
    "stroke",
  ];

  targets.forEach((el) => {
    const computed = window.getComputedStyle(el);

    // Force all text to black
    el.style.color = "#000000";

    // Sanitize background & border colors
    bgProps.forEach((prop) => {
      const value = computed.getPropertyValue(
        prop.replace(/([A-Z])/g, "-$1").toLowerCase()
      );

      if (
        value &&
        (value.includes("oklab") ||
          value.includes("oklch") ||
          value.includes("color-mix") ||
          value.includes("color("))
      ) {
        (el.style as any)[prop] = "transparent";
      }
    });
  });
}

// ── CHART — export sebagai PNG (with margin) ──
export async function exportChartAsImage(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const MARGIN = 24; // px margin kiri kanan atas bawah

  const chartCanvas = await html2canvas(element, {
    backgroundColor: null,
    useCORS: true,
    logging: false,
    onclone: (_clonedDoc, clonedEl) => {
      sanitizeColors(clonedEl as HTMLElement);
    },
  });

  // Buat canvas baru dengan margin
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width  = chartCanvas.width  + MARGIN * 2;
  finalCanvas.height = chartCanvas.height + MARGIN * 2;

  const ctx = finalCanvas.getContext("2d")!;
  // Background transparent — draw chart dengan offset (margin)
  ctx.drawImage(chartCanvas, MARGIN, MARGIN);

  const link    = document.createElement("a");
  link.download = `${filename}.png`;
  link.href     = finalCanvas.toDataURL("image/png");
  link.click();
}

// ── CHART — export sebagai PDF (with margin) ──
export async function exportChartAsPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const MARGIN_MM = 10; // mm margin dalam PDF

  const chartCanvas = await html2canvas(element, {
    backgroundColor: null,
    useCORS: true,
    logging: false,
    onclone: (_clonedDoc, clonedEl) => {
      sanitizeColors(clonedEl as HTMLElement);
    },
  });

  const imgData  = chartCanvas.toDataURL("image/png");
  const pdf      = new jsPDF("landscape", "mm", "a4");
  const pageW    = pdf.internal.pageSize.getWidth();
  const pageH    = pdf.internal.pageSize.getHeight();

  const availW   = pageW - MARGIN_MM * 2;
  const availH   = pageH - MARGIN_MM * 2;

  // Scale image to fit within available space, preserving aspect ratio
  const imgRatio  = chartCanvas.width / chartCanvas.height;
  const availRatio = availW / availH;

  let drawW: number;
  let drawH: number;

  if (imgRatio > availRatio) {
    drawW = availW;
    drawH = availW / imgRatio;
  } else {
    drawH = availH;
    drawW = availH * imgRatio;
  }

  // Center within margins
  const offsetX = MARGIN_MM + (availW - drawW) / 2;
  const offsetY = MARGIN_MM + (availH - drawH) / 2;

  pdf.addImage(imgData, "PNG", offsetX, offsetY, drawW, drawH);
  pdf.save(`${filename}.pdf`);
}

// ── DATA — export sebagai CSV ──
export function exportCSV(data: object[], filename: string) {
  const csv  = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href     = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ── DATA — export sebagai Excel ──
export function exportExcel(
  data: object[],
  filename: string,
  sheetName = "Data"
) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ── DATA — export sebagai PDF (table) ──
export async function exportTableAsPDF(
  data: object[],
  filename: string,
  title: string
) {
  const pdf  = new jsPDF("landscape", "mm", "a4");
  const cols = Object.keys(data[0] ?? {});
  const rows = data.map((row) =>
    cols.map((col) => String((row as any)[col] ?? ""))
  );

  pdf.setFontSize(16);
  pdf.text(title, 14, 15);
  pdf.setFontSize(10);

  const startY    = 25;
  const colWidth  = (pdf.internal.pageSize.getWidth() - 28) / cols.length;
  const rowHeight = 8;

  // Header row
  pdf.setFillColor(72, 52, 132);
  pdf.rect(14, startY, pdf.internal.pageSize.getWidth() - 28, rowHeight, "F");
  pdf.setTextColor(255, 255, 255);
  cols.forEach((col, i) => {
    pdf.text(col, 14 + i * colWidth + 2, startY + 5.5);
  });

  // Data rows
  pdf.setTextColor(30, 30, 30);
  rows.forEach((row, rowIdx) => {
    const y = startY + rowHeight * (rowIdx + 1);
    if (rowIdx % 2 === 0) {
      pdf.setFillColor(245, 245, 250);
      pdf.rect(14, y, pdf.internal.pageSize.getWidth() - 28, rowHeight, "F");
    }
    row.forEach((cell, colIdx) => {
      pdf.text(cell.substring(0, 20), 14 + colIdx * colWidth + 2, y + 5.5);
    });
  });

  pdf.save(`${filename}.pdf`);
}

// ── IMPORT — parse CSV/Excel ──
export async function importFromFile(file: File): Promise<object[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "csv") {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => resolve(result.data as object[]),
        error: (err) => reject(err),
      });
    });
  }

  if (ext === "xlsx" || ext === "xls") {
    const buffer = await file.arrayBuffer();
    const wb     = XLSX.read(buffer, { type: "array" });
    const ws     = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws);
  }

  throw new Error("Unsupported file format. Please use CSV or Excel.");
}

// ── SAMPLE CSV untuk import transaksi ──
export function downloadSampleCSV() {
  const sample = [
    {
      title:       "Salary March",
      amount:      3500,
      type:        "INCOME",
      category:    "Salary",
      date:        "2026-03-01",
      status:      "Completed",
      description: "Monthly salary",
    },
    {
      title:       "Groceries",
      amount:      120.5,
      type:        "EXPENSE",
      category:    "Food & Drinks",
      date:        "2026-03-05",
      status:      "Completed",
      description: "Weekly groceries",
    },
    {
      title:       "Netflix",
      amount:      17,
      type:        "EXPENSE",
      category:    "Entertainment",
      date:        "2026-03-10",
      status:      "Completed",
      description: "",
    },
  ];

  exportCSV(sample, "savvyra_transaction_sample");
}

// ── DASHBOARD — export Summary PDF ──
export async function exportDashboardPDF(
  data: {
    balance: number;
    income: number;
    expenses: number;
    savings: number;
    expenseByCategory: { name: string; value: number }[];
    incomeExpenseSummary: { name: string; income: number; expenses: number }[];
    monthlyTrend: { month: string; income: number; expenses: number }[];
  },
  userName: string
) {
  const pdf = new jsPDF("portrait", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const now = new Date().toLocaleDateString("en-MY", {
    day: "2-digit", month: "long", year: "numeric",
  });

  let y = 0;

  // ── Header band ──
  pdf.setFillColor(42, 28, 89);
  pdf.rect(0, 0, pageW, 38, "F");

  pdf.setFontSize(18);
  pdf.setTextColor(196, 181, 253);
  pdf.setFont("helvetica", "bold");
  pdf.text("Savvyra", 14, 16);

  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "normal");
  pdf.text("Financial Summary Report", 14, 25);
  pdf.text(`Generated: ${now}  ·  ${userName}`, 14, 32);

  y = 48;

  // ── KPI Cards row ──
  const kpis = [
    { label: "Balance",       value: data.balance,  color: [196, 181, 253] as [number,number,number] },
    { label: "Income",        value: data.income,   color: [142, 227, 181] as [number,number,number] },
    { label: "Expenses",      value: data.expenses, color: [255, 140, 140] as [number,number,number] },
    { label: "Total Savings", value: data.savings,  color: [226, 217, 255] as [number,number,number] },
  ];

  const cardW = (pageW - 28 - 9) / 4; // 14mm margin each side, 3px gap
  kpis.forEach((kpi, i) => {
    const x = 14 + i * (cardW + 3);

    // Card bg
    pdf.setFillColor(245, 243, 255);
    pdf.roundedRect(x, y, cardW, 22, 3, 3, "F");

    // Accent bar top
    pdf.setFillColor(...kpi.color);
    pdf.roundedRect(x, y, cardW, 3, 1.5, 1.5, "F");

    // Label
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 80, 160);
    pdf.setFont("helvetica", "normal");
    pdf.text(kpi.label.toUpperCase(), x + 4, y + 9);

    // Value
    pdf.setFontSize(10);
    pdf.setTextColor(42, 28, 89);
    pdf.setFont("helvetica", "bold");
    const formatted = `RM ${kpi.value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    pdf.text(formatted, x + 4, y + 18, { maxWidth: cardW - 6 });
  });

  y += 30;

  // ── Section: Expense by Category ──
  if (data.expenseByCategory.length > 0) {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(42, 28, 89);
    pdf.text("Spending by Category", 14, y);
    y += 6;

    // Header row
    pdf.setFillColor(72, 52, 132);
    pdf.rect(14, y, pageW - 28, 7, "F");
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.text("Category", 18, y + 5);
    pdf.text("Amount (RM)", pageW - 50, y + 5);
    y += 7;

    const total = data.expenseByCategory.reduce((s, c) => s + c.value, 0);
    data.expenseByCategory.forEach((cat, i) => {
      if (i % 2 === 0) {
        pdf.setFillColor(245, 243, 255);
        pdf.rect(14, y, pageW - 28, 7, "F");
      }
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(42, 28, 89);
      pdf.text(cat.name, 18, y + 5);

      const pct = total > 0 ? ` (${((cat.value / total) * 100).toFixed(1)}%)` : "";
      const valStr = `RM ${cat.value.toLocaleString("en-MY", { minimumFractionDigits: 2 })}${pct}`;
      pdf.text(valStr, pageW - 50, y + 5);
      y += 7;
    });

    y += 6;
  }

  // ── Section: Monthly Trend ──
  if (data.monthlyTrend.length > 0) {
    // Page break check
    if (y > 220) { pdf.addPage(); y = 20; }

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(42, 28, 89);
    pdf.text("Monthly Trend", 14, y);
    y += 6;

    // Header
    pdf.setFillColor(72, 52, 132);
    pdf.rect(14, y, pageW - 28, 7, "F");
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.text("Month", 18, y + 5);
    pdf.text("Income (RM)", 80, y + 5);
    pdf.text("Expenses (RM)", 130, y + 5);
    pdf.text("Net (RM)", pageW - 45, y + 5);
    y += 7;

    data.monthlyTrend.forEach((row, i) => {
      if (i % 2 === 0) {
        pdf.setFillColor(245, 243, 255);
        pdf.rect(14, y, pageW - 28, 7, "F");
      }
      const net = row.income - row.expenses;
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(42, 28, 89);
      pdf.text(row.month, 18, y + 5);
      pdf.text(row.income.toLocaleString("en-MY", { minimumFractionDigits: 2 }), 80, y + 5);
      pdf.text(row.expenses.toLocaleString("en-MY", { minimumFractionDigits: 2 }), 130, y + 5);

      // Net — colour coded
      net >= 0
        ? pdf.setTextColor(14, 61, 34)
        : pdf.setTextColor(74, 24, 24);
      pdf.text((net >= 0 ? "+" : "") + net.toLocaleString("en-MY", { minimumFractionDigits: 2 }), pageW - 45, y + 5);
      y += 7;
    });
  }

  // ── Footer ──
  pdf.setFontSize(7.5);
  pdf.setTextColor(160, 150, 190);
  pdf.setFont("helvetica", "normal");
  pdf.text("Generated by Savvyra · savvyra.app", 14, pdf.internal.pageSize.getHeight() - 8);

  pdf.save(`savvyra-dashboard-${now.replace(/ /g, "-")}.pdf`);
}