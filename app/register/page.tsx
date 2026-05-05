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
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="flex min-h-screen items-center justify-center px-8 pt-32 md:pt-12 pb-48 md:pb-16">
      <div className="w-full max-w-sm md:max-w-4xl rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">

        <div className="flex flex-col md:flex-row">

          {/* Left — form */}
          <div className="w-full md:w-1/2 p-6 md:p-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create account</h1>
            <p className="text-sm text-gray-500 mb-6">Start managing your finances with Savvyra</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-gray-700">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5D0D18] focus:ring-2 focus:ring-[#5D0D18]/10"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5D0D18] focus:ring-2 focus:ring-[#5D0D18]/10"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#5D0D18] focus:ring-2 focus:ring-[#5D0D18]/10"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#5D0D18] py-3 text-sm font-medium text-[#FFF9EB] hover:bg-[#3d0810] transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-500 text-center">
              Already have an account?{" "}
              <a href="/login" className="text-[#5D0D18] hover:underline">Login</a>
            </p>
          </div>

          {/* Right — branding (desktop only) */}
          <div className="hidden md:flex flex-col justify-between items-start w-1/2 bg-[#5D0D18] px-10 py-12">
            <div className="h-10 w-10 overflow-hidden rounded-full">
              <Image src="/logo512.png" alt="Savvyra" width={60} height={60} className="h-full w-full object-cover" />
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-3xl font-semibold text-[#FFF9EB] leading-snug">
                Your finances,<br />finally organized.
              </p>
              <p className="text-sm text-[#FFF9EB]/60">
                Set savings goals, track commitments, and understand where your money goes — all in one place.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center gap-3 bg-[#FFF9EB]/10 rounded-xl px-4 py-3">
                <PiggyBank size={18} className="text-[#FFF9EB]/60 shrink-0" />
                <p className="text-sm text-[#FFF9EB]/80">Track savings goals with real progress</p>
              </div>
              <div className="flex items-center gap-3 bg-[#FFF9EB]/10 rounded-xl px-4 py-3">
                <ArrowLeftRight size={18} className="text-[#FFF9EB]/60 shrink-0" />
                <p className="text-sm text-[#FFF9EB]/80">Monitor transactions at a glance</p>
              </div>
              <div className="flex items-center gap-3 bg-[#FFF9EB]/10 rounded-xl px-4 py-3">
                <HandCoins size={18} className="text-[#FFF9EB]/60 shrink-0" />
                <p className="text-sm text-[#FFF9EB]/80">Never miss a financial commitment</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}