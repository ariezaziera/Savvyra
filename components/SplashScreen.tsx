"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [enter, setEnter] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setEnter(true), 200);
    const t2 = setTimeout(() => setShow(false), 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-99999 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* THEME BLOBS */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* GLASS OVERLAY */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.15)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
        }}
      />

      {/* RIPPLE EFFECT */}
      <div className="absolute left-1/2 top-1/2">
        <div className="relative">
          <span className="absolute h-65 w-65 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 animate-ripple" />

          <span
            className="absolute h-90 w-90 -translate-x-1/2 -translate-y-1/2 rounded-full border animate-ripple-delayed"
            style={{
              borderColor: "color-mix(in srgb, var(--blob-2) 20%, transparent)",
            }}
          />

          <span
            className="absolute h-120 w-120 -translate-x-1/2 -translate-y-1/2 rounded-full border animate-ripple-slow"
            style={{
              borderColor: "color-mix(in srgb, var(--blob-3) 15%, transparent)",
            }}
          />
        </div>
      </div>

      {/* FLOATING PARTICLES */}
      <div className="absolute left-[15%] top-[20%] h-2 w-2 rounded-full bg-white/50 animate-twinkle" />
      <div
        className="absolute right-[18%] top-[28%] h-1.5 w-1.5 rounded-full animate-twinkle-delay"
        style={{
          background: "color-mix(in srgb, var(--blob-3) 70%, white)",
        }}
      />
      <div
        className="absolute bottom-[22%] left-[20%] h-2 w-2 rounded-full animate-twinkle"
        style={{
          background: "color-mix(in srgb, var(--blob-2) 70%, white)",
        }}
      />
      <div className="absolute bottom-[18%] right-[25%] h-1.5 w-1.5 rounded-full bg-white/40 animate-twinkle-delay" />

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        {/* CENTER GROUP */}
        <div
          className={`
            relative h-35 w-65
            transition-all duration-1000
            ${enter ? "opacity-100 scale-100" : "opacity-0 scale-90"}
          `}
        >
          {/* GLASS CARD (CENTERED) */}
          <div
            className="absolute left-1/2 top-1/2 h-27.5 w-27.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
            }}
          />

          {/* GLASS CIRCLE (CENTERED) */}
          <div
            className="absolute left-1/2 top-1/2 h-23.75 w-23.75 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
            }}
          />

          {/* LOGO (CENTERED) */}
          <div className="absolute left-1/2 top-1/2 h-18.75 w-18.75 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-white shadow-lg">
            <Image
              src="/logo.png"
              alt="Savvyra Logo"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        {/* BRANDING */}
        <div
          className={`
            mt-12 text-center transition-all duration-2000 delay-200
            ${enter ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
          `}
        >
          <h1
            className="bg-clip-text text-5xl font-black tracking-tight text-transparent"
            style={{
              backgroundImage: `linear-gradient(
                90deg,
                var(--text-primary),
                var(--blob-2),
                var(--blob-3)
              )`,
            }}
          >
            Savvyra
          </h1>

          <p className="mt-5 text-[10px] tracking-[0.35em] uppercase text-white/50">
            Smart money, soft living.
          </p>
        </div>

        {/* LOADING BAR */}
        <div className="absolute -bottom-22.5 w-55 overflow-hidden rounded-full glass">
          <div
            className="h-0.75 w-full animate-loader rounded-full"
            style={{
              backgroundImage: `linear-gradient(
                90deg,
                var(--blob-1),
                var(--blob-3),
                var(--blob-2)
              )`,
            }}
          />
        </div>

        {/* FOOTER TEXT */}
        <p className="absolute bottom-10 text-center text-[10px] text-white/25">
          Loading your future...
        </p>
      </div>
    </div>
  );
}