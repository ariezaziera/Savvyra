"use client";

import { useRef, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
};

const PALETTE: {
  bg: string;
  text: string;
  muted: string;
  track: string;
  chart: string;
}[] = [
  { bg: "#C4B5FD", text: "#2E1065", muted: "#4C1D95", track: "rgba(46,16,101,0.12)",  chart: "#6A49FA" },
  { bg: "#93C8F0", text: "#0C2D48", muted: "#1A4A6E", track: "rgba(12,45,72,0.12)",   chart: "#185FA5" },
  { bg: "#E8A0A0", text: "#4A0E0E", muted: "#7A1A1A", track: "rgba(74,14,14,0.12)",   chart: "#C0494A" },
  { bg: "#E8C97A", text: "#3D2000", muted: "#6B3A00", track: "rgba(61,32,0,0.12)",    chart: "#B87A10" },
  { bg: "#E2D9FF", text: "#2E1065", muted: "#4C1D95", track: "rgba(46,16,101,0.12)",  chart: "#6A49FA" },
  { bg: "#6A49FA", text: "#EDE9FF", muted: "#C4B5FD", track: "rgba(255,255,255,0.15)", chart: "#E2D9FF" },
];

export default function SavingsGoalsCarousel({ goals }: { goals: Goal[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // only hijack when there's horizontal overflow to scroll
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY * 1.5, behavior: "smooth" });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section className="glass p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Savings Goals</h2>
          <p className="mt-0.5 text-sm text-white/45">
            Track progress toward each target.
          </p>
        </div>
        <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-white/60 border border-white/10">
          {goals.length} goals
        </span>
      </div>

      {goals.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/35">
          No goals yet — add one below.
        </p>
      ) : (
        <>
          {/* Scroll hint — mobile only */}
          <p className="mb-3 flex items-center gap-1.5 text-xs text-white/30 md:hidden">
            <span>Swipe to see more</span>
            <span>→</span>
          </p>

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1"
            style={{
              scrollbarWidth: "none",          // Firefox
              WebkitOverflowScrolling: "touch", // iOS momentum
              scrollSnapType: "x mandatory",   // mobile snap
              cursor: "grab",
            }}
            onMouseDown={(e) => {
              // drag-to-scroll on desktop as bonus
              const el = scrollRef.current;
              if (!el) return;
              el.style.cursor = "grabbing";
              const startX = e.pageX - el.offsetLeft;
              const startScroll = el.scrollLeft;

              const onMove = (e: MouseEvent) => {
                const x = e.pageX - el.offsetLeft;
                el.scrollLeft = startScroll - (x - startX) * 1.2;
              };
              const onUp = () => {
                el.style.cursor = "grab";
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          >
            {goals.map((goal, index) => {
              const theme = PALETTE[index % PALETTE.length];

              const progress =
                goal.targetAmount > 0
                  ? Math.min(goal.currentAmount / goal.targetAmount, 1)
                  : 0;
              const isCompleted = progress >= 1;
              const pct = Math.round(progress * 100);

              const pieData = [
                { value: progress },
                { value: 1 - progress },
              ];

              return (
                <div
                  key={goal.id}
                  className="relative min-w-55 shrink-0 overflow-hidden rounded-2xl p-5 mt-3 transition-all duration-300 hover:scale-[1.025] hover:-translate-y-0.5"
                  style={{
                    background: theme.bg,
                    border: "1px solid rgba(255,255,255,0.25)",
                    scrollSnapAlign: "start", // mobile snap per card
                    userSelect: "none",       // prevent text select while dragging
                  }}
                >
                  {/* Top shine */}
                  <div
                    className="absolute inset-x-0 top-0 h-px"
                    style={{ background: "rgba(255,255,255,0.5)" }}
                  />

                  {/* Completed badge */}
                  {isCompleted && (
                    <span
                      className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: "rgba(255,255,255,0.3)",
                        color: theme.text,
                        border: "1px solid rgba(255,255,255,0.4)",
                      }}
                    >
                      Completed
                    </span>
                  )}

                  {/* Goal name */}
                  <p
                    className="relative z-10 text-sm font-bold truncate pr-2"
                    style={{ color: theme.text }}
                  >
                    {goal.name}
                  </p>

                  {/* Donut */}
                  <div className="relative z-10 mx-auto mt-4 h-28 w-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          innerRadius={38}
                          outerRadius={52}
                          startAngle={90}
                          endAngle={-270}
                          strokeWidth={0}
                        >
                          <Cell fill={theme.chart} />
                          <Cell fill={theme.track} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Centre % */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span
                        className="text-xl font-bold"
                        style={{ color: theme.chart }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="relative z-10 mt-4 h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: theme.track }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progress * 100}%`,
                        background: theme.chart,
                      }}
                    />
                  </div>

                  {/* Amounts */}
                  <p
                    className="relative z-10 mt-3 text-xs"
                    style={{ color: theme.muted }}
                  >
                    <span className="font-bold" style={{ color: theme.text }}>
                      RM {goal.currentAmount.toLocaleString()}
                    </span>
                    {" / "}
                    RM {goal.targetAmount.toLocaleString()}
                  </p>

                  {goal.deadline && (
                    <p
                      className="relative z-10 mt-1 text-xs"
                      style={{ color: theme.muted }}
                    >
                      Due{" "}
                      {new Date(goal.deadline).toLocaleDateString("en-MY", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dot indicators — mobile only */}
          <div className="mt-3 flex justify-center gap-1.5 md:hidden">
            {goals.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const el = scrollRef.current;
                  if (!el) return;
                  const card = el.children[i] as HTMLElement;
                  card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
                }}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: "24px",
                  background: "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}