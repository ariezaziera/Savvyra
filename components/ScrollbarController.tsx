"use client";

import { useEffect, useRef } from "react";

export default function ScrollbarController() {
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const thumb = thumbRef.current;
    const track = trackRef.current;
    if (!thumb || !track) return;

    const updateThumb = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      const scrollable = docHeight - winHeight;
      if (scrollable <= 0) {
        track.style.opacity = "0";
        return;
      }

      const thumbHeight = Math.max((winHeight / docHeight) * winHeight, 40);
      const thumbTop = (scrollTop / scrollable) * (winHeight - thumbHeight);

      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;
    };

    const onScroll = () => {
      updateThumb();

      // fade in
      track.style.opacity = "1";

      // reset fade out timer
      clearTimeout(fadeTimeout.current);
      fadeTimeout.current = setTimeout(() => {
        track.style.opacity = "0";
      }, 1000);
    };

    updateThumb();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateThumb, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateThumb);
      clearTimeout(fadeTimeout.current);
    };
  }, []);

  return (
    <>
      {/* Hide the native scrollbar entirely */}
      <style>{`
        html { scrollbar-width: none; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Fake scrollbar track */}
      <div
        ref={trackRef}
        style={{
          position: "fixed",
          top: 0,
          right: "4px",
          width: "5px",
          height: "100vh",
          zIndex: 9999,
          opacity: 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
          borderRadius: "9999px",
        }}
        className="hidden md:block"
      >
        {/* Fake scrollbar thumb */}
        <div
          ref={thumbRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            borderRadius: "9999px",
            background: "linear-gradient(180deg, #6A49FA 0%, #C4B5FD 50%, #E2D9FF 100%)",
            transition: "transform 0.1s linear, height 0.1s linear",
          }}
        />
      </div>
    </>
  );
}