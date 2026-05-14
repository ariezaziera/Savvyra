"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const is404 = pathname === "/not-found";
  const isOnboarding = pathname === "/onboarding";
  const noLayout = isAuthPage || is404 || isOnboarding;

  return (
    <>
      {/* Hide Navbar on auth/onboarding pages without touching the Navbar component */}
      {noLayout && (
        <style>{`nav, aside { display: none !important; }`}</style>
      )}
      <main className={!noLayout ? "md:ml-22 md:mr-8 pb-20 md:pb-0" : ""}>
        {children}
      </main>
    </>
  );
}