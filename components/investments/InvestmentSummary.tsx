// components/investments/InvestmentSummary.tsx
import React from "react";

interface InvestmentSummaryProps {
  totalInvested: number;
  totalReturns: number;
  roiPercentage: number;
}

const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({
  totalInvested,
  totalReturns,
  roiPercentage,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Investment Summary</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-gray-500">Total Invested</p>
          <p className="text-xl font-bold text-blue-600">
            ${totalInvested.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Total Returns</p>
          <p className="text-xl font-bold text-green-600">
            ${totalReturns.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500">ROI</p>
          <p
            className={`text-xl font-bold ${
              roiPercentage >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {roiPercentage.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSummary;