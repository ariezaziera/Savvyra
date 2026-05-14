"use client";

import { useRef, useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
};

type Filter = "ongoing" | "completed" | "all";

const PALETTE: {
  bg: string;
  text: string;
  muted: string;
  track: string;
  chart: string;
}[] = [
  { bg: "#C4B5FD", text: "#2E1065", muted: "#4C1D95", track: "rgba(46,16,101,0.12)",   chart: "#6A49FA" },
  { bg: "#93C8F0", text: "#0C2D48", muted: "#1A4A6E", track: "rgba(12,45,72,0.12)",    chart: "#185FA5" },
  { bg: "#E8A0A0", text: "#4A0E0E", muted: "#7A1A1A", track: "rgba(74,14,14,0.12)",    chart: "#C0494A" },
  { bg: "#E8C97A", text: "#3D2000", muted: "#6B3A00", track: "rgba(61,32,0,0.12)",     chart: "#B87A10" },
  { bg: "#E2D9FF", text: "#2E1065", muted: "#4C1D95", track: "rgba(46,16,101,0.12)",   chart: "#6A49FA" },
  { bg: "#6A49FA", text: "#EDE9FF", muted: "#C4B5FD", track: "rgba(255,255,255,0.15)", chart: "#E2D9FF" },
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "ongoing",   label: "Ongoing"   },
  { key: "completed", label: "Completed" },
  { key: "all",       label: "All"       },
];

export default function SavingsGoalsCarousel({ goals }: { goals: Goal[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("ongoing");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY * 1.5, behavior: "smooth" });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Reset scroll + active index when filter changes
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    setActiveIndex(0);
  }, [filter]);

  // Track which card is centred via IntersectionObserver
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(el.children).indexOf(entry.target as HTMLElement);
            if (index !== -1) setActiveIndex(index);
          }
        });
      },
      { root: el, threshold: 0.6 }
    );

    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [filter]);

  const filteredGoals = goals.filter((goal) => {
    const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
    const isCompleted = progress >= 1;
    if (filter === "ongoing")   return !isCompleted;
    if (filter === "completed") return isCompleted;
    return true;
  });

  const goalsWithIndex = filteredGoals.map((goal) => ({
    goal,
    originalIndex: goals.findIndex((g) => g.id === goal.id),
  }));

  return (
    <section className="glass-no-clip p-6" style={{ overflow: "visible" }}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Savings Goals</h2>
          <p className="mt-0.5 text-sm text-white/45">
            Track progress toward each target.
          </p>
        </div>
        <span className="mt-0.5 shrink-0 rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-white/60 border border-white/10">
          {goals.length} goals
        </span>
      </div>

      {/* Filter pills */}
      <div className="mb-4 flex gap-2">
        {FILTERS.map(({ key, label }) => {
          const isActive = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #6A49FA, #9B7FFF)",
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(106,73,250,0.45)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }
                  : {
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.50)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {filteredGoals.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/35">
          {filter === "ongoing"   && "No ongoing goals — all done! 🎉"}
          {filter === "completed" && "No completed goals yet."}
          {filter === "all"       && "No goals yet — add one below."}
        </p>
      ) : (
        <>
          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto py-4"
            style={{
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "x mandatory",
              cursor: "grab",
              gap: "12px",
              // Mobile: padding centres the first/last card with peek
              paddingLeft: "16px",
              paddingRight: "16px",
            }}
            onMouseDown={(e) => {
              const el = scrollRef.current;
              if (!el) return;
              el.style.cursor = "grabbing";
              const startX = e.pageX - el.offsetLeft;
              const startScroll = el.scrollLeft;
              const onMove = (ev: MouseEvent) => {
                el.scrollLeft = startScroll - (ev.pageX - el.offsetLeft - startX) * 1.2;
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
            {goalsWithIndex.map(({ goal, originalIndex }, i) => {
              const theme = PALETTE[originalIndex % PALETTE.length];
              const progress = goal.targetAmount > 0
                ? Math.min(goal.currentAmount / goal.targetAmount, 1)
                : 0;
              const isCompleted = progress >= 1;
              const pct = Math.round(progress * 100);
              const pieData = [{ value: progress }, { value: 1 - progress }];
              const isActive = i === activeIndex;

              return (
                <div
                  key={goal.id}
                  className="relative shrink-0 overflow-hidden rounded-2xl p-5 transition-all duration-300"
                  style={{
                    background: theme.bg,
                    border: "1px solid rgba(255,255,255,0.25)",
                    scrollSnapAlign: "center",
                    userSelect: "none",
                    // Mobile: nearly full width with peek; Desktop: fixed width
                    width: "calc(100vw - 96px)",
                    maxWidth: "280px",
                    minWidth: "200px",
                    transform: isActive ? "scale(1) translateY(-2px)" : "scale(0.96) translateY(0px)",
                    opacity: isActive ? 1 : 0.75,
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
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold" style={{ color: theme.chart }}>
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
                      style={{ width: `${progress * 100}%`, background: theme.chart }}
                    />
                  </div>

                  {/* Amounts */}
                  <p className="relative z-10 mt-3 text-xs" style={{ color: theme.muted }}>
                    <span className="font-bold" style={{ color: theme.text }}>
                      RM {goal.currentAmount.toLocaleString()}
                    </span>
                    {" / "}
                    RM {goal.targetAmount.toLocaleString()}
                  </p>

                  {goal.deadline && (
                    <p className="relative z-10 mt-1 text-xs" style={{ color: theme.muted }}>
                      Due{" "}
                      {new Date(goal.deadline).toLocaleDateString("en-MY", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dot indicators */}
          <div className="mt-2 flex justify-center gap-1.5">
            {filteredGoals.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const el = scrollRef.current;
                  if (!el) return;
                  const card = el.children[i] as HTMLElement;
                  card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                }}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === activeIndex ? "20px" : "6px",
                  background: i === activeIndex
                    ? "rgba(196,181,253,0.9)"
                    : "rgba(255,255,255,0.20)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}