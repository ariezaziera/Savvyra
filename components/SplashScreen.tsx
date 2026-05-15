"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [enter, setEnter] = useState(false);
  const [logoGlow, setLogoGlow] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setEnter(true), 100);
    const t2 = setTimeout(() => setLogoGlow(true), 600);
    const t3 = setTimeout(() => setShow(false), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden" style={{ background: "#453284" }}>

      <style suppressHydrationWarning>{`
        /* ── Blobs ── */
        @keyframes blob-drift-1 { from{transform:translate(0,0) scale(1)} to{transform:translate(50px,70px) scale(1.1)} }
        @keyframes blob-drift-2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-55px,-45px) scale(1.08)} }
        @keyframes blob-drift-3 { from{transform:translate(0,0) scale(1)} to{transform:translate(35px,-55px) scale(0.94)} }

        /* ── Logo ── */
        @keyframes logo-breathe {
          0%,100% { transform:translate(-50%,-50%) scale(1); }
          50%      { transform:translate(-50%,-50%) scale(1.06); }
        }
        @keyframes ring-spin {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes ring-spin-rev {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes glow-pulse {
          0%,100% { opacity:0.5; transform:translate(-50%,-50%) scale(1); }
          50%      { opacity:1;   transform:translate(-50%,-50%) scale(1.15); }
        }

        /* ── Ripples ── */
        @keyframes ripple-out {
          0%   { transform:translate(-50%,-50%) scale(0.6); opacity:0.7; }
          100% { transform:translate(-50%,-50%) scale(2.8); opacity:0; }
        }

        /* ── Particles ── */
        @keyframes particle-fly-1 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(-60px,-90px) scale(0);opacity:0} }
        @keyframes particle-fly-2 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(80px,-70px) scale(0);opacity:0} }
        @keyframes particle-fly-3 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(-80px,20px) scale(0);opacity:0} }
        @keyframes particle-fly-4 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(60px,80px) scale(0);opacity:0} }
        @keyframes particle-fly-5 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(20px,-100px) scale(0);opacity:0} }
        @keyframes particle-fly-6 { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(-40px,90px) scale(0);opacity:0} }

        /* ── Shimmer sweep on logo ── */
        @keyframes shimmer {
          0%   { transform:translateX(-150%) skewX(-20deg); }
          100% { transform:translateX(250%) skewX(-20deg); }
        }

        /* ── Text entrance ── */
        @keyframes slide-up-fade {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── Loader ── */
        @keyframes loader-sweep {
          0%   { transform:translateX(-100%); }
          100% { transform:translateX(200%); }
        }

        /* ── Twinkle ── */
        @keyframes twinkle {
          0%,100% { opacity:0.2; transform:scale(0.8); }
          50%      { opacity:1;   transform:scale(1.5); }
        }

        /* ── Float ambient ── */
        @keyframes float-a { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float-b { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
      `}</style>

      {/* ── BLOBS ── */}
      <div style={{ position:"fixed", borderRadius:9999, pointerEvents:"none", zIndex:0, width:520, height:520, background:"#6A49FA", top:-160, left:-160, filter:"blur(110px)", opacity:0.7, animation:"blob-drift-1 12s ease-in-out infinite alternate" }} />
      <div style={{ position:"fixed", borderRadius:9999, pointerEvents:"none", zIndex:0, width:420, height:420, background:"#C6E6FF", bottom:-80, right:-80, filter:"blur(100px)", opacity:0.38, animation:"blob-drift-2 16s ease-in-out infinite alternate" }} />
      <div style={{ position:"fixed", borderRadius:9999, pointerEvents:"none", zIndex:0, width:360, height:360, background:"#FEDADA", top:"35%", right:"10%", filter:"blur(90px)", opacity:0.35, animation:"blob-drift-3 10s ease-in-out infinite alternate" }} />

      {/* ── AMBIENT PARTICLES (always visible, floating) ── */}
      {[
        { left:"14%", top:"18%", size:7, color:"#E8A0A0", anim:"float-a 3.5s ease-in-out infinite", delay:"0s" },
        { left:"82%", top:"24%", size:5, color:"#E8C97A", anim:"float-b 4s ease-in-out infinite",   delay:"0.8s" },
        { left:"22%", top:"72%", size:6, color:"#C6E6FF", anim:"float-a 3s ease-in-out infinite",   delay:"1.2s" },
        { left:"78%", top:"68%", size:4, color:"#E8A0A0", anim:"float-b 4.5s ease-in-out infinite", delay:"0.4s" },
        { left:"50%", top:"12%", size:5, color:"#E8C97A", anim:"float-a 3.8s ease-in-out infinite", delay:"1.6s" },
        { left:"8%",  top:"48%", size:4, color:"#FEDADA", anim:"float-b 3.2s ease-in-out infinite", delay:"2s" },
      ].map((p, i) => (
        <div key={i} style={{ position:"absolute", left:p.left, top:p.top, width:p.size, height:p.size, borderRadius:"50%", background:p.color, opacity:0.7, animation:p.anim, animationDelay:p.delay, zIndex:1 }} />
      ))}

      {/* ── BURST PARTICLES (fire when logo glows) ── */}
      {logoGlow && [1,2,3,4,5,6].map(i => (
        <div key={i} style={{ position:"absolute", left:"50%", top:"38%", width:8, height:8, borderRadius:"50%", background: i % 2 === 0 ? "#E8A0A0" : "#E8C97A", animation:`particle-fly-${i} 0.9s cubic-bezier(0.2,0.8,0.4,1) both`, zIndex:2 }} />
      ))}

      {/* ── MAIN CONTENT ── */}
      <div className="relative flex h-full flex-col items-center justify-center px-6" style={{ zIndex:10 }}>

        {/* LOGO CLUSTER */}
        <div style={{ position:"relative", width:220, height:220, opacity: enter ? 1 : 0, transform: enter ? "scale(1)" : "scale(0.7)", transition:"opacity 0.8s cubic-bezier(0.34,1.56,0.64,1), transform 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}>

          {/* OUTER GLOW */}
          <div style={{ position:"absolute", left:"50%", top:"50%", width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle, rgba(232,160,160,0.25) 0%, transparent 70%)", animation:"glow-pulse 2.4s ease-in-out infinite", zIndex:0 }} />

          {/* SPINNING DASHED RING (inner, reverse) */}
          <div style={{ position:"absolute", left:"50%", top:"50%", width:148, height:148, borderRadius:"50%", border:"2px dashed rgba(232,201,122,0.4)", animation:"ring-spin-rev 8s linear infinite", zIndex:1 }} />

          {/* GLASS RINGS */}
          <div style={{ position:"absolute", left:"50%", top:"50%", width:136, height:136, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(20px)", transform:"translate(-50%,-50%)", zIndex:2 }} />
          <div style={{ position:"absolute", left:"50%", top:"50%", width:116, height:116, borderRadius:"50%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", backdropFilter:"blur(20px)", transform:"translate(-50%,-50%)", zIndex:3 }} />

          {/* LOGO CONTAINER */}
          <div style={{ 
            position: "absolute", 
            left: "50%", 
            top: "50%", 
            transform: "translate(-50%, -50%)", // Tambah ni supaya betul-betul center
            width: 110,  // Besarkan sikit container (dari 90 ke 110)
            height: 110, 
            borderRadius: "50%", 
            overflow: "hidden", 
            zIndex: 4, 
            animation: enter ? "logo-breathe 3s ease-in-out infinite" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.05)", // Optional: nampak sikit tapak bulatan tu
            backdropFilter: "blur(4px)" // Kasi vibe glass sikit
          }}>

            {/* SHIMMER SWEEP - Cover seluruh area container */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "50%", zIndex: 5 }}>
              <div style={{ 
                position: "absolute", 
                top: 0, 
                bottom: 0, 
                width: "60%", 
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", 
                animation: "shimmer 2.2s ease-in-out infinite", 
                animationDelay: "0.8s" 
              }} />
            </div>

            {/* THE ACTUAL LOGO - Berikan ruang dalaman (Padding/Scale) */}
            <div style={{ position: "relative", width: "70%", height: "70%", zIndex: 6 }}>
              <Image 
                src="/logo2.png" 
                alt="Savvyra Logo" 
                fill 
                priority 
                className="object-contain" // Contain supaya tak terpotong
              />
            </div>
          </div>
        </div>

        {/* BRANDING */}
        <div style={{ marginTop:40, textAlign:"center", animation: enter ? "slide-up-fade 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s both" : "none" }}>
          <h1 style={{ fontSize:48, fontWeight:900, letterSpacing:"-2px", margin:0, background:"linear-gradient(90deg, #fff 0%, #E8A0A0 45%, #E8C97A 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            Savvyra
          </h1>
          <p style={{ marginTop:12, fontSize:10, letterSpacing:"0.35em", textTransform:"uppercase", color:"rgba(255,255,255,0.45)", animation: enter ? "slide-up-fade 0.8s cubic-bezier(0.22,1,0.36,1) 0.5s both" : "none" }}>
            Smart money, soft living.
          </p>
        </div>

        {/* LOADING BAR */}
        <div style={{ position:"absolute", bottom:64, width:200, height:3, borderRadius:99, overflow:"hidden", background:"rgba(255,255,255,0.08)", animation: enter ? "slide-up-fade 0.6s ease 0.7s both" : "none" }}>
          <div style={{ height:"100%", width:"60%", borderRadius:99, background:"linear-gradient(90deg, #E8A0A0, #E8C97A)", animation:"loader-sweep 1.6s ease-in-out infinite" }} />
        </div>

        {/* FOOTER */}
        <p style={{ position:"absolute", bottom:36, fontSize:10, color:"rgba(255,255,255,0.22)", letterSpacing:"0.05em", animation: enter ? "slide-up-fade 0.6s ease 0.9s both" : "none" }}>
          Loading your future...
        </p>
      </div>
    </div>
  );
}