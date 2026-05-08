import Link from "next/link";
import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#453284] px-6">

      {/* Blobs */}
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
      `}</style>

      <div
        className="relative z-10 w-full max-w-md rounded-4xl p-8 text-center shadow-2xl"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <div className="mb-6 flex items-center justify-center gap-3">
          <Image
            src="/logo512.png"
            alt="Savvyra"
            width={50}
            height={50}
            className="rounded-2xl"
          />

          <span className="text-2xl font-semibold text-white">
            Savvyra
          </span>
        </div>

        <div className="mb-4 text-7xl">
          📡
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-white">
          You're offline.
        </h1>

        <p className="mt-5 text-sm leading-relaxed text-white/60">
          Your internet connection seems unavailable.
          Please reconnect and try again.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#453284] transition hover:scale-[1.02]"
        >
          Try Again
        </Link>

        <div className="mt-8 text-sm text-white/30">
          Crafted by Arieza for modern financial living.
        </div>
      </div>
    </div>
  );
}