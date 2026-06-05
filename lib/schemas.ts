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
  title:               z.string().min(1).max(100),
  amount:              z.number().positive("Amount must be positive"),
  type:                z.enum(["INCOME", "EXPENSE", "SAVINGS", "INVESTMENT", "DEBT_PAYMENT", "DEBT_ADDITION", "COMMITMENT"]),
  category:            z.string().min(1).max(50),
  date:                z.coerce.date().transform((d) => d.toISOString()),
  description:         z.string().max(500).optional().nullable(),
  note:                z.string().max(500).optional().nullable(),
  // Module links — at most one will be set
  savingsGoalId:        z.string().optional().nullable(),
  investmentId:         z.string().optional().nullable(),
  debtId:               z.string().optional().nullable(),
  debtScheduleId:       z.string().optional().nullable(),
  commitmentInstanceId: z.string().optional().nullable(),
  salaryMonthId:        z.string().optional().nullable(),
});

export const commitmentSchema = z.object({
  name:      z.string().min(1).max(100),
  amount:    z.coerce.number().positive(),
  category:  z.string().max(50).optional(),
  frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "ANNUALLY"]).optional(),
  dayOfMonth: z.coerce.number().min(1).max(31).optional().nullable(),
  note:      z.string().max(500).optional(),
});

export const savingsGoalSchema = z.object({
  name:                z.string().min(1).max(100),
  targetAmount:        z.coerce.number().positive(),
  currentAmount:       z.coerce.number().min(0).optional(),
  deadline:            z.coerce.date().transform((d) => d.toISOString()).optional().nullable(),
  monthlyContribution: z.coerce.number().positive().optional().nullable(),
});