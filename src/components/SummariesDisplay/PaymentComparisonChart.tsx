import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PaymentComparisonChart: React.FC<{ matrixData: any }> = ({
  matrixData,
}) => {
  // Transform matrix data for the chart
  const chartData: any[] = matrixData.suppliers.map((supplier: any) => ({
    name: supplier.name,
    Match: supplier.breakdown.match,
    "High Negative": supplier.breakdown.high_negative_difference,
    "Low Negative": supplier.breakdown.low_negative_difference,
    "Low Positive": supplier.breakdown.low_positive_difference,
    "High Positive": supplier.breakdown.high_positive_difference,
    total: supplier.total,
    totalExpectedAmount: supplier.totalExpectedAmount,
    totalCapturedAmount: supplier.totalCapturedAmount,
  }));
  chartData.sort((a: any, b: any) => b.total - a.total);

  const formatRatio = (num: any, total: any): string =>
    `<span class="math-inline">\{num\}/</span>{total}`;
  const formatPercentage = (num: any, total: any): string =>
    `${((num / total) * 100).toFixed(1)}%`;
  const formatCurrency = (amount: any): string =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);

  const CustomTooltip: React.FC<{
    active: any;
    payload: any[];
    label: any;
  }> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data: any = payload[0].payload;
      const total = data.total;
      const amountDiff = data.totalCapturedAmount - data.totalExpectedAmount;
      const diffPercentage = (
        (amountDiff / data.totalExpectedAmount) *
        100
      ).toFixed(1);
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-md shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {/* Payment Distribution */}
          <div className="mb-3">
            {payload.map(
              (entry: any, index: any) =>
                entry.value > 0 && (
                  <p key={index} className="text-sm">
                    <span style={{ color: entry.color }}>●</span> {entry.name}:{" "}
                    {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
                  </p>
                )
            )}
          </div>
          {/* Amount Information */}
          <div className="border-t pt-2 mt-2">
            <p className="text-sm">
              Expected: {formatCurrency(data.totalExpectedAmount)}
            </p>
            <p className="text-sm">
              Captured: {formatCurrency(data.totalCapturedAmount)}
            </p>
            <p
              className="text-sm font-medium"
              style={{
                color:
                  amountDiff < 0
                    ? "#ef4444"
                    : amountDiff > 0
                    ? "#22c55e"
                    : "#4B5563",
              }}
            >
              Difference: {formatCurrency(amountDiff)} ({diffPercentage}%)
            </p>
          </div>
          {/* Total Summary */}
          <div className="border-t pt-2 mt-2">
            <p className="text-sm font-medium">Total Bookings: {total}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend: React.FC<any> = (props) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 py-4">
        {payload.map((entry: any, index: any) => (
          <div key={index} className="flex items-center">
            <div
              className="w-3 h-3 mr-2 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
        Payment Amount Comparison
      </h3>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 20,
              right: 30,
              left: 100,
              bottom: 20,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              type="number"
              tickFormatter={(value: any) => value}
              label={{
                value: "Number of Bookings",
                position: "bottom",
                offset: 0,
              }}
            />
            <YAxis type="category" dataKey="name" width={90} />
            <Tooltip
              content={
                <CustomTooltip
                  active={undefined}
                  payload={[]}
                  label={undefined}
                />
              }
            />
            <Legend content={<CustomLegend />} />

            <Bar
              dataKey="Match"
              stackId="a"
              fill="#22c55e" // Green
              name="Match"
            />
            <Bar
              dataKey="High Negative"
              stackId="a"
              fill="#ef4444" // Red
              name="High Negative"
            />
            <Bar
              dataKey="Low Negative"
              stackId="a"
              fill="#f87171" // Light Red
              name="Low Negative"
            />
            <Bar
              dataKey="Low Positive"
              stackId="a"
              fill="#fcd34d" // Yellow
              name="Low Positive"
            />
            <Bar
              dataKey="High Positive"
              stackId="a"
              fill="#3b82f6" // Blue
              name="High Positive"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>
          Total Bookings: {matrixData.totals.total} | Matches:{" "}
          {formatRatio(
            matrixData.totals.breakdown.match,
            matrixData.totals.total
          )}{" "}
          (
          {formatPercentage(
            matrixData.totals.breakdown.match,
            matrixData.totals.total
          )}
          )
        </p>
      </div>
    </div>
  );
};

export default PaymentComparisonChart;
