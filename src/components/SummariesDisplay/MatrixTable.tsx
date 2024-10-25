// components/MatrixTable.jsx

import React from "react";
import { Card, Table, Badge, Text, Group } from "@mantine/core";
import {
  formatPercentage,
  formatRatio,
  StandardMatrix,
} from "@components/Utils";

const MatrixTable = ({
  title,
  matrixData,
}: {
  title: any;
  matrixData: any;
}) => (
  <Card withBorder className="w-full shadow-sm mb-6">
    <Text size="lg" className="p-4 border-b">
      {title}
    </Text>

    <Table.ScrollContainer minWidth={800}>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Supplier</Table.Th>
            <Table.Th className="text-center">Match Rate</Table.Th>
            <Table.Th className="text-center">Match %</Table.Th>
            <Table.Th className="text-center">Missing</Table.Th>
            <Table.Th>Value Distribution</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {matrixData.suppliers.map((supplier: any, idx: any) => (
            <Table.Tr key={idx}>
              <Table.Td className="font-medium">{supplier.name}</Table.Td>
              <Table.Td className="text-center">
                {formatRatio(supplier.matches, supplier.total)}
              </Table.Td>
              <Table.Td className="text-center">
                {formatPercentage(supplier.matches, supplier.total)}
              </Table.Td>
              <Table.Td className="text-center">{supplier.missing}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {supplier.breakdown.match > 0 && (
                    <Badge color="green" variant="light">
                      match (
                      {formatRatio(supplier.breakdown.match, supplier.total)})
                    </Badge>
                  )}
                  {supplier.breakdown.mismatch > 0 && (
                    <Badge color="red" variant="light">
                      mismatch (
                      {formatRatio(supplier.breakdown.mismatch, supplier.total)}
                      )
                    </Badge>
                  )}
                  {supplier.breakdown.missing > 0 && (
                    <Badge color="gray" variant="light">
                      missing (
                      {formatRatio(supplier.breakdown.missing, supplier.total)})
                    </Badge>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
          <Table.Tr bg="var(--mantine-color-gray-1)">
            <Table.Td className="font-semibold">Total</Table.Td>
            <Table.Td className="text-center font-semibold">
              {formatRatio(matrixData.totals.matches, matrixData.totals.total)}
            </Table.Td>
            <Table.Td className="text-center font-semibold">
              {formatPercentage(
                matrixData.totals.matches,
                matrixData.totals.total
              )}
            </Table.Td>
            <Table.Td className="text-center font-semibold">
              {matrixData.totals.missing}
            </Table.Td>
            <Table.Td>
              <Group gap="xs">
                {matrixData.totals.breakdown.match > 0 && (
                  <Badge color="green" variant="light">
                    match (
                    {formatRatio(
                      matrixData.totals.breakdown.match,
                      matrixData.totals.total
                    )}
                    )
                  </Badge>
                )}
                {matrixData.totals.breakdown.mismatch > 0 && (
                  <Badge color="red" variant="light">
                    mismatch (
                    {formatRatio(
                      matrixData.totals.breakdown.mismatch,
                      matrixData.totals.total
                    )}
                    )
                  </Badge>
                )}
                {matrixData.totals.breakdown.missing > 0 && (
                  <Badge color="gray" variant="light">
                    missing (
                    {formatRatio(
                      matrixData.totals.breakdown.missing,
                      matrixData.totals.total
                    )}
                    )
                  </Badge>
                )}
              </Group>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  </Card>
);

export default MatrixTable;

interface PaymentStatusMatrixProps {
  title: string;
  matrixData: StandardMatrix;
}

interface ExtendedBreakdown {
  match: number;
  mismatch: number;
  missing: number;
  cancelled_succeeded?: number;
}

interface ExtendedSupplier {
  name: string;
  matches: number;
  total: number;
  missing: number;
  breakdown: ExtendedBreakdown;
}

interface ExtendedMatrix extends Omit<StandardMatrix, "suppliers"> {
  suppliers: ExtendedSupplier[];
  totals: {
    matches: number;
    total: number;
    missing: number;
    breakdown: ExtendedBreakdown;
  };
}

export const PaymentStatusMatrixTable: React.FC<PaymentStatusMatrixProps> = ({
  title,
  matrixData,
}) => {
  // Type assertion for the extended matrix
  const extendedData = matrixData as ExtendedMatrix;

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "match":
        return "green";
      case "mismatch":
        return "red";
      case "cancelled_succeeded":
        return "orange";
      default:
        return "gray";
    }
  };

  // Safe getter for breakdown values
  const getBreakdownValue = (
    breakdown: ExtendedBreakdown,
    key: keyof ExtendedBreakdown
  ): number => {
    return breakdown[key] || 0;
  };

  return (
    <Card withBorder className="w-full shadow-sm mb-6">
      <Text size="lg" className="p-4 border-b">
        {title}
      </Text>

      <Table.ScrollContainer minWidth={800}>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Supplier</Table.Th>
              <Table.Th className="text-center">Match Rate</Table.Th>
              <Table.Th className="text-center">Match %</Table.Th>
              <Table.Th className="text-center">Missing</Table.Th>
              <Table.Th className="text-center">Mismatch</Table.Th>
              <Table.Th className="text-center">
                Cancelled with Payment
              </Table.Th>
              <Table.Th>Status Distribution</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {extendedData.suppliers.map((supplier, idx) => (
              <Table.Tr key={idx}>
                <Table.Td className="font-medium">{supplier.name}</Table.Td>
                <Table.Td className="text-center">
                  {formatRatio(supplier.matches, supplier.total)}
                </Table.Td>
                <Table.Td className="text-center">
                  {formatPercentage(supplier.matches, supplier.total)}
                </Table.Td>
                <Table.Td className="text-center">{supplier.missing}</Table.Td>
                <Table.Td className="text-center">
                  {getBreakdownValue(supplier.breakdown, "mismatch")}
                </Table.Td>
                <Table.Td className="text-center">
                  {getBreakdownValue(supplier.breakdown, "cancelled_succeeded")}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {getBreakdownValue(supplier.breakdown, "match") > 0 && (
                      <Badge color="green" variant="light">
                        match (
                        {formatRatio(supplier.breakdown.match, supplier.total)})
                      </Badge>
                    )}
                    {getBreakdownValue(supplier.breakdown, "mismatch") > 0 && (
                      <Badge color="red" variant="light">
                        mismatch (
                        {formatRatio(
                          getBreakdownValue(supplier.breakdown, "mismatch"),
                          supplier.total
                        )}
                        )
                      </Badge>
                    )}
                    {getBreakdownValue(
                      supplier.breakdown,
                      "cancelled_succeeded"
                    ) > 0 && (
                      <Badge color="orange" variant="light">
                        cancelled with payment (
                        {formatRatio(
                          getBreakdownValue(
                            supplier.breakdown,
                            "cancelled_succeeded"
                          ),
                          supplier.total
                        )}
                        )
                      </Badge>
                    )}
                    {getBreakdownValue(supplier.breakdown, "missing") > 0 && (
                      <Badge color="gray" variant="light">
                        missing (
                        {formatRatio(
                          supplier.breakdown.missing,
                          supplier.total
                        )}
                        )
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            <Table.Tr bg="var(--mantine-color-gray-1)">
              <Table.Td className="font-semibold">Total</Table.Td>
              <Table.Td className="text-center font-semibold">
                {formatRatio(
                  extendedData.totals.matches,
                  extendedData.totals.total
                )}
              </Table.Td>
              <Table.Td className="text-center font-semibold">
                {formatPercentage(
                  extendedData.totals.matches,
                  extendedData.totals.total
                )}
              </Table.Td>
              <Table.Td className="text-center font-semibold">
                {extendedData.totals.missing}
              </Table.Td>
              <Table.Td className="text-center font-semibold">
                {getBreakdownValue(extendedData.totals.breakdown, "mismatch")}
              </Table.Td>
              <Table.Td className="text-center font-semibold">
                {getBreakdownValue(
                  extendedData.totals.breakdown,
                  "cancelled_succeeded"
                )}
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {getBreakdownValue(extendedData.totals.breakdown, "match") >
                    0 && (
                    <Badge color="green" variant="light">
                      match (
                      {formatRatio(
                        extendedData.totals.breakdown.match,
                        extendedData.totals.total
                      )}
                      )
                    </Badge>
                  )}
                  {getBreakdownValue(
                    extendedData.totals.breakdown,
                    "mismatch"
                  ) > 0 && (
                    <Badge color="red" variant="light">
                      mismatch (
                      {formatRatio(
                        getBreakdownValue(
                          extendedData.totals.breakdown,
                          "mismatch"
                        ),
                        extendedData.totals.total
                      )}
                      )
                    </Badge>
                  )}
                  {getBreakdownValue(
                    extendedData.totals.breakdown,
                    "cancelled_succeeded"
                  ) > 0 && (
                    <Badge color="orange" variant="light">
                      cancelled with payment (
                      {formatRatio(
                        getBreakdownValue(
                          extendedData.totals.breakdown,
                          "cancelled_succeeded"
                        ),
                        extendedData.totals.total
                      )}
                      )
                    </Badge>
                  )}
                  {getBreakdownValue(extendedData.totals.breakdown, "missing") >
                    0 && (
                    <Badge color="gray" variant="light">
                      missing (
                      {formatRatio(
                        extendedData.totals.breakdown.missing,
                        extendedData.totals.total
                      )}
                      )
                    </Badge>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
};
