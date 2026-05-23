// lib/notifications.ts
// Server-side helpers to create notifications + send push

import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require("web-push");

// ── Configure VAPID ──
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL   = process.env.VAPID_EMAIL ?? "support@savvyra.app";

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.warn("⚠️  VAPID keys not set — push notifications disabled");
} else {
  webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE);
}

export type NotifType = "SALARY_REMINDER" | "BILL_DUE" | "SAVINGS_MILESTONE" | "GENERAL";

// ── Create in-app notification ──
export async function createNotification({
  userId, type, title, body, data,
}: {
  userId: string;
  type: NotifType;
  title: string;
  body: string;
  data?: Record<string, any>;
}) {
  return prisma.notification.create({
    data: { userId, type, title, body, data: data ?? {} },
  });
}

// ── Send push + create in-app notification ──
export async function notify({
  userId, type, title, body, data,
}: {
  userId: string;
  type: NotifType;
  title: string;
  body: string;
  data?: Record<string, any>;
}) {
  // 1. Always create in-app record
  await createNotification({ userId, type, title, body, data });

  // 2. Skip push if VAPID not configured
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  // 3. Get all push subscriptions for this user
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });

  const payload = JSON.stringify({ title, body, data: data ?? {} });

  // 4. Send to each device (fire-and-forget, remove invalid subs)
  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (err: any) {
        // 410 Gone = subscription expired, remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    })
  );
}

// ── Convenience wrappers ──
export const notifyBillDue = (userId: string, billName: string, amount: number, dueDate: string) =>
  notify({
    userId, type: "BILL_DUE",
    title: `Bill due soon: ${billName}`,
    body: `RM ${amount.toFixed(2)} is due on ${dueDate}. Don't forget to pay!`,
    data: { billName, amount, dueDate },
  });

export const notifySalaryReminder = (userId: string, month: string, expectedNet: number) =>
  notify({
    userId, type: "SALARY_REMINDER",
    title: `Salary day approaching — ${month}`,
    body: `Your expected take-home is RM ${expectedNet.toFixed(2)}. Review your plan!`,
    data: { month, expectedNet },
  });

export const notifySavingsMilestone = (userId: string, goalName: string, percent: number) =>
  notify({
    userId, type: "SAVINGS_MILESTONE",
    title: `Savings milestone: ${goalName}`,
    body: percent >= 100
      ? `🎉 You've completed your "${goalName}" goal!`
      : `You've reached ${percent}% of your "${goalName}" goal. Keep it up!`,
    data: { goalName, percent },
  });