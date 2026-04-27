export type StatItem = {
  label: string;
  value: number;
  color: string;
};

export type SavingsGoal = {
  name: string;
  current: number;
  target: number;
  color: string;
};

export const stats: StatItem[] = [
  { label: "Balance", value: 1250, color: "text-blue-600" },
  { label: "Income", value: 2100, color: "text-green-600" },
  { label: "Expenses", value: 650, color: "text-red-500" },
  { label: "Savings", value: 500, color: "text-purple-600" },
];

export const savingsGoals: SavingsGoal[] = [
  {
    name: "Emergency Fund",
    current: 3200,
    target: 5000,
    color: "from-blue-600 to-blue-400",
  },
  {
    name: "Car Service",
    current: 450,
    target: 1000,
    color: "from-violet-600 to-violet-400",
  },
  {
    name: "Travel Fund",
    current: 1800,
    target: 3000,
    color: "from-cyan-600 to-cyan-400",
  },
];