"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const WARNING_TIME  = 30 * 1000; // 30 seconds inactivity before warning
const COUNTDOWN_TIME = 10;       // seconds to auto-logout after warning

const PUBLIC_ROUTES = ["/login", "/register", "/onboarding"];

export default function SessionTimeout() {
  const router   = useRouter();
  const pathname = usePathname();

  const timeoutRef      = useRef<NodeJS.Timeout | null>(null);
  const countdownRef    = useRef<NodeJS.Timeout | null>(null);
  // ✅ Ref that always points at the latest handleLogout — prevents stale closure
  const handleLogoutRef = useRef<() => void>(() => {});

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);

  /* ─────────────────────────────────────────────
     LOGOUT
     useCallback so it's stable across renders,
     but we also keep the ref up to date below.
  ───────────────────────────────────────────── */
  const handleLogout = useCallback(async () => {
    // stop timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // reset modal state
    setShowModal(false);
    setCountdown(COUNTDOWN_TIME);

    // logout request
    await fetch("/api/logout", {
      method: "POST",
    });

    // navigate
    router.push("/login");
  }, [router]);

  // Keep the ref pointing at the latest version of handleLogout
  // so the setInterval closure is never stale ✅
  useEffect(() => {
    handleLogoutRef.current = handleLogout;
  }, [handleLogout]);

  useEffect(() => {
    if (pathname && PUBLIC_ROUTES.includes(pathname)) {
      setShowModal(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    }
  }, [pathname]);

  /* ─────────────────────────────────────────────
     START COUNTDOWN
  ───────────────────────────────────────────── */
  const startCountdown = useCallback(() => {
    console.log("startCountdown function executed", Date.now());

    setCountdown(COUNTDOWN_TIME);

    countdownRef.current = setInterval(() => {
        console.log("interval tick", Date.now());

        setCountdown((prev) => {
        if (prev <= 1) {
            handleLogoutRef.current();
            return 0;
        }

        return prev - 1;
        });
    }, 1000);
    }, []); // no deps — reads handleLogoutRef dynamically

  /* ─────────────────────────────────────────────
     RESET INACTIVITY TIMER
  ───────────────────────────────────────────── */
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
        console.log("MODAL OPEN", Date.now());

        setShowModal(true);

        console.log("COUNTDOWN START", Date.now());

        startCountdown();
    }, WARNING_TIME);
    }, [startCountdown]);

  /* ─────────────────────────────────────────────
     CONTINUE SESSION
  ───────────────────────────────────────────── */
  const continueSession = useCallback(() => {
    setShowModal(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    resetTimer();
  }, [resetTimer]);

  /* ─────────────────────────────────────────────
     USER ACTIVITY LISTENERS
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (pathname && PUBLIC_ROUTES.includes(pathname)) return;

    const events = ["mousemove", "mousedown", "keypress", "touchstart", "scroll"];
    const activityHandler = () => {
      if (!showModal) resetTimer();
    };

    events.forEach((e) => window.addEventListener(e, activityHandler));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, activityHandler));
      if (timeoutRef.current)   clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showModal, pathname, resetTimer]);

  /* ── Early return AFTER all hooks ── */
  if (pathname && PUBLIC_ROUTES.includes(pathname)) return null;
  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)" }}
    >
      <div
        style={{
          width: "90%", maxWidth: 380, padding: 28, borderRadius: 24,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(28px)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
        }}
      >
        <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 10, letterSpacing: "-0.5px" }}>
          Session expiring
        </h2>

        <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 22, fontSize: 14 }}>
          Your session will end due to inactivity. Countdown will START soon.
        </p>

        <div style={{ fontSize: 44, fontWeight: 700, color: "#E8C97A", textAlign: "center", marginBottom: 24, letterSpacing: "-2px" }}>
          {countdown}s
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            style={{
              flex: 1, height: 50, borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff", fontWeight: 600, cursor: "pointer",
            }}
          >
            Logout
          </button>

          <button
            onClick={continueSession}
            style={{
              flex: 1, height: 50, borderRadius: 14, border: "none",
              background: "linear-gradient(135deg,#E8A0A0 0%,#E8C97A 100%)",
              color: "#453284", fontWeight: 700, cursor: "pointer",
              boxShadow: "0 6px 24px rgba(232,162,160,0.35)",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}