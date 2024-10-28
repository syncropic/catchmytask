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
import { useComponentData } from "@components/hooks/useComponentData";

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
        <StatusComparisonMatrix
          title={toTitleCase(record?.name)}
          dataItems={dataItems}
        />
      )}
    </>
  );
};

export default StatusComparisonMatrixWrapper;
