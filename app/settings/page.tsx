"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import PageContainer from "@/components/PageContainer";
import { useUser } from "@/hooks/useUser";
import {
  User, Shield, Info, Headphones,
  Sun, Moon, Bell, ChevronRight, Lock,
  Fingerprint, MessageCircle, Mail,
  Check, X, LogOut, Pencil, ExternalLink,
} from "lucide-react";

type TabKey = "profile" | "security" | "about" | "support";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "profile",  label: "Profile",  icon: User      },
  { key: "security", label: "Security", icon: Shield     },
  { key: "about",    label: "About",    icon: Info       },
  { key: "support",  label: "Support",  icon: Headphones },
];

const FAQ = [
  { q: "How do I reset my password?", a: "Go to the login page and tap 'Forgot Password'. You'll receive a reset link via your registered email." },
  { q: "Is my financial data secure?", a: "Yes. All data is encrypted at rest and in transit. We never share your data with third parties." },
  { q: "Can I export my transactions?", a: "Export to CSV/PDF is coming soon! You'll be able to generate monthly statements from the Transactions page." },
  { q: "How does the salary calculator work?", a: "Enter your basic salary, allowances, leave days and OT hours. Savvyra auto-calculates EPF, SOCSO, EIS and your expected take-home pay." },
  { q: "Why is my balance not updating?", a: "Make sure transactions are added correctly. Income adds to balance, while Expense, Debt, Commitment and Savings reduce it." },
];

// ── Glass row (desktop Style A) ──
function GlassRow({ icon: Icon, label, value, iconColor = "text-[#C4B5FD]", iconBg = "bg-[#C4B5FD]/10", onClick, soon, toggle, toggled, onToggle, danger }: any) {
  return (
    <div
      onClick={!soon && !toggle ? onClick : undefined}
      className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-200
        ${danger ? "border-[#FF8C8C]/20 bg-[#FF8C8C]/5 hover:bg-[#FF8C8C]/10" : "border-white/8 bg-white/4 hover:bg-white/8"}
        ${soon ? "opacity-50 cursor-not-allowed" : onClick || toggle ? "cursor-pointer" : ""}`}
    >
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={17} className={danger ? "text-[#FF8C8C]" : iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-[#FF8C8C]" : "text-white"}`}>{label}</p>
        {value && <p className="text-xs text-white/35 mt-0.5 truncate">{value}</p>}
      </div>
      {soon && <span className="text-[9px] uppercase tracking-wider text-white/30 border border-white/15 rounded-full px-2 py-0.5">Soon</span>}
      {toggle && (
        <div onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
          className={`relative w-11 h-6 rounded-full cursor-pointer transition-all duration-300 ${toggled ? "bg-[#6A49FA]" : "bg-white/15"}`}>
          <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${toggled ? "left-6" : "left-1"}`} />
        </div>
      )}
      {!soon && !toggle && onClick && <ChevronRight size={15} className={danger ? "text-[#FF8C8C]/40" : "text-white/25"} />}
    </div>
  );
}

// ── Light row (mobile Style B) ──
function LightRow({ icon: Icon, label, value, onClick, soon, toggle, toggled, onToggle, danger }: any) {
  return (
    <div
      onClick={!soon && !toggle ? onClick : undefined}
      className={`flex items-center gap-3 rounded-2xl p-3 border shadow-sm transition-all duration-200
        ${danger ? "border-red-100 bg-red-50" : "border-purple-100 bg-white"}
        ${soon ? "opacity-50 cursor-not-allowed" : onClick || toggle ? "cursor-pointer active:scale-[0.98]" : ""}`}
    >
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-red-100" : "bg-[#6A49FA]/10"}`}>
        <Icon size={15} className={danger ? "text-red-500" : "text-[#6A49FA]"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${danger ? "text-red-500" : "text-gray-800"}`}>{label}</p>
        {value && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{value}</p>}
      </div>
      {soon && <span className="text-[9px] text-[#6A49FA]/40 border border-[#6A49FA]/20 rounded-full px-2 py-0.5">Soon</span>}
      {toggle && (
        <div onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
          className={`relative w-10 h-5 rounded-full cursor-pointer transition-all ${toggled ? "bg-[#6A49FA]" : "bg-gray-200"}`}>
          <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${toggled ? "left-5" : "left-0.5"}`} />
        </div>
      )}
      {!soon && !toggle && onClick && <ChevronRight size={13} className={danger ? "text-red-300" : "text-gray-300"} />}
    </div>
  );
}

// ── Profile Tab ──
function ProfileTab({ glass }: { glass: boolean }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [dark, setDark] = useState(true);
  const [notifs, setNotifs] = useState({ payment: true, savings: true, salary: false, tips: false });
  const Row = glass ? GlassRow : LightRow;
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "?";
  const notifLabels = [
    { key: "payment" as const,  label: "Payment reminders"   },
    { key: "savings" as const,  label: "Savings goal updates" },
    { key: "salary"  as const,  label: "Salary alerts"        },
    { key: "tips"    as const,  label: "Finance tips"         },
  ];

  return (
    <div className="space-y-4">
      {/* Avatar */}
      {glass ? (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
          <div className="flex items-center gap-4">
            {user?.image
              ? <img src={user.image} alt="" className="h-16 w-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg" />
              : <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#6A49FA] to-[#C4B5FD] flex items-center justify-center text-2xl font-bold text-white shadow-lg">{initial}</div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-white truncate">{loading ? "—" : (user?.name ?? "No name")}</p>
              <p className="text-xs text-white/40 mt-0.5 truncate">{loading ? "—" : user?.email}</p>
              <span className="inline-block mt-2 text-[10px] text-[#8EE3B5] border border-[#8EE3B5]/30 rounded-full px-2 py-0.5 bg-[#8EE3B5]/10">Active</span>
            </div>
            <button onClick={() => router.push("/profile")} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition shrink-0">
              <Pencil size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#6A49FA] to-[#9B7FFF] rounded-2xl p-4 text-white flex items-center gap-3 shadow-md">
          {user?.image
            ? <img src={user.image} alt="" className="h-12 w-12 rounded-xl object-cover border-2 border-white/30 shrink-0" />
            : <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">{initial}</div>
          }
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{loading ? "—" : (user?.name ?? "No name")}</p>
            <p className="text-[11px] text-white/70 truncate">{loading ? "—" : user?.email}</p>
          </div>
          <button onClick={() => router.push("/profile")} className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 transition shrink-0">
            <Pencil size={13} />
          </button>
        </div>
      )}

      <Row icon={User} label="Edit Profile" value="Name, avatar & account info" onClick={() => router.push("/profile")} iconColor="text-[#C4B5FD]" iconBg="bg-[#C4B5FD]/10" />

      {/* Theme */}
      {glass ? (
        <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-[#FBD38D]/15 flex items-center justify-center">
              {dark ? <Moon size={17} className="text-[#FBD38D]" /> : <Sun size={17} className="text-[#FBD38D]" />}
            </div>
            <p className="text-sm font-medium text-white flex-1">App Theme</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["dark","light"] as const).map((t) => (
              <button key={t} onClick={() => setDark(t === "dark")}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold capitalize transition-all
                  ${(t==="dark")===dark ? "bg-[#6A49FA]/40 text-[#C4B5FD] border border-[#6A49FA]/40" : "border border-white/8 text-white/35 hover:bg-white/8 hover:text-white/60"}`}>
                {t==="dark" ? <Moon size={13}/> : <Sun size={13}/>} {t} Mode {(t==="dark")===dark && <Check size={12}/>}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-3 border border-purple-100 shadow-sm">
          <p className="text-[10px] font-bold text-[#6A49FA]/60 uppercase tracking-wider mb-2">Appearance</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dark ? <Moon size={14} className="text-[#6A49FA]"/> : <Sun size={14} className="text-[#6A49FA]"/>}
              <span className="text-xs text-gray-700">Dark Mode</span>
            </div>
            <div onClick={() => setDark(!dark)} className={`relative w-10 h-5 rounded-full cursor-pointer transition-all ${dark ? "bg-[#6A49FA]" : "bg-gray-200"}`}>
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${dark ? "left-5" : "left-0.5"}`} />
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {glass ? (
        <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#C4B5FD]/15 flex items-center justify-center"><Bell size={17} className="text-[#C4B5FD]"/></div>
            <p className="text-sm font-medium text-white">Notifications</p>
          </div>
          {notifLabels.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <p className="text-xs text-white/55">{label}</p>
              <div onClick={() => setNotifs(p => ({...p,[key]:!p[key]}))} className={`relative w-10 h-5 rounded-full cursor-pointer transition-all ${notifs[key] ? "bg-[#6A49FA]" : "bg-white/15"}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${notifs[key] ? "left-5" : "left-0.5"}`}/>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-3 border border-purple-100 shadow-sm space-y-2">
          <p className="text-[10px] font-bold text-[#6A49FA]/60 uppercase tracking-wider">Notifications</p>
          {notifLabels.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{label}</span>
              <div onClick={() => setNotifs(p => ({...p,[key]:!p[key]}))} className={`relative w-9 h-4 rounded-full cursor-pointer transition-all ${notifs[key] ? "bg-[#6A49FA]" : "bg-gray-200"}`}>
                <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${notifs[key] ? "left-5" : "left-0.5"}`}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logout */}
      <button onClick={() => signOut({ callbackUrl: "/login" })}
        className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all
          ${glass ? "border border-[#FF8C8C]/25 bg-[#FF8C8C]/8 text-[#FF8C8C] hover:bg-[#FF8C8C]/15" : "border border-red-200 bg-red-50 text-red-500 hover:bg-red-100"}`}>
        <LogOut size={16}/> Logout
      </button>
    </div>
  );
}

// ── Security Tab ──
function SecurityTab({ glass }: { glass: boolean }) {
  const Row = glass ? GlassRow : LightRow;
  return (
    <div className="space-y-3">
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${glass ? "text-white/30" : "text-[#6A49FA]/60"}`}>Account Security</p>
      <Row icon={Lock}        label="Change Password" value="Update your login credentials" onClick={() => {}} iconColor="text-[#C4B5FD]" iconBg="bg-[#C4B5FD]/15"/>
      <Row icon={Fingerprint} label="Biometric Login"  value="Face ID / Fingerprint"         soon iconColor="text-[#8EE3B5]" iconBg="bg-[#8EE3B5]/15" toggle toggled={false}/>
      <Row icon={Shield}      label="Two-Factor Auth"  value="Extra layer of protection"     soon iconColor="text-[#FBD38D]" iconBg="bg-[#FBD38D]/15"/>
      {glass ? (
        <div className="mt-2 rounded-2xl border border-[#FF8C8C]/20 bg-[#FF8C8C]/5 p-4">
          <p className="text-xs font-bold text-[#FF8C8C] mb-1">Danger Zone</p>
          <p className="text-xs text-white/35 mb-3">This action is permanent and cannot be undone.</p>
          <button className="w-full rounded-xl border border-[#FF8C8C]/30 bg-[#FF8C8C]/10 py-2.5 text-xs font-bold text-[#FF8C8C] hover:bg-[#FF8C8C]/20 transition">Delete My Account</button>
        </div>
      ) : (
        <div className="bg-red-50 rounded-2xl p-3 border border-red-100 mt-2">
          <p className="text-[10px] font-bold text-red-500 mb-2">Danger Zone</p>
          <button className="w-full rounded-xl border border-red-200 bg-white py-2 text-xs font-bold text-red-500">Delete My Account</button>
        </div>
      )}
    </div>
  );
}

// ── About Tab ──
function AboutTab({ glass }: { glass: boolean }) {
  const links = ["Privacy Policy", "Terms of Use", "Open Source Licenses"];
  return (
    <div className="space-y-4">
      {glass ? (
        <div className="relative overflow-hidden rounded-3xl border border-[#6A49FA]/30 bg-gradient-to-br from-[#6A49FA]/20 to-[#C4B5FD]/10 p-6 text-center">
          <div className="absolute inset-x-0 top-0 h-px bg-white/20"/>
          <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-[#6A49FA] to-[#C4B5FD] flex items-center justify-center mx-auto mb-3 text-2xl font-black text-white shadow-[0_8px_24px_rgba(106,73,250,0.4)]">S</div>
          <h2 className="text-xl font-bold text-white">Savvyra</h2>
          <p className="text-xs text-white/40 mt-1">Personal Finance, built for Malaysians</p>
          <div className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/55">Version 1.0.0</div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#6A49FA]/10 to-[#C4B5FD]/20 rounded-2xl p-4 border border-purple-100 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#6A49FA] to-[#C4B5FD] flex items-center justify-center mx-auto mb-2 text-xl font-black text-white shadow-md">S</div>
          <p className="font-bold text-[#1a0f3c] text-sm">Savvyra</p>
          <p className="text-[10px] text-gray-400 mt-0.5">v1.0.0 · Built for Malaysians</p>
        </div>
      )}
      {glass ? (
        <div className="space-y-2">
          {[
            { label: "About", value: "A personal finance app designed for Malaysians to track salary, expenses, savings and commitments all in one place." },
            { label: "Built with", value: "Next.js · Prisma · PostgreSQL · Tailwind CSS" },
            { label: "Data & Privacy", value: "Your data is stored securely and never shared with third parties." },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3.5">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm text-white/70 leading-relaxed">{value}</p>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2">
            {links.map((l) => (
              <button key={l} className="rounded-2xl border border-white/8 bg-white/4 py-3 text-xs text-white/50 hover:text-white hover:bg-white/8 transition flex items-center justify-center gap-1">
                {l} <ExternalLink size={10}/>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((l) => (
            <div key={l} className="bg-white rounded-2xl p-3 border border-purple-100 shadow-sm flex items-center justify-between">
              <span className="text-xs text-gray-700">{l}</span>
              <ChevronRight size={13} className="text-gray-300"/>
            </div>
          ))}
          <div className="bg-white rounded-2xl p-3 border border-purple-100 shadow-sm">
            <p className="text-[10px] font-bold text-[#6A49FA]/60 uppercase tracking-wider mb-1">Built with</p>
            <p className="text-xs text-gray-500">Next.js · Prisma · PostgreSQL · Tailwind CSS</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Support Tab ──
function SupportTab({ glass }: { glass: boolean }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.name || !form.email || !form.msg) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    setSending(false); setSent(true);
    setForm({ name: "", email: "", msg: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const inputCls = glass
    ? "w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#6A49FA]/60 focus:ring-2 focus:ring-[#6A49FA]/20 transition"
    : "w-full rounded-xl border border-purple-100 px-3 py-2.5 text-xs text-gray-700 outline-none placeholder:text-gray-300 focus:border-[#6A49FA]/40 transition";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <a href="mailto:support@savvyra.app"
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition cursor-pointer ${glass ? "border-white/8 bg-white/4 hover:bg-white/8" : "border-purple-100 bg-white shadow-sm hover:shadow-md"}`}>
          <Mail size={16} className={glass ? "text-[#C4B5FD]" : "text-[#6A49FA]"}/>
          <div><p className={`text-xs font-bold ${glass ? "text-white" : "text-gray-800"}`}>Email</p><p className={`text-[10px] mt-0.5 ${glass ? "text-white/35" : "text-gray-400"}`}>support@savvyra.app</p></div>
        </a>
        <a href="https://wa.me/60123456789" target="_blank" rel="noreferrer"
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition cursor-pointer ${glass ? "border-[#8EE3B5]/20 bg-[#8EE3B5]/8 hover:bg-[#8EE3B5]/15" : "border-green-100 bg-green-50 shadow-sm hover:shadow-md"}`}>
          <MessageCircle size={16} className="text-[#8EE3B5]"/>
          <div><p className={`text-xs font-bold ${glass ? "text-white" : "text-gray-800"}`}>WhatsApp</p><p className={`text-[10px] mt-0.5 ${glass ? "text-white/35" : "text-gray-400"}`}>Chat with us</p></div>
        </a>
      </div>

      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${glass ? "text-white/30" : "text-[#6A49FA]/60"}`}>FAQ</p>
        <div className={`rounded-2xl overflow-hidden border ${glass ? "border-white/8 bg-white/4" : "border-purple-100 bg-white shadow-sm"}`}>
          {FAQ.map(({ q, a }, i) => (
            <div key={i} className={`border-b last:border-0 ${glass ? "border-white/6" : "border-purple-50"}`}>
              <button className="w-full flex items-center justify-between px-4 py-3.5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <p className={`text-xs font-medium pr-4 ${glass ? "text-white/80" : "text-gray-700"}`}>{q}</p>
                {openFaq === i ? <X size={13} className={glass ? "text-white/30 shrink-0" : "text-gray-300 shrink-0"}/> : <ChevronRight size={13} className={glass ? "text-white/30 shrink-0" : "text-gray-300 shrink-0"}/>}
              </button>
              {openFaq === i && (
                <div className={`px-4 pb-4 border-t ${glass ? "border-white/6" : "border-purple-50"}`}>
                  <p className={`text-xs leading-relaxed mt-3 ${glass ? "text-white/45" : "text-gray-500"}`}>{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${glass ? "text-white/30" : "text-[#6A49FA]/60"}`}>Contact Us</p>
        <div className={`rounded-3xl border p-5 space-y-3 ${glass ? "border-white/10 bg-white/5" : "border-purple-100 bg-white shadow-sm"}`}>
          {sent && (
            <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${glass ? "bg-[#8EE3B5]/15 border border-[#8EE3B5]/25" : "bg-green-50 border border-green-200"}`}>
              <Check size={14} className="text-[#8EE3B5]"/>
              <p className={`text-xs font-medium ${glass ? "text-[#8EE3B5]" : "text-green-700"}`}>Message sent! We'll reply within 24 hours.</p>
            </div>
          )}
          <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Your name" className={inputCls}/>
          <input value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="Email address" className={inputCls}/>
          <textarea value={form.msg} onChange={e => setForm(p=>({...p,msg:e.target.value}))} placeholder="How can we help?" rows={4} className={inputCls+" resize-none"}/>
          <button onClick={handleSend} disabled={sending || !form.name || !form.email || !form.msg}
            className={`w-full rounded-full py-3 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${glass ? "bg-gradient-to-r from-[#6A49FA] to-[#9B7FFF] text-white shadow-[0_8px_24px_rgba(106,73,250,0.40)] hover:scale-[1.02] active:scale-[0.98]" : "bg-[#6A49FA] text-white shadow-md hover:bg-[#5a3de8]"}`}>
            {sending ? "Sending…" : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──
export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("profile");

  const content = (glass: boolean) => (
    <AnimatePresence mode="wait">
      <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.25, ease:"easeOut" }}>
        {tab === "profile"  && <ProfileTab  glass={glass}/>}
        {tab === "security" && <SecurityTab glass={glass}/>}
        {tab === "about"    && <AboutTab    glass={glass}/>}
        {tab === "support"  && <SupportTab  glass={glass}/>}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <PageContainer>
      <div className="blob blob-1"/><div className="blob blob-2"/>
      <style>{`.blob{position:fixed;border-radius:9999px;pointer-events:none;z-index:0}.blob-1{width:500px;height:500px;background:#6a49fa;top:-150px;left:-150px;filter:blur(130px);opacity:.45}.blob-2{width:400px;height:400px;background:#fedada;bottom:-100px;right:-100px;filter:blur(120px);opacity:.30}`}</style>

      <div className="relative z-10">
        <div className="mb-7">
          <p className="text-xs uppercase tracking-[0.25em] text-white/35 font-medium">Preferences</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Settings</h1>
        </div>

        {/* DESKTOP — Style A */}
        <div className="hidden md:block">
          <div className="mb-6 grid grid-cols-4 gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                  ${tab === key ? "bg-[#6A49FA]/40 text-[#C4B5FD] shadow-[inset_0_0_0_1px_rgba(196,181,253,0.25)]" : "text-white/40 hover:text-white/70"}`}>
                <Icon size={16}/>{label}
              </button>
            ))}
          </div>
          {content(true)}
        </div>

        {/* MOBILE — Style B */}
        <div className="md:hidden flex gap-3 items-start">
          <div className="w-20 shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex flex-col gap-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-[10px] font-semibold transition-all duration-200
                  ${tab === key ? "bg-[#6A49FA] text-white shadow-md" : "text-white/35 hover:text-white/60 hover:bg-white/5"}`}>
                <Icon size={16}/>{label}
              </button>
            ))}
          </div>
          <div className="flex-1 min-w-0 bg-[#f5f3ff] rounded-3xl p-4">
            {content(false)}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}