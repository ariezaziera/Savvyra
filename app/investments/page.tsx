// app/investments/page.tsx
import React from "react";
import InvestmentSummary from "@/components/investments/InvestmentSummary";
import InvestmentList from "@/components/investments/InvestmentList";
import InvestmentChart from "@/components/investments/InvestmentChart";

// Example mock data — replace with API calls later
const mockInvestments = [
  { id: "1", name: "Tech Fund", category: "Stocks", amount: 5000, returns: 1200 },
  { id: "2", name: "Real Estate Trust", category: "REIT", amount: 10000, returns: 2500 },
  { id: "3", name: "Crypto Portfolio", category: "Crypto", amount: 2000, returns: -300 },
];

const mockLabels = ["Jan", "Feb", "Mar", "Apr", "May"];
const mockValues = [5000, 5200, 5400, 5600, 5800];

export default function InvestmentsPage() {
  // Example summary calculations
  const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReturns = mockInvestments.reduce((sum, inv) => sum + inv.returns, 0);
  const roiPercentage = (totalReturns / totalInvested) * 100;

  return (
    <div className="p-8 space-y-8">
      <InvestmentSummary
        totalInvested={totalInvested}
        totalReturns={totalReturns}
        roiPercentage={roiPercentage}
      />
      <InvestmentList investments={mockInvestments} />
      <InvestmentChart labels={mockLabels} values={mockValues} />
    </div>
  );
}