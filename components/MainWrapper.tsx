"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <main className={!isAuthPage ? "md:ml-16 pb-20 md:pb-0" : ""}>
      {children}
    </main>
  );
}