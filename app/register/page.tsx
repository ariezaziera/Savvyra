"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  HandCoins,
  PiggyBank,
} from "lucide-react";
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
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
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#453284]">

      {/* Aurora Blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <style>{`
        .blob {
          position: fixed;
          border-radius: 9999px;
          pointer-events: none;
          z-index: 0;
          will-change: transform;
        }

        .blob-1 {
          width: 500px;
          height: 500px;
          background: #6A49FA;
          top: -150px;
          left: -150px;
          filter: blur(120px);
          opacity: 0.85;
          animation: blob-drift-1 12s ease-in-out infinite alternate;
        }

        .blob-2 {
          width: 450px;
          height: 450px;
          background: #C6E6FF;
          bottom: -100px;
          right: -100px;
          filter: blur(110px);
          opacity: 0.55;
          animation: blob-drift-2 15s ease-in-out infinite alternate;
        }

        .blob-3 {
          width: 380px;
          height: 380px;
          background: #FEDADA;
          top: 30%;
          right: 10%;
          filter: blur(100px);
          opacity: 0.45;
          animation: blob-drift-3 10s ease-in-out infinite alternate;
        }

        @keyframes blob-drift-1 {
          from {
            transform: translate(0, 0) scale(1);
          }

          to {
            transform: translate(40px, 60px) scale(1.1);
          }
        }

        @keyframes blob-drift-2 {
          from {
            transform: translate(0, 0) scale(1);
          }

          to {
            transform: translate(-50px, -40px) scale(1.08);
          }
        }

        @keyframes blob-drift-3 {
          from {
            transform: translate(0, 0) scale(1);
          }

          to {
            transform: translate(30px, -50px) scale(0.95);
          }
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

        @keyframes typingWord {
          from {
            width: 0;
          }

          to {
            width: 13ch;
          }
        }

        @keyframes blink {
          50% {
            border-color: transparent;
          }
        }
      `}</style>

      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col justify-between px-16 py-14">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/logo512.png"
                alt="Savvyra"
                width={58}
                height={58}
              />
            </div>

            <span className="text-2xl font-semibold tracking-tight text-white">
              Savvyra
            </span>
          </div>

          {/* Branding */}
          <div className="max-w-xl">
            <h1 className="text-6xl font-semibold leading-[1.05] tracking-tight text-white">
              Build better
              <br />

              <span className="typing-word text-[#E8A0A0] font-extrabold">
                financial habits.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-white/65">
              Start tracking expenses, saving smarter, and organizing
              your financial life with clarity and confidence.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="flex flex-col gap-3 max-w-md">

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-xl">
              <PiggyBank
                size={18}
                className="shrink-0 text-[#C6E6FF]"
              />

              <p className="text-sm text-white/75">
                Track savings goals with real progress
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-xl">
              <ArrowLeftRight
                size={18}
                className="shrink-0 text-[#C6E6FF]"
              />

              <p className="text-sm text-white/75">
                Organize transactions effortlessly
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-xl">
              <HandCoins
                size={18}
                className="shrink-0 text-[#FEDADA]"
              />

              <p className="text-sm text-white/75">
                Never miss financial commitments
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="text-sm text-white/30">
            Crafted by Arieza for modern financial living.
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex items-center justify-center md:justify-end px-6 md:px-14 py-10">

          {/* Floating Card */}
          <div
            className="w-full max-w-md rounded-4xl p-6 md:p-8 shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >

            {/* Mobile Logo */}
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <Image
                src="/logo512.png"
                alt="Savvyra"
                width={46}
                height={46}
                className="rounded-xl"
              />

              <span className="text-xl font-semibold text-white">
                Savvyra
              </span>
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Create account
            </h2>

            <p className="mt-2 text-sm text-white/55">
              Start managing your finances with confidence
            </p>

            <form
              onSubmit={handleRegister}
              className="mt-8 space-y-5"
            >

              {/* Name */}
              <div>
                <label className="text-sm text-white/70">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/25 focus:bg-white/15"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-white/70">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/25 focus:bg-white/15"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm text-white/70">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/25 focus:bg-white/15"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-[#FEDADA]">
                  {error}
                </p>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-[#453284] transition duration-300 hover:scale-[1.01] disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs tracking-wide text-white/40">
                  OR CONTINUE WITH
                </span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/8 py-3 text-sm font-medium text-white transition hover:bg-white/12"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-5 w-5"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.2 36 26.7 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.3 5.4-6.2 6.8l6.2 5.2C39.2 36.5 44 31 44 24c0-1.3-.1-2.3-.4-3.5z"
                  />
                </svg>

                Continue with Google
              </button>
            </form>

            {/* Login */}
            <p className="mt-6 text-center text-sm text-white/45">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-[#C6E6FF] hover:underline"
              >
                Login
              </a>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}