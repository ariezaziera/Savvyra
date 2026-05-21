// hooks/usePushNotifications.ts
"use client";

import { useState, useEffect } from "react";

export type PushStatus = "idle" | "loading" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>("idle");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  useEffect(() => {
    if (!isSupported) { setStatus("unsupported"); return; }

    // Check existing permission
    if (Notification.permission === "granted") setStatus("granted");
    else if (Notification.permission === "denied") setStatus("denied");

    // Check existing subscription
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setSubscription(sub);
      });
    }).catch(() => {});
  }, [isSupported]);

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) { setStatus("unsupported"); return false; }

    setStatus("loading");

    try {
      // 1. Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return false;
      }

      // 2. Get VAPID public key
      const keyRes = await fetch("/api/notifications/push");
      const { publicKey } = await keyRes.json();
      if (!publicKey) throw new Error("VAPID key not configured");

      // 3. Register service worker
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 4. Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      setSubscription(sub);

      // 5. Save subscription to server
      const subJson = sub.toJSON();
      await fetch("/api/notifications/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
          deviceName: getDeviceLabel(),
        }),
      });

      setStatus("granted");
      return true;
    } catch (err: any) {
      console.error("Push subscription error:", err);
      setStatus("idle");
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) return false;
    try {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await fetch("/api/notifications/push", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
      setSubscription(null);
      setStatus("idle");
      return true;
    } catch {
      return false;
    }
  };

  return { subscribe, unsubscribe, status, subscription, isSupported };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function getDeviceLabel(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua))  return "iPhone";
  if (/iPad/.test(ua))    return "iPad";
  if (/Mac/.test(ua))     return "Mac";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows PC";
  return "Browser";
}