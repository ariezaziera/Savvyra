// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { getIconForCategory } from "@/lib/categoryIcons";

/* ─────────────────────────────────────────────────────────────────
   Default categories seeded on first fetch per user
───────────────────────────────────────────────────────────────── */
const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food & Drinks",    icon: "🍔" },
  { name: "Transport",        icon: "🚗" },
  { name: "Shopping",         icon: "🛍️" },
  { name: "Bills & Utilities",icon: "📄" },
  { name: "Health",           icon: "💊" },
  { name: "Entertainment",    icon: "🎮" },
  { name: "Education",        icon: "🎓" },
  { name: "Housing",          icon: "🏠" },
  { name: "Personal Care",    icon: "🪥" },
  { name: "Savings",          icon: "🏦" },
  { name: "Other",            icon: "📌" },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary",           icon: "💼" },
  { name: "Freelance",        icon: "💻" },
  { name: "Business",         icon: "🏢" },
  { name: "Investment",       icon: "📈" },
  { name: "Gift",             icon: "🎁" },
  { name: "Rental",           icon: "🏠" },
  { name: "Bonus",            icon: "🎁" },
  { name: "Other",            icon: "💰" },
];

async function seedDefaults(userId: string) {
  const existing = await prisma.category.count({ where: { userId } });
  if (existing > 0) return; // already seeded

  const data = [
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
      ...c, userId, type: "Expense", isDefault: true,
    })),
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
      ...c, userId, type: "Income", isDefault: true,
    })),
  ];

  await prisma.category.createMany({ data, skipDuplicates: true });
}

/* ─────────────────────────────────────────────────────────────────
   GET /api/categories  — returns all categories for current user
───────────────────────────────────────────────────────────────── */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await seedDefaults(session.user.id);

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(categories);
}

/* ─────────────────────────────────────────────────────────────────
   POST /api/categories  — create a new custom category
───────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, type, icon } = await req.json();

  if (!name?.trim() || !type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }

  const resolvedIcon = icon?.trim() || getIconForCategory(name, type);

  try {
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        type,
        icon: resolvedIcon,
        isDefault: false,
        userId: session.user.id,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    // Unique constraint — duplicate name+type
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

/* ─────────────────────────────────────────────────────────────────
   PATCH /api/categories  — update icon (or name) of a category
───────────────────────────────────────────────────────────────── */
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, icon, name } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Verify ownership
  const existing = await prisma.category.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(icon !== undefined && { icon }),
      ...(name !== undefined && { name: name.trim() }),
    },
  });

  return NextResponse.json(updated);
}

/* ─────────────────────────────────────────────────────────────────
   DELETE /api/categories  — delete a category
───────────────────────────────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Verify ownership
  const existing = await prisma.category.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}