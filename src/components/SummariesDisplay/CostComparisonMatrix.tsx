// components/CostComparisonMatrix.tsx

import React, { useEffect, useState } from "react";
import { Card, Table, Badge, Text, Group, Title } from "@mantine/core";
import {
  formatPercentage,
  formatRatio,
  StandardMatrix,
  toTitleCase,
  useReadRecordByState,
} from "@components/Utils";
import MonacoEditor from "@components/MonacoEditor";
import { useDuckDB } from "pages/_app";

interface CostDataItem {
  group: string;
  total: number;
  matches: number;
  missing: number;
  differences: number;
  match_percentage: number;
  missing_percentage: number;
  high_negative_diff: number;
  medium_negative_diff: number;
  low_negative_diff: number;
  low_positive_diff: number;
  medium_positive_diff: number;
  high_positive_diff: number;
  difference_percentage: number;
}

const CostComparisonMatrix = ({
  title,
  dataItems,
}: {
  title: string;
  dataItems: CostDataItem[];
}) => {
  const formatRatioWithPercentage = (
    value: number,
    total: number,
    percentage: number
  ) => (
    <div className="flex flex-col items-center">
      <span className="font-medium">
        {value}/{total}
      </span>
      <span className="text-xs text-gray-600">{percentage.toFixed(2)}%</span>
    </div>
  );

  const formatDifferenceDistribution = (item: CostDataItem) => (
    <Group gap="xs">
      {item.matches > 0 && (
        <Badge color="green" variant="light">
          match ({item.matches}/{item.total})
        </Badge>
      )}
      {item.missing > 0 && (
        <Badge color="gray" variant="light">
          missing ({item.missing}/{item.total})
        </Badge>
      )}
      {item.high_negative_diff > 0 && (
        <Badge color="red" variant="light">
          high neg ({item.high_negative_diff}/{item.total})
        </Badge>
      )}
      {item.medium_negative_diff > 0 && (
        <Badge color="orange" variant="light">
          med neg ({item.medium_negative_diff}/{item.total})
        </Badge>
      )}
      {item.low_negative_diff > 0 && (
        <Badge color="yellow" variant="light">
          low neg ({item.low_negative_diff}/{item.total})
        </Badge>
      )}
      {item.low_positive_diff > 0 && (
        <Badge color="lime" variant="light">
          low pos ({item.low_positive_diff}/{item.total})
        </Badge>
      )}
      {item.medium_positive_diff > 0 && (
        <Badge color="blue" variant="light">
          med pos ({item.medium_positive_diff}/{item.total})
        </Badge>
      )}
      {item.high_positive_diff > 0 && (
        <Badge color="violet" variant="light">
          high pos ({item.high_positive_diff}/{item.total})
        </Badge>
      )}
    </Group>
  );

  return (
    <Card withBorder className="w-full shadow-sm mb-6">
      <Title order={4} className="pb-3">
        {title}
      </Title>

      <Table.ScrollContainer minWidth={800}>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Group</Table.Th>
              <Table.Th className="text-center">Matches</Table.Th>
              <Table.Th className="text-center">Missing</Table.Th>
              <Table.Th className="text-center">Differences</Table.Th>
              <Table.Th>Value Distribution</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {dataItems?.map((item) => (
              <Table.Tr
                key={item.group}
                className={item.group === "TOTAL" ? "bg-gray-50" : ""}
              >
                <Table.Td className="font-medium">{item.group}</Table.Td>
                <Table.Td className="text-center">
                  {formatRatioWithPercentage(
                    item.matches,
                    item.total,
                    item.match_percentage
                  )}
                </Table.Td>
                <Table.Td className="text-center">
                  {formatRatioWithPercentage(
                    item.missing,
                    item.total,
                    item.missing_percentage
                  )}
                </Table.Td>
                <Table.Td className="text-center">
                  {formatRatioWithPercentage(
                    item.differences,
                    item.total,
                    item.difference_percentage
                  )}
                </Table.Td>
                <Table.Td>{formatDifferenceDistribution(item)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
};

export const CostComparisonMatrixWrapper = ({ record }: { record: any }) => {
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
        <CostComparisonMatrix
          title={toTitleCase(record?.name)}
          dataItems={dataItems}
        />
      )}
    </>
  );
};

export default CostComparisonMatrixWrapper;
