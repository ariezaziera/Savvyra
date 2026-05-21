"use client";

import { useState, useEffect } from "react";
import { Fingerprint, Check, X, Trash2, Smartphone } from "lucide-react";
import { useWebAuthn } from "@/hooks/useWebAuthn";

type Credential = {
  id: string;
  credentialId: string;
  deviceName: string | null;
  createdAt: string;
  lastUsed: string | null;
};

export default function BiometricToggle({ glass = true }: { glass?: boolean }) {
  const { register, remove, status, error, isSupported } = useWebAuthn();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchCredentials = async () => {
    try {
      const res = await fetch("/api/auth/webauthn/credentials");
      if (res.ok) {
        const data = await res.json();
        setCredentials(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleRegister = async () => {
    const deviceName = `${getDeviceLabel()} — ${new Date().toLocaleDateString("en-MY")}`;
    const ok = await register(deviceName);
    if (ok) {
      localStorage.setItem("savvyra_biometric", "true");
      showToast("Biometric registered! ✅");
      await fetchCredentials();
    }
  };

  const handleRemove = async (credentialId: string) => {
    const ok = await remove(credentialId);
    if (ok) {
      const remaining = credentials.filter((c) => c.credentialId !== credentialId);
      setCredentials(remaining);
      if (remaining.length === 0) localStorage.removeItem("savvyra_biometric");
      showToast("Device removed");
    }
  };

  if (!isSupported) {
    return (
      <div className={`rounded-2xl border px-4 py-4 ${glass ? "border-white/8 bg-white/4" : "border-purple-100 bg-white shadow-sm"}`}>
        <div className="flex items-center gap-3">
          <Fingerprint size={17} className="text-white/30" />
          <div>
            <p className={`text-sm font-medium ${glass ? "text-white/50" : "text-gray-400"}`}>Biometric Login</p>
            <p className={`text-xs mt-0.5 ${glass ? "text-white/30" : "text-gray-300"}`}>Not supported on this browser or device</p>
          </div>
        </div>
      </div>
    );
  }

  const isRegistered = credentials.length > 0;

  return (
    <div className="space-y-3">
      {/* Toast */}
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          {toast}
        </div>
      )}

      {/* Main toggle row */}
      <div className={`rounded-2xl border px-4 py-4 ${glass ? "border-white/8 bg-white/4" : "border-purple-100 bg-white shadow-sm"}`}>
        <div className="flex items-center gap-4">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${glass ? "bg-[#8EE3B5]/15" : "bg-[#6A49FA]/10"}`}>
            <Fingerprint size={17} className={glass ? "text-[#8EE3B5]" : "text-[#6A49FA]"} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${glass ? "text-white" : "text-gray-800"}`}>Biometric Login</p>
            <p className={`text-xs mt-0.5 ${glass ? "text-white/35" : "text-gray-400"}`}>
              {isRegistered ? `${credentials.length} device${credentials.length > 1 ? "s" : ""} registered` : "Face ID / Fingerprint"}
            </p>
          </div>
          {isRegistered ? (
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${glass ? "text-[#8EE3B5]" : "text-green-600"}`}>
              <Check size={14} /> On
            </span>
          ) : (
            <button
              onClick={handleRegister}
              disabled={status === "loading"}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${glass
                  ? "bg-[#6A49FA]/30 text-[#C4B5FD] hover:bg-[#6A49FA]/50"
                  : "bg-[#6A49FA] text-white hover:bg-[#5a3de8]"
                }`}
            >
              {status === "loading" ? "Setting up…" : "Enable"}
            </button>
          )}
        </div>

        {error && (
          <p className={`mt-3 text-xs ${glass ? "text-[#FF8C8C]" : "text-red-500"}`}>{error}</p>
        )}
      </div>

      {/* Registered devices */}
      {isRegistered && (
        <div className={`rounded-2xl border overflow-hidden ${glass ? "border-white/8 bg-white/4" : "border-purple-100 bg-white shadow-sm"}`}>
          <div className={`px-4 py-2.5 border-b ${glass ? "border-white/6" : "border-purple-50"}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${glass ? "text-white/35" : "text-[#6A49FA]/60"}`}>
              Registered Devices
            </p>
          </div>
          {credentials.map((cred) => (
            <div key={cred.id} className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 ${glass ? "border-white/6" : "border-purple-50"}`}>
              <Smartphone size={15} className={glass ? "text-white/40 shrink-0" : "text-gray-400 shrink-0"} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${glass ? "text-white/80" : "text-gray-700"}`}>
                  {cred.deviceName ?? "Unknown Device"}
                </p>
                <p className={`text-[10px] mt-0.5 ${glass ? "text-white/30" : "text-gray-400"}`}>
                  Added {new Date(cred.createdAt).toLocaleDateString("en-MY")}
                  {cred.lastUsed && ` · Last used ${new Date(cred.lastUsed).toLocaleDateString("en-MY")}`}
                </p>
              </div>
              <button
                onClick={() => handleRemove(cred.credentialId)}
                className={`p-1.5 rounded-lg transition ${glass ? "text-white/25 hover:text-[#FF8C8C] hover:bg-[#FF8C8C]/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div className={`px-4 py-3 border-t ${glass ? "border-white/6" : "border-purple-50"}`}>
            <button
              onClick={handleRegister}
              disabled={status === "loading"}
              className={`text-xs font-medium transition disabled:opacity-50 ${glass ? "text-[#C4B5FD] hover:text-white" : "text-[#6A49FA] hover:text-[#5a3de8]"}`}
            >
              + Add another device
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getDeviceLabel(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua))  return "iPhone";
  if (/iPad/.test(ua))    return "iPad";
  if (/Mac/.test(ua))     return "Mac";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows PC";
  return "Device";
}