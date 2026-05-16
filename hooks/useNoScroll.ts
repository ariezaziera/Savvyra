"use client";

import { useEffect } from "react";

/**
 * useNoScroll
 * Call this at the top of any full-screen page (onboarding, login, register)
 * that must NEVER scroll — even after back-navigation triggers browser scroll
 * restoration.
 *
 * It locks html + body on mount and cleans up on unmount so other pages
 * are unaffected.
 */
export function useNoScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prev = {
      htmlOverflow:   html.style.overflow,
      htmlHeight:     html.style.height,
      bodyOverflow:   body.style.overflow,
      bodyHeight:     body.style.height,
      bodyPosition:   body.style.position,
    };

    html.style.overflow = "hidden";
    html.style.height   = "100%";
    body.style.overflow = "hidden";
    body.style.height   = "100%";
    body.style.position = "relative";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.height   = prev.htmlHeight;
      body.style.overflow = prev.bodyOverflow;
      body.style.height   = prev.bodyHeight;
      body.style.position = prev.bodyPosition;
    };
  }, []);
}