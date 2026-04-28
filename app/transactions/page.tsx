"use client";

import { useEffect, useRef, useState } from "react";
import PageContainer from "@/components/PageContainer";
import AddTransactionForm from "@/components/AddTransactionForm";
import { Trash2, Pencil } from "lucide-react";
import Toast from "@/components/Toast";
import DeleteTransactionModal from "@/components/DeleteTransactionModal";

type Transaction = {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "Income" | "Expense";
  status: "Completed" | "Pending";
};

const formatCurrency = (amount: number) => `RM ${amount.toLocaleString()}`;

export default function TransactionsPage() {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/transactions");
      const data = await response.json();

      setTransactions(data);
    } catch (error) {
      showToast("Failed to load transactions.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    const response = await fetch("/api/transactions", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: transactionToDelete.id }),
    });

    if (!response.ok) {
      showToast("Failed to delete transaction.", "error");
      return;
    }

    setTransactionToDelete(null);
    showToast("Transaction deleted successfully.");
    fetchTransactions();
    scrollToTransactions();
  };

  const totalIncome = transactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = transactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalTransactions = transactions.length;
  
  const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const transactionsSectionRef = useRef<HTMLElement | null>(null);

  const scrollToTransactions = () => {
    transactionsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const filteredTransactions = transactions.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "All Types" || item.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your recent income and expenses in one place
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">
            {totalTransactions}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Income</p>
          <h2 className="mt-1 text-2xl font-semibold text-green-600">
            {formatCurrency(totalIncome)}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <h2 className="mt-1 text-2xl font-semibold text-rose-500">
            {formatCurrency(totalExpenses)}
          </h2>
        </div>
      </div>

      <div className="mt-6">
        <AddTransactionForm
          onTransactionSaved={fetchTransactions}
          editingTransaction={editingTransaction}
          onCancelEdit={() => setEditingTransaction(null)}
          onShowToast={showToast}
          onScrollToTransactions={scrollToTransactions}
        />     
      </div>

      <section
        ref={transactionsSectionRef}
        className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <p className="text-sm text-gray-500">
              A quick overview of your latest activity
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transaction"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option>All Types</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Title
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                  Category
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                  Date
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                  Amount
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading transactions...
                  </td>
                </tr>
              )}
              
              {!isLoading &&
                filteredTransactions.map((item) => (
                <tr
                  key={item.id}
                  className="rounded-xl border border-gray-100 bg-slate-50"
                >
                  <td className="rounded-l-xl px-4 py-4 text-sm font-medium text-gray-900">
                    {item.title}
                  </td>

                  <td className="px-4 py-4 text-center text-sm text-gray-600">
                    {item.category}
                  </td>

                  <td className="px-4 py-4 text-center text-sm text-gray-600">
                    {formatDate(item.date)}
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.type === "Income"
                          ? "bg-green-50 text-green-600"
                          : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.status === "Completed"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td
                    className={`rounded-r-xl px-4 py-4 text-center text-sm font-semibold ${
                      item.type === "Income"
                        ? "text-green-600"
                        : "text-rose-500"
                    }`}
                  >
                    {item.type === "Income" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="rounded-r-xl py-4 text-center">
                    <div className="flex justify-center gap-1">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => setEditingTransaction(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setTransactionToDelete(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <DeleteTransactionModal
        transaction={transactionToDelete}
        formatCurrency={formatCurrency}
        onCancel={() => setTransactionToDelete(null)}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}