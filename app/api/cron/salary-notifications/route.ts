import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Security — Vercel passes this header automatically
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();

  // Get all salary profiles
  const profiles = await prisma.salaryProfile.findMany({
    include: { user: true },
  });

  const notifications = [];

  for (const profile of profiles) {
    const salaryDay = profile.salaryDay ?? 2;
    const userId = profile.userId;

    // Calculate salary date this month
    const salaryDate = new Date(todayYear, todayMonth - 1, salaryDay);

    // If salary day already passed this month, look at next month
    const targetDate = salaryDate < today
      ? new Date(todayYear, todayMonth, salaryDay)
      : salaryDate;

    const diffMs = targetDate.getTime() - today.setHours(0, 0, 0, 0);
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    let notifData = null;

    if (diffDays === 7) {
      notifData = {
        title: "Gaji dalam 7 hari lagi 📅",
        body: `Gaji korang akan masuk pada ${targetDate.toLocaleDateString("ms-MY")}. Mula plan perbelanjaan bulan ni!`,
      };
    } else if (diffDays === 3) {
      notifData = {
        title: "Gaji dalam 3 hari lagi 💸",
        body: `Lagi 3 hari je! Pastikan semua commitment bulan ni dah ready.`,
      };
    } else if (diffDays === 1) {
      notifData = {
        title: "Gaji esok! 🎉",
        body: `Gaji korang masuk esok. Jangan lupa check payslip dan settle commitments.`,
      };
    } else if (diffDays === 0) {
      notifData = {
        title: "Gaji hari ni masuk! 💰",
        body: `Selamat! Jangan lupa settle semua commitments dan update savings goal korang.`,
      };
    }

    if (notifData) {
      // Avoid duplicate — check if same notif already sent today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          type: "SALARY_REMINDER",
          title: notifData.title,
          createdAt: { gte: startOfDay },
        },
      });

      if (!existing) {
        notifications.push(
          prisma.notification.create({
            data: {
              userId,
              type: "SALARY_REMINDER",
              title: notifData.title,
              body: notifData.body,
              isRead: false,
            },
          })
        );
      }
    }
  }

  await Promise.all(notifications);

  return NextResponse.json({
    success: true,
    sent: notifications.length,
  });
}