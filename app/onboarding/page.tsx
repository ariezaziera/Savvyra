"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ─── Slide data ─────────────────────────────────────────────────── */
const SLIDES = [
  {
    id: 1,
    headline: "Track every ringgit",
    sub: "See exactly where your money goes with beautiful, effortless breakdowns.",
    visual: <SlideExpense />,
  },
  {
    id: 2,
    headline: "Build savings without pressure",
    sub: "Set goals, watch them grow — one calm step at a time.",
    visual: <SlideGoals />,
  },
  {
    id: 3,
    headline: "Insights that feel personal",
    sub: "Smart suggestions tailored around your habits and your life.",
    visual: <SlideInsights />,
  },
];

/* ─── Main page ──────────────────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  function goTo(next: number) {
    if (next >= SLIDES.length) {
      finish();
      return;
    }
    setVisible(false);
    setTimeout(() => {
      setIndex(next);
      setVisible(true);
    }, 240);
  }

  function finish() {
    localStorage.setItem("savvyra_onboarded", "true");
    router.push("/login");
  }

  const slide = SLIDES[index];

  return (
    <div className="relative overflow-hidden bg-[#453284]" style={{ height: "100dvh" }}>

      {/* ── Aurora blobs ── */}
      <div className="ob-blob ob-blob-1" />
      <div className="ob-blob ob-blob-2" />
      <div className="ob-blob ob-blob-3" />

      <style>{`
        /* ── Blobs ── */
        .ob-blob { position:fixed; border-radius:9999px; pointer-events:none; z-index:0; will-change:transform; }
        .ob-blob-1 { width:420px; height:420px; background:#6A49FA; top:-120px; left:-120px; filter:blur(100px); opacity:0.8; animation:blob-drift-1 12s ease-in-out infinite alternate; }
        .ob-blob-2 { width:360px; height:360px; background:#C6E6FF; bottom:-80px; right:-80px; filter:blur(90px); opacity:0.45; animation:blob-drift-2 16s ease-in-out infinite alternate; }
        .ob-blob-3 { width:300px; height:300px; background:#FEDADA; top:30%; right:8%; filter:blur(80px); opacity:0.4; animation:blob-drift-3 10s ease-in-out infinite alternate; }

        @keyframes blob-drift-1 { from{transform:translate(0,0) scale(1)} to{transform:translate(40px,60px) scale(1.1)} }
        @keyframes blob-drift-2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-50px,-40px) scale(1.08)} }
        @keyframes blob-drift-3 { from{transform:translate(0,0) scale(1)} to{transform:translate(30px,-50px) scale(0.95)} }

        /* ── Animations ── */
        @keyframes ob-slide-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ob-fade-in  { from{opacity:0} to{opacity:1} }
        .ob-enter { animation: ob-slide-up 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .ob-fade  { animation: ob-fade-in  0.35s ease both; }

        /* ── Dots ── */
        .ob-dot-active  { width:24px; height:8px; border-radius:4px; background:linear-gradient(90deg,#E8A0A0,#E8C97A); transition:all 0.3s ease; }
        .ob-dot-passive { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.22); transition:all 0.3s ease; cursor:pointer; }
        .ob-dot-passive:hover { background:rgba(255,255,255,0.4); }

        /* ── Buttons ── */
        .ob-btn-primary {
          width:100%; height:52px; border-radius:16px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#E8A0A0 0%,#E8C97A 100%);
          color:#453284; font-size:16px; font-weight:700; letter-spacing:-0.2px;
          box-shadow:0 4px 24px rgba(232,162,160,0.35);
          transition:transform 0.2s ease, box-shadow 0.2s ease;
        }
        .ob-btn-primary:hover  { transform:scale(1.015); box-shadow:0 6px 32px rgba(232,162,160,0.45); }
        .ob-btn-primary:active { transform:scale(0.98); }

        .ob-btn-skip {
          background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.14);
          color:rgba(255,255,255,0.65); border-radius:10px; padding:7px 16px;
          font-size:13px; font-weight:500; cursor:pointer;
          transition:background 0.2s ease;
        }
        .ob-btn-skip:hover { background:rgba(255,255,255,0.14); }
      `}</style>

      {/* ── Content shell: fixed to viewport height, no overflow ── */}
      <div
        className="relative z-10 flex flex-col"
        style={{
          height: "100dvh",
          /* 
           * Safe-area padding handles notch / gesture bar on Android.
           * Fallbacks keep layout sane when env() isn't supported.
           * Horizontal padding fixed at 24px; vertical paddings are minimal
           * so the layout fits the tall Xiaomi 15T (2772×1280 → ~900dp tall).
           */
          paddingTop: "max(env(safe-area-inset-top, 0px), 16px)",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)",
          paddingLeft: 24,
          paddingRight: 24,
          boxSizing: "border-box",
          overflow: "hidden",   /* hard-stop: nothing escapes the viewport */
        }}
      >

        {/* ── Top bar: logo + skip ── */}
        <div
          className="ob-fade flex items-center justify-between shrink-0"
          style={{
            opacity: mounted ? undefined : 0,
            animationDelay: "0.05s",
            paddingTop: 6,
            paddingBottom: 6,
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{
                width: 34, height: 34,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <Image src="/logo512.png" alt="Savvyra" width={20} height={20} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Savvyra</span>
          </div>

          <button className="ob-btn-skip" onClick={finish}>
            Skip
          </button>
        </div>

        {/* ── Visual area: fills remaining space but never overflows ── */}
        <div
          className="flex items-center justify-center"
          style={{
            flex: "1 1 0",        /* grow into remaining space */
            minHeight: 0,          /* crucial — prevents flex children from overflowing */
            overflow: "hidden",
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          <div
            key={`visual-${index}`}
            className="ob-enter w-full"
            style={{
              animationDelay: "0.05s",
              maxHeight: "100%",
              overflow: "hidden",
            }}
          >
            {slide.visual}
          </div>
        </div>

        {/* ── Text block: fixed height, no grow ── */}
        <div
          key={`text-${index}`}
          className="ob-enter text-center shrink-0"
          style={{
            opacity: visible ? undefined : 0,
            transition: "opacity 0.24s ease",
            marginBottom: 16,
            animationDelay: "0.08s",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(20px, 5.5vw, 26px)",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              color: "#fff",
              margin: "0 0 8px",
            }}
          >
            {slide.headline}
          </h1>
          <p
            style={{
              fontSize: "clamp(13px, 3.5vw, 15px)",
              color: "rgba(255,255,255,0.52)",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 300,
              marginInline: "auto",
            }}
          >
            {slide.sub}
          </p>
        </div>

        {/* ── Dot indicators ── */}
        <div className="flex items-center justify-center gap-2 shrink-0" style={{ marginBottom: 14 }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={i === index ? "ob-dot-active" : "ob-dot-passive"}
              onClick={() => i !== index && goTo(i)}
            />
          ))}
        </div>

        {/* ── CTA button ── */}
        <div className="ob-enter shrink-0" style={{ animationDelay: "0.12s" }}>
          <button className="ob-btn-primary" onClick={() => goTo(index + 1)}>
            {index === SLIDES.length - 1 ? "Get Started" : "Continue"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SLIDE VISUALS — compacted for tall-thin screens
═══════════════════════════════════════════════════ */

/* ── Slide 1: Expense cards ── */
function SlideExpense() {
  const items = [
    { label: "Groceries",    amount: "RM 84.50", icon: "🛒", color: "#E8A0A0" },
    { label: "Grab ride",    amount: "RM 22.00", icon: "🚗", color: "#E8C97A" },
    { label: "Morning kopi", amount: "RM 6.50",  icon: "☕", color: "#C6E6FF" },
  ];

  return (
    <div className="mx-auto flex flex-col" style={{ maxWidth: 320, gap: 10 }}>
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-3"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
            padding: "11px 16px",
            animation: `ob-slide-up 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 0.07 + 0.05}s both`,
          }}
        >
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: item.color + "25",
              fontSize: 18,
            }}
          >
            {item.icon}
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{item.label}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>Today</p>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: item.color, margin: 0 }}>{item.amount}</p>
        </div>
      ))}

      {/* Mini chart pill */}
      <div
        className="flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "9px 16px",
          animation: "ob-slide-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.26s both",
        }}
      >
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>This month</p>
        <div className="flex items-end gap-1">
          {[40, 65, 45, 80, 55, 90, 60].map((h, i) => (
            <div
              key={i}
              style={{
                width: 6, height: h * 0.32,
                borderRadius: 3,
                background: i === 5
                  ? "linear-gradient(180deg,#E8A0A0,#E8C97A)"
                  : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#E8C97A", margin: 0 }}>RM 113</p>
      </div>
    </div>
  );
}

/* ── Slide 2: Savings goals ── */
function SlideGoals() {
  const percent = 72;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <div className="mx-auto flex flex-col items-center" style={{ maxWidth: 320, gap: 14 }}>

      {/* Progress ring — slightly smaller to save vertical space */}
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
          <circle
            cx="70" cy="70" r={r}
            fill="none" stroke="url(#goalGrad)" strokeWidth="9" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform="rotate(-90 70 70)"
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
          <defs>
            <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#E8A0A0" />
              <stop offset="100%" stopColor="#E8C97A" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ pointerEvents: "none" }}>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-1px" }}>{percent}%</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>saved</p>
        </div>
      </div>

      {/* Goal card */}
      <div
        className="w-full"
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          padding: "13px 18px",
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 2px" }}>Dream Vacation 🌴</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#E8C97A", margin: 0 }}>
              RM 3,600 <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.35)", fontSize: 12 }}>/ RM 5,000</span>
            </p>
          </div>
          <div style={{ background: "rgba(232,201,122,0.15)", border: "1px solid rgba(232,201,122,0.25)", borderRadius: 8, padding: "4px 10px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#E8C97A", margin: 0 }}>On track</p>
          </div>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.1)" }}>
          <div style={{ height: "100%", width: `${percent}%`, borderRadius: 3, background: "linear-gradient(90deg,#E8A0A0,#E8C97A)", transition: "width 0.8s ease" }} />
        </div>
      </div>

      {/* Hint pill */}
      <div
        className="flex items-center gap-2"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "7px 14px",
        }}
      >
        <span style={{ fontSize: 15 }}>🪙</span>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0 }}>RM 1,400 more · ~4 months at current pace</p>
      </div>
    </div>
  );
}

/* ── Slide 3: Smart insights ── */
function SlideInsights() {
  const bars = [40, 65, 50, 80, 60, 90, 55];
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="mx-auto flex flex-col" style={{ maxWidth: 320, gap: 10 }}>

      {/* Bar chart card */}
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          padding: "14px 16px 12px",
        }}
      >
        <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.45)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Weekly spending
        </p>
        <div className="flex items-end gap-2" style={{ height: 60 }}>
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                style={{
                  width: "100%", height: (h / 100) * 52,
                  borderRadius: 4,
                  background: i === 5 ? "linear-gradient(180deg,#E8A0A0,#E8C97A)" : "rgba(255,255,255,0.15)",
                  transition: "height 0.5s ease",
                }}
              />
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", margin: 0 }}>{days[i]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI insight pill */}
      <div
        className="flex items-start gap-3"
        style={{
          background: "rgba(232,201,122,0.1)",
          border: "1px solid rgba(232,201,122,0.2)",
          borderRadius: 12,
          padding: "11px 14px",
          animation: "ob-slide-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.15s both",
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>✨</span>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.55 }}>
          You spend <span style={{ color: "#E8C97A", fontWeight: 600 }}>18% less</span> on weekends. Keep it up!
        </p>
      </div>

      {/* Category breakdown row */}
      <div className="flex gap-2">
        {[
          { label: "Food",   pct: 42, color: "#E8A0A0" },
          { label: "Travel", pct: 28, color: "#C6E6FF" },
          { label: "Others", pct: 30, color: "#E8C97A" },
        ].map((cat, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "9px 6px",
            }}
          >
            <div
              style={{
                width: 24, height: 24, borderRadius: "50%",
                background: cat.color + "30",
                border: `2px solid ${cat.color}`,
                marginBottom: 5,
              }}
            />
            <p style={{ fontSize: 13, fontWeight: 700, color: cat.color, margin: 0 }}>{cat.pct}%</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0 }}>{cat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}