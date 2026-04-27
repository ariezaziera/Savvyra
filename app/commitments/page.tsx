import AddCommitmentForm from "@/components/AddCommitmentForm";
import PageContainer from "@/components/PageContainer";
import { formatCurrency } from "@/lib/formatCurrency";

type Commitment = {
  id: number;
  name: string;
  category: string;
  dueDate: string;
  amount: number;
  status: "Upcoming" | "Paid" | "Overdue";
};

const commitments: Commitment[] = [
  {
    id: 1,
    name: "Shopee PayLater",
    category: "PayLater",
    dueDate: "25 Apr 2026",
    amount: 120,
    status: "Upcoming",
  },
  {
    id: 2,
    name: "Car Loan",
    category: "Loan",
    dueDate: "30 Apr 2026",
    amount: 350,
    status: "Upcoming",
  },
  {
    id: 3,
    name: "PFF Repayment",
    category: "Repayment",
    dueDate: "30 Apr 2026",
    amount: 418.4,
    status: "Upcoming",
  },
  {
    id: 4,
    name: "Netflix",
    category: "Subscription",
    dueDate: "18 Apr 2026",
    amount: 55,
    status: "Paid",
  },
];

export default function CommitmentsPage() {
  const totalCommitments = commitments.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const upcomingCount = commitments.filter(
    (item) => item.status === "Upcoming"
  ).length;

  const paidCount = commitments.filter((item) => item.status === "Paid").length;

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Commitments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Stay on top of your recurring payments and due dates
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Commitments</p>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">
            {formatCurrency(totalCommitments)}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Upcoming</p>
          <h2 className="mt-1 text-2xl font-semibold text-amber-600">
            {upcomingCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Paid</p>
          <h2 className="mt-1 text-2xl font-semibold text-blue-600">
            {paidCount}
          </h2>
        </div>
      </div>

      <div className="mt-6">
        <AddCommitmentForm />
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Monthly Commitments
          </h2>
          <p className="text-sm text-gray-500">
            Review your fixed payments and payment status
          </p>
        </div>

        <div className="space-y-3">
          {commitments.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.category} • Due {item.dueDate}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    item.status === "Paid"
                      ? "bg-blue-50 text-blue-600"
                      : item.status === "Upcoming"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-rose-50 text-rose-500"
                  }`}
                >
                  {item.status}
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}