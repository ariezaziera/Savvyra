"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const INACTIVITY_TIME    = 5 * 60 * 1000;  // 5 min no activity → warning modal
const COUNTDOWN_TIME     = 60;              // 60s to respond before auto-logout
const BACKGROUND_TIMEOUT = 15 * 1000;  // 5 min in background → auto-logout

const LAST_SEEN_KEY = "savvyra_last_seen";

const PUBLIC_ROUTES = ["/login", "/register", "/onboarding"];

export default function SessionTimeout() {
  const router   = useRouter();
  const pathname = usePathname();

  const inactivityRef   = useRef<NodeJS.Timeout | null>(null);
  const countdownRef    = useRef<NodeJS.Timeout | null>(null);
  const backgroundRef   = useRef<NodeJS.Timeout | null>(null);
  const hiddenAtRef     = useRef<number | null>(null);
  const handleLogoutRef = useRef<() => void>(() => {});

  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);

  const isPublicRoute = !!(pathname && PUBLIC_ROUTES.includes(pathname));

  /* ─────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────── */
  const stampLastSeen = () => {
    try {
      sessionStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
    } catch {}
  };

  const clearLastSeen = () => {
    try {
      sessionStorage.removeItem(LAST_SEEN_KEY);
    } catch {}
  };

  const getElapsedSinceLastSeen = (): number => {
    try {
      const raw = sessionStorage.getItem(LAST_SEEN_KEY);
      if (!raw) return Infinity; // no record = treat as expired
      return Date.now() - parseInt(raw, 10);
    } catch {
      return Infinity;
    }
  };

  /* ─────────────────────────────────────────────
     LOGOUT
  ───────────────────────────────────────────── */
  const handleLogout = useCallback(async () => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    if (countdownRef.current)  clearInterval(countdownRef.current);
    if (backgroundRef.current) clearTimeout(backgroundRef.current);

    setShowModal(false);
    setCountdown(COUNTDOWN_TIME);
    clearLastSeen();

    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }, [router]);

  useEffect(() => {
    handleLogoutRef.current = handleLogout;
  }, [handleLogout]);

  /* ─────────────────────────────────────────────
     COUNTDOWN
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
     INACTIVITY TIMER
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
    stampLastSeen();
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  /* ─────────────────────────────────────────────
     STARTUP CHECK
     Runs once on mount — if app was cleared from
     recents or left too long, logout immediately.
     sessionStorage is wiped when PWA is killed,
     so getElapsedSinceLastSeen() returns Infinity.
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (isPublicRoute) return;

    const elapsed = getElapsedSinceLastSeen();

    if (elapsed >= BACKGROUND_TIMEOUT) {
      handleLogoutRef.current();
      return;
    }

    stampLastSeen();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─────────────────────────────────────────────
     CLEAR TIMERS ON PUBLIC ROUTES
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (!isPublicRoute) return;
    setShowModal(false);
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    if (countdownRef.current)  clearInterval(countdownRef.current);
    if (backgroundRef.current) clearTimeout(backgroundRef.current);
  }, [isPublicRoute]);

  /* ─────────────────────────────────────────────
     ACTIVITY LISTENERS
     Updates last-seen stamp on every interaction.
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (isPublicRoute) return;

    const events = ["mousemove", "mousedown", "keypress", "touchstart", "scroll"];
    const onActivity = () => {
      if (!showModal) {
        resetInactivityTimer();
        stampLastSeen();
      }
    };

    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    resetInactivityTimer();
    stampLastSeen();

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
      if (countdownRef.current)  clearInterval(countdownRef.current);
    };
  }, [showModal, isPublicRoute, resetInactivityTimer]);

  /* ─────────────────────────────────────────────
     VISIBILITY CHANGE
     Handles home button, tab switch, app switcher.
     Also does elapsed-time check on return in case
     OS throttled/froze the background timer.
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (isPublicRoute) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        stampLastSeen();

        backgroundRef.current = setTimeout(() => {
          handleLogoutRef.current();
        }, BACKGROUND_TIMEOUT);

      } else {
        if (backgroundRef.current) clearTimeout(backgroundRef.current);

        // Manual elapsed check — OS may have frozen the setTimeout
        const elapsed = hiddenAtRef.current
          ? Date.now() - hiddenAtRef.current
          : getElapsedSinceLastSeen();

        if (elapsed >= BACKGROUND_TIMEOUT) {
          handleLogoutRef.current();
          return;
        }

        hiddenAtRef.current = null;
        stampLastSeen();
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
     BEFORE UNLOAD
     Best-effort on tab/browser close.
     Unreliable on mobile but still worth having.
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (isPublicRoute) return;

    const onUnload = () => {
      navigator.sendBeacon("/api/logout");
      clearLastSeen();
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