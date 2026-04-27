"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "Income" | "Expense";
  status: "Completed" | "Pending";
};

type AddTransactionFormProps = {
  onTransactionSaved: () => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
  onShowToast: (message: string, type?: "success" | "error") => void;
  onScrollToTransactions: () => void;
};

const emptyForm = {
  title: "",
  category: "",
  date: "",
  amount: "",
  type: "Expense",
  status: "Completed",
};

export default function AddTransactionForm({
  onTransactionSaved,
  editingTransaction,
  onCancelEdit,
  onShowToast,
  onScrollToTransactions,
}: AddTransactionFormProps) {

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        title: editingTransaction.title,
        category: editingTransaction.category,
        date: editingTransaction.date.split("T")[0],
        amount: String(editingTransaction.amount),
        type: editingTransaction.type,
        status: editingTransaction.status,
      });
    }
  }, [editingTransaction]);

  const resetForm = () => {
    if (editingTransaction) {
      setForm({
        title: editingTransaction.title,
        category: editingTransaction.category,
        date: editingTransaction.date.split("T")[0],
        amount: String(editingTransaction.amount),
        type: editingTransaction.type,
        status: editingTransaction.status,
      });

      return;
    }

    setForm(emptyForm);
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    onCancelEdit?.();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isEditing = Boolean(editingTransaction);

    const response = await fetch("/api/transactions", {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        id: editingTransaction?.id,
      }),
    });

    if (!response.ok) {
      onShowToast("Failed to save transaction.", "error");
      return;
    }

    onShowToast("Transaction saved successfully.");

    setForm({
      title: "",
      category: "",
      date: "",
      amount: "",
      type: "Expense",
      status: "Completed",
    });

    onShowToast(
      isEditing
        ? "Transaction updated successfully."
        : "Transaction saved successfully."
    );

    setForm(emptyForm);

    onTransactionSaved();
    onScrollToTransactions();
    onCancelEdit?.();
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          {editingTransaction ? "Edit Transaction" : "Add Transaction"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Create a new income or expense entry
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Monthly Salary"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Savings, Food, Transport"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="e.g. 120"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {editingTransaction ? "Update Transaction" : "Save Transaction"}
          </button>

            {editingTransaction && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            )}

          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}