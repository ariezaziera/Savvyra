"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // redirect to dashboard
      router.push("/");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const [isAuthChecked, setIsAuthChecked] = useState(false);

    useEffect(() => {
    const checkAuth = async () => {
        // Give cookies/localStorage a moment
        await new Promise(resolve => setTimeout(resolve, 50));
        const token = localStorage.getItem('token'); // or check cookie
        if (!token) router.push('/login');
        setIsAuthChecked(true);
    };
    checkAuth();
    }, []);

    // if (!isAuthChecked) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen items-center justify-center px-8 pt-32 md:pt-20 pb-48 md:pb-16">
      <div className="w-full max-w-sm md:max-w-4xl rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        
        <div className="flex flex-col md:flex-row">

          {/* Left — branding (desktop only) */}
          <div className="hidden md:flex flex-col justify-center items-start gap-4 w-1/2 bg-[#5D0D18] px-10 py-12">
            <div className="h-10 w-10 overflow-hidden rounded-full mb-2">
              <Image src="/logo512.png" alt="Savvyra" width={60} height={60} className="h-full w-full object-cover" />
            </div>
            <p className="text-3xl font-semibold text-[#FFF9EB] leading-snug">
              Take control of your finances.
            </p>
            <p className="text-sm text-[#FFF9EB]/60">
              Track spending, grow savings, and stay on top of your commitments — all in one place.
            </p>
          </div>

          {/* Right — form */}
          <div className="w-full md:w-1/2 p-6 md:p-10">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-sm text-gray-500 mb-6">Login to your Savvyra account</p>

            <form onSubmit={handleLogin} className="space-y-4">
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
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-500 text-center">
              No account?{" "}
              <a href="/register" className="text-[#5D0D18] hover:underline">Register</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}