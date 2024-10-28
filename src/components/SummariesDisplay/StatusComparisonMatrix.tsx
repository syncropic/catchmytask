// components/MatrixTable.jsx

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

interface DataItem {
  group: string;
  total: number;
  matches: number;
  missing: number;
  mismatches: number;
  match_percentage: number;
  missing_percentage: number;
  mismatch_percentage: number;
}

const StatusComparisonMatrix = ({
  title,
  dataItems,
}: {
  title: string;
  dataItems: DataItem[];
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
              <Table.Th className="text-center">Mismatches</Table.Th>
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
                    item.mismatches,
                    item.total,
                    item.mismatch_percentage
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {item.matches > 0 && (
                      <Badge color="green" variant="light">
                        match ({item.matches}/{item.total})
                      </Badge>
                    )}
                    {item.mismatches > 0 && (
                      <Badge color="red" variant="light">
                        mismatch ({item.mismatches}/{item.total})
                      </Badge>
                    )}
                    {item.missing > 0 && (
                      <Badge color="gray" variant="light">
                        missing ({item.missing}/{item.total})
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
};

export const StatusComparisonMatrixWrapper = ({ record }: { record: any }) => {
  const [dataItems, setDataItems] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);
  const dbInstance = useDuckDB(); // Get DuckDB instance

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

  // use effect when componentRecord?.query changes and is not null run the query on the dbInstance and setDataItems
  useEffect(() => {
    const executeQuery = async () => {
      if (!componentRecord?.query || !dbInstance) return;

      try {
        // Execute the query
        const result = await dbInstance.query(componentRecord.query);
        setDataItems(result.toArray());
        setIsLoading(false);
      } catch (error) {
        console.error("Error executing query:", error);
        // You might want to handle the error state here
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
        <StatusComparisonMatrix
          title={toTitleCase(record?.name)}
          dataItems={dataItems}
        />
      )}
    </>
  );
};

export default StatusComparisonMatrixWrapper;
