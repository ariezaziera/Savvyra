import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// Helper: spawn a CommitmentInstance for a given month/year
async function spawnInstance(
  commitmentId: string,
  userId: string,
  month: number,
  year: number,
  amount: number,
  dayOfMonth: number | null,
  isArrear = false
) {
  const day = dayOfMonth ?? 1;
  const dueDate = new Date(year, month - 1, day);

  // Upsert so we never create duplicates
  return prisma.commitmentInstance.upsert({
    where: { commitmentId_month_year: { commitmentId, month, year } },
    update: {},
    create: {
      commitmentId,
      userId,
      month,
      year,
      dueDate,
      amount,
      isArrear,
      status: "PENDING",
    },
  });
}

// GET — fetch all commitments with current month instance + stats
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const commitments = await prisma.commitment.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: {
        instances: {
          orderBy: { year: "desc" },
          take: 3, // current + recent history
        },
        debt: {
          select: { id: true, name: true },
        },
      },
    });

    // Auto-spawn missing current month instances for active commitments
    const spawnPromises = commitments
      .filter((c) => c.isActive)
      .map(async (c) => {
        const hasCurrentInstance = c.instances.some(
          (i) => i.month === currentMonth && i.year === currentYear
        );
        if (!hasCurrentInstance) {
          const newInstance = await spawnInstance(
            c.id,
            userId,
            currentMonth,
            currentYear,
            c.amount,
            c.dayOfMonth
          );
          c.instances.unshift(newInstance);
        }
      });

    await Promise.all(spawnPromises);

    // Refetch after spawning
    const result = await prisma.commitment.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: {
        instances: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
        },
        debt: {
          select: { id: true, name: true },
        },
      },
    });

    // Compute summary stats for current month
    const currentInstances = result.flatMap((c) =>
      c.instances.filter(
        (i) => i.month === currentMonth && i.year === currentYear
      )
    );

    const totalThisMonth = currentInstances.reduce((sum, i) => sum + i.amount, 0);
    const unpaidThisMonth = currentInstances
      .filter((i) => i.status === "PENDING" || i.status === "OVERDUE")
      .reduce((sum, i) => sum + i.amount, 0);

    return NextResponse.json({
      commitments: result,
      summary: {
        currentMonth,
        currentYear,
        totalThisMonth,
        unpaidThisMonth,
        paidThisMonth: totalThisMonth - unpaidThisMonth,
      },
    });
  } catch (error) {
    console.error("GET /api/commitments error:", error);
    return NextResponse.json({ error: "Failed to fetch commitments" }, { status: 500 });
  }
}

// POST — create a new commitment master + spawn current month instance
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    if (!body.name || !body.amount) {
      return NextResponse.json({ error: "Name and amount are required" }, { status: 400 });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const commitment = await prisma.commitment.create({
      data: {
        userId,
        name: body.name,
        amount: parseFloat(body.amount),
        category: body.category ?? "General",
        frequency: body.frequency ?? "MONTHLY",
        startDate: body.startDate ? new Date(body.startDate) : now,
        endDate: body.endDate ? new Date(body.endDate) : null,
        dayOfMonth: body.dayOfMonth ? parseInt(body.dayOfMonth) : null,
        debtId: body.debtId ?? null,
        note: body.note ?? null,
        isActive: true,
      },
    });

    // Spawn current month instance immediately
    const instance = await spawnInstance(
      commitment.id,
      userId,
      currentMonth,
      currentYear,
      commitment.amount,
      commitment.dayOfMonth
    );

    return NextResponse.json({ commitment, instance }, { status: 201 });
  } catch (error) {
    console.error("POST /api/commitments error:", error);
    return NextResponse.json({ error: "Failed to create commitment" }, { status: 500 });
  }
}
