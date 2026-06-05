// components/investments/InvestmentChart.tsx
import React from "react";
import { Line } from "react-chartjs-2";

interface InvestmentChartProps {
  labels: string[]; // e.g. months or years
  values: number[]; // investment growth values
}

const InvestmentChart: React.FC<InvestmentChartProps> = ({ labels, values }) => {
  const data = {
    labels,
    datasets: [
      {
        label: "Investment Growth",
        data: values,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">Investment Growth Chart</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default InvestmentChart;