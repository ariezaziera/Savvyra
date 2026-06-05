import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export const runtime = "nodejs";

// Helper: check and skip if notification already sent today
async function alreadySent(userId: string, type: string, title: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const existing = await prisma.notification.findFirst({
    where: { userId, type: type as any, title, createdAt: { gte: startOfDay } },
  });
  return !!existing;
}

// Helper: create in-app + email notification
async function notify(
  userId: string,
  email: string,
  name: string,
  type: string,
  title: string,
  body: string,
  emailType: string,
  data: object,
  metadata: object
) {
  await prisma.notification.create({
    data: { userId, type: type as any, title, body, isRead: false, data },
  });
  try {
    await sendReminderEmail({ to: email, name, title, body, type: emailType as "salary" | "savings" | "commitment" | "debt" | "investment", metadata });
  } catch (err) {
    console.error(`Email failed for ${email}:`, err);
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  let sent = 0;

  // ─────────────────────────────────────────────
  // 1. COMMITMENT INSTANCES (current month unpaid)
  // ─────────────────────────────────────────────
  const commitmentInstances = await prisma.commitmentInstance.findMany({
    where: {
      month: currentMonth,
      year: currentYear,
      status: { in: ["PENDING", "OVERDUE"] },
    },
    include: { commitment: true, user: true },
  });

  for (const instance of commitmentInstances) {
    const dueDate = new Date(instance.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((dueDate.getTime() - now.getTime()) / 86400000);

    const notifMap: Record<number, { title: string; body: string }> = {
      7: {
        title: `Commitment due dalam 7 hari — ${instance.commitment.name} 📅`,
        body: `"${instance.commitment.name}" (RM${instance.amount.toLocaleString()}) due dalam 7 hari — ${dueDate.toLocaleDateString("ms-MY")}.`,
      },
      3: {
        title: `Commitment due dalam 3 hari — ${instance.commitment.name} ⚠️`,
        body: `Lagi 3 hari! "${instance.commitment.name}" RM${instance.amount.toLocaleString()} due ${dueDate.toLocaleDateString("ms-MY")}.`,
      },
      1: {
        title: `Commitment due esok — ${instance.commitment.name} 🔔`,
        body: `"${instance.commitment.name}" RM${instance.amount.toLocaleString()} due esok. Jangan lupa bayar!`,
      },
      0: {
        title: `Commitment due hari ni — ${instance.commitment.name} 💸`,
        body: `"${instance.commitment.name}" RM${instance.amount.toLocaleString()} due hari ni. Settle sekarang!`,
      },
    };

    const n = notifMap[diffDays];
    if (!n) continue;
    if (await alreadySent(instance.userId, "BILL_DUE", n.title)) continue;

    await notify(
      instance.userId, instance.user.email!, instance.user.name ?? "there",
      "BILL_DUE", n.title, n.body, "commitment",
      { commitmentId: instance.commitmentId, instanceId: instance.id, amount: instance.amount },
      { label: instance.commitment.name, amount: instance.amount, dueDate: dueDate.toLocaleDateString("ms-MY") }
    );
    sent++;
  }

  // ─────────────────────────────────────────────
  // 2. DEBT SCHEDULES (upcoming & overdue)
  // ─────────────────────────────────────────────
  const debtSchedules = await prisma.debtSchedule.findMany({
    where: { status: { in: ["PENDING", "OVERDUE"] } },
    include: { debt: { include: { user: true } } },
  });

  for (const schedule of debtSchedules) {
    const dueDate = new Date(schedule.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((dueDate.getTime() - now.getTime()) / 86400000);

    const notifMap: Record<number, { title: string; body: string }> = {
      7: {
        title: `Bayaran hutang dalam 7 hari — ${schedule.debt.name} 📅`,
        body: `Ansuran ke-${schedule.instalmentNo} untuk "${schedule.debt.name}" (RM${schedule.amount.toLocaleString()}) due dalam 7 hari.`,
      },
      3: {
        title: `Bayaran hutang dalam 3 hari — ${schedule.debt.name} ⚠️`,
        body: `Lagi 3 hari! Ansuran ke-${schedule.instalmentNo} "${schedule.debt.name}" RM${schedule.amount.toLocaleString()} due ${dueDate.toLocaleDateString("ms-MY")}.`,
      },
      1: {
        title: `Bayaran hutang esok — ${schedule.debt.name} 🔔`,
        body: `Ansuran ke-${schedule.instalmentNo} "${schedule.debt.name}" RM${schedule.amount.toLocaleString()} due esok!`,
      },
      0: {
        title: `Bayaran hutang hari ni — ${schedule.debt.name} 💸`,
        body: `Ansuran ke-${schedule.instalmentNo} "${schedule.debt.name}" RM${schedule.amount.toLocaleString()} due hari ni!`,
      },
      [-1]: {
        title: `Bayaran hutang tertunggak — ${schedule.debt.name} 🚨`,
        body: `Ansuran ke-${schedule.instalmentNo} "${schedule.debt.name}" RM${schedule.amount.toLocaleString()} sudah overdue!`,
      },
    };

    const n = notifMap[diffDays];
    if (!n) continue;
    if (await alreadySent(schedule.userId, "DEBT_REMINDER", n.title)) continue;

    await notify(
      schedule.userId, schedule.debt.user.email!, schedule.debt.user.name ?? "there",
      "DEBT_REMINDER", n.title, n.body, "debt",
      { debtId: schedule.debtId, scheduleId: schedule.id, amount: schedule.amount },
      { label: schedule.debt.name, amount: schedule.amount, dueDate: dueDate.toLocaleDateString("ms-MY") }
    );
    sent++;
  }

  // ─────────────────────────────────────────────
  // 3. SAVINGS GOALS (deadline approaching)
  // ─────────────────────────────────────────────
  const savingsGoals = await prisma.savingsGoal.findMany({
    where: { deadline: { not: null }, isArchived: false },
    include: { user: true, transactions: true },
  });

  for (const goal of savingsGoals) {
    if (!goal.deadline) continue;

    // Calculate current amount dynamically from transactions
    const currentAmount = goal.transactions
      .filter((t) => t.type === "SAVINGS")
      .reduce((sum, t) => sum + t.amount, 0);

    const progress = goal.targetAmount > 0 ? currentAmount / goal.targetAmount : 0;
    if (progress >= 1) continue;

    const deadline = new Date(goal.deadline);
    deadline.setHours(0, 0, 0, 0);
    const diffDays = Math.round((deadline.getTime() - now.getTime()) / 86400000);

    const notifMap: Record<number, { title: string; body: string }> = {
      60: {
        title: `2 bulan lagi — ${goal.name} 📅`,
        body: `Savings goal "${goal.name}" due dalam 2 bulan. Semak progress korang!`,
      },
      30: {
        title: `1 bulan lagi — ${goal.name} ⏳`,
        body: `Lagi sebulan je! "${goal.name}" — korang dah save ${(progress * 100).toFixed(0)}% daripada RM${goal.targetAmount.toLocaleString()}.`,
      },
      7: {
        title: `1 minggu lagi — ${goal.name} 🔔`,
        body: `Tinggal 7 hari! "${goal.name}" — pastikan top up sebelum due date.`,
      },
      0: {
        title: `Due hari ni — ${goal.name} 🎯`,
        body: `"${goal.name}" due hari ni! Korang dah capai ${(progress * 100).toFixed(0)}% daripada target.`,
      },
    };

    const n = notifMap[diffDays];
    if (!n) continue;
    if (await alreadySent(goal.userId, "SAVINGS_MILESTONE", n.title)) continue;

    await notify(
      goal.userId, goal.user.email!, goal.user.name ?? "there",
      "SAVINGS_MILESTONE", n.title, n.body, "savings",
      { goalId: goal.id, targetAmount: goal.targetAmount, currentAmount },
      { label: goal.name, current: currentAmount, target: goal.targetAmount, dueDate: deadline.toLocaleDateString("ms-MY") }
    );
    sent++;
  }

  // ─────────────────────────────────────────────
  // 4. INVESTMENT MATURITY DATES
  // ─────────────────────────────────────────────
  const investments = await prisma.investment.findMany({
    where: { maturityDate: { not: null }, status: "ACTIVE" },
    include: { user: true },
  });

  for (const inv of investments) {
    if (!inv.maturityDate) continue;

    const maturityDate = new Date(inv.maturityDate);
    maturityDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((maturityDate.getTime() - now.getTime()) / 86400000);

    const notifMap: Record<number, { title: string; body: string }> = {
      30: {
        title: `Pelaburan matang dalam 30 hari — ${inv.name} 📈`,
        body: `"${inv.name}" akan matang dalam sebulan pada ${maturityDate.toLocaleDateString("ms-MY")}.`,
      },
      7: {
        title: `Pelaburan matang dalam 7 hari — ${inv.name} 🔔`,
        body: `"${inv.name}" akan matang dalam 7 hari. Bersedia untuk tindakan seterusnya!`,
      },
      1: {
        title: `Pelaburan matang esok — ${inv.name} 🎯`,
        body: `"${inv.name}" matang esok pada ${maturityDate.toLocaleDateString("ms-MY")}!`,
      },
      0: {
        title: `Pelaburan matang hari ni — ${inv.name} 💰`,
        body: `"${inv.name}" matang hari ni! Semak platform pelaburan korang.`,
      },
    };

    const n = notifMap[diffDays];
    if (!n) continue;
    if (await alreadySent(inv.userId, "INVESTMENT_UPDATE", n.title)) continue;

    await notify(
      inv.userId, inv.user.email!, inv.user.name ?? "there",
      "INVESTMENT_UPDATE", n.title, n.body, "investment",
      { investmentId: inv.id, maturityDate: inv.maturityDate },
      { label: inv.name, dueDate: maturityDate.toLocaleDateString("ms-MY") }
    );
    sent++;
  }

  // ─────────────────────────────────────────────
  // 5. SALARY DAY REMINDER
  // ─────────────────────────────────────────────
  const salaryProfiles = await prisma.salaryProfile.findMany({
    include: { user: true },
  });

  for (const profile of salaryProfiles) {
    const salaryDay = profile.salaryDay;
    const todayDate = now.getDate();
    const daysUntilSalary = salaryDay - todayDate;

    const notifMap: Record<number, { title: string; body: string }> = {
      3: {
        title: `Gaji dalam 3 hari 💼`,
        body: `Gaji korang akan masuk dalam 3 hari (${salaryDay} hab bulan ini). Pastikan salary planning dah ready!`,
      },
      1: {
        title: `Gaji esok! 🎉`,
        body: `Gaji masuk esok! Buka Savvyra dan semak salary planning korang.`,
      },
      0: {
        title: `Gaji hari ni! 💸`,
        body: `Gaji dah masuk hari ni! Update actual salary korang dalam Savvyra.`,
      },
    };

    const n = notifMap[daysUntilSalary];
    if (!n) continue;
    if (await alreadySent(profile.userId, "SALARY_REMINDER", n.title)) continue;

    await notify(
      profile.userId, profile.user.email!, profile.user.name ?? "there",
      "SALARY_REMINDER", n.title, n.body, "salary",
      { salaryDay, month: currentMonth, year: currentYear },
      { label: "Salary Reminder", dueDate: `${salaryDay}/${currentMonth}/${currentYear}` }
    );
    sent++;
  }

  return NextResponse.json({ success: true, sent });
}
