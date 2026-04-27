import DashboardStats from "@/components/DashboardStats";
import SavingsGoalsSection from "@/components/SavingsGoalsSection";
import PageContainer from "@/components/PageContainer";
import { stats, savingsGoals } from "@/lib/dashboardData";
import { formatCurrency } from "@/lib/formatCurrency";

export default function Home() {
  return (
    <PageContainer>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Savvyra Dashboard
      </h1>

      <DashboardStats stats={stats} formatCurrency={formatCurrency} />

      <SavingsGoalsSection
        savingsGoals={savingsGoals}
        formatCurrency={formatCurrency}
      />
    </PageContainer>
  );
}