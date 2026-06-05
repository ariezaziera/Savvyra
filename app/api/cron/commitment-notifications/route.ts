import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Fetch unpaid instances for this month
  const instances = await prisma.commitmentInstance.findMany({
    where: {
      month: currentMonth,
      year: currentYear,
      status: { in: ["PENDING", "OVERDUE"] },
    },
    include: {
      commitment: true,
      user: true,
    },
  });

  let sent = 0;

  for (const instance of instances) {
    const dueDate = new Date(instance.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffMs   = dueDate.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const notifMap: Record<number, { title: string; body: string }> = {
      7: {
        title: `Commitment due dalam 7 hari — ${instance.commitment.name} 📅`,
        body:  `"${instance.commitment.name}" (RM${instance.amount.toLocaleString()}) perlu dibayar dalam 7 hari — ${dueDate.toLocaleDateString("ms-MY")}.`,
      },
      3: {
        title: `Commitment due dalam 3 hari — ${instance.commitment.name} ⚠️`,
        body:  `Lagi 3 hari! "${instance.commitment.name}" RM${instance.amount.toLocaleString()} due ${dueDate.toLocaleDateString("ms-MY")}.`,
      },
      1: {
        title: `Commitment due esok — ${instance.commitment.name} 🔔`,
        body:  `"${instance.commitment.name}" RM${instance.amount.toLocaleString()} due esok. Jangan lupa bayar!`,
      },
      0: {
        title: `Commitment due hari ni — ${instance.commitment.name} 💸`,
        body:  `"${instance.commitment.name}" RM${instance.amount.toLocaleString()} due hari ni. Settle sekarang!`,
      },
    };

    const notifData = notifMap[diffDays];
    if (!notifData) continue;

    // Check duplicate for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await prisma.notification.findFirst({
      where: {
        userId:    instance.userId,
        type:      "BILL_DUE",
        title:     notifData.title,
        createdAt: { gte: startOfDay },
      },
    });

    if (existing) continue;

    // In-app notification
    await prisma.notification.create({
      data: {
        userId:  instance.userId,
        type:    "BILL_DUE",
        title:   notifData.title,
        body:    notifData.body,
        isRead:  false,
        data:    {
          commitmentId: instance.commitmentId,
          instanceId:   instance.id,
          amount:       instance.amount,
          dueDate:      instance.dueDate,
        },
      },
    });

    // Email
    try {
      await sendReminderEmail({
        to:       instance.user.email!,
        name:     instance.user.name ?? "there",
        title:    notifData.title,
        body:     notifData.body,
        type:     "commitment",
        metadata: {
          label:   instance.commitment.name,
          amount:  instance.amount,
          dueDate: dueDate.toLocaleDateString("ms-MY"),
        },
      });
    } catch (err) {
      console.error(`Email failed for ${instance.user.email}:`, err);
    }

    sent++;
  }

  return NextResponse.json({ success: true, sent });
}
