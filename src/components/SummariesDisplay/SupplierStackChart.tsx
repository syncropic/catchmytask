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

// // Visualization Component
// const SupplierStackChart = ({ matrixData, type = "cost" }) => {
//   // Transform matrix data for the chart
//   const chartData = matrixData[`${type}Matrix`].suppliers
//     .map((supplier) => ({
//       name: supplier.name,
//       Match: supplier.breakdown.match,
//       Mismatch: supplier.breakdown.mismatch,
//       Missing: supplier.breakdown.missing,
//       total: supplier.total,
//     }))
//     .sort((a, b) => b.total - a.total);

//   const formatRatio = (num, total) => `${num}/${total}`;

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       const total = payload[0].payload.total;
//       return (
//         <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
//           <p className="font-medium mb-2">{label}</p>
//           {payload.map((entry, index) => (
//             <p key={index} className="text-sm">
//               <span style={{ color: entry.color }}>●</span> {entry.name}:{" "}
//               {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
//             </p>
//           ))}
//           <p className="text-sm font-medium mt-2 border-t pt-2">
//             Total Bookings: {total}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const CustomLegend = (props) => {
//     const { payload } = props;
//     return (
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           gap: "2rem",
//           padding: "1rem",
//         }}
//       >
//         {payload.map((entry, index) => (
//           <div key={index} style={{ display: "flex", alignItems: "center" }}>
//             <div
//               style={{
//                 width: "12px",
//                 height: "12px",
//                 backgroundColor: entry.color,
//                 marginRight: "8px",
//                 borderRadius: "2px",
//               }}
//             />
//             <span style={{ fontSize: "0.875rem", color: "#4B5563" }}>
//               {entry.value}
//             </span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="bg-white p-4 rounded-lg border border-gray-200">
//       <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
//         Supplier {type === "cost" ? "Cost" : "Status"} Comparison Distribution
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
//               tick={{ fill: "#4B5563", fontSize: 12 }}
//               label={{
//                 value: "Number of Bookings",
//                 position: "bottom",
//                 style: {
//                   textAnchor: "middle",
//                   fill: "#4B5563",
//                   fontSize: 12,
//                   paddingTop: "10px",
//                 },
//               }}
//             />
//             <YAxis
//               type="category"
//               dataKey="name"
//               tick={{ fill: "#4B5563", fontSize: 12 }}
//               width={90}
//             />
//             <Tooltip content={<CustomTooltip />} />
//             <Legend content={<CustomLegend />} />
//             <Bar dataKey="Match" stackId="a" fill="#22c55e" name="Match" />
//             <Bar
//               dataKey="Mismatch"
//               stackId="a"
//               fill="#ef4444"
//               name="Mismatch"
//             />
//             <Bar dataKey="Missing" stackId="a" fill="#6b7280" name="Missing" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       <div className="mt-4 text-center text-sm text-gray-600">
//         <p>
//           Total Bookings: {matrixData[`${type}Matrix`].totals.total} | Matches:{" "}
//           {formatRatio(
//             matrixData[`${type}Matrix`].totals.breakdown.match,
//             matrixData[`${type}Matrix`].totals.total
//           )}{" "}
//           | Mismatches:{" "}
//           {formatRatio(
//             matrixData[`${type}Matrix`].totals.breakdown.mismatch,
//             matrixData[`${type}Matrix`].totals.total
//           )}{" "}
//           | Missing:{" "}
//           {formatRatio(
//             matrixData[`${type}Matrix`].totals.breakdown.missing,
//             matrixData[`${type}Matrix`].totals.total
//           )}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SupplierStackChart;

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

// Types and Interfaces
interface Breakdown {
  match: number;
  mismatch: number;
  missing: number;
}

interface Supplier {
  name: string;
  matches: number;
  total: number;
  missing: number;
  breakdown: Breakdown;
}

interface MatrixTotals {
  matches: number;
  total: number;
  missing: number;
  breakdown: Breakdown;
}

interface Matrix {
  suppliers: Supplier[];
  totals: MatrixTotals;
}

interface MatrixData {
  costMatrix: Matrix;
  statusMatrix: Matrix;
}

interface ChartDataItem {
  name: string;
  Match: number;
  Mismatch: number;
  Missing: number;
  total: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    payload: ChartDataItem;
  }>;
  label?: string;
}

interface LegendProps {
  payload?: Array<{
    color: string;
    value: string;
  }>;
}

interface SupplierStackChartProps {
  matrixData: MatrixData;
  type?: "cost" | "status";
}

// Component
const SupplierStackChart: React.FC<SupplierStackChartProps> = ({
  matrixData,
  type = "cost",
}) => {
  // Transform matrix data for the chart
  const chartData: ChartDataItem[] = matrixData[`${type}Matrix`].suppliers
    .map((supplier) => ({
      name: supplier.name,
      Match: supplier.breakdown.match,
      Mismatch: supplier.breakdown.mismatch,
      Missing: supplier.breakdown.missing,
      total: supplier.total,
    }))
    .sort((a, b) => b.total - a.total);

  const formatRatio = (num: number, total: number): string => `${num}/${total}`;

  const CustomTooltip: React.FC<TooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      const total = payload[0].payload.total;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>●</span> {entry.name}:{" "}
              {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
            </p>
          ))}
          <p className="text-sm font-medium mt-2 border-t pt-2">
            Total Bookings: {total}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend: React.FC<LegendProps> = (props) => {
    const { payload } = props;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          padding: "1rem",
        }}
      >
        {payload?.map((entry, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: entry.color,
                marginRight: "8px",
                borderRadius: "2px",
              }}
            />
            <span style={{ fontSize: "0.875rem", color: "#4B5563" }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
        Supplier {type === "cost" ? "Cost" : "Status"} Comparison Distribution
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
              tick={{ fill: "#4B5563", fontSize: 12 }}
              label={{
                value: "Number of Bookings",
                position: "bottom",
                style: {
                  textAnchor: "middle",
                  fill: "#4B5563",
                  fontSize: 12,
                  paddingTop: "10px",
                },
              }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#4B5563", fontSize: 12 }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar dataKey="Match" stackId="a" fill="#22c55e" name="Match" />
            <Bar
              dataKey="Mismatch"
              stackId="a"
              fill="#ef4444"
              name="Mismatch"
            />
            <Bar dataKey="Missing" stackId="a" fill="#6b7280" name="Missing" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        <p>
          Total Bookings: {matrixData[`${type}Matrix`].totals.total} | Matches:{" "}
          {formatRatio(
            matrixData[`${type}Matrix`].totals.breakdown.match,
            matrixData[`${type}Matrix`].totals.total
          )}{" "}
          | Mismatches:{" "}
          {formatRatio(
            matrixData[`${type}Matrix`].totals.breakdown.mismatch,
            matrixData[`${type}Matrix`].totals.total
          )}{" "}
          | Missing:{" "}
          {formatRatio(
            matrixData[`${type}Matrix`].totals.breakdown.missing,
            matrixData[`${type}Matrix`].totals.total
          )}
        </p>
      </div>
    </div>
  );
};

export default SupplierStackChart;
