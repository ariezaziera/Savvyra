"use client";

import { useEffect, useRef, useState } from "react";
import PageContainer from "@/components/PageContainer";
import AddTransactionForm from "@/components/AddTransactionForm";
import { Trash2, Pencil, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import Toast from "@/components/Toast";
import DeleteTransactionModal from "@/components/DeleteTransactionModal";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import TransactionFilter, { DateFilter } from "@/components/TransactionFilter";
import { getIconForCategory } from "@/lib/categoryIcons";
import ExportMenu from "@/components/ExportMenu";
import ImportTransactions from "@/components/ImportTransactions";

ChartJS.register(ArcElement, Tooltip, Legend);

// ── Types ────────────────────────────────────────────────────────
type TransactionType =
  | "INCOME" | "EXPENSE" | "SAVINGS" | "INVESTMENT"
  | "DEBT_PAYMENT" | "DEBT_ADDITION" | "COMMITMENT";

type Transaction = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: TransactionType;
  note?: string | null;
  savingsGoalId?: string | null;
  investmentId?: string | null;
  debtId?: string | null;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  type: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// ── Constants ────────────────────────────────────────────────────
const TYPE_STYLE: Record<string, { bg: string; text: string; sub: string; badge: string; glow: string; sign: string }> = {
  INCOME:        { bg: "linear-gradient(135deg, #E2D9FF 0%, #C4B5FD 100%)", text: "#2B1059", sub: "rgba(43,16,89,0.55)",  badge: "rgba(43,16,89,0.12)",  glow: "rgba(196,181,253,0.22)", sign: "+" },
  EXPENSE:       { bg: "linear-gradient(135deg, #FEDADA 0%, #E8A0A0 100%)", text: "#4A1818", sub: "rgba(74,24,24,0.55)",  badge: "rgba(74,24,24,0.12)",  glow: "rgba(232,160,160,0.22)", sign: "−" },
  DEBT_PAYMENT:  { bg: "linear-gradient(135deg, #FFE8A6 0%, #E8C97A 100%)", text: "#4A3200", sub: "rgba(74,50,0,0.55)",   badge: "rgba(74,50,0,0.12)",   glow: "rgba(232,201,122,0.22)", sign: "−" },
  DEBT_ADDITION: { bg: "linear-gradient(135deg, #FFE8A6 0%, #E8C97A 100%)", text: "#4A3200", sub: "rgba(74,50,0,0.55)",   badge: "rgba(74,50,0,0.12)",   glow: "rgba(232,201,122,0.22)", sign: "+" },
  COMMITMENT:    { bg: "linear-gradient(135deg, #FFE8A6 0%, #E8C97A 100%)", text: "#4A3200", sub: "rgba(74,50,0,0.55)",   badge: "rgba(74,50,0,0.12)",   glow: "rgba(232,201,122,0.22)", sign: "−" },
  SAVINGS:       { bg: "linear-gradient(135deg, #D4F5E2 0%, #8EE3B5 100%)", text: "#0E3D22", sub: "rgba(14,61,34,0.55)",  badge: "rgba(14,61,34,0.12)",  glow: "rgba(142,227,181,0.22)", sign: "+" },
  INVESTMENT:    { bg: "linear-gradient(135deg, #C6E6FF 0%, #93C8F0 100%)", text: "#0E2A4A", sub: "rgba(14,42,74,0.55)",  badge: "rgba(14,42,74,0.12)",  glow: "rgba(147,200,240,0.22)", sign: "+" },
};

const CHART_COLORS = ["#C4B5FD","#E8A0A0","#93C8F0","#E8C97A","#E2D9FF","#6A49FA","#FEDADA","#C6E6FF"];

// ── Helpers ──────────────────────────────────────────────────────
const formatCurrency = (n: number) =>
  `RM ${n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });

function applyDateFilter(txs: Transaction[], f: DateFilter): Transaction[] {
  if (f.mode === "picker") {
    return txs.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === f.month && d.getFullYear() === f.year;
    });
  }
  const from = f.from ? new Date(f.from) : null;
  const to   = f.to   ? new Date(f.to)   : null;
  if (to) to.setHours(23, 59, 59, 999);
  return txs.filter((t) => {
    const d = new Date(t.date);
    if (from && d < from) return false;
    if (to   && d > to)   return false;
    return true;
  });
}

function toExportRows(txs: Transaction[]) {
  return txs.map((t) => ({
    Date:     formatDate(t.date),
    Title:    t.title,
    Category: t.category,
    Type:     t.type,
    Amount:   t.amount,
  }));
}

// ── Donut Panel ──────────────────────────────────────────────────
function DonutPanel({ transactions }: { transactions: Transaction[] }) {
  const expenses = transactions.filter((t) => t.type === "EXPENSE");
  const catMap: Record<string, number> = {};
  expenses.forEach((t) => { catMap[t.category] = (catMap[t.category] ?? 0) + t.amount; });
  const cats   = Object.keys(catMap);
  const vals   = cats.map((c) => catMap[c]);
  const total  = vals.reduce((a, b) => a + b, 0);
  const colors = cats.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  const donutData = {
    labels: cats,
    datasets: [{ data: vals, backgroundColor: colors, borderColor: "rgba(69,50,132,0.5)", borderWidth: 2, hoverOffset: 6 }],
  };
  const donutOptions = {
    responsive: true, maintainAspectRatio: true, cutout: "70%",
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${formatCurrency(ctx.raw as number)}` } } },
  } as const;

  return (
    <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(24px)", borderRadius: 24, padding: "20px 20px 18px" }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 16 }}>
        Spending by category
      </p>
      {cats.length > 0 ? (
        <div style={{ position: "relative", width: "100%", maxWidth: 200, margin: "0 auto 4px" }}>
          <Doughnut data={donutData} options={donutOptions} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>expenses</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", marginTop: 2 }}>{formatCurrency(total)}</span>
          </div>
        </div>
      ) : (
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>No expenses this period</p>
        </div>
      )}
      {cats.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 16 }}>
          {cats.map((cat, i) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i], flexShrink: 0 }} />
                {cat}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{formatCurrency(catMap[cat])}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "14px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Total transactions</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#C4B5FD" }}>{transactions.length}</span>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function TransactionsPage() {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery]   = useState("");
  const [typeFilter, setTypeFilter]     = useState("All Types");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [toast, setToast]               = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState<Pagination | null>(null);

  const now = new Date();
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    mode: "picker", month: now.getMonth(), year: now.getFullYear(), from: "", to: "",
  });

  const transactionsSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => { fetchTransactions(page); }, [page]);
  useEffect(() => { fetchCategories(); }, []);

  const fetchTransactions = async (p = page) => {
    try {
      setIsLoading(true);
      const res  = await fetch(`/api/transactions?page=${p}`);
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch {
      showToast("Failed to load transactions.", "error");
      setTransactions([]);
    } finally { setIsLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res  = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch { setCategories([]); }
  };

  const getCategoryIcon = (categoryName: string, type: string) => {
    const match = categories.find((c) => c.name === categoryName && c.type === type);
    return match?.icon ?? getIconForCategory(categoryName, type);
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const scrollToTransactions = () =>
    transactionsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleTransactionSaved = () => { setPage(1); fetchTransactions(1); fetchCategories(); };

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    const res = await fetch("/api/transactions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: transactionToDelete.id }),
    });
    if (!res.ok) { showToast("Failed to delete.", "error"); return; }
    setTransactionToDelete(null);
    showToast("Transaction deleted.");
    setPage(1);
    fetchTransactions(1);
    scrollToTransactions();
  };

  // Derived
  const periodFiltered = applyDateFilter(transactions, dateFilter);
  const totalIncome    = periodFiltered.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpenses  = periodFiltered.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const filteredTransactions = periodFiltered.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType   = typeFilter === "All Types" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <PageContainer>
      <>
        {/* Header */}
        <div className="relative z-10 mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Financial Activity</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Transactions</h1>
          <p className="mt-1.5 text-sm text-white/50">Track your income and expenses in one place.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} className="relative z-10 space-y-5">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Total Transactions", value: pagination ? String(pagination.total) : String(periodFiltered.length), bg: "linear-gradient(135deg, #E2D9FF 0%, #C4B5FD 100%)", glow: "rgba(196,181,253,0.25)", text: "#2D1B6B", icon: <Receipt size={17} color="#2D1B6B" /> },
              { label: "Total Income",       value: formatCurrency(totalIncome),   bg: "linear-gradient(135deg, #D4F5E2 0%, #8EE3B5 100%)", glow: "rgba(142,227,181,0.25)", text: "#0E3D22", icon: <TrendingUp size={17} color="#0E3D22" /> },
              { label: "Total Expenses",     value: formatCurrency(totalExpenses), bg: "linear-gradient(135deg, #FEDADA 0%, #E8A0A0 100%)", glow: "rgba(232,160,160,0.25)", text: "#4A1818", icon: <TrendingDown size={17} color="#4A1818" /> },
            ].map(({ label, value, bg, glow, text, icon }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="relative overflow-hidden rounded-3xl p-6" style={{ background: bg, boxShadow: `0 12px 40px ${glow}` }}>
                <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
                <div className="relative z-10 mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/30">{icon}</div>
                <p className="relative z-10 text-xs font-medium uppercase tracking-wide" style={{ color: `${text}99` }}>{label}</p>
                <h2 className="relative z-10 mt-1.5 text-3xl font-bold tracking-tight" style={{ color: text }}>{value}</h2>
              </motion.div>
            ))}
          </div>

          {/* Add Transaction Form */}
          <div className="relative overflow-hidden rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(24px)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}>
            <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
            <AddTransactionForm
              onTransactionSaved={handleTransactionSaved}
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
              onShowToast={showToast}
              onScrollToTransactions={scrollToTransactions}
            />
          </div>

          {/* Filter bar */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
              <p className="text-sm text-white/45">A quick overview of your latest activity</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <TransactionFilter value={dateFilter} onChange={setDateFilter} />
              <ImportTransactions onSuccess={handleTransactionSaved} />
              <ExportMenu data={toExportRows(filteredTransactions)} filename="transactions" title="Transaction History" />
            </div>
          </div>

          {/* Two-column layout */}
          <section ref={transactionsSectionRef} className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] items-start">
            {/* Donut */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <DonutPanel transactions={periodFiltered} />
            </motion.div>

            {/* List */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
              {/* Search + type filter */}
              <div className="mb-3 flex flex-col gap-3 sm:flex-row">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title or category…"
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }} />
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <option value="All Types"     style={{ background: "#2B1E59" }}>All Types</option>
                  <option value="INCOME"        style={{ background: "#2B1E59" }}>Income</option>
                  <option value="EXPENSE"       style={{ background: "#2B1E59" }}>Expense</option>
                  <option value="SAVINGS"       style={{ background: "#2B1E59" }}>Savings</option>
                  <option value="INVESTMENT"    style={{ background: "#2B1E59" }}>Investment</option>
                  <option value="DEBT_PAYMENT"  style={{ background: "#2B1E59" }}>Debt Payment</option>
                  <option value="DEBT_ADDITION" style={{ background: "#2B1E59" }}>Debt Addition</option>
                  <option value="COMMITMENT"    style={{ background: "#2B1E59" }}>Commitment</option>
                </select>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-3">
                {[
                  { label: "Income",        bg: "linear-gradient(135deg,#E2D9FF,#C4B5FD)" },
                  { label: "Expense",       bg: "linear-gradient(135deg,#FEDADA,#E8A0A0)" },
                  { label: "Savings",       bg: "linear-gradient(135deg,#D4F5E2,#8EE3B5)" },
                  { label: "Investment",    bg: "linear-gradient(135deg,#C6E6FF,#93C8F0)" },
                  { label: "Debt Payment",  bg: "linear-gradient(135deg,#FFE8A6,#E8C97A)" },
                  { label: "Commitment",    bg: "linear-gradient(135deg,#FFE8A6,#E8C97A)" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: l.bg }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)" }}>{l.label}</span>
                  </div>
                ))}
              </div>

              {isLoading && <p className="py-12 text-center text-sm text-white/40">Loading transactions...</p>}
              {!isLoading && filteredTransactions.length === 0 && (
                <p className="py-12 text-center text-sm text-white/40">No transactions found.</p>
              )}

              {/* Mobile cards */}
              {!isLoading && (
                <div className="flex flex-col gap-3 md:hidden">
                  {filteredTransactions.map((item, i) => {
                    const s    = TYPE_STYLE[item.type] ?? TYPE_STYLE["EXPENSE"];
                    const icon = getCategoryIcon(item.category, item.type);
                    return (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="relative overflow-hidden rounded-2xl px-4 py-4"
                        style={{ background: s.bg, boxShadow: `0 6px 24px ${s.glow}` }}>
                        <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                              {icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-bold" style={{ color: s.text }}>{item.title}</p>
                              <p className="text-xs mt-0.5" style={{ color: s.sub }}>{item.category} · {formatDate(item.date)}</p>
                              <span className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: s.badge, color: s.text }}>{item.type.replace("_", " ")}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-extrabold" style={{ color: s.text }}>{s.sign}{formatCurrency(item.amount)}</p>
                            <div className="mt-2 flex gap-1 justify-end">
                              <button onClick={() => setEditingTransaction(item)} className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.30)", color: s.text }}><Pencil size={13} /></button>
                              <button onClick={() => setTransactionToDelete(item)} className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.30)", color: s.text }}><Trash2 size={13} /></button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Desktop rows */}
              {!isLoading && filteredTransactions.length > 0 && (
                <div className="hidden md:flex flex-col gap-2">
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1.2fr 0.8fr", padding: "0 16px", marginBottom: 4 }}>
                    {["Title","Category","Date","Type","Amount","Actions"].map((h, i) => (
                      <div key={h} style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.8px", textTransform: "uppercase", textAlign: i === 0 ? "left" : "center" }}>{h}</div>
                    ))}
                  </div>
                  {filteredTransactions.map((item, i) => {
                    const s    = TYPE_STYLE[item.type] ?? TYPE_STYLE["EXPENSE"];
                    const icon = getCategoryIcon(item.category, item.type);
                    return (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1.2fr 0.8fr", alignItems: "center", background: s.bg, borderRadius: 16, padding: "12px 16px", boxShadow: `0 4px 16px ${s.glow}`, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", inset: "0 0 auto", height: 1, background: "rgba(255,255,255,0.40)" }} />
                        <div style={{ fontWeight: 700, fontSize: 13, color: s.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{item.title}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{icon}</div>
                          <span style={{ fontSize: 12, color: s.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.category}</span>
                        </div>
                        <div style={{ fontSize: 12, color: s.sub, textAlign: "center" }}>{formatDate(item.date)}</div>
                        <div style={{ textAlign: "center" }}>
                          <span style={{ background: s.badge, color: s.text, fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "3px 10px" }}>{item.type.replace("_", " ")}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: s.text, textAlign: "center" }}>{s.sign}{formatCurrency(item.amount)}</div>
                        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                          <button onClick={() => setEditingTransaction(item)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.30)", color: s.text, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Pencil size={13} /></button>
                          <button onClick={() => setTransactionToDelete(item)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.30)", color: s.text, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Trash2 size={13} /></button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination && !isLoading && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                    Page {pagination.page} of {pagination.totalPages} · {pagination.total} transactions
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage((p) => p - 1)} disabled={!pagination.hasPrev}
                      style={{ padding: "6px 14px", borderRadius: 12, fontSize: 12, fontWeight: 500, border: "1px solid rgba(255,255,255,0.08)", background: pagination.hasPrev ? "rgba(196,181,253,0.15)" : "rgba(255,255,255,0.05)", color: pagination.hasPrev ? "#C4B5FD" : "rgba(255,255,255,0.2)", cursor: pagination.hasPrev ? "pointer" : "not-allowed" }}>
                      ← Previous
                    </button>
                    <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNext}
                      style={{ padding: "6px 14px", borderRadius: 12, fontSize: 12, fontWeight: 500, border: "1px solid rgba(255,255,255,0.08)", background: pagination.hasNext ? "rgba(196,181,253,0.15)" : "rgba(255,255,255,0.05)", color: pagination.hasNext ? "#C4B5FD" : "rgba(255,255,255,0.2)", cursor: pagination.hasNext ? "pointer" : "not-allowed" }}>
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </section>
        </motion.div>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <DeleteTransactionModal transaction={transactionToDelete} formatCurrency={formatCurrency} onCancel={() => setTransactionToDelete(null)} onConfirm={handleDelete} />
      </>
    </PageContainer>
  );
}