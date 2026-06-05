import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";
import { transactionSchema } from "@/lib/schemas";

// ── Cascade helpers ──────────────────────────────────────────────────────────

async function applyTransactionCascade(tx: any) {
  // Debt schedule → mark PAID + reduce debt remaining
  if (tx.debtScheduleId) {
    await prisma.debtSchedule.update({
      where: { id: tx.debtScheduleId },
      data: { status: "PAID", paidAt: tx.date },
    });
    const schedule = await prisma.debtSchedule.findUnique({ where: { id: tx.debtScheduleId } });
    if (schedule) {
      await prisma.debt.update({
        where: { id: schedule.debtId },
        data: { remainingAmount: { decrement: schedule.amount } },
      });
      // Auto-settle debt if no more pending schedules
      const pendingCount = await prisma.debtSchedule.count({
        where: { debtId: schedule.debtId, status: "PENDING" },
      });
      if (pendingCount === 0) {
        await prisma.debt.update({
          where: { id: schedule.debtId },
          data: { status: "SETTLED", remainingAmount: 0 },
        });
      }
    }
  }

  // Commitment instance → mark PAID
  if (tx.commitmentInstanceId) {
    await prisma.commitmentInstance.update({
      where: { id: tx.commitmentInstanceId },
      data: { status: "PAID", paidAt: tx.date },
    });
  }

  // Flexible debt payment → reduce remaining
  if (tx.debtId && !tx.debtScheduleId && tx.type === "DEBT_PAYMENT") {
    await prisma.debt.update({
      where: { id: tx.debtId },
      data: { remainingAmount: { decrement: tx.amount } },
    });
  }
}

async function reverseCascade(tx: any) {
  // Undo debt schedule mark
  if (tx.debtScheduleId) {
    const schedule = await prisma.debtSchedule.findUnique({ where: { id: tx.debtScheduleId } });
    if (schedule) {
      await prisma.debtSchedule.update({
        where: { id: tx.debtScheduleId },
        data: { status: "PENDING", paidAt: null },
      });
      await prisma.debt.update({
        where: { id: schedule.debtId },
        data: { remainingAmount: { increment: schedule.amount }, status: "ACTIVE" },
      });
    }
  }

  // Undo commitment instance mark
  if (tx.commitmentInstanceId) {
    await prisma.commitmentInstance.update({
      where: { id: tx.commitmentInstanceId },
      data: { status: "PENDING", paidAt: null },
    });
  }

  // Undo flexible debt payment
  if (tx.debtId && !tx.debtScheduleId && tx.type === "DEBT_PAYMENT") {
    await prisma.debt.update({
      where: { id: tx.debtId },
      data: { remainingAmount: { increment: tx.amount } },
    });
  }
}

// ── GET ──────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit   = parseInt(searchParams.get("limit") ?? "20");
    const skip    = (page - 1) * limit;
    const type    = searchParams.get("type") ?? undefined;
    const from    = searchParams.get("from") ?? undefined;
    const to      = searchParams.get("to") ?? undefined;

    const where: any = { userId };
    if (type)         where.type = type;
    if (from || to)   where.date = { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        take: limit,
        skip,
        include: {
          savingsGoal:        { select: { id: true, name: true } },
          investment:         { select: { id: true, name: true } },
          debt:               { select: { id: true, name: true } },
          debtSchedule:       { select: { id: true, instalmentNo: true, dueDate: true } },
          commitmentInstance: { select: { id: true, month: true, year: true, commitment: { select: { name: true } } } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

// ── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, amount, type, category, date, description, note,
            savingsGoalId, investmentId, debtId, debtScheduleId, commitmentInstanceId, salaryMonthId } = parsed.data;

    const transaction = await prisma.transaction.create({
      data: {
        userId, title, amount, type, category,
        date: new Date(date),
        description: description ?? null,
        note: note ?? null,
        savingsGoalId:        savingsGoalId        ?? null,
        investmentId:         investmentId         ?? null,
        debtId:               debtId               ?? null,
        debtScheduleId:       debtScheduleId       ?? null,
        commitmentInstanceId: commitmentInstanceId ?? null,
        salaryMonthId:        salaryMonthId        ?? null,
      },
    });

    await applyTransactionCascade(transaction);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

// ── PUT (edit) ────────────────────────────────────────────────────────────────

export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const existing = await prisma.transaction.findFirst({ where: { id: String(body.id), userId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, amount, type, category, date, description, note,
            savingsGoalId, investmentId, debtId, debtScheduleId, commitmentInstanceId, salaryMonthId } = parsed.data;

    // Reverse old cascades before applying new ones
    await reverseCascade(existing);

    const transaction = await prisma.transaction.update({
      where: { id: String(body.id) },
      data: {
        title, amount, type, category,
        date: new Date(date),
        description: description ?? null,
        note: note ?? null,
        savingsGoalId:        savingsGoalId        ?? null,
        investmentId:         investmentId         ?? null,
        debtId:               debtId               ?? null,
        debtScheduleId:       debtScheduleId       ?? null,
        commitmentInstanceId: commitmentInstanceId ?? null,
        salaryMonthId:        salaryMonthId        ?? null,
      },
    });

    await applyTransactionCascade(transaction);

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("PUT /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    const existing = await prisma.transaction.findFirst({ where: { id: String(id), userId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await reverseCascade(existing);
    await prisma.transaction.delete({ where: { id: String(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}