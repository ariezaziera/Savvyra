"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const INACTIVITY_TIME    = 10 * 1000;  // 5 min inactivity → show warning modal
const COUNTDOWN_TIME     = 60;              // 60 seconds to respond before auto-logout
const BACKGROUND_TIMEOUT = 15 * 1000;  // 5 min in background → auto-logout

const PUBLIC_ROUTES = ["/login", "/register", "/onboarding"];

export default function SessionTimeout() {
  const router   = useRouter();
  const pathname = usePathname();

  const inactivityRef   = useRef<NodeJS.Timeout | null>(null);
  const countdownRef    = useRef<NodeJS.Timeout | null>(null);
  const backgroundRef   = useRef<NodeJS.Timeout | null>(null);
  const hiddenAtRef     = useRef<number | null>(null);  // timestamp when app went to background
  const handleLogoutRef = useRef<() => void>(() => {});

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);

  const isPublicRoute = pathname && PUBLIC_ROUTES.includes(pathname);

  /* ─────────────────────────────────────────────
     LOGOUT — clears everything and redirects
  ───────────────────────────────────────────── */
  const handleLogout = useCallback(async () => {
    if (inactivityRef.current)  clearTimeout(inactivityRef.current);
    if (countdownRef.current)   clearInterval(countdownRef.current);
    if (backgroundRef.current)  clearTimeout(backgroundRef.current);

    setShowModal(false);
    setCountdown(COUNTDOWN_TIME);

    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }, [router]);

  // Keep ref fresh so interval/timeout closures are never stale
  useEffect(() => {
    handleLogoutRef.current = handleLogout;
  }, [handleLogout]);

  /* ─────────────────────────────────────────────
     COUNTDOWN — runs after warning modal appears
  ───────────────────────────────────────────── */
  const startCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_TIME);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleLogoutRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /* ─────────────────────────────────────────────
     INACTIVITY TIMER — resets on user activity
  ───────────────────────────────────────────── */
  const resetInactivityTimer = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => {
      setShowModal(true);
      startCountdown();
    }, INACTIVITY_TIME);
  }, [startCountdown]);

  /* ─────────────────────────────────────────────
     CONTINUE SESSION
  ───────────────────────────────────────────── */
  const continueSession = useCallback(() => {
    setShowModal(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  /* ─────────────────────────────────────────────
     CLEAR TIMERS ON PUBLIC ROUTES
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (!isPublicRoute) return;
    setShowModal(false);
    if (inactivityRef.current)  clearTimeout(inactivityRef.current);
    if (countdownRef.current)   clearInterval(countdownRef.current);
    if (backgroundRef.current)  clearTimeout(backgroundRef.current);
  }, [isPublicRoute]);

  /* ─────────────────────────────────────────────
     INACTIVITY LISTENERS — mouse, touch, keyboard
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (isPublicRoute) return;

    const events = ["mousemove", "mousedown", "keypress", "touchstart", "scroll"];
    const onActivity = () => {
      if (!showModal) resetInactivityTimer();
    };

    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    resetInactivityTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      if (inactivityRef.current)  clearTimeout(inactivityRef.current);
      if (countdownRef.current)   clearInterval(countdownRef.current);
    };
  }, [showModal, isPublicRoute, resetInactivityTimer]);

  /* ─────────────────────────────────────────────
     VISIBILITY CHANGE — handles:
     • App goes to background (tab switch, home button, swipe away)
     • App comes back to foreground
     • Checks elapsed time when returning — if > BACKGROUND_TIMEOUT, logout
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (isPublicRoute) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        // App went to background — record timestamp + start background timer
        hiddenAtRef.current = Date.now();

        backgroundRef.current = setTimeout(() => {
          handleLogoutRef.current();
        }, BACKGROUND_TIMEOUT);

      } else {
        // App came back to foreground
        if (backgroundRef.current) clearTimeout(backgroundRef.current);

        // Also check elapsed time manually (in case setTimeout was throttled by OS)
        if (hiddenAtRef.current) {
          const elapsed = Date.now() - hiddenAtRef.current;
          if (elapsed >= BACKGROUND_TIMEOUT) {
            handleLogoutRef.current();
            return;
          }
        }

        hiddenAtRef.current = null;
        // Resume inactivity timer from foreground
        if (!showModal) resetInactivityTimer();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (backgroundRef.current) clearTimeout(backgroundRef.current);
    };
  }, [isPublicRoute, showModal, resetInactivityTimer]);

  /* ─────────────────────────────────────────────
     BEFORE UNLOAD — best-effort cleanup on
     tab close / browser kill / PWA swipe-away
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (isPublicRoute) return;

    const onUnload = () => {
      // sendBeacon is fire-and-forget — works even as page is closing
      navigator.sendBeacon("/api/logout");
    };

    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [isPublicRoute]);

  /* ── Early returns after all hooks ── */
  if (isPublicRoute) return null;
  if (!showModal)    return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
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
          You've been inactive for a while. You'll be logged out automatically.
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