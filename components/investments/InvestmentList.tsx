// components/investments/InvestmentList.tsx
import React from "react";

interface Investment {
  id: string;
  name: string;
  category: string;
  amount: number;
  returns: number;
}

interface InvestmentListProps {
  investments: Investment[];
}

const InvestmentList: React.FC<InvestmentListProps> = ({ investments }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">Investment List</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
              Name
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
              Category
            </th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">
              Amount
            </th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">
              Returns
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {investments.map((inv) => (
            <tr key={inv.id}>
              <td className="px-4 py-2 text-sm text-gray-700">{inv.name}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{inv.category}</td>
              <td className="px-4 py-2 text-sm text-gray-700 text-right">
                ${inv.amount.toLocaleString()}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700 text-right">
                ${inv.returns.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvestmentList;