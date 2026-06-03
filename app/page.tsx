"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/formatCurrency";
import ExpenseCategoryChart from "@/components/ExpenseCategoryChart";
import IncomeExpenseBarChart from "@/components/IncomeExpenseBarChart";
import MonthlyTrendChart from "@/components/MonthlyTrendChart";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import DashboardStats from "@/components/DashboardStats";
import SavingsGoalsCarousel from "@/components/SavingsGoalsCarousel";
import CommitmentsWidget from "@/components/dashboard/CommitmentsWidget";
import DebtWidget from "@/components/dashboard/DebtWidget";
import InvestmentsWidget from "@/components/dashboard/InvestmentsWidget";
import QuickActions from "@/components/QuickActions";
import NotificationBell from "@/components/NotificationBell";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, CalendarDays } from "lucide-react";

type DashboardData = {
  balance: number; income: number; expenses: number; savings: number;
  netWorth: number;
  expenseByCategory: { name: string; value: number }[];
  incomeExpenseSummary: { name: string; income: number; expenses: number }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
  goals: any[];
  debt: {
    totalRemaining: number; totalOriginal: number; paidPct: number;
    monthlyRepayment: number; nextPayment: any; count: number;
  };
  commitments: {
    total: number; paid: number; unpaid: number; overdue: number;
    totalAmount: number; paidAmount: number; nextDue: any; overdueList: any[];
  };
  investments: {
    totalInvested: number; totalCurrentValue: number;
    gainLoss: number; gainLossPct: number; count: number;
  };
  salary: { basicSalary: number | null; nextSalaryDate: string | null; salaryDay: number | null };
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
function getFirstName(name: string | null | undefined) {
  if (!name) return "there";
  return name.split(" ")[0];
}
function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
}

export default function Home() {
  const { user } = useUser();
  const [data, setData]         = useState<DashboardData | null>(null);
  const [goals, setGoals]       = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [toast, setToast]       = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => { setGreeting(getGreeting()); }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [dashRes, goalsRes] = await Promise.all([fetch("/api/dashboard"), fetch("/api/savings-goals")]);
        const dashData  = await dashRes.json();
        const goalsData = await goalsRes.json();
        setData(dashData);
        setGoals(Array.isArray(goalsData) ? goalsData : []);

        // Goal completion toast
        (Array.isArray(goalsData) ? goalsData : []).forEach((g: any) => {
          const pct = g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 0;
          const key = `savvyra-goal-completed-${g.id}`;
          if (pct >= 1 && !localStorage.getItem(key)) {
            showToast(`${g.name} completed 🎉`);
            localStorage.setItem(key, "true");
          }
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const stats = data ? [
    { label: "Income",        value: data.income   },
    { label: "Expenses",      value: data.expenses },
    { label: "Total Savings", value: data.savings  },
  ] : [];

  const salaryDaysLeft = data?.salary.nextSalaryDate ? daysUntil(data.salary.nextSalaryDate) : null;

  return (
    <PageContainer>
      <div className="blob blob-1"/><div className="blob blob-2"/><div className="blob blob-3"/>
      <style>{`
        .blob{position:fixed;border-radius:9999px;pointer-events:none;z-index:0;will-change:transform}
        .blob-1{width:600px;height:600px;background:#6a49fa;top:-200px;left:-200px;filter:blur(140px);opacity:.55;animation:blob-drift-1 14s ease-in-out infinite alternate}
        .blob-2{width:500px;height:500px;background:#c6e6ff;bottom:-120px;right:-120px;filter:blur(130px);opacity:.25;animation:blob-drift-2 18s ease-in-out infinite alternate}
        .blob-3{width:480px;height:480px;background:#fedada;bottom:5%;right:5%;filter:blur(120px);opacity:.38;animation:blob-drift-3 12s ease-in-out infinite alternate}
        @keyframes blob-drift-1{from{transform:translate(0,0) scale(1)}to{transform:translate(50px,70px) scale(1.15)}}
        @keyframes blob-drift-2{from{transform:translate(0,0) scale(1)}to{transform:translate(-60px,-50px) scale(1.10)}}
        @keyframes blob-drift-3{from{transform:translate(0,0) scale(1)}to{transform:translate(40px,-60px) scale(0.92)}}
      `}</style>

      {toast && <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">{toast}</div>}

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 md:hidden">
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center justify-center h-10 w-10 rounded-2xl border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-all backdrop-blur-xl">
              <LogOut size={18} />
            </button>
            <NotificationBell />
            <Link href="/profile">
              <div className="relative group">
                {user?.image
                  ? <img src={user.image} alt="" className="h-10 w-10 rounded-full object-cover border-2 border-white/20"/>
                  : <div className="h-10 w-10 rounded-full flex items-center justify-center border-2 border-white/20 bg-linear-to-br from-[#6A49FA] to-[#C4B5FD]"><span className="text-sm font-bold text-white">{getFirstName(user?.name)?.[0]?.toUpperCase() ?? "?"}</span></div>}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#8EE3B5] border-2 border-[#1a1035]"/>
              </div>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Personal Finance Overview</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">{greeting || "Hello"}, {getFirstName(user?.name)} 👋</h1>
              <p className="mt-1.5 text-sm text-white/50">Here's your financial snapshot for today.</p>
            </div>
            <div className="hidden md:flex items-center gap-3 mt-2 shrink-0">
              <NotificationBell />
              <Link href="/profile">
                <div className="relative group">
                  {user?.image
                    ? <img src={user.image} alt="" className="h-11 w-11 rounded-full object-cover border-2 border-white/20"/>
                    : <div className="h-11 w-11 rounded-full flex items-center justify-center border-2 border-white/20 bg-linear-to-br from-[#6A49FA] to-[#C4B5FD]"><span className="text-base font-bold text-white">{getFirstName(user?.name)?.[0]?.toUpperCase() ?? "?"}</span></div>}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#8EE3B5] border-2 border-[#1a1035]"/>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? <DashboardSkeleton /> : (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45, ease:"easeOut" }} className="space-y-5">

            {/* Quick Actions */}
            <QuickActions />

            {/* Net Worth + Stats */}
            <DashboardStats stats={stats} formatCurrency={formatCurrency} netWorth={data?.netWorth ?? 0} />

            {/* Salary next payday banner — only show if configured */}
            {salaryDaysLeft !== null && salaryDaysLeft <= 7 && (
              <Link href="/salary">
                <div className="flex items-center gap-3 rounded-2xl border border-[#8EE3B5]/25 bg-[#8EE3B5]/8 px-4 py-3 transition hover:bg-[#8EE3B5]/15">
                  <CalendarDays size={16} className="text-[#8EE3B5] shrink-0"/>
                  <p className="text-sm text-[#8EE3B5] font-medium">
                    {salaryDaysLeft === 0 ? "Salary day today! 🎉" : `Salary in ${salaryDaysLeft} day${salaryDaysLeft === 1 ? "" : "s"} 💰`}
                  </p>
                </div>
              </Link>
            )}

            {/* Commitments + Debt side by side on larger screens */}
            {data && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CommitmentsWidget data={data.commitments} />
                <DebtWidget data={data.debt} />
              </div>
            )}

            {/* Investments */}
            {data && data.investments.count > 0 && (
              <InvestmentsWidget data={data.investments} />
            )}

            {/* Savings Goals */}
            <div className="-mx-1 px-1 py-1">
              <SavingsGoalsCarousel goals={goals} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
                <ExpenseCategoryChart data={data?.expenseByCategory ?? []} />
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
                <IncomeExpenseBarChart data={data?.incomeExpenseSummary ?? []} />
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15"/>
              <MonthlyTrendChart data={data?.monthlyTrend ?? []} />
            </div>

          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}
