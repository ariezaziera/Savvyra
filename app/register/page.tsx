"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ─────────────────────────────────────────────────────────────────
   FloatingLabel — matches login page exactly
───────────────────────────────────────────────────────────────── */
interface FloatingLabelProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}

function FloatingLabel({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
}: FloatingLabelProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <label
        style={{
          position: "absolute",
          left: 16,
          top: lifted ? 9 : "50%",
          transform: lifted ? "none" : "translateY(-50%)",
          fontSize: lifted ? 10 : 14,
          fontWeight: 500,
          color: focused ? "#E8C97A" : "rgba(255,255,255,0.4)",
          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
          zIndex: 1,
          letterSpacing: lifted ? "0.4px" : 0,
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: 56,
          borderRadius: 14,
          background: focused
            ? "rgba(255,255,255,0.11)"
            : "rgba(255,255,255,0.07)",
          border: focused
            ? "1px solid rgba(232,201,122,0.65)"
            : "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 500,
          paddingTop: lifted ? 18 : 0,
          paddingLeft: 16,
          paddingRight: 16,
          outline: "none",
          boxSizing: "border-box",
          transition: "all 0.2s ease",
          boxShadow: focused
            ? "0 0 0 3px rgba(232,201,122,0.1)"
            : "none",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Google icon SVG
───────────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.2 36 26.7 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.3 5.4-6.2 6.8l6.2 5.2C39.2 36.5 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Loading dots — matches login page
───────────────────────────────────────────────────────────────── */
function LoadingDots() {
  return (
    <span className="flex items-center justify-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#453284",
            display: "inline-block",
            animation: `loginDot 0.9s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Entry animation
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Register failed");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#453284]">

      {/* ── Aurora blobs ── */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* ── Scoped styles — identical to login page ── */}
      <style>{`
        @keyframes loginSlideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes loginFadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes loginDot {
          0%,80%,100% { transform:scale(0); opacity:0.4; }
          40%          { transform:scale(1); opacity:1;   }
        }
        @keyframes typingWord {
          from { width:0; }
          to   { width:18ch; }
        }
        @keyframes blink {
          50% { border-color:transparent; }
        }
        .login-enter {
          animation: loginSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        .login-fade {
          animation: loginFadeIn 0.4s ease both;
        }
        .typing-word {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid #C6E6FF;
          width: 0;
          animation:
            typingWord 3s steps(30, end) infinite alternate,
            blink 0.8s step-end infinite;
        }
      `}</style>

      {/* ── Two-column grid ── */}
      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-2">

        {/* ════ LEFT SIDE — desktop only ════ */}
        <div className="hidden md:flex flex-col justify-between px-16 py-14">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="overflow-hidden rounded-2xl">
              <Image src="/logo512.png" alt="Savvyra" width={58} height={58} />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white">
              Savvyra
            </span>
          </div>

          {/* Hero text */}
          <div className="max-w-xl">
            <h1 className="text-6xl font-semibold leading-[1.05] tracking-tight text-white">
              Build better
              <br />
              <span className="typing-word bg-linear-to-r from-[#E8A0A0] to-[#E8C97A] bg-clip-text text-transparent font-extrabold drop-shadow-[0_0_8px_rgba(232,201,122,0.35)]">
                financial habits.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/65">
              Start tracking expenses, saving smarter, and organizing
              your financial life with clarity and confidence.
            </p>
          </div>

          <div className="text-sm tracking-wide text-white/30">
            Crafted by Arieza Aziera for modern financial living.
          </div>
        </div>

        {/* ════ RIGHT SIDE — auth card ════ */}
        <div
          className="relative flex items-center justify-center md:justify-end px-5 md:px-14"
          style={{
            paddingTop: "env(safe-area-inset-top, 52px)",
            paddingBottom: "env(safe-area-inset-bottom, 40px)",
          }}
        >
          <div
            className={`w-full max-w-md ${mounted ? "login-enter" : ""}`}
            style={{
              opacity: mounted ? undefined : 0,
              animationDelay: "0.05s",
            }}
          >

            {/* ── Mobile logo ── */}
            <div
              className="mb-7 flex items-center gap-3 md:hidden login-fade"
              style={{ animationDelay: "0.08s" }}
            >
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 40, height: 40,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Image src="/logo512.png" alt="Savvyra" width={26} height={26} />
              </div>
              <span className="text-lg font-semibold text-white">Savvyra</span>
            </div>

            {/* ── Greeting ── */}
            <div
              className="login-fade mb-8"
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="text-[28px] font-bold tracking-tight text-white leading-tight">
                Create account
              </h2>
              <p className="mt-1.5 text-sm text-white/50">
                Start managing your finances with confidence
              </p>
            </div>

            {/* ── Glass card ── */}
            <div
              className="login-enter"
              style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 24,
                padding: "24px 20px 20px",
                marginBottom: 14,
                animationDelay: "0.12s",
              }}
            >
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

                <FloatingLabel
                  label="Full name"
                  type="text"
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                />

                <FloatingLabel
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />

                <FloatingLabel
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                />

                {/* Error */}
                {error && (
                  <p
                    className="text-sm"
                    style={{ color: "#FEDADA", marginBottom: 14, marginTop: -8 }}
                  >
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: 54,
                    borderRadius: 14,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    background: "linear-gradient(135deg,#E8A0A0 0%,#E8C97A 100%)",
                    color: "#453284",
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: "-0.2px",
                    boxShadow: "0 4px 24px rgba(232,162,160,0.35)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
                    opacity: loading ? 0.75 : 1,
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading)
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.015)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  }}
                >
                  {loading ? <LoadingDots /> : "Create Account"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3" style={{ marginTop: 18, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "1px", textTransform: "uppercase" }}>
                    or continue with
                  </span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                </div>

                {/* Google */}
                <button
                  type="button"
                  style={{
                    width: "100%",
                    height: 50,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 14,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.11)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
                  }}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

              </form>
            </div>

            {/* Login link */}
            <p
              className="login-fade text-center text-sm"
              style={{ color: "rgba(255,255,255,0.4)", animationDelay: "0.2s" }}
            >
              Already have an account?{" "}
              <a
                href="/login"
                style={{ color: "#E8C97A", fontWeight: 600, textDecoration: "none" }}
              >
                Sign in
              </a>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}