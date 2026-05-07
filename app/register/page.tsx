"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, HandCoins, PiggyBank } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        return;
      }

      router.push("/login");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-8 pt-32 md:pt-12 pb-48 md:pb-16 overflow-hidden bg-[#453284]">

      {/* Aurora blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <style>{`
        .blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          will-change: transform;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: #6A49FA;
          top: -150px; left: -150px;
          filter: blur(120px);
          opacity: 0.85;
          animation: blob-drift-1 12s ease-in-out infinite alternate;
        }
        .blob-2 {
          width: 450px; height: 450px;
          background: #C6E6FF;
          bottom: -100px; right: -100px;
          filter: blur(110px);
          opacity: 0.55;
          animation: blob-drift-2 15s ease-in-out infinite alternate;
        }
        .blob-3 {
          width: 380px; height: 380px;
          background: #FEDADA;
          top: 30%; right: 10%;
          filter: blur(100px);
          opacity: 0.45;
          animation: blob-drift-3 10s ease-in-out infinite alternate;
        }
        @keyframes blob-drift-1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 60px) scale(1.1); }
        }
        @keyframes blob-drift-2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-50px, -40px) scale(1.08); }
        }
        @keyframes blob-drift-3 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -50px) scale(0.95); }
        }
      `}</style>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm md:max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        <div className="flex flex-col md:flex-row">

          {/* Left — form */}
          <div className="w-full md:w-1/2 p-6 md:p-10">
            <h1 className="text-2xl font-semibold text-white mb-2">Create account</h1>
            <p className="text-sm text-white/50 mb-6">Start managing your finances with Savvyra</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-white/70">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-[#FEDADA]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-medium text-white transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6A49FA, #453284)' }}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <p className="mt-4 text-sm text-white/50 text-center">
              Already have an account?{" "}
              <a href="/login" className="text-[#C6E6FF] hover:underline">Login</a>
            </p>
          </div>

          {/* Right — branding (desktop only) */}
          <div
            className="hidden md:flex flex-col justify-between items-start w-1/2 px-10 py-12"
            style={{ background: 'rgba(106,73,250,0.35)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image src="/logo512.png" alt="Savvyra" width={60} height={60} className="h-full w-full object-cover" />
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-3xl font-semibold text-white leading-snug">
                Your finances,<br />finally organized.
              </p>
              <p className="text-sm text-white/60">
                Set savings goals, track commitments, and understand where your money goes — all in one place.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <PiggyBank size={18} className="text-[#C6E6FF] shrink-0" />
                <p className="text-sm text-white/80">Track savings goals with real progress</p>
              </div>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <ArrowLeftRight size={18} className="text-[#C6E6FF] shrink-0" />
                <p className="text-sm text-white/80">Monitor transactions at a glance</p>
              </div>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <HandCoins size={18} className="text-[#FEDADA] shrink-0" />
                <p className="text-sm text-white/80">Never miss a financial commitment</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}