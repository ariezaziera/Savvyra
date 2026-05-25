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

  const commitments = await prisma.commitment.findMany({
    where: { isPaid: false },
    include: { user: true },
  });

  let sent = 0;

  for (const commitment of commitments) {
    const dueDate = new Date(commitment.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffMs   = dueDate.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const notifMap: Record<number, { title: string; body: string }> = {
      7: {
        title: `Commitment due dalam 7 hari — ${commitment.name} 📅`,
        body:  `"${commitment.name}" (RM${commitment.amount.toLocaleString()}) perlu dibayar dalam 7 hari — ${dueDate.toLocaleDateString("ms-MY")}.`,
      },
      3: {
        title: `Commitment due dalam 3 hari — ${commitment.name} ⚠️`,
        body:  `Lagi 3 hari! "${commitment.name}" RM${commitment.amount.toLocaleString()} due ${dueDate.toLocaleDateString("ms-MY")}.`,
      },
      1: {
        title: `Commitment due esok — ${commitment.name} 🔔`,
        body:  `"${commitment.name}" RM${commitment.amount.toLocaleString()} due esok. Jangan lupa bayar!`,
      },
      0: {
        title: `Commitment due hari ni — ${commitment.name} 💸`,
        body:  `"${commitment.name}" RM${commitment.amount.toLocaleString()} due hari ni. Settle sekarang!`,
      },
    };

    const notifData = notifMap[diffDays];
    if (!notifData) continue;

    // Check duplicate
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existing = await prisma.notification.findFirst({
      where: {
        userId:    commitment.userId,
        type:      "BILL_DUE",
        title:     notifData.title,
        createdAt: { gte: startOfDay },
      },
    });

    if (existing) continue;

    // In-app
    await prisma.notification.create({
      data: {
        userId:  commitment.userId,
        type:    "BILL_DUE",
        title:   notifData.title,
        body:    notifData.body,
        isRead:  false,
        data:    { commitmentId: commitment.id, amount: commitment.amount, dueDate: commitment.dueDate },
      },
    });

    // Email
    try {
      await sendReminderEmail({
        to:       commitment.user.email!,
        name:     commitment.user.name ?? "there",
        title:    notifData.title,
        body:     notifData.body,
        type:     "commitment",
        metadata: {
          label:   commitment.name,
          amount:  commitment.amount,
          dueDate: dueDate.toLocaleDateString("ms-MY"),
        },
      });
    } catch (err) {
      console.error(`Email failed for ${commitment.user.email}:`, err);
    }

    sent++;
  }

  return NextResponse.json({ success: true, sent });
}