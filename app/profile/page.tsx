"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageContainer from "@/components/PageContainer";
import { useUser } from "@/hooks/useUser";
import { Pencil, Check, X, Mail, Calendar, Shield, ChevronLeft } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refetch } = useUser();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const startEdit = () => {
    setNameInput(user?.name ?? "");
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = async () => {
    if (!nameInput.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      if (res.ok) {
        await refetch();
        setEditing(false);
        setToast("Profile updated! ✨");
        setTimeout(() => setToast(""), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitial = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <PageContainer>
      {/* Blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <style>{`
        .blob { position: fixed; border-radius: 9999px; pointer-events: none; z-index: 0; }
        .blob-1 { width: 500px; height: 500px; background: #6a49fa; top: -150px; left: -150px; filter: blur(130px); opacity: 0.45; }
        .blob-2 { width: 400px; height: 400px; background: #fedada; bottom: -100px; right: -100px; filter: blur(120px); opacity: 0.30; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          {toast}
        </div>
      )}

      <div className="relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Account</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">My Profile</h1>
          <p className="mt-1.5 text-sm text-white/50">Manage your personal information.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-5"
          >
            {/* Avatar Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
              <div className="flex items-center gap-5">
                {/* Avatar */}
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name ?? "Profile"}
                    className="h-20 w-20 rounded-full object-cover border-2 border-white/20 shadow-xl"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full flex items-center justify-center border-2 border-white/20 shadow-xl bg-gradient-to-br from-[#6A49FA] to-[#C4B5FD]">
                    <span className="text-3xl font-bold text-white">{getInitial(user?.name)}</span>
                  </div>
                )}

                {/* Name + Edit */}
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        className="flex-1 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#6A49FA]/60 focus:ring-2 focus:ring-[#6A49FA]/20"
                        placeholder="Your name"
                      />
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="p-2 rounded-xl bg-[#6A49FA]/30 text-[#C4B5FD] hover:bg-[#6A49FA]/50 transition"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 rounded-xl bg-white/10 text-white/50 hover:bg-white/20 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white truncate">
                        {user?.name ?? "No name set"}
                      </h2>
                      <button
                        onClick={startEdit}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                  <p className="mt-1 text-sm text-white/45 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-5">
              <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Account Details</h3>

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-[#6A49FA]/20 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-[#C4B5FD]" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-white mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-[#8EE3B5]/15 flex items-center justify-center shrink-0">
                  <Calendar size={16} className="text-[#8EE3B5]" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Member Since</p>
                  <p className="text-sm font-medium text-white mt-0.5">
                    {user?.createdAt ? formatDate(user.createdAt) : "—"}
                  </p>
                </div>
              </div>

              {/* Login Method */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-[#FEDADA]/20 flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-[#E8A0A0]" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Login Method</p>
                  <p className="text-sm font-medium text-white mt-0.5 capitalize">
                    {user?.provider === "google" ? "Google Account" : "Email & Password"}
                  </p>
                </div>
              </div>
            </div>

            {/* Note for Google users — can't change name here */}
            {user?.provider === "google" && (
              <p className="text-center text-xs text-white/30 px-4">
                Your name is synced from Google. Changes here will only affect Savvyra.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}