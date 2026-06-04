"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayout = ["/login", "/register", "/onboarding", "/not-found"].includes(pathname ?? "");

  return (
    <>
      {noLayout && <style>{`nav, aside { display: none !important; }`}</style>}
      <main className={!noLayout ? "md:ml-22 md:mr-8 pb-24 md:pb-0" : ""}>
        {children}
      </main>
    </>
  );
}
