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
  date:         z.coerce.date().transform((d) => d.toISOString()),
  status:       z.string().optional(),
  description:  z.string().max(500).optional(),
  savingsGoalId: z.string().optional().nullable(),
});

export const commitmentSchema = z.object({
  name:      z.string().min(1).max(100),
  amount:    z.coerce.number().positive(),
  dueDate:   z.coerce.date().transform((d) => d.toISOString()),
  category:  z.string().max(50).optional(),
  frequency: z.enum(["Monthly", "Weekly", "Yearly", "One-time"]).optional(),
  note:      z.string().max(500).optional(),
});

export const savingsGoalSchema = z.object({
  name:                z.string().min(1).max(100),
  targetAmount:        z.coerce.number().positive(), // ← fix
  currentAmount:       z.coerce.number().min(0).optional(), // ← fix
  deadline:            z.coerce.date().transform((d) => d.toISOString()).optional().nullable(),
  monthlyContribution: z.coerce.number().positive().optional().nullable(), // ← fix
});