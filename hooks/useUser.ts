"use client";

import { useEffect, useState } from "react";

export type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  provider: string | null;
};

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, refetch: fetchUser };
}