import { z } from "zod";

export const loginSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const registerSchema = z.object({
  name:     z.string().min(1).max(50).optional(),
  email:    z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const transactionSchema = z.object({
  title:        z.string().min(1).max(100),
  amount:       z.number().positive("Amount must be positive"),
  type:         z.enum(["INCOME", "EXPENSE", "DEBT", "COMMITMENT", "SAVINGS", "INVESTMENT"]),
  category:     z.string().min(1).max(50),
  // ✅ FIX: replaced .datetime() with .coerce so the schema accepts both
  // full ISO strings ("2026-05-26T00:00:00.000Z") and date-only strings
  // ("2026-05-26") without throwing a validation error.
  date:         z.coerce.date().transform((d) => d.toISOString()),
  status:       z.string().optional(),
  description:  z.string().max(500).optional(),
  savingsGoalId: z.string().optional().nullable(),
});

export const commitmentSchema = z.object({
  name:      z.string().min(1).max(100),
  amount:    z.number().positive(),
  // ✅ FIX: same coerce fix applied for consistency
  dueDate:   z.coerce.date().transform((d) => d.toISOString()),
  category:  z.string().max(50).optional(),
  frequency: z.enum(["Monthly", "Weekly", "Yearly", "One-time"]).optional(),
  note:      z.string().max(500).optional(),
});

export const savingsGoalSchema = z.object({
  name:                z.string().min(1).max(100),
  targetAmount:        z.number().positive(),
  currentAmount:       z.number().min(0).optional(),
  // ✅ FIX: same coerce fix applied for consistency
  deadline:            z.coerce.date().transform((d) => d.toISOString()).optional().nullable(),
  monthlyContribution: z.number().positive().optional().nullable(),
});