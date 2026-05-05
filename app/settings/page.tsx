"use client";

import PageContainer from "@/components/PageContainer";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const [expanded, setExpanded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const pathname = usePathname();
  
    const isAuthPage = pathname === "/login" || pathname === "/register";
  
    useEffect(() => {
      if (isAuthPage) return;
      const checkAuth = async () => {
        try {
          const res = await fetch("/api/auth/me");
          setIsLoggedIn(res.ok);
        } catch {
          setIsLoggedIn(false);
        }
      };
      checkAuth();
    }, [isAuthPage]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your app preferences and display options
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            General Preferences
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Control your default app experience
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Currency</p>
              <p className="mt-1 text-sm text-gray-500">
                Malaysian Ringgit (RM)
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Theme</p>
              <p className="mt-1 text-sm text-gray-500">
                Light Minimal Fintech
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Notifications</p>
              <p className="mt-1 text-sm text-gray-500">
                Payment reminders and savings updates
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          <p className="mt-1 text-sm text-gray-500">
            Profile and sync settings will appear here
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Profile Name</p>
              <p className="mt-1 text-sm text-gray-500">Savvyra User</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Data Sync</p>
              <p className="mt-1 text-sm text-gray-500">
                Cloud sync will be available after backend integration
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
              <p className="text-sm font-medium text-gray-900">Security</p>
              <p className="mt-1 text-sm text-gray-500">
                Authentication and privacy settings coming soon
              </p>
            </div>
          </div>
        </section>
       
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm justify-center font-bold
            text-[#FFF9EB] bg-[#5D0D18] transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </PageContainer>
  );
}