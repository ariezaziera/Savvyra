// DeleteTransactionModal.tsx

type Transaction = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  type:
    | "INCOME"
    | "EXPENSE"
    | "SAVINGS"
    | "INVESTMENT"
    | "DEBT_PAYMENT"
    | "DEBT_ADDITION"
    | "COMMITMENT";
  savingsGoalId?: string | null;
  investmentId?: string | null;
  debtId?: string | null;
  debtScheduleId?: string | null;
  commitmentInstanceId?: string | null;
};

type DeleteTransactionModalProps = {
  transaction: Transaction | null;
  formatCurrency: (amount: number) => string;
  onCancel: () => void;
  onConfirm: () => void;
};

const TYPE_LABEL: Record<string, string> = {
  INCOME: "Income",
  EXPENSE: "Expense",
  DEBT_PAYMENT: "Debt Payment",
  DEBT_ADDITION: "Debt Addition",
  COMMITMENT: "Commitment",
  SAVINGS: "Savings",
  INVESTMENT: "Investment",
};

export default function DeleteTransactionModal({
  transaction,
  formatCurrency,
  onCancel,
  onConfirm,
}: DeleteTransactionModalProps) {
  if (!transaction) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(10,5,30,0.75)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl p-6"
        style={{
          background: "#1E1248",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "rgba(255,255,255,0.18)" }} />
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full"
          style={{ background: "#E8A0A0", filter: "blur(60px)", opacity: 0.25 }}
        />

        <h2 className="relative z-10 text-lg font-bold text-white">Delete transaction?</h2>
        <p className="relative z-10 mt-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          This action cannot be undone. Please confirm the details before deleting.
        </p>

        <div
          className="relative z-10 mt-5 rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="font-semibold text-white">{transaction.title}</p>
          <div className="mt-3 space-y-2">
            {[
              { label: "Category", value: transaction.category },
              { label: "Type",     value: TYPE_LABEL[transaction.type] ?? transaction.type },
              { label: "Amount",   value: formatCurrency(transaction.amount) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                <span
                  className="font-medium"
                  style={{
                    color:
                      label === "Type"
                        ? transaction.type === "INCOME" ? "#E8C97A" : "#E8A0A0"
                        : label === "Amount"
                        ? "#E2D9FF"
                        : "rgba(255,255,255,0.8)",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl px-5 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #E8A0A0 0%, #C0494A 100%)",
              boxShadow: "0 8px 24px rgba(192,73,74,0.4)",
              border: "1px solid rgba(232,160,160,0.3)",
            }}
          >
            Delete Transaction
          </button>
        </div>
      </div>
    </div>
  );
}