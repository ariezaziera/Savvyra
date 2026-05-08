"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
    useEffect(() => {
        document.body.classList.add("hide-navbar");

        return () => {
            document.body.classList.remove("hide-navbar");
        };
    }, []);

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

        .float404 {
          animation: float404 6s ease-in-out infinite;
        }

        @keyframes float404 {
          0% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-14px);
          }

          100% {
            transform: translateY(0px);
          }
        }
      `}</style>

      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col justify-between px-16 py-14">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <Image
              src="/logo512.png"
              alt="Savvyra"
              width={58}
              height={58}
              className="rounded-2xl"
            />

            <span className="text-2xl font-semibold tracking-tight text-white">
              Savvyra
            </span>
          </div>

          {/* Main Content */}
          <div className="max-w-xl">

            <div className="float404 text-[170px] font-bold leading-none tracking-[-10px] text-white/10">
              404
            </div>

            <h1 className="-mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-white">
              Lost in the
              <br />

              <span className="text-[#C6E6FF]">
                digital space.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-white/60">
              The page you’re looking for doesn’t exist,
              may have been removed, or is temporarily unavailable.
            </p>

            <div className="mt-5 flex items-center gap-4">

              <Link
                href="/"
                className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#453284] transition duration-300 hover:scale-[1.03]"
              >
                <ArrowLeft size={16} />
                Return Home
              </Link>

              <Link
                href="/login"
                className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Login
              </Link>

            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/30">
            Crafted by Arieza for modern financial living.
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex items-center justify-center px-6 py-10">

          {/* Floating Glass Card */}
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-[36px] p-8 shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >

            {/* Glow */}
            <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />

            {/* Card Content */}
            <div className="relative z-10">

              <div className="mb-6 flex items-center gap-3 md:hidden">
                <Image
                  src="/logo512.png"
                  alt="Savvyra"
                  width={46}
                  height={46}
                  className="rounded-xl"
                />

                <span className="text-xl font-semibold text-white">
                  Savvyra
                </span>
              </div>

              {/* Fake Browser */}
              <div className="rounded-2xl border border-white/10 bg-[#2f215f]/70 p-4 backdrop-blur-xl">

                {/* Browser Top */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FF6B6B]" />
                  <div className="h-3 w-3 rounded-full bg-[#FFD166]" />
                  <div className="h-3 w-3 rounded-full bg-[#06D6A0]" />
                </div>

                {/* Browser Body */}
                <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-10 text-center">

                  <div className="text-7xl font-bold tracking-tight text-white/15">
                    404
                  </div>

                  <div className="mt-5 h-3 w-40 rounded-full bg-white/10 mx-auto" />
                  <div className="mt-3 h-3 w-56 rounded-full bg-white/5 mx-auto" />
                  <div className="mt-3 h-3 w-32 rounded-full bg-white/5 mx-auto" />

                  <div className="mt-8 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
                    Error: Route does not exist
                  </div>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="text-sm leading-relaxed text-white/60">
                  Savvyra couldn’t locate the requested route.
                  Please verify the URL or return to the dashboard.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}