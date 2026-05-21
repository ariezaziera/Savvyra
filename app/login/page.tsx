"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useNoScroll } from "@/hooks/useNoScroll";
import { useWebAuthn } from "@/hooks/useWebAuthn";
import { Fingerprint } from "lucide-react";

interface FloatingLabelProps {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; autoComplete?: string;
}

function FloatingLabel({ label, type = "text", value, onChange, autoComplete }: FloatingLabelProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <label style={{
        position: "absolute", left: 16,
        top: lifted ? 9 : "50%",
        transform: lifted ? "none" : "translateY(-50%)",
        fontSize: lifted ? 10 : 14, fontWeight: 500,
        color: focused ? "#E8C97A" : "rgba(255,255,255,0.4)",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none", zIndex: 1,
        letterSpacing: lifted ? "0.4px" : 0,
      }}>{label}</label>
      <input
        type={type} value={value} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 56, borderRadius: 14,
          background: focused ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.07)",
          border: focused ? "1px solid rgba(232,201,122,0.65)" : "1px solid rgba(255,255,255,0.1)",
          color: "#fff", fontSize: 15, fontWeight: 500,
          paddingTop: lifted ? 18 : 0, paddingLeft: 16, paddingRight: 16,
          outline: "none", boxSizing: "border-box", transition: "all 0.2s ease",
          boxShadow: focused ? "0 0 0 3px rgba(232,201,122,0.1)" : "none",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

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

function LoadingDots() {
  return (
    <span className="flex items-center justify-center gap-1.5">
      {[0,1,2].map((i) => (
        <span key={i} style={{
          width:6, height:6, borderRadius:"50%", background:"#453284",
          display:"inline-block",
          animation:`loginDot 0.9s ease-in-out ${i*0.18}s infinite`,
        }}/>
      ))}
    </span>
  );
}

export default function LoginPage() {
  useNoScroll();
  const router = useRouter();
  const { authenticate, status: biometricStatus, error: biometricError, isSupported } = useWebAuthn();

  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error,         setError]         = useState("");
  const [mounted,       setMounted]       = useState(false);
  const [expanding,     setExpanding]     = useState(false);
  const [hasBiometric,  setHasBiometric]  = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    setHasBiometric(localStorage.getItem("savvyra_biometric") === "true");
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setError("Invalid email or password"); setLoading(false); return; }
    setExpanding(true);
    setTimeout(() => router.push("/"), 1100);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const handleBiometric = async () => {
    setError("");
    const ok = await authenticate(email || undefined);
    if (ok) {
      setExpanding(true);
      setTimeout(() => router.push("/"), 1100);
    } else {
      setError(biometricError || "Biometric login failed. Try your password.");
    }
  };

  const anyLoading = loading || googleLoading || biometricStatus === "loading";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#453284]">
      <div className="blob blob-1"/><div className="blob blob-2"/><div className="blob blob-3"/>

      <div style={{
        position:"fixed", top:"50%", left:"50%",
        width:80, height:80, borderRadius:"9999px",
        transform:`translate(-50%,-50%) scale(${expanding ? 60 : 0})`,
        background:"radial-gradient(circle,#453284 0%,#6A49FA 40%,#E8A0A0 70%,#2B1E59 100%)",
        zIndex:9999, pointerEvents:"none",
        opacity: expanding ? 1 : 0,
        transition: expanding
          ? "transform 1.2s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease"
          : "transform 0s, opacity 0.4s ease 0.8s",
      }}/>

      <style>{`
        @keyframes loginSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes loginFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes loginDot{0%,80%,100%{transform:scale(0);opacity:0.4}40%{transform:scale(1);opacity:1}}
        .login-enter{animation:loginSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both}
        .login-fade{animation:loginFadeIn 0.4s ease both}
        @keyframes bioPulse{0%,100%{box-shadow:0 0 0 0 rgba(196,181,253,0.4)}50%{box-shadow:0 0 0 12px rgba(196,181,253,0)}}
        .bio-pulse{animation:bioPulse 2s ease-in-out infinite}
        .typing-word{display:inline-block;overflow:hidden;white-space:nowrap;border-right:3px solid #C4B5FD;width:0;animation:typingWord 2.5s steps(30,end) infinite alternate,blink 0.8s step-end infinite}
        @keyframes typingWord{from{width:0}to{width:8ch}}
        @keyframes blink{50%{border-color:transparent}}
      `}</style>

      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-2">

        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-between px-16 py-14">
          <div className="flex items-center gap-4">
            <div className="overflow-hidden rounded-2xl">
              <Image src="/logo2.png" alt="Savvyra" width={58} height={58}
                className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(232,160,160,0.6)] hover:drop-shadow-[0_0_12px_rgba(232,201,122,0.8)] transition-all duration-300"/>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Savvyra</span>
          </div>
          <div className="max-w-xl">
            <h1 className="text-6xl font-semibold leading-[1.05] tracking-tight text-white">
              Take control of your<br/>
              <span className="typing-word bg-linear-to-r from-[#E8A0A0] to-[#E8C97A] bg-clip-text text-transparent font-extrabold drop-shadow-[0_0_8px_rgba(232,201,122,0.35)]">
                finances.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/65">
              Track spending, manage commitments, and grow your savings with a smarter financial workspace built for modern users.
            </p>
          </div>
          <div className="text-sm tracking-wide text-white/30">Crafted by Arieza Aziera for modern financial living.</div>
        </div>

        {/* RIGHT */}
        <div className="relative flex items-center justify-center md:justify-end px-5 md:px-14"
          style={{ paddingTop:"env(safe-area-inset-top,52px)", paddingBottom:"env(safe-area-inset-bottom,40px)" }}>
          <div className={`w-full max-w-md ${mounted ? "login-enter" : ""}`} style={{ opacity:mounted ? undefined : 0, animationDelay:"0.05s" }}>

            {/* Mobile logo */}
            <div className="mb-7 flex items-center gap-3 md:hidden login-fade" style={{ animationDelay:"0.08s" }}>
              <div className="relative flex items-center justify-center rounded-xl overflow-hidden"
                style={{ width:35, height:35, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)" }}>
                <Image src="/logo2.png" alt="Savvyra" width={26} height={26}
                  className="relative z-10 object-contain filter drop-shadow-[0_2px_8px_rgba(232,160,160,0.6)] transition-all duration-300"/>
              </div>
              <span className="text-lg font-semibold text-white">Savvyra</span>
            </div>

            {/* Greeting */}
            <div className="login-fade mb-6" style={{ animationDelay:"0.1s" }}>
              <h2 className="text-[28px] font-bold tracking-tight text-white leading-tight">Welcome back</h2>
              <p className="mt-1.5 text-sm text-white/50">Sign in to continue your journey</p>
            </div>

            {/* Biometric quick-login — if already registered */}
            {isSupported && hasBiometric && (
              <div className="login-fade mb-4" style={{ animationDelay:"0.08s" }}>
                <button onClick={handleBiometric} disabled={anyLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#C4B5FD]/25 bg-[#C4B5FD]/10 py-4 text-sm font-semibold text-[#C4B5FD] transition hover:bg-[#C4B5FD]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className={`h-9 w-9 rounded-xl bg-[#C4B5FD]/15 flex items-center justify-center ${biometricStatus === "loading" ? "bio-pulse" : ""}`}>
                    <Fingerprint size={20} className="text-[#C4B5FD]"/>
                  </div>
                  {biometricStatus === "loading" ? "Verifying…" : "Login with Biometric"}
                </button>
                <div className="flex items-center gap-3 mt-4 mb-2">
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"1px", textTransform:"uppercase" }}>or use password</span>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
                </div>
              </div>
            )}

            {/* Form card */}
            <div className="login-enter" style={{
              background:"rgba(255,255,255,0.08)", backdropFilter:"blur(28px)",
              WebkitBackdropFilter:"blur(28px)", border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:24, padding:"24px 20px 20px", marginBottom:14, animationDelay:"0.12s",
            }}>
              <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:0 }}>
                <FloatingLabel label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email"/>
                <FloatingLabel label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password"/>

                <div className="flex justify-end" style={{ marginTop:-8, marginBottom:20 }}>
                  <button type="button" className="text-xs font-medium"
                    style={{ color:"#E8C97A", background:"none", border:"none", cursor:"pointer", padding:0 }}>
                    Forgot password?
                  </button>
                </div>

                {error && <p className="text-sm" style={{ color:"#FEDADA", marginBottom:14, marginTop:-8 }}>{error}</p>}

                <button type="submit" disabled={anyLoading || expanding}
                  style={{
                    width:"100%", height:54, borderRadius:14, border:"none",
                    cursor:anyLoading || expanding ? "not-allowed" : "pointer",
                    background:"linear-gradient(135deg,#E8A0A0 0%,#E8C97A 100%)",
                    color:"#453284", fontSize:15, fontWeight:700, letterSpacing:"-0.2px",
                    boxShadow:"0 4px 24px rgba(232,162,160,0.35)",
                    transition:"transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
                    opacity:anyLoading || expanding ? 0.75 : 1,
                    fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center",
                  }}
                  onMouseEnter={(e) => { if (!anyLoading && !expanding) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.015)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                >
                  {loading ? <LoadingDots/> : "Sign In"}
                </button>

                <div className="flex items-center gap-3" style={{ marginTop:18, marginBottom:14 }}>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }}/>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)", letterSpacing:"1px", textTransform:"uppercase" }}>or continue with</span>
                  <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }}/>
                </div>

                <button type="button" onClick={handleGoogle} disabled={anyLoading || expanding}
                  style={{
                    width:"100%", height:50, borderRadius:14,
                    border:"1px solid rgba(255,255,255,0.12)",
                    background:googleLoading ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)",
                    color:"rgba(255,255,255,0.85)", fontSize:14, fontWeight:500,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                    cursor:googleLoading ? "not-allowed" : "pointer",
                    opacity:googleLoading ? 0.7 : 1,
                    transition:"background 0.2s ease", fontFamily:"inherit",
                  }}
                  onMouseEnter={(e) => { if (!googleLoading) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.11)"; }}
                  onMouseLeave={(e) => { if (!googleLoading) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
                >
                  {googleLoading ? <LoadingDots/> : <><GoogleIcon/> Continue with Google</>}
                </button>

                {/* Biometric — first time setup, email required */}
                {isSupported && !hasBiometric && (
                  <button type="button" onClick={handleBiometric} disabled={anyLoading || !email}
                    style={{
                      width:"100%", height:50, borderRadius:14, marginTop:10,
                      border:"1px solid rgba(196,181,253,0.2)",
                      background:"rgba(196,181,253,0.08)",
                      color:"rgba(196,181,253,0.8)", fontSize:14, fontWeight:500,
                      display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                      cursor:!email ? "not-allowed" : "pointer",
                      opacity:!email ? 0.4 : 1,
                      transition:"all 0.2s ease", fontFamily:"inherit",
                    }}
                  >
                    <Fingerprint size={18}/>
                    {biometricStatus === "loading" ? "Verifying…" : "Use Biometric"}
                  </button>
                )}
              </form>
            </div>

            <p className="login-fade text-center text-sm" style={{ color:"rgba(255,255,255,0.4)", animationDelay:"0.2s" }}>
              No account?{" "}
              <a href="/register" style={{ color:"#E8C97A", fontWeight:600, textDecoration:"none" }}>Create one</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}