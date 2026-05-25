import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSalaryReminderEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const profiles = await prisma.salaryProfile.findMany({
    include: { user: true },
  });

  let sent = 0;

  for (const profile of profiles) {
    const salaryDay = profile.salaryDay ?? 2;
    const userId    = profile.userId;
    const userEmail = profile.user.email;
    const userName  = profile.user.name ?? "there";

    if (!userEmail) continue;

    // Build salary date — if passed this month, look at next month
    let salaryDate = new Date(now.getFullYear(), now.getMonth(), salaryDay);
    if (salaryDate < now) {
      salaryDate = new Date(now.getFullYear(), now.getMonth() + 1, salaryDay);
    }

    const diffDays = Math.round(
      (salaryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const notifMap: Record<number, { title: string; body: string }> = {
      7: {
        title: "Gaji dalam 7 hari lagi 📅",
        body:  `Gaji akan masuk ${salaryDate.toLocaleDateString("ms-MY")}. Mula plan bulan ni!`,
      },
      3: {
        title: "Gaji dalam 3 hari lagi 💸",
        body:  "Lagi 3 hari! Pastikan semua commitment dah ready.",
      },
      1: {
        title: "Gaji esok! 🎉",
        body:  "Gaji masuk esok. Jangan lupa check payslip dan settle commitments.",
      },
      0: {
        title: "Gaji hari ni masuk! 💰",
        body:  "Selamat! Jangan lupa settle commitments dan update savings goal.",
      },
    };

    const notifData = notifMap[diffDays];
    if (!notifData) continue;

    // Check duplicate
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type:  "SALARY_REMINDER",
        title: notifData.title,
        createdAt: { gte: startOfDay },
      },
    });

    if (existing) continue;

    // ── In-app notification ──
    await prisma.notification.create({
      data: {
        userId,
        type:   "SALARY_REMINDER",
        title:  notifData.title,
        body:   notifData.body,
        isRead: false,
      },
    });

    // ── Email notification ──
    try {
      await sendSalaryReminderEmail({
        to:        userEmail,
        name:      userName,
        title:     notifData.title,
        body:      notifData.body,
        salaryDay,
      });
    } catch (err) {
      // Email fail shouldn't break in-app notification
      console.error(`Email failed for ${userEmail}:`, err);
    }

    sent++;
  }

  return NextResponse.json({ success: true, sent });
}