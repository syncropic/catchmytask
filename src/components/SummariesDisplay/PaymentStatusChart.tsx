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

const PaymentStatusChart: React.FC<{ matrixData: any }> = ({ matrixData }) => {
  // Transform matrix data for the chart
  const chartData: any[] = matrixData.suppliers
    .map((supplier: any) => ({
      name: supplier.name,
      Match: supplier.breakdown.match,
      Mismatch: supplier.breakdown.mismatch,
      Missing: supplier.breakdown.missing,
      total: supplier.total,
      // Include payment status types for tooltip
      succeeded: supplier.status_types?.succeeded || 0,
      failed: supplier.status_types?.failed || 0,
      pending: supplier.status_types?.pending || 0,
    }))
    .sort((a: any, b: any) => b.total - a.total);

  const formatRatio = (num: any, total: any) => `${num}/${total}`;
  const formatPercentage = (num: any, total: any) =>
    `${((num / total) * 100).toFixed(1)}%`;

  const CustomTooltip: React.FC<{
    active: any;
    payload: any[];
    label: any;
  }> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data: any = payload[0].payload;
      const total = data.total;

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-md shadow-lg">
          <p className="font-medium mb-2">{label}</p>

          {/* Status Distribution */}
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

          {/* Payment Status Types */}
          {(data.succeeded > 0 || data.failed > 0 || data.pending > 0) && (
            <div className="border-t pt-2 mt-2">
              <p className="text-sm font-medium mb-1">Status Breakdown:</p>
              {data.succeeded > 0 && (
                <p className="text-sm text-green-600">
                  Succeeded: {data.succeeded} (
                  {((data.succeeded / total) * 100).toFixed(1)}%)
                </p>
              )}
              {data.failed > 0 && (
                <p className="text-sm text-red-600">
                  Failed: {data.failed} (
                  {((data.failed / total) * 100).toFixed(1)}%)
                </p>
              )}
              {data.pending > 0 && (
                <p className="text-sm text-yellow-600">
                  Pending: {data.pending} (
                  {((data.pending / total) * 100).toFixed(1)}%)
                </p>
              )}
            </div>
          )}

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
        Payment Status Comparison by Supplier
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
              dataKey="Mismatch"
              stackId="a"
              fill="#ef4444" // Red
              name="Mismatch"
            />
            <Bar
              dataKey="Missing"
              stackId="a"
              fill="#6b7280" // Gray
              name="Missing"
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
          ) | Success Rate:{" "}
          {formatPercentage(
            matrixData.suppliers.reduce(
              (sum: any, supplier: any) =>
                sum + (supplier.status_types?.succeeded || 0),
              0
            ),
            matrixData.totals.total
          )}
        </p>
      </div>
    </div>
  );
};

export default PaymentStatusChart;

// import React from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const PaymentStatusChart = ({ matrixData }) => {
//   // Transform matrix data for the chart
//   const chartData = matrixData.suppliers
//     .map((supplier) => ({
//       name: supplier.name,
//       Match: supplier.breakdown.match,
//       Mismatch: supplier.breakdown.mismatch,
//       Missing: supplier.breakdown.missing,
//       total: supplier.total,
//       // Include payment status types for tooltip
//       succeeded: supplier.status_types?.succeeded || 0,
//       failed: supplier.status_types?.failed || 0,
//       pending: supplier.status_types?.pending || 0,
//     }))
//     .sort((a, b) => b.total - a.total);

//   const formatRatio = (num, total) => `${num}/${total}`;
//   const formatPercentage = (num, total) =>
//     `${((num / total) * 100).toFixed(1)}%`;

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       const total = data.total;

//       return (
//         <div className="bg-white p-4 border border-gray-200 rounded-md shadow-lg">
//           <p className="font-medium mb-2">{label}</p>

//           {/* Status Distribution */}
//           <div className="mb-3">
//             {payload.map(
//               (entry, index) =>
//                 entry.value > 0 && (
//                   <p key={index} className="text-sm">
//                     <span style={{ color: entry.color }}>●</span> {entry.name}:{" "}
//                     {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
//                   </p>
//                 )
//             )}
//           </div>

//           {/* Payment Status Types */}
//           {(data.succeeded > 0 || data.failed > 0 || data.pending > 0) && (
//             <div className="border-t pt-2 mt-2">
//               <p className="text-sm font-medium mb-1">Status Breakdown:</p>
//               {data.succeeded > 0 && (
//                 <p className="text-sm text-green-600">
//                   Succeeded: {data.succeeded} (
//                   {((data.succeeded / total) * 100).toFixed(1)}%)
//                 </p>
//               )}
//               {data.failed > 0 && (
//                 <p className="text-sm text-red-600">
//                   Failed: {data.failed} (
//                   {((data.failed / total) * 100).toFixed(1)}%)
//                 </p>
//               )}
//               {data.pending > 0 && (
//                 <p className="text-sm text-yellow-600">
//                   Pending: {data.pending} (
//                   {((data.pending / total) * 100).toFixed(1)}%)
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Total Summary */}
//           <div className="border-t pt-2 mt-2">
//             <p className="text-sm font-medium">Total Bookings: {total}</p>
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   const CustomLegend = (props) => {
//     const { payload } = props;
//     return (
//       <div className="flex justify-center gap-6 py-4">
//         {payload.map((entry, index) => (
//           <div key={index} className="flex items-center">
//             <div
//               className="w-3 h-3 mr-2 rounded"
//               style={{ backgroundColor: entry.color }}
//             />
//             <span className="text-sm text-gray-600">{entry.value}</span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="bg-white p-4 rounded-lg border border-gray-200">
//       <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
//         Payment Status Comparison by Supplier
//       </h3>

//       <div style={{ width: "100%", height: 400 }}>
//         <ResponsiveContainer>
//           <BarChart
//             data={chartData}
//             layout="vertical"
//             margin={{
//               top: 20,
//               right: 30,
//               left: 100,
//               bottom: 20,
//             }}
//           >
//             <CartesianGrid
//               strokeDasharray="3 3"
//               horizontal={true}
//               vertical={false}
//             />
//             <XAxis
//               type="number"
//               tickFormatter={(value) => value}
//               label={{
//                 value: "Number of Bookings",
//                 position: "bottom",
//                 offset: 0,
//               }}
//             />
//             <YAxis type="category" dataKey="name" width={90} />
//             <Tooltip content={<CustomTooltip />} />
//             <Legend content={<CustomLegend />} />

//             <Bar
//               dataKey="Match"
//               stackId="a"
//               fill="#22c55e" // Green
//               name="Match"
//             />
//             <Bar
//               dataKey="Mismatch"
//               stackId="a"
//               fill="#ef4444" // Red
//               name="Mismatch"
//             />
//             <Bar
//               dataKey="Missing"
//               stackId="a"
//               fill="#6b7280" // Gray
//               name="Missing"
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Summary Statistics */}
//       <div className="mt-4 text-center text-sm text-gray-600">
//         <p>
//           Total Bookings: {matrixData.totals.total} | Matches:{" "}
//           {formatRatio(
//             matrixData.totals.breakdown.match,
//             matrixData.totals.total
//           )}{" "}
//           (
//           {formatPercentage(
//             matrixData.totals.breakdown.match,
//             matrixData.totals.total
//           )}
//           ) | Success Rate:{" "}
//           {formatPercentage(
//             matrixData.suppliers.reduce(
//               (sum, supplier) => sum + (supplier.status_types?.succeeded || 0),
//               0
//             ),
//             matrixData.totals.total
//           )}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default PaymentStatusChart;
