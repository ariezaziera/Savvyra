import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #3d0810 0%, #5D0D18 40%, #7a1520 70%, #4a0f14 100%)" }}>

      {/* Aurora Blobs */}
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
          background: #9FB2AC;
          top: -150px;
          left: -150px;
          filter: blur(130px);
          opacity: 0.4;
          animation: blob-drift-1 12s ease-in-out infinite alternate;
        }

        .blob-2 {
          width: 450px;
          height: 450px;
          background: #FFF9EB;
          bottom: -100px;
          right: -100px;
          filter: blur(120px);
          opacity: 0.15;
          animation: blob-drift-2 15s ease-in-out infinite alternate;
        }

        .blob-3 {
          width: 380px;
          height: 380px;
          background: #9FB2AC;
          top: 30%;
          right: 10%;
          filter: blur(110px);
          opacity: 0.25;
          animation: blob-drift-3 10s ease-in-out infinite alternate;
        }

        @keyframes blob-drift-1 {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(40px, 60px) scale(1.1); }
        }

        @keyframes blob-drift-2 {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(-50px, -40px) scale(1.08); }
        }

        @keyframes blob-drift-3 {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(30px, -50px) scale(0.95); }
        }

        .float-animation {
          animation: float 5s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">

        {/* Logo */}
        <div className="mb-10 flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Savvyra"
            width={56}
            height={56}
            className="rounded-2xl"
          />
          <div className="text-left">
            <p className="text-xl font-semibold text-[#FFF9EB]">Savvyra</p>
            <p className="text-xs text-[#9FB2AC]">Personal Finance</p>
          </div>
        </div>

        {/* 404 */}
        <div className="float-animation text-[120px] font-bold leading-none tracking-tight md:text-[180px]"
          style={{ color: "rgba(255,249,235,0.15)" }}>
          404
        </div>

        {/* Divider line */}
        <div className="my-6 h-px w-24 rounded-full bg-[#9FB2AC]/40" />

        {/* Content */}
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold tracking-tight text-[#FFF9EB] md:text-4xl">
            Page not found.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#9FB2AC] md:text-lg">
            The page you're looking for may have been moved,
            deleted, or never existed in the first place.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-2xl bg-[#FFF9EB] px-7 py-3 text-sm font-semibold text-[#5D0D18] transition duration-300 hover:scale-[1.03] hover:bg-white"
          >
            Return Home
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border border-[#9FB2AC]/30 bg-[#9FB2AC]/10 px-7 py-3 text-sm font-medium text-[#FFF9EB] backdrop-blur-xl transition hover:bg-[#9FB2AC]/20"
          >
            Go to Login
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-sm text-[#9FB2AC]/50">
          Crafted by Arieza for modern financial living.
        </div>
      </div>
    </div>
  );
}