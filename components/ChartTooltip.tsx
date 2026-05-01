type Props = {
  active?: boolean;
  payload?: any[];
};

export default function ChartTooltip({ active, payload }: Props) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-medium text-gray-900">
        {data.name || data.payload.month}
      </p>
      <p className="text-sm text-blue-600">
        {data.dataKey === "income" ? "Income" : data.dataKey === "expenses" ? "Expenses" : "Amount"}: RM{" "}
        {data.value.toLocaleString()}
      </p>
    </div>
  );
}