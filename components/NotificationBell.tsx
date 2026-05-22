"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Wallet, HandCoins, PiggyBank, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Notification = {
  id: string;
  type: "SALARY_REMINDER" | "BILL_DUE" | "SAVINGS_MILESTONE" | "GENERAL";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
};

const TYPE_ICON: Record<string, React.ElementType> = {
  SALARY_REMINDER:   Wallet,
  BILL_DUE:          HandCoins,
  SAVINGS_MILESTONE: PiggyBank,
  GENERAL:           Info,
};

const TYPE_COLOR: Record<string, string> = {
  SALARY_REMINDER:   "text-[#C4B5FD] bg-[#C4B5FD]/15",
  BILL_DUE:          "text-[#FF8C8C] bg-[#FF8C8C]/15",
  SAVINGS_MILESTONE: "text-[#8EE3B5] bg-[#8EE3B5]/15",
  GENERAL:           "text-[#93C5FD] bg-[#93C5FD]/15",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifs(data.notifications ?? []);
        setUnread(data.unreadCount ?? 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 2 minutes for new notifications
    const interval = setInterval(fetchNotifs, 120000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs((p) => p.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifs((p) => p.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnread((p) => Math.max(0, p - 1));
  };

  const deleteNotif = async (id: string, wasUnread: boolean) => {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifs((p) => p.filter((n) => n.id !== id));
    if (wasUnread) setUnread((p) => Math.max(0, p - 1));
  };

  const clearAll = async () => {
    await fetch("/api/notifications", { method: "DELETE" });
    setNotifs([]);
    setUnread(0);
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifs(); }}
        className="relative flex items-center justify-center h-10 w-10 rounded-2xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-xl"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#FF8C8C] border-2 border-[#1a1035] flex items-center justify-center text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-12 z-50 w-80 rounded-3xl border border-white/10 bg-[#1a1035]/95 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Notifications</span>
                {unread > 0 && (
                  <span className="rounded-full bg-[#FF8C8C]/20 text-[#FF8C8C] text-[10px] font-bold px-2 py-0.5">
                    {unread} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-[#C4B5FD] hover:text-white transition font-medium">
                    Mark all read
                  </button>
                )}
                {notifs.length > 0 && (
                  <button onClick={clearAll} className="text-[10px] text-white/30 hover:text-white/60 transition">
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-95 overflow-y-auto">
              {loading && notifs.length === 0 && (
                <div className="flex items-center justify-center py-10">
                  <div className="h-5 w-5 rounded-full border-2 border-[#6A49FA]/40 border-t-[#6A49FA] animate-spin" />
                </div>
              )}

              {!loading && notifs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Bell size={20} className="text-white/20" />
                  </div>
                  <p className="text-xs text-white/30">No notifications yet</p>
                </div>
              )}

              {notifs.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Info;
                const color = TYPE_COLOR[n.type] ?? TYPE_COLOR.GENERAL;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markRead(n.id)}
                    className={`relative flex items-start gap-3 px-4 py-3.5 border-b border-white/5 last:border-0 transition-all cursor-pointer group
                      ${n.isRead ? "opacity-60" : "bg-white/3 hover:bg-white/5"}`}
                  >
                    {/* Unread dot */}
                    {!n.isRead && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-[#C4B5FD]" />
                    )}

                    {/* Icon */}
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={16} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-xs font-semibold text-white leading-snug">{n.title}</p>
                      <p className="text-xs text-white/45 mt-0.5 leading-snug">{n.body}</p>
                      <p className="text-[10px] text-white/25 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotif(n.id, !n.isRead); }}
                      className="absolute right-3 top-3.5 opacity-0 group-hover:opacity-100 transition p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}