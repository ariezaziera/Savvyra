export const formatCurrency = (amount?: number): string => {
  if (!amount) return "RM 0";

  return `RM ${amount.toLocaleString()}`;
};