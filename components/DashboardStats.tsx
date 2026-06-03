import { formatCurrency } from "@/lib/formatCurrency";

type StatItem = { label: string; value: number; color?: string };

type Props = {
  stats: StatItem[];
  formatCurrency: (n: number) => string;
  netWorth?: number;
};

const BLOB_ANIMATIONS = `
  @keyframes drift-a { from{transform:translate(0,0) scale(1)} to{transform:translate(18px,22px) scale(1.08)} }
  @keyframes drift-b { from{transform:translate(0,0) scale(1)} to{transform:translate(-14px,16px) scale(1.12)} }
  @keyframes drift-c { from{transform:translate(0,0) scale(1)} to{transform:translate(20px,-18px) scale(0.94)} }
  @keyframes drift-d { from{transform:translate(0,0) scale(1)} to{transform:translate(-16px,-20px) scale(1.06)} }
`;

export default function DashboardStats({ stats, netWorth = 0 }: Props) {
  const income   = stats.find((s) => s.label === "Income")?.value   ?? 0;
  const expenses = stats.find((s) => s.label === "Expenses")?.value ?? 0;
  const savings  = stats.find((s) => s.label === "Total Savings")?.value ?? 0;

  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

  return (
    <>
      <style>{BLOB_ANIMATIONS}</style>

      {/* Net Worth hero card */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5 mb-4"
        style={{
          background: "linear-gradient(135deg, #E2D9FF 0%, #C4B5FD 100%)",
          border: "1px solid rgba(196,181,253,0.4)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "rgba(255,255,255,0.5)" }} />
        <div className="pointer-events-none absolute rounded-full" style={{ width:"220px",height:"220px",background:"#6A49FA",top:"-80px",right:"-60px",filter:"blur(70px)",opacity:0.25,animation:"drift-a 13s ease-in-out infinite alternate" }} />
        <div className="pointer-events-none absolute rounded-full" style={{ width:"120px",height:"120px",background:"#453284",bottom:"-40px",left:"30px",filter:"blur(50px)",opacity:0.2,animation:"drift-b 9s ease-in-out infinite alternate" }} />

        <span className="relative z-10 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ background:"rgba(255,255,255,0.25)",border:"1px solid rgba(255,255,255,0.35)",color:"#3C2A8A" }}>
          Net Worth
        </span>
        <h2 className="relative z-10 mt-3 text-3xl font-bold tracking-tight" style={{ color: "#2A1860" }}>
          {formatCurrency(netWorth)}
        </h2>
        <p className="relative z-10 mt-1 text-xs" style={{ color: "rgba(42,24,96,0.55)" }}>
          Savings + Investments − Debts
        </p>

        {/* Income/Expense bar */}
        <div className="relative z-10 mt-4 space-y-1.5">
          <div className="flex justify-between text-xs" style={{ color: "rgba(42,24,96,0.6)" }}>
            <span>Savings rate</span>
            <span className="font-semibold" style={{ color: "rgba(42,24,96,0.85)" }}>{savingsRate}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(42,24,96,0.15)" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width:`${Math.min(savingsRate,100)}%`, background:"linear-gradient(90deg,#6A49FA,#453284)" }} />
          </div>
          <div className="flex justify-between text-xs" style={{ color: "rgba(42,24,96,0.5)" }}>
            <span>Income {formatCurrency(income)}</span>
            <span>Expenses {formatCurrency(expenses)}</span>
          </div>
        </div>
      </div>

      {/* 3 smaller stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Income",        value:income,   bg:"linear-gradient(135deg,#6A49FA 0%,#453284 100%)", border:"rgba(106,73,250,0.5)", valueColor:"#fff",    badgeColor:"#E2D9FF", badgeBg:"rgba(255,255,255,0.12)", badgeBorder:"rgba(255,255,255,0.2)" },
          { label:"Expenses",      value:expenses, bg:"linear-gradient(135deg,#FEDADA 0%,#E8A0A0 100%)", border:"rgba(232,160,160,0.4)", valueColor:"#2E0E0E", badgeColor:"#7A1A1A", badgeBg:"rgba(255,255,255,0.25)", badgeBorder:"rgba(255,255,255,0.35)" },
          { label:"Total Savings", value:savings,  bg:"linear-gradient(135deg,#FFE8A6 0%,#E8C97A 100%)", border:"rgba(196,181,253,0.3)", valueColor:"#2E0E0E", badgeColor:"#7A1A1A", badgeBg:"rgba(255,255,255,0.25)", badgeBorder:"rgba(255,255,255,0.35)" },
        ].map(({ label, value, bg, border, valueColor, badgeColor, badgeBg, badgeBorder }) => (
          <div key={label} className="relative overflow-hidden rounded-3xl p-4 transition-all hover:-translate-y-0.5"
            style={{ background: bg, border: `1px solid ${border}`, boxShadow: "0 10px 32px rgba(0,0,0,0.45)" }}>
            <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
            <span className="relative z-10 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
              style={{ background: badgeBg, border: `1px solid ${badgeBorder}`, color: badgeColor }}>
              {label === "Total Savings" ? "Savings" : label}
            </span>
            <p className="relative z-10 mt-2 text-lg font-bold leading-tight" style={{ color: valueColor }}>
              {formatCurrency(value)}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
