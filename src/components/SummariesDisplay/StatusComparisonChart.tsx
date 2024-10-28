// components/StatusComparisonChart.tsx

import { useComponentData } from "@components/hooks/useComponentData";
import MonacoEditor from "@components/MonacoEditor";
import { toTitleCase, useReadRecordByState } from "@components/Utils";
import { useDuckDB } from "pages/_app";
import React, { useEffect, useState } from "react";
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

interface StatusDataItem {
  group: string;
  total: number;
  matches: number;
  missing: number;
  mismatches: number;
  match_percentage: number;
  missing_percentage: number;
  mismatch_percentage: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    payload: any;
  }>;
  label?: string;
}

export const StatusComparisonChart = ({
  title,
  dataItems,
}: {
  title: string;
  dataItems: StatusDataItem[];
}) => {
  // Filter out the TOTAL row and sort by total
  const chartData = dataItems
    .filter((item) => item.group !== "TOTAL")
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      name: item.group,
      Matches: item.matches,
      Missing: item.missing,
      Mismatches: item.mismatches,
      total: item.total,
    }));

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
              {entry.value} ({((entry.value / total) * 100).toFixed(2)}%)
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

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-8 p-4">
        {payload?.map((entry: any, index: number) => (
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

  const totalRow = dataItems.find((item) => item.group === "TOTAL");

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
        {title}
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
                style: { textAnchor: "middle", fill: "#4B5563", fontSize: 12 },
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
            <Bar dataKey="Matches" stackId="a" fill="#22c55e" name="Matches" />
            <Bar dataKey="Missing" stackId="a" fill="#6b7280" name="Missing" />
            <Bar
              dataKey="Mismatches"
              stackId="a"
              fill="#ef4444"
              name="Mismatches"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {totalRow && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Total Bookings: {totalRow.total} | Matches: {totalRow.matches}/
            {totalRow.total} ({totalRow.match_percentage.toFixed(2)}%) |
            Missing: {totalRow.missing}/{totalRow.total} (
            {totalRow.missing_percentage.toFixed(2)}%) | Mismatches:{" "}
            {totalRow.mismatches}/{totalRow.total} (
            {totalRow.mismatch_percentage.toFixed(2)}%)
          </p>
        </div>
      )}
    </div>
  );
};

export const StatusComparisonChartWrapper = ({ record }: { record: any }) => {
  //   const [dataItems, setDataItems] = useState<[]>([]);
  //   const [isLoading, setIsLoading] = useState(false);
  //   // const [isLoading, setIsLoading] = useState(true);
  //   const dbInstance = useDuckDB(); // Get DuckDB instance

  //   let read_record_state = {
  //     credential: "surrealdb catchmytask dev",
  //     success_message_code: record?.id,
  //     record: record,
  //     read_record_mode: "remote",
  //   };

  //   const {
  //     data: componentData,
  //     isLoading: componentIsLoading,
  //     error: componentError,
  //   } = useReadRecordByState(read_record_state);

  //   let componentRecord = componentData?.data?.find(
  //     (item: any) =>
  //       item?.message?.code === read_record_state?.success_message_code
  //   )?.data[0];

  //   // use effect when componentRecord?.query changes and is not null run the query on the dbInstance and setDataItems
  //   useEffect(() => {
  //     const executeQuery = async () => {
  //       if (!componentRecord?.query || !dbInstance) return;

  //       try {
  //         // Execute the query
  //         const result = await dbInstance.query(componentRecord.query);
  //         setDataItems(result.toArray());
  //         setIsLoading(false);
  //       } catch (error) {
  //         console.error("Error executing query:", error);
  //         // You might want to handle the error state here
  //       }
  //     };

  //     executeQuery();
  //   }, [componentRecord?.query, dbInstance]);

  //   if (componentError)
  //     return (
  //       <MonacoEditor
  //         value={{
  //           data: componentError?.response?.data,
  //           status: componentError?.response?.status,
  //         }}
  //         language="json"
  //         height="25vh"
  //       />
  //     );
  //   if (componentIsLoading) return <div>Loading...</div>;
  const { dataItems, isLoading, error, componentRecord } = useComponentData({
    record,
  });

  if (error)
    return (
      <MonacoEditor
        value={{
          data: error?.response?.data,
          status: error?.response?.status,
        }}
        language="json"
        height="25vh"
      />
    );
  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {dataItems && (
        <StatusComparisonChart
          title={toTitleCase(record?.name)}
          dataItems={dataItems}
        />
      )}
    </>
  );
};

export default StatusComparisonChartWrapper;
