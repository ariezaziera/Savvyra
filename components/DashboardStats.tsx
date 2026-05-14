import { StatItem } from "@/lib/dashboardData";

type DashboardStatsProps = {
  stats: StatItem[];
  formatCurrency: (amount: number) => string;
};

type BlobConfig = {
  width: string;
  height: string;
  color: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  blur: string;
  opacity: number;
  anim: string;
};

type CardConfig = {
  bg: string;
  border: string;
  shine: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  valueColor: string;
  blobs: BlobConfig[];
};

const CARD_CONFIG: Record<string, CardConfig> = {
  Balance: {
    bg: "linear-gradient(135deg, #E2D9FF 0%, #C4B5FD 100%)",
    border: "rgba(196,181,253,0.4)",
    shine: "rgba(255,255,255,0.5)",
    badgeBg: "rgba(255,255,255,0.25)",
    badgeBorder: "rgba(255,255,255,0.35)",
    badgeColor: "#3C2A8A",
    valueColor: "#2A1860",
    blobs: [
      { width: "220px", height: "220px", color: "#6A49FA", top: "-80px", right: "-60px", blur: "70px", opacity: 0.25, anim: "drift-a 13s ease-in-out infinite alternate" },
      { width: "120px", height: "120px", color: "#453284", bottom: "-40px", left: "30px", blur: "50px", opacity: 0.2, anim: "drift-b 9s ease-in-out infinite alternate" },
    ],
  },
  Income: {
    bg: "linear-gradient(135deg, #6A49FA 0%, #453284 100%)",
    border: "rgba(106,73,250,0.5)",
    shine: "rgba(255,255,255,0.15)",
    badgeBg: "rgba(255,255,255,0.12)",
    badgeBorder: "rgba(255,255,255,0.2)",
    badgeColor: "#E2D9FF",
    valueColor: "#fff",
    blobs: [
      { width: "160px", height: "160px", color: "#C4B5FD", top: "-60px", right: "-50px", blur: "55px", opacity: 0.35, anim: "drift-c 11s ease-in-out infinite alternate" },
      { width: "80px", height: "80px", color: "#E2D9FF", bottom: "-20px", left: "-20px", blur: "35px", opacity: 0.2, anim: "drift-a 7s ease-in-out infinite alternate" },
    ],
  },
  Expenses: {
    bg: "linear-gradient(135deg, #FEDADA 0%, #E8A0A0 100%)",
    border: "rgba(232,160,160,0.4)",
    shine: "rgba(255,255,255,0.45)",
    badgeBg: "rgba(255,255,255,0.25)",
    badgeBorder: "rgba(255,255,255,0.35)",
    badgeColor: "#7A1A1A",
    valueColor: "#2E0E0E",
    blobs: [
      { width: "180px", height: "130px", color: "#E8A0A0", top: "-55px", left: "-40px", blur: "60px", opacity: 0.4, anim: "drift-d 14s ease-in-out infinite alternate" },
      { width: "90px", height: "90px", color: "#6A49FA", bottom: "-30px", right: "10px", blur: "40px", opacity: 0.15, anim: "drift-c 8s ease-in-out infinite alternate" },
    ],
  },
  "Total Savings": {
    bg: "linear-gradient(135deg, #FFE8A6 0%, #E8C97A 100%)",
    border: "rgba(196,181,253,0.3)",
    shine: "rgba(255,255,255,0.18)",
    badgeBg: "rgba(255,255,255,0.12)",
    badgeBorder: "rgba(255,255,255,0.2)",
    badgeColor: "#7A1A1A",
    valueColor: "#2E0E0E",
    blobs: [
      { width: "200px", height: "150px", color: "#C4B5FD", top: "-70px", right: "80px", blur: "65px", opacity: 0.3, anim: "drift-b 16s ease-in-out infinite alternate" },
      { width: "100px", height: "100px", color: "#FEDADA", bottom: "-30px", right: "-20px", blur: "45px", opacity: 0.35, anim: "drift-a 10s ease-in-out infinite alternate" },
    ],
  },
};

const BLOB_ANIMATIONS = `
  @keyframes drift-a {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(18px, 22px) scale(1.08); }
  }
  @keyframes drift-b {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(-14px, 16px) scale(1.12); }
  }
  @keyframes drift-c {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(20px, -18px) scale(0.94); }
  }
  @keyframes drift-d {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(-16px, -20px) scale(1.06); }
  }
`;

export default function DashboardStats({ stats, formatCurrency }: DashboardStatsProps) {
  const savings  = stats.find((s) => s.label === "Total Savings")?.value ?? 0;
  const expenses = stats.find((s) => s.label === "Expenses")?.value ?? 0;
  const total    = savings + expenses;
  const savingsPct  = total ? Math.round((savings / total) * 100) : 0;
  const expensesPct = total ? Math.round((expenses / total) * 100) : 0;

  return (
    <>
      <style>{BLOB_ANIMATIONS}</style>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map(({ label, value }) => {
          const config = CARD_CONFIG[label] ?? CARD_CONFIG["Balance"];
          const isBalance = label === "Balance";
          const isLight = label === "Balance" || label === "Expenses";

          return (
            <div
              key={label}
              className={`relative overflow-hidden rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5 ${isBalance ? "sm:col-span-2" : ""}`}
              style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
                boxShadow: "0 16px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              {/* Top shine */}
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{ background: config.shine }}
              />

              {/* Individual blobs */}
              {config.blobs.map((blob, i) => (
                <div
                  key={i}
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    width: blob.width,
                    height: blob.height,
                    background: blob.color,
                    top: blob.top,
                    bottom: blob.bottom,
                    left: blob.left,
                    right: blob.right,
                    filter: `blur(${blob.blur})`,
                    opacity: blob.opacity,
                    animation: blob.anim,
                  }}
                />
              ))}

              {/* Badge */}
              <span
                className="relative z-10 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: config.badgeBg,
                  border: `1px solid ${config.badgeBorder}`,
                  color: config.badgeColor,
                }}
              >
                {label}
              </span>

              {/* Amount */}
              <h2
                className="relative z-10 mt-3 text-3xl font-bold tracking-tight"
                style={{ color: config.valueColor }}
              >
                {formatCurrency(value)}
              </h2>

              {/* Balance extras */}
              {isBalance && (
                <div className="relative z-10 mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: "rgba(42,24,96,0.6)" }}>Savings vs Expenses</span>
                    <span className="font-semibold" style={{ color: "rgba(42,24,96,0.85)" }}>
                      {savingsPct}% / {expensesPct}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(42,24,96,0.15)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${savingsPct}%`,
                        background: "linear-gradient(90deg, #6A49FA, #453284)",
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs" style={{ color: "rgba(42,24,96,0.55)" }}>
                    <span>Savings: {formatCurrency(savings)}</span>
                    <span>Expenses: {formatCurrency(expenses)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}