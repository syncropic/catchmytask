// components/CostComparisonChart.tsx

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

interface CostDataItem {
  group: string;
  total: number;
  matches: number;
  missing: number;
  differences: number;
  high_negative_diff: number;
  medium_negative_diff: number;
  low_negative_diff: number;
  low_positive_diff: number;
  medium_positive_diff: number;
  high_positive_diff: number;
  match_percentage: number;
  missing_percentage: number;
  difference_percentage: number;
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

export const CostComparisonChart = ({
  title,
  dataItems,
}: {
  title: string;
  dataItems: CostDataItem[];
}) => {
  // Filter out the TOTAL row and sort by total
  const chartData = dataItems
    .filter((item) => item.group !== "TOTAL")
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      name: item.group,
      Matches: item.matches,
      Missing: item.missing,
      "High Negative": item.high_negative_diff,
      "Medium Negative": item.medium_negative_diff,
      "Low Negative": item.low_negative_diff,
      "Low Positive": item.low_positive_diff,
      "Medium Positive": item.medium_positive_diff,
      "High Positive": item.high_positive_diff,
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
      <div className="flex flex-wrap justify-center gap-4 p-4">
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
            <Bar dataKey="Matches" stackId="a" fill="#22c55e" />
            <Bar dataKey="Missing" stackId="a" fill="#6b7280" />
            <Bar dataKey="High Negative" stackId="a" fill="#ef4444" />
            <Bar dataKey="Medium Negative" stackId="a" fill="#f97316" />
            <Bar dataKey="Low Negative" stackId="a" fill="#eab308" />
            <Bar dataKey="Low Positive" stackId="a" fill="#84cc16" />
            <Bar dataKey="Medium Positive" stackId="a" fill="#0ea5e9" />
            <Bar dataKey="High Positive" stackId="a" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {totalRow && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Total Bookings: {totalRow.total} | Matches: {totalRow.matches}/
            {totalRow.total} ({totalRow.match_percentage.toFixed(2)}%) |
            Missing: {totalRow.missing}/{totalRow.total} (
            {totalRow.missing_percentage.toFixed(2)}%) | Differences:{" "}
            {totalRow.differences}/{totalRow.total} (
            {totalRow.difference_percentage.toFixed(2)}%)
          </p>
        </div>
      )}
    </div>
  );
};

export const CostComparisonChartWrapper = ({ record }: { record: any }) => {
  const [dataItems, setDataItems] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dbInstance = useDuckDB();

  let read_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: record?.id,
    record: record,
    read_record_mode: "remote",
  };

  const {
    data: componentData,
    isLoading: componentIsLoading,
    error: componentError,
  } = useReadRecordByState(read_record_state);

  let componentRecord = componentData?.data?.find(
    (item: any) =>
      item?.message?.code === read_record_state?.success_message_code
  )?.data[0];

  useEffect(() => {
    const executeQuery = async () => {
      if (!componentRecord?.query || !dbInstance) return;

      try {
        const result = await dbInstance.query(componentRecord.query);
        setDataItems(result.toArray());
        setIsLoading(false);
      } catch (error) {
        console.error("Error executing query:", error);
      }
    };

    executeQuery();
  }, [componentRecord?.query, dbInstance]);

  if (componentError)
    return (
      <MonacoEditor
        value={{
          data: componentError?.response?.data,
          status: componentError?.response?.status,
        }}
        language="json"
        height="25vh"
      />
    );
  if (componentIsLoading) return <div>Loading...</div>;

  return (
    <>
      {dataItems && (
        <CostComparisonChart
          title={toTitleCase(record?.name)}
          dataItems={dataItems}
        />
      )}
    </>
  );
};

export default CostComparisonChartWrapper;
