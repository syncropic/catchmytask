// components/CoverageMetrics.tsx

import React, { useEffect, useState } from "react";
import { Card, Text, Grid, Title } from "@mantine/core";
import { toTitleCase, useReadRecordByState } from "@components/Utils";
import MonacoEditor from "@components/MonacoEditor";
import { useDuckDB } from "pages/_app";

interface CoverageMetric {
  title: string;
  value: string;
  detail: string;
  subDetail?: string;
  color: string;
}

interface CoverageData {
  group: string;
  total: number;
  cost_coverage: number;
  status_coverage: number;
  full_coverage: number;
  cost_matches: number;
  status_matches: number;
  cost_coverage_percentage: number;
  status_coverage_percentage: number;
  full_coverage_percentage: number;
  cost_match_percentage: number;
  status_match_percentage: number;
}

const formatRatio = (num: number, total: number): string => `${num}/${total}`;
const formatPercentage = (value: number): string => `${value.toFixed(2)}%`;

const CoverageMetrics = ({
  title,
  data,
}: {
  title: string;
  data: CoverageData;
}) => {
  const metrics: CoverageMetric[] = [
    {
      title: "Overall Data Coverage",
      value: formatPercentage(data.full_coverage_percentage),
      detail: `${formatRatio(data.full_coverage, data.total)} bookings`,
      subDetail: "Both cost and status data available",
      color: "blue",
    },
    {
      title: "Cost Data Coverage",
      value: formatPercentage(data.cost_coverage_percentage),
      detail: `${formatRatio(data.cost_coverage, data.total)} bookings`,
      subDetail: `${formatPercentage(data.cost_match_percentage)} match rate`,
      color: "green",
    },
    {
      title: "Status Data Coverage",
      value: formatPercentage(data.status_coverage_percentage),
      detail: `${formatRatio(data.status_coverage, data.total)} bookings`,
      subDetail: `${formatPercentage(data.status_match_percentage)} match rate`,
      color: "violet",
    },
  ];

  const MetricCard: React.FC<{ metric: CoverageMetric }> = ({ metric }) => (
    <Card withBorder>
      <div className="text-center">
        <Text size="sm" c="dimmed">
          <Title order={6}>{metric.title}</Title>
        </Text>
        <Text size="xl" fw={700} c={metric.color} className="mt-1">
          {metric.value}
        </Text>
        <Text size="xs" c="dimmed" className="mt-1">
          {metric.detail}
        </Text>
        {metric.subDetail && (
          <Text size="xs" c="dimmed" className="mt-1">
            {metric.subDetail}
          </Text>
        )}
      </div>
    </Card>
  );

  return (
    <Grid className="mb-6">
      {metrics.map((metric, idx) => (
        <Grid.Col key={idx} span={4}>
          <MetricCard metric={metric} />
        </Grid.Col>
      ))}
    </Grid>
  );
};

export const CoverageMetricsWrapper = ({ record }: { record: any }) => {
  const [data, setData] = useState<CoverageData | null>(null);
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
        const rows = result.toArray();
        // Get the TOTAL row
        const totalRow = rows.find((row: any) => row.group === "TOTAL");
        if (totalRow) {
          setData(totalRow);
        }
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
  if (componentIsLoading || isLoading) return <div>Loading...</div>;

  return (
    <>
      {data && (
        <CoverageMetrics title={toTitleCase(record?.name)} data={data} />
      )}
    </>
  );
};

export default CoverageMetricsWrapper;
