"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ─── Slide data ─────────────────────────────────────────────────── */
const SLIDES = [
  {
    id: 1,
    label: "Expense tracking",
    headline: "Track every",
    accent: "ringgit",
    sub: "See exactly where your money goes with beautiful, effortless breakdowns — no spreadsheets, no guesswork.",
    cta: "Start for free",
    visual: <SlideExpense />,
  },
  {
    id: 2,
    label: "Savings goals",
    headline: "Build savings",
    accent: "without pressure",
    sub: "Set goals, watch them grow — one calm step at a time. Savvyra makes saving feel achievable, not stressful.",
    cta: "Set my first goal",
    visual: <SlideGoals />,
  },
  {
    id: 3,
    label: "AI insights",
    headline: "Insights that feel",
    accent: "personal",
    sub: "Smart suggestions tailored around your habits and your life — not generic advice that could apply to anyone.",
    cta: "Get your insights",
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
    document.cookie = "savvyra_onboarded=true; path=/; max-age=31536000";
    router.push("/login");
  }

  const slide = SLIDES[index];

  return (
    <>
      <style suppressHydrationWarning>{`
        /* ── Shared blobs ── */
        .ob-blob { position:fixed; border-radius:9999px; pointer-events:none; z-index:0; will-change:transform; }
        .ob-blob-1 { width:520px; height:520px; background:#6A49FA; top:-160px; left:-160px; filter:blur(110px); opacity:0.7; animation:blob-drift-1 12s ease-in-out infinite alternate; }
        .ob-blob-2 { width:420px; height:420px; background:#C6E6FF; bottom:-80px; right:-80px; filter:blur(100px); opacity:0.38; animation:blob-drift-2 16s ease-in-out infinite alternate; }
        .ob-blob-3 { width:360px; height:360px; background:#FEDADA; top:35%; right:10%; filter:blur(90px); opacity:0.35; animation:blob-drift-3 10s ease-in-out infinite alternate; }

        @keyframes blob-drift-1 { from{transform:translate(0,0) scale(1)} to{transform:translate(50px,70px) scale(1.1)} }
        @keyframes blob-drift-2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-55px,-45px) scale(1.08)} }
        @keyframes blob-drift-3 { from{transform:translate(0,0) scale(1)} to{transform:translate(35px,-55px) scale(0.94)} }

        /* ── Mobile animations ── */
        @keyframes ob-slide-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ob-fade-in  { from{opacity:0} to{opacity:1} }
        .ob-enter { animation: ob-slide-up 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .ob-fade  { animation: ob-fade-in  0.35s ease both; }

        /* ── Mobile dots ── */
        .ob-dot-active  { width:24px; height:8px; border-radius:4px; background:linear-gradient(90deg,#E8A0A0,#E8C97A); transition:all 0.3s ease; }
        .ob-dot-passive { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.22); transition:all 0.3s ease; cursor:pointer; }
        .ob-dot-passive:hover { background:rgba(255,255,255,0.4); }

        /* ── Mobile buttons ── */
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

        /* ── Desktop nav ── */
        .dt-nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:20px 48px;
          background:rgba(69,50,132,0.6);
          backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(255,255,255,0.07);
        }
        .dt-nav-logo { display:flex; align-items:center; gap:10px; }
        .dt-nav-logo-icon {
          width:36px; height:36px; border-radius:10px;
          background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.18);
          display:flex; align-items:center; justify-content:center;
        }
        .dt-nav-links { display:flex; align-items:center; gap:24px; }
        .dt-nav-link {
          font-size:13px; color:rgba(255,255,255,0.55);
          text-decoration:none; transition:color 0.2s; background:none; border:none; cursor:pointer;
        }
        .dt-nav-link:hover { color:rgba(255,255,255,0.9); }
        .dt-btn-start {
          background:linear-gradient(135deg,#E8A0A0,#E8C97A);
          border:none; border-radius:12px;
          padding:10px 22px; font-size:14px; font-weight:700;
          color:#453284; cursor:pointer; letter-spacing:-0.2px;
          transition:transform 0.2s, opacity 0.2s;
        }
        .dt-btn-start:hover { transform:scale(1.03); opacity:0.92; }

        /* ── Desktop sections ── */
        .dt-section {
          min-height:100vh;
          display:grid; align-items:center;
          padding:120px 80px 80px;
          max-width:1280px; margin:0 auto;
        }
        .dt-section-inner {
          display:grid; grid-template-columns:1fr 1fr;
          gap:80px; align-items:center;
        }
        .dt-section-inner.reverse { direction:rtl; }
        .dt-section-inner.reverse > * { direction:ltr; }

        .dt-label {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15);
          border-radius:20px; padding:5px 14px;
          font-size:12px; font-weight:600; color:rgba(255,255,255,0.7);
          letter-spacing:0.5px; text-transform:uppercase; margin-bottom:20px;
        }
        .dt-label-dot { width:6px; height:6px; border-radius:50%; background:#E8C97A; }

        .dt-headline {
          font-size:clamp(32px,3.5vw,52px);
          font-weight:800; color:#fff; line-height:1.1;
          letter-spacing:-1.5px; margin-bottom:18px;
        }
        .dt-headline-accent {
          background:linear-gradient(135deg,#E8A0A0,#E8C97A);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
        }
        .dt-sub {
          font-size:clamp(15px,1.4vw,18px);
          color:rgba(255,255,255,0.52); line-height:1.7;
          max-width:420px; margin-bottom:36px;
        }
        .dt-cta-row { display:flex; align-items:center; gap:16px; }
        .dt-btn-lg {
          background:linear-gradient(135deg,#E8A0A0,#E8C97A);
          border:none; border-radius:14px;
          padding:14px 28px; font-size:15px; font-weight:700;
          color:#453284; cursor:pointer; letter-spacing:-0.2px;
          box-shadow:0 8px 32px rgba(232,162,160,0.3);
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .dt-btn-lg:hover { transform:scale(1.02); box-shadow:0 12px 40px rgba(232,162,160,0.42); }
        .dt-btn-ghost {
          background:transparent; border:1px solid rgba(255,255,255,0.2);
          border-radius:14px; padding:14px 24px;
          font-size:15px; font-weight:600; color:rgba(255,255,255,0.7);
          cursor:pointer; transition:all 0.2s;
        }
        .dt-btn-ghost:hover { background:rgba(255,255,255,0.08); color:#fff; }

        .dt-divider {
          max-width:1280px; margin:0 auto;
          height:1px; background:rgba(255,255,255,0.07);
          position:relative; z-index:1;
        }

        /* ── Desktop footer ── */
        .dt-footer {
          position:relative; z-index:1;
          text-align:center; padding:80px 48px 60px;
          border-top:1px solid rgba(255,255,255,0.07);
        }
        .dt-footer-tagline {
          font-size:clamp(32px,4vw,52px); font-weight:800; color:#fff;
          letter-spacing:-1.5px; margin-bottom:12px;
        }
        .dt-footer-sub { font-size:16px; color:rgba(255,255,255,0.45); margin-bottom:32px; }
        .dt-footer-btn {
          background:linear-gradient(135deg,#E8A0A0,#E8C97A);
          border:none; border-radius:16px;
          padding:16px 40px; font-size:17px; font-weight:800;
          color:#453284; cursor:pointer;
          box-shadow:0 8px 48px rgba(232,162,160,0.4);
          transition:transform 0.2s;
        }
        .dt-footer-btn:hover { transform:scale(1.02); }
        .dt-footer-note { font-size:12px; color:rgba(255,255,255,0.3); margin-top:16px; }

        /* ── Desktop visual card atoms ── */
        .dt-glass {
          background:rgba(255,255,255,0.08);
          backdrop-filter:blur(24px);
          border:1px solid rgba(255,255,255,0.1);
        }
        .dt-expense-row {
          display:flex; align-items:center; gap:14px;
          padding:14px 18px; border-radius:16px;
          margin-bottom:10px;
        }
        .dt-expense-icon {
          width:44px; height:44px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          font-size:20px; flex-shrink:0;
        }
        .dt-chart-pill {
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 18px; border-radius:14px;
        }
        .dt-chart-bars { display:flex; align-items:flex-end; gap:5px; }
        .dt-ring-wrap { position:relative; width:180px; height:180px; }
        .dt-ring-center {
          position:absolute; inset:0; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
        }
        .dt-goal-card { padding:16px 20px; border-radius:16px; margin-bottom:12px; }
        .dt-goal-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; }
        .dt-goal-badge {
          background:rgba(232,201,122,0.15); border:1px solid rgba(232,201,122,0.3);
          border-radius:8px; padding:5px 12px;
          font-size:11px; font-weight:600; color:#E8C97A;
        }
        .dt-progress-track { height:6px; border-radius:3px; background:rgba(255,255,255,0.1); }
        .dt-progress-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,#E8A0A0,#E8C97A); }
        .dt-hint-pill {
          display:flex; align-items:center; gap:10px;
          padding:10px 16px; border-radius:12px; margin-top:4px;
          font-size:12px; color:rgba(255,255,255,0.5);
        }
        .dt-chart-card { padding:18px 20px; border-radius:16px; margin-bottom:10px; }
        .dt-weekly-bars { display:flex; align-items:flex-end; gap:8px; height:90px; }
        .dt-wbar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; }
        .dt-wbar-day { font-size:10px; color:rgba(255,255,255,0.35); }
        .dt-insight-pill {
          display:flex; align-items:flex-start; gap:12px;
          padding:14px 18px; border-radius:14px; margin-bottom:10px;
          background:rgba(232,201,122,0.1); border:1px solid rgba(232,201,122,0.2);
          font-size:13px; color:rgba(255,255,255,0.7); line-height:1.6;
        }
        .dt-cats-row { display:flex; gap:10px; }
        .dt-cat-card {
          flex:1; display:flex; flex-direction:column; align-items:center;
          padding:14px 8px; border-radius:14px;
          background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08);
        }
        .dt-cat-dot { width:28px; height:28px; border-radius:50%; margin-bottom:8px; }
      `}</style>

      {/* ══════════════════════════════════════════
          MOBILE layout (hidden on md+)
      ══════════════════════════════════════════ */}
      <div
        className="md:hidden relative overflow-hidden bg-[#453284]"
        style={{ height: "100dvh" }}
      >
        <div className="ob-blob ob-blob-1" />
        <div className="ob-blob ob-blob-2" />
        <div className="ob-blob ob-blob-3" />

        <div
          className="relative z-10 flex flex-col"
          style={{
            height: "100dvh",
            paddingTop: "max(env(safe-area-inset-top, 0px), 16px)",
            paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)",
            paddingLeft: 24,
            paddingRight: 24,
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* Top bar */}
          <div
            className="ob-fade flex items-center justify-between shrink-0"
            style={{ opacity: mounted ? undefined : 0, animationDelay: "0.05s", paddingTop: 6, paddingBottom: 6 }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: 34, height: 34, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <Image src="/logo2.png" alt="Savvyra" width={20} height={20} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Savvyra</span>
            </div>
            <button className="ob-btn-skip" onClick={finish}>Skip</button>
          </div>

          {/* Visual */}
          <div
            className="flex items-center justify-center"
            style={{ flex: "1 1 0", minHeight: 0, overflow: "hidden", paddingTop: 10, paddingBottom: 10 }}
          >
            <div
              key={`visual-${index}`}
              className="ob-enter w-full"
              style={{ animationDelay: "0.05s", maxHeight: "100%", overflow: "hidden" }}
            >
              {slide.visual}
            </div>
          </div>

          {/* Text */}
          <div
            key={`text-${index}`}
            className="ob-enter text-center shrink-0"
            style={{ opacity: visible ? undefined : 0, transition: "opacity 0.24s ease", marginBottom: 16, animationDelay: "0.08s" }}
          >
            <h1
              style={{ fontSize: "clamp(20px, 5.5vw, 26px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.5px", color: "#fff", margin: "0 0 8px" }}
            >
              {slide.headline}
            </h1>
            <p style={{ fontSize: "clamp(13px, 3.5vw, 15px)", color: "rgba(255,255,255,0.52)", lineHeight: 1.6, margin: 0, maxWidth: 300, marginInline: "auto" }}>
              {slide.sub}
            </p>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 shrink-0" style={{ marginBottom: 14 }}>
            {SLIDES.map((_, i) => (
              <div key={i} className={i === index ? "ob-dot-active" : "ob-dot-passive"} onClick={() => i !== index && goTo(i)} />
            ))}
          </div>

          {/* CTA */}
          <div className="ob-enter shrink-0" style={{ animationDelay: "0.12s" }}>
            <button className="ob-btn-primary" onClick={() => goTo(index + 1)}>
              {index === SLIDES.length - 1 ? "Get Started" : "Continue"}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP layout (hidden below md)
      ══════════════════════════════════════════ */}
      <div className="hidden md:block relative bg-[#453284] overflow-x-hidden">
        <div className="ob-blob ob-blob-1" />
        <div className="ob-blob ob-blob-2" />
        <div className="ob-blob ob-blob-3" />

        {/* Nav */}
        <nav className="dt-nav">
          <div className="dt-nav-logo">
            <div className="dt-nav-logo-icon">
              <Image src="/logo2.png" alt="Savvyra" width={20} height={20} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>Savvyra</span>
          </div>
          <div className="dt-nav-links">
            <button className="dt-nav-link" onClick={() => document.getElementById("dt-s1")?.scrollIntoView({ behavior: "smooth" })}>Features</button>
            <button className="dt-nav-link" onClick={() => document.getElementById("dt-s3")?.scrollIntoView({ behavior: "smooth" })}>Insights</button>
            <button className="dt-btn-start" onClick={finish}>Get Started</button>
          </div>
        </nav>

        {/* ── Section 1: Track every ringgit ── */}
        <section className="dt-section" id="dt-s1" style={{ position: "relative", zIndex: 1 }}>
          <div className="dt-section-inner">
            <div>
              <div className="dt-label"><span className="dt-label-dot" />Expense tracking</div>
              <h2 className="dt-headline">
                Track every<br />
                <span className="dt-headline-accent">ringgit</span>
              </h2>
              <p className="dt-sub">See exactly where your money goes with beautiful, effortless breakdowns — no spreadsheets, no guesswork.</p>
              <div className="dt-cta-row">
                <button className="dt-btn-lg" onClick={finish}>Start for free</button>
                <button className="dt-btn-ghost" onClick={() => document.getElementById("dt-s2")?.scrollIntoView({ behavior: "smooth" })}>See more</button>
              </div>
            </div>
            <div>
              <DesktopSlideExpense />
            </div>
          </div>
        </section>

        <div className="dt-divider" style={{ position: "relative", zIndex: 1 }} />

        {/* ── Section 2: Build savings ── */}
        <section className="dt-section" id="dt-s2" style={{ position: "relative", zIndex: 1 }}>
          <div className="dt-section-inner reverse">
            <div>
              <div className="dt-label"><span className="dt-label-dot" />Savings goals</div>
              <h2 className="dt-headline">
                Build savings<br />
                <span className="dt-headline-accent">without pressure</span>
              </h2>
              <p className="dt-sub">Set goals, watch them grow — one calm step at a time. Savvyra makes saving feel achievable, not stressful.</p>
              <div className="dt-cta-row">
                <button className="dt-btn-lg" onClick={finish}>Set my first goal</button>
              </div>
            </div>
            <div>
              <DesktopSlideGoals />
            </div>
          </div>
        </section>

        <div className="dt-divider" style={{ position: "relative", zIndex: 1 }} />

        {/* ── Section 3: Smart insights ── */}
        <section className="dt-section" id="dt-s3" style={{ position: "relative", zIndex: 1 }}>
          <div className="dt-section-inner">
            <div>
              <div className="dt-label"><span className="dt-label-dot" />AI insights</div>
              <h2 className="dt-headline">
                Insights that feel<br />
                <span className="dt-headline-accent">personal</span>
              </h2>
              <p className="dt-sub">Smart suggestions tailored around your habits and your life — not generic advice that could apply to anyone.</p>
              <div className="dt-cta-row">
                <button className="dt-btn-lg" onClick={finish}>Get your insights</button>
              </div>
            </div>
            <div>
              <DesktopSlideInsights />
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="dt-footer">
          <div className="dt-footer-tagline">Ready to take control?</div>
          <div className="dt-footer-sub">Join thousands of Malaysians managing money with calm and clarity.</div>
          <button className="dt-footer-btn" onClick={finish}>Create your free account</button>
          <div className="dt-footer-note">No credit card required · Free forever plan available</div>
        </footer>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   MOBILE SLIDE VISUALS
═══════════════════════════════════════════════════ */

function SlideExpense() {
  const items = [
    { label: "Groceries",    amount: "RM 84.50", icon: "🛒", color: "#E8A0A0" },
    { label: "Grab ride",    amount: "RM 22.00", icon: "🚗", color: "#E8C97A" },
    { label: "Morning kopi", amount: "RM 6.50",  icon: "☕", color: "#C6E6FF" },
  ];
  return (
    <div className="mx-auto flex flex-col" style={{ maxWidth: 320, gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "11px 16px", animation: `ob-slide-up 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 0.07 + 0.05}s both` }}>
          <div className="flex items-center justify-center shrink-0" style={{ width: 36, height: 36, borderRadius: 10, background: item.color + "25", fontSize: 18 }}>{item.icon}</div>
          <div className="flex-1">
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{item.label}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>Today</p>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: item.color, margin: 0 }}>{item.amount}</p>
        </div>
      ))}
      <div className="flex items-center justify-between" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "9px 16px", animation: "ob-slide-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.26s both" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>This month</p>
        <div className="flex items-end gap-1">
          {[40, 65, 45, 80, 55, 90, 60].map((h, i) => (
            <div key={i} style={{ width: 6, height: h * 0.32, borderRadius: 3, background: i === 5 ? "linear-gradient(180deg,#E8A0A0,#E8C97A)" : "rgba(255,255,255,0.18)" }} />
          ))}
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#E8C97A", margin: 0 }}>RM 113</p>
      </div>
    </div>
  );
}

function SlideGoals() {
  const percent = 72;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <div className="mx-auto flex flex-col items-center" style={{ maxWidth: 320, gap: 14 }}>
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
          <circle cx="70" cy="70" r={r} fill="none" stroke="url(#goalGrad)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} transform="rotate(-90 70 70)" style={{ transition: "stroke-dasharray 0.8s ease" }} />
          <defs><linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#E8A0A0" /><stop offset="100%" stopColor="#E8C97A" /></linearGradient></defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ pointerEvents: "none" }}>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-1px" }}>{percent}%</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>saved</p>
        </div>
      </div>
      <div className="w-full" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "13px 18px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 2px" }}>Dream Vacation 🌴</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#E8C97A", margin: 0 }}>RM 3,600 <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.35)", fontSize: 12 }}>/ RM 5,000</span></p>
          </div>
          <div style={{ background: "rgba(232,201,122,0.15)", border: "1px solid rgba(232,201,122,0.25)", borderRadius: 8, padding: "4px 10px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#E8C97A", margin: 0 }}>On track</p>
          </div>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.1)" }}>
          <div style={{ height: "100%", width: `${percent}%`, borderRadius: 3, background: "linear-gradient(90deg,#E8A0A0,#E8C97A)" }} />
        </div>
      </div>
      <div className="flex items-center gap-2" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "7px 14px" }}>
        <span style={{ fontSize: 15 }}>🪙</span>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0 }}>RM 1,400 more · ~4 months at current pace</p>
      </div>
    </div>
  );
}

function SlideInsights() {
  const bars = [40, 65, 50, 80, 60, 90, 55];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="mx-auto flex flex-col" style={{ maxWidth: 320, gap: 10 }}>
      <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 16px 12px" }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.45)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "1px" }}>Weekly spending</p>
        <div className="flex items-end gap-2" style={{ height: 60 }}>
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div style={{ width: "100%", height: (h / 100) * 52, borderRadius: 4, background: i === 5 ? "linear-gradient(180deg,#E8A0A0,#E8C97A)" : "rgba(255,255,255,0.15)" }} />
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.38)", margin: 0 }}>{days[i]}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-start gap-3" style={{ background: "rgba(232,201,122,0.1)", border: "1px solid rgba(232,201,122,0.2)", borderRadius: 12, padding: "11px 14px", animation: "ob-slide-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.15s both" }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>✨</span>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.55 }}>You spend <span style={{ color: "#E8C97A", fontWeight: 600 }}>18% less</span> on weekends. Keep it up!</p>
      </div>
      <div className="flex gap-2">
        {[{ label: "Food", pct: 42, color: "#E8A0A0" }, { label: "Travel", pct: 28, color: "#C6E6FF" }, { label: "Others", pct: 30, color: "#E8C97A" }].map((cat, i) => (
          <div key={i} className="flex-1 flex flex-col items-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "9px 6px" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: cat.color + "30", border: `2px solid ${cat.color}`, marginBottom: 5 }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: cat.color, margin: 0 }}>{cat.pct}%</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0 }}>{cat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DESKTOP SLIDE VISUALS (larger, more spacious)
═══════════════════════════════════════════════════ */

function DesktopSlideExpense() {
  const items = [
    { label: "Groceries",    amount: "RM 84.50", icon: "🛒", color: "#E8A0A0", when: "Today, 10:42 AM" },
    { label: "Grab ride",    amount: "RM 22.00", icon: "🚗", color: "#E8C97A", when: "Today, 9:15 AM" },
    { label: "Morning kopi", amount: "RM 6.50",  icon: "☕", color: "#C6E6FF", when: "Today, 8:03 AM" },
  ];
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="dt-expense-row dt-glass" style={{ marginBottom: 10 }}>
          <div className="dt-expense-icon" style={{ background: item.color + "22" }}>{item.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{item.label}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>{item.when}</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.amount}</div>
        </div>
      ))}
      <div className="dt-chart-pill dt-glass">
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>This month</span>
        <div className="dt-chart-bars">
          {[40, 65, 45, 80, 55, 90, 60].map((h, i) => (
            <div key={i} style={{ width: 8, height: h * 0.32, borderRadius: 3, background: i === 5 ? "linear-gradient(180deg,#E8A0A0,#E8C97A)" : "rgba(255,255,255,0.18)" }} />
          ))}
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#E8C97A" }}>RM 113</span>
      </div>
    </div>
  );
}

function DesktopSlideGoals() {
  const percent = 72;
  const r = 72;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <div className="flex flex-col items-center" style={{ gap: 16 }}>
      <div className="dt-ring-wrap">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle cx="90" cy="90" r={r} fill="none" stroke="url(#dtGoalGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} transform="rotate(-90 90 90)" />
          <defs><linearGradient id="dtGoalGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#E8A0A0" /><stop offset="100%" stopColor="#E8C97A" /></linearGradient></defs>
        </svg>
        <div className="dt-ring-center">
          <div style={{ fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: "-2px" }}>{percent}%</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>saved</div>
        </div>
      </div>
      <div className="dt-goal-card dt-glass" style={{ width: "100%" }}>
        <div className="dt-goal-top">
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Dream Vacation 🌴</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#E8C97A" }}>RM 3,600 <span style={{ fontWeight: 400, fontSize: 13, color: "rgba(255,255,255,0.35)" }}>/ RM 5,000</span></div>
          </div>
          <div className="dt-goal-badge">On track</div>
        </div>
        <div className="dt-progress-track"><div className="dt-progress-fill" style={{ width: `${percent}%` }} /></div>
      </div>
      <div className="dt-hint-pill dt-glass" style={{ width: "100%" }}>
        <span style={{ fontSize: 18 }}>🪙</span>
        RM 1,400 more · ~4 months at current pace
      </div>
    </div>
  );
}

function DesktopSlideInsights() {
  const bars = [40, 65, 50, 80, 60, 90, 55];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div>
      <div className="dt-chart-card dt-glass">
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 14 }}>Weekly spending</div>
        <div className="dt-weekly-bars">
          {bars.map((h, i) => (
            <div key={i} className="dt-wbar-wrap">
              <div style={{ width: "100%", height: (h / 100) * 83, borderRadius: 4, background: i === 5 ? "linear-gradient(180deg,#E8A0A0,#E8C97A)" : "rgba(255,255,255,0.15)" }} />
              <div className="dt-wbar-day" style={{ color: i === 5 ? "#E8C97A" : undefined }}>{days[i]}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="dt-insight-pill">
        <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>✨</span>
        <div>You spend <span style={{ color: "#E8C97A", fontWeight: 700 }}>18% less</span> on weekends — your wallet thanks you. Keep the streak going!</div>
      </div>
      <div className="dt-cats-row">
        {[{ label: "Food", pct: 42, color: "#E8A0A0" }, { label: "Travel", pct: 28, color: "#C6E6FF" }, { label: "Others", pct: 30, color: "#E8C97A" }].map((cat, i) => (
          <div key={i} className="dt-cat-card">
            <div className="dt-cat-dot" style={{ background: cat.color + "30", border: `2px solid ${cat.color}` }} />
            <div style={{ fontSize: 16, fontWeight: 800, color: cat.color }}>{cat.pct}%</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{cat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}