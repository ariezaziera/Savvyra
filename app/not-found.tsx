import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#453284]">

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

        .float-animation {
          animation: float 5s ease-in-out infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-12px);
          }

          100% {
            transform: translateY(0px);
          }
        }
      `}</style>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">

        {/* Logo */}
        <div className="mb-10 flex items-center gap-4">
          <Image
            src="/logo512.png"
            alt="Savvyra"
            width={62}
            height={62}
            className="rounded-2xl"
          />

          <span className="text-3xl font-semibold tracking-tight text-white">
            Savvyra
          </span>
        </div>

        {/* 404 */}
        <div className="float-animation text-[120px] font-bold leading-none tracking-tight text-white/90 md:text-[180px]">
          404
        </div>

        {/* Content */}
        <div className="mt-4 max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Page not found.
          </h1>

          <p className="mt-5 text-base leading-relaxed text-white/60 md:text-lg">
            The page you are looking for may have been moved,
            deleted, or never existed in the first place.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-2xl bg-white px-7 py-3 text-sm font-semibold text-[#453284] transition duration-300 hover:scale-[1.03]"
          >
            Return Home
          </Link>

          <Link
            href="/login"
            className="rounded-2xl border border-white/10 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/15"
          >
            Go to Login
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-sm text-white/30">
          Crafted by Arieza for modern financial living.
        </div>
      </div>
    </div>
  );
}