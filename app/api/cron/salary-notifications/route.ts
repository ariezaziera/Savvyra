import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email"

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Get all savings goals with deadline
  const goals = await prisma.savingsGoal.findMany({
    where: {
      deadline: { not: null },
      // Skip fully achieved goals
      NOT: {
        currentAmount: { gte: prisma.savingsGoal.fields.targetAmount }
      }
    },
    include: { user: true },
  });

  let sent = 0;

  for (const goal of goals) {
    if (!goal.deadline) continue;

    const deadline = new Date(goal.deadline);
    deadline.setHours(0, 0, 0, 0);

    const diffMs   = deadline.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
    if (progress >= 1) continue; // already achieved

    const notifMap: Record<number, { title: string; body: string }> = {
      60: {
        title: `2 bulan lagi — ${goal.name} 📅`,
        body:  `Savings goal "${goal.name}" due dalam 2 bulan. Semak progress korang!`,
      },
      30: {
        title: `1 bulan lagi — ${goal.name} ⏳`,
        body:  `Lagi sebulan je! "${goal.name}" — korang dah save ${(progress * 100).toFixed(0)}% daripada RM${goal.targetAmount.toLocaleString()}.`,
      },
      7: {
        title: `1 minggu lagi — ${goal.name} 🔔`,
        body:  `Tinggal 7 hari! "${goal.name}" — pastikan korang top up sebelum due date.`,
      },
      0: {
        title: `Due hari ni — ${goal.name} 🎯`,
        body:  `"${goal.name}" due hari ni! Korang dah capai ${(progress * 100).toFixed(0)}% daripada target.`,
      },
    };

    const notifData = notifMap[diffDays];
    if (!notifData) continue;

    // Check duplicate
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await prisma.notification.findFirst({
      where: {
        userId:    goal.userId,
        type:      "SAVINGS_MILESTONE",
        title:     notifData.title,
        createdAt: { gte: startOfDay },
      },
    });

    if (existing) continue;

    // In-app
    await prisma.notification.create({
      data: {
        userId:  goal.userId,
        type:    "SAVINGS_MILESTONE",
        title:   notifData.title,
        body:    notifData.body,
        isRead:  false,
        data:    { goalId: goal.id, targetAmount: goal.targetAmount, currentAmount: goal.currentAmount },
      },
    });

    // Email
    try {
      await sendReminderEmail({
        to:       goal.user.email!,
        name:     goal.user.name ?? "there",
        title:    notifData.title,
        body:     notifData.body,
        type:     "savings",
        metadata: {
          label:   goal.name,
          current: goal.currentAmount,
          target:  goal.targetAmount,
          dueDate: deadline.toLocaleDateString("ms-MY"),
        },
      });
    } catch (err) {
      console.error(`Email failed for ${goal.user.email}:`, err);
    }

    sent++;
  }

  return NextResponse.json({ success: true, sent });
}