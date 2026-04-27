import AddSavingsGoalForm from "@/components/AddSavingsGoalForm";
import PageContainer from "@/components/PageContainer";
import SavingsGoalsSection from "@/components/SavingsGoalsSection";
import { savingsGoals } from "@/lib/dashboardData";
import { formatCurrency } from "@/lib/formatCurrency";

export default function SavingsPage() {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Savings Goals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your active savings targets and progress
        </p>
      </div>

      <AddSavingsGoalForm />

      <div className="mt-6">
        <SavingsGoalsSection
          savingsGoals={savingsGoals}
          formatCurrency={formatCurrency}
        />
      </div>
    </PageContainer>
  );
}