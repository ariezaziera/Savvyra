import PageContainer from "@/components/PageContainer";
import AddTransactionForm from "@/components/AddTransactionForm";

type Transaction = {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
  type: "Income" | "Expense";
  status: "Completed" | "Pending";
};

const transactions: Transaction[] = [
  {
    id: 1,
    title: "Monthly Salary",
    category: "Income",
    date: "22 Apr 2026",
    amount: 2100,
    type: "Income",
    status: "Completed",
  },
  {
    id: 2,
    title: "Shopee PayLater",
    category: "Commitment",
    date: "21 Apr 2026",
    amount: 120,
    type: "Expense",
    status: "Completed",
  },
  {
    id: 3,
    title: "Petrol",
    category: "Transport",
    date: "20 Apr 2026",
    amount: 50,
    type: "Expense",
    status: "Completed",
  },
  {
    id: 4,
    title: "Emergency Fund Transfer",
    category: "Savings",
    date: "19 Apr 2026",
    amount: 200,
    type: "Expense",
    status: "Completed",
  },
  {
    id: 5,
    title: "Freelance Design",
    category: "Side Income",
    date: "18 Apr 2026",
    amount: 180,
    type: "Income",
    status: "Pending",
  },
];

const formatCurrency = (amount: number) => `RM ${amount.toLocaleString()}`;

export default function TransactionsPage() {
  const totalIncome = transactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = transactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalTransactions = transactions.length;

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
        <AddTransactionForm />
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
              placeholder="Search transaction"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            <select className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Category
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((item) => (
                <tr
                  key={item.id}
                  className="rounded-xl border border-gray-100 bg-slate-50"
                >
                  <td className="rounded-l-xl px-4 py-4 text-sm font-medium text-gray-900">
                    {item.title}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {item.category}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    {item.date}
                  </td>

                  <td className="px-4 py-4">
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

                  <td className="px-4 py-4">
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
                    className={`rounded-r-xl px-4 py-4 text-right text-sm font-semibold ${
                      item.type === "Income"
                        ? "text-green-600"
                        : "text-rose-500"
                    }`}
                  >
                    {item.type === "Income" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  );
}