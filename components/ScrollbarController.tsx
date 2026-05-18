"use client";

import { useEffect, useRef } from "react";

export default function ScrollbarController() {
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout>>();
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  useEffect(() => {
    const thumb = thumbRef.current;
    const track = trackRef.current;
    if (!thumb || !track) return;

    const getThumbHeight = () => {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      return Math.max((winHeight / docHeight) * winHeight, 40);
    };

    const updateThumb = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;

      if (scrollable <= 0) {
        track.style.opacity = "0";
        return;
      }

      const thumbHeight = getThumbHeight();
      const thumbTop = (scrollTop / scrollable) * (winHeight - thumbHeight);

      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;
    };

    const showTrack = () => {
      track.style.opacity = "1";
      clearTimeout(fadeTimeout.current);
      fadeTimeout.current = setTimeout(() => {
        if (!isDragging.current) track.style.opacity = "0";
      }, 1000);
    };

    const onScroll = () => {
      updateThumb();
      showTrack();
    };

    // ── Drag handling ──────────────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      dragStartY.current = e.clientY;
      dragStartScrollTop.current = window.scrollY;

      track.style.opacity = "1";
      clearTimeout(fadeTimeout.current);

      // disable smooth thumb transition while dragging for responsiveness
      thumb.style.transition = "none";
      document.body.style.userSelect = "none";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;
      const thumbHeight = getThumbHeight();
      const trackRange = winHeight - thumbHeight;

      const deltaY = e.clientY - dragStartY.current;
      const scrollDelta = (deltaY / trackRange) * scrollable;

      window.scrollTo({
        top: dragStartScrollTop.current + scrollDelta,
        behavior: "instant",
      });
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;

      // restore smooth transition
      thumb.style.transition = "transform 0.1s linear, height 0.1s linear";
      document.body.style.userSelect = "";

      // start fade-out timer
      fadeTimeout.current = setTimeout(() => {
        track.style.opacity = "0";
      }, 1000);
    };

    // ── Click-on-track to jump ─────────────────────────────────────
    const onTrackClick = (e: MouseEvent) => {
      if (e.target === thumb) return; // ignore clicks that started a drag

      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;
      const thumbHeight = getThumbHeight();
      const trackRange = winHeight - thumbHeight;

      const clickY = e.clientY;
      const ratio = (clickY - thumbHeight / 2) / trackRange;
      window.scrollTo({ top: ratio * scrollable, behavior: "smooth" });
    };

    updateThumb();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateThumb, { passive: true });
    thumb.addEventListener("mousedown", onMouseDown);
    track.addEventListener("click", onTrackClick);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateThumb);
      thumb.removeEventListener("mousedown", onMouseDown);
      track.removeEventListener("click", onTrackClick);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      clearTimeout(fadeTimeout.current);
    };
  }, []);

  return (
    <>
      <style>{`
        html { scrollbar-width: none; }
        ::-webkit-scrollbar { display: none; }
        .custom-scrollbar-thumb:hover {
          filter: brightness(1.25) drop-shadow(0 0 4px #6A49FA99);
          width: 7px !important;
        }
        .custom-scrollbar-thumb:active {
          cursor: grabbing !important;
        }
      `}</style>

      <div
        ref={trackRef}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => {
          clearTimeout(fadeTimeout.current);
          trackRef.current!.style.opacity = "1";
        }}
        onMouseLeave={() => {
          if (!isDragging.current) {
            fadeTimeout.current = setTimeout(() => {
              trackRef.current!.style.opacity = "0";
            }, 1000);
          }
        }}
        style={{
          position: "fixed",
          top: 0,
          right: "4px",
          width: "12px",      // wider hit area so hover is easier to trigger
          height: "100vh",
          zIndex: 9999,
          opacity: 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "auto",
          borderRadius: "9999px",
          cursor: "default",
          display: "flex",
          justifyContent: "flex-end",
        }}
        className="hidden md:block"
      >
        <div
          ref={thumbRef}
          className="custom-scrollbar-thumb"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "5px",
            borderRadius: "9999px",
            background:
              "linear-gradient(180deg, #6A49FA 0%, #C4B5FD 50%, #E2D9FF 100%)",
            transition: "transform 0.1s linear, height 0.1s linear, width 0.15s ease, filter 0.15s ease",
            cursor: "grab",
          }}
        />
      </div>
    </>
  );
}