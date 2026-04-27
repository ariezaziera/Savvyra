type Transaction = {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "Income" | "Expense";
  status: "Completed" | "Pending";
};

type DeleteTransactionModalProps = {
  transaction: Transaction | null;
  formatCurrency: (amount: number) => string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteTransactionModal({
  transaction,
  formatCurrency,
  onCancel,
  onConfirm,
}: DeleteTransactionModalProps) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">
          Delete transaction?
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          This action cannot be undone. Please confirm the transaction details
          before deleting.
        </p>

        <div className="mt-5 rounded-xl border border-gray-100 bg-slate-50 p-4">
          <p className="font-medium text-gray-900">{transaction.title}</p>

          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>Category: {transaction.category}</p>
            <p>Type: {transaction.type}</p>
            <p>Status: {transaction.status}</p>
            <p>Amount: {formatCurrency(transaction.amount)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-rose-600"
          >
            Delete Transaction
          </button>
        </div>
      </div>
    </div>
  );
}