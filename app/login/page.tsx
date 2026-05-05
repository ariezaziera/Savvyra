"use client";

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
    <div className="flex min-h-screen items-center justify-center px-8 pb-48 md:pb-16">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Login to your Savvyra account
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-500 text-center">
          No account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}