import React from "react";
import { Card, Table, Badge, Text, Group } from "@mantine/core";
import { formatPercentage, formatRatio } from "@components/Utils";
import { PaymentMatrix, PaymentBreakdown } from "@components/Utils";

interface PaymentMatrixTableProps {
  title: string;
  matrixData: PaymentMatrix;
}

const PaymentMatrixTable: React.FC<PaymentMatrixTableProps> = ({
  title,
  matrixData,
}) => {
  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);

  const getBadgeConfig = (key: keyof PaymentBreakdown) => {
    const configs = {
      match: { color: "green", label: "match" },
      high_negative_difference: { color: "red", label: "high negative" },
      low_negative_difference: { color: "orange", label: "low negative" },
      low_positive_difference: { color: "yellow", label: "low positive" },
      high_positive_difference: { color: "blue", label: "high positive" },
    };
    return configs[key] || { color: "gray", label: key.replace(/_/g, " ") };
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
              <Table.Th className="text-right">Expected Amount</Table.Th>
              <Table.Th className="text-right">Captured Amount</Table.Th>
              <Table.Th className="text-right">Difference</Table.Th>
              <Table.Th className="text-center">Missing</Table.Th>
              <Table.Th>Value Distribution</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {matrixData.suppliers.map((supplier, idx) => {
              const amountDiff =
                supplier.totalCapturedAmount - supplier.totalExpectedAmount;
              const diffPercentage = (
                (amountDiff / supplier.totalExpectedAmount) *
                100
              ).toFixed(1);

              return (
                <Table.Tr key={idx}>
                  <Table.Td className="font-medium">{supplier.name}</Table.Td>
                  <Table.Td className="text-center">
                    {formatRatio(supplier.matches, supplier.total)}
                  </Table.Td>
                  <Table.Td className="text-center">
                    {formatPercentage(supplier.matches, supplier.total)}
                  </Table.Td>
                  <Table.Td className="text-right">
                    {formatCurrency(supplier.totalExpectedAmount)}
                  </Table.Td>
                  <Table.Td className="text-right">
                    {formatCurrency(supplier.totalCapturedAmount)}
                  </Table.Td>
                  <Table.Td className="text-right">
                    <span
                      className={
                        amountDiff < 0 ? "text-red-500" : "text-green-500"
                      }
                    >
                      {formatCurrency(amountDiff)}
                      <br />
                      <span className="text-xs">({diffPercentage}%)</span>
                    </span>
                  </Table.Td>
                  <Table.Td className="text-center">
                    {supplier.missing}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {(
                        Object.keys(supplier.breakdown) as Array<
                          keyof PaymentBreakdown
                        >
                      )
                        .filter((key) => supplier.breakdown[key] > 0)
                        .map((key) => {
                          const config = getBadgeConfig(key);
                          return (
                            <Badge
                              key={key}
                              color={config.color}
                              variant="light"
                            >
                              {config.label} (
                              {formatRatio(
                                supplier.breakdown[key],
                                supplier.total
                              )}
                              )
                            </Badge>
                          );
                        })}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
            <Table.Tr bg="var(--mantine-color-gray-1)">
              <Table.Td className="font-semibold">Total</Table.Td>
              <Table.Td className="text-center font-semibold">
                {formatRatio(
                  matrixData.totals.matches,
                  matrixData.totals.total
                )}
              </Table.Td>
              <Table.Td className="text-center font-semibold">
                {formatPercentage(
                  matrixData.totals.matches,
                  matrixData.totals.total
                )}
              </Table.Td>
              <Table.Td className="text-right font-semibold">
                {formatCurrency(
                  matrixData.suppliers.reduce(
                    (sum, supplier) => sum + supplier.totalExpectedAmount,
                    0
                  )
                )}
              </Table.Td>
              <Table.Td className="text-right font-semibold">
                {formatCurrency(
                  matrixData.suppliers.reduce(
                    (sum, supplier) => sum + supplier.totalCapturedAmount,
                    0
                  )
                )}
              </Table.Td>
              <Table.Td className="text-right font-semibold">
                {formatCurrency(
                  matrixData.suppliers.reduce(
                    (sum, supplier) =>
                      sum +
                      (supplier.totalCapturedAmount -
                        supplier.totalExpectedAmount),
                    0
                  )
                )}
              </Table.Td>
              <Table.Td className="text-center font-semibold">
                {matrixData.totals.missing}
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {(
                    Object.keys(matrixData.totals.breakdown) as Array<
                      keyof PaymentBreakdown
                    >
                  )
                    .filter((key) => matrixData.totals.breakdown[key] > 0)
                    .map((key) => {
                      const config = getBadgeConfig(key);
                      return (
                        <Badge key={key} color={config.color} variant="light">
                          {config.label} (
                          {formatRatio(
                            matrixData.totals.breakdown[key],
                            matrixData.totals.total
                          )}
                          )
                        </Badge>
                      );
                    })}
                </Group>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
};

export default PaymentMatrixTable;

// import React from "react";
// import { Table, Group, Badge } from "@mantine/core";
// import {
//   StandardMatrix,
//   PaymentMatrix,
//   PaymentBreakdown,
//   StandardBreakdown,
//   BaseBreakdown
// } from "@components/Utils";

// interface BadgeConfig {
//   color: string;
//   label: string;
// }

// type MatrixType = 'payment' | 'status';

// interface ReconciliationMatrixTableProps {
//   title: string;
//   matrixData: StandardMatrix | PaymentMatrix;
//   type?: MatrixType;
// }

// // Type guard to check if matrix is PaymentMatrix
// const isPaymentMatrix = (
//   matrix: StandardMatrix | PaymentMatrix,
//   type: MatrixType
// ): matrix is PaymentMatrix => {
//   return type === 'payment';
// };

// const ReconciliationMatrixTable: React.FC<ReconciliationMatrixTableProps> = ({
//   title,
//   matrixData,
//   type = "payment"
// }) => {
//   const formatRatio = (num: number, total: number): string => `${num}/${total}`;
//   const formatPercentage = (num: number, total: number): string =>
//     `${((num / total) * 100).toFixed(1)}%`;
//   const formatCurrency = (amount: number): string =>
//     new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//       minimumFractionDigits: 2,
//     }).format(amount);

//   // Different badge colors and labels based on type
//   const getBadgeConfig = (key: keyof (PaymentBreakdown | StandardBreakdown)): BadgeConfig => {
//     if (type === "payment") {
//       const paymentConfigs: Record<keyof PaymentBreakdown, BadgeConfig> = {
//         match: { color: "green", label: "match" },
//         high_negative_difference: { color: "red", label: "high negative" },
//         low_negative_difference: { color: "orange", label: "low negative" },
//         low_positive_difference: { color: "yellow", label: "low positive" },
//         high_positive_difference: { color: "blue", label: "high positive" }
//       };
//       return paymentConfigs[key as keyof PaymentBreakdown] || { color: "gray", label: key.replace(/_/g, " ") };
//     } else {
//       const statusConfigs: Record<keyof StandardBreakdown, BadgeConfig> = {
//         match: { color: "green", label: "match" },
//         mismatch: { color: "red", label: "mismatch" },
//         missing: { color: "gray", label: "missing" }
//       };
//       return statusConfigs[key as keyof StandardBreakdown] || { color: "gray", label: key.replace(/_/g, " ") };
//     }
//   };

//   return (
//     <div className="w-full shadow-sm mb-6 border rounded-lg bg-white">
//       <div className="p-4 border-b font-medium text-lg">{title}</div>

//       <div className="overflow-x-auto">
//         <Table striped highlightOnHover>
//           <Table.Thead>
//             <Table.Tr>
//               <Table.Th>Supplier</Table.Th>
//               <Table.Th className="text-center">Match Rate</Table.Th>
//               <Table.Th className="text-center">Match %</Table.Th>
//               {isPaymentMatrix(matrixData, type) && (
//                 <>
//                   <Table.Th className="text-right">Expected Amount</Table.Th>
//                   <Table.Th className="text-right">Captured Amount</Table.Th>
//                   <Table.Th className="text-right">Difference</Table.Th>
//                 </>
//               )}
//               <Table.Th className="text-center">Missing</Table.Th>
//               <Table.Th>Value Distribution</Table.Th>
//             </Table.Tr>
//           </Table.Thead>
//           <Table.Tbody>
//             {matrixData.suppliers.map((supplier, idx) => {
//               const amountDiff = isPaymentMatrix(matrixData, type)
//                 ? supplier.totalCapturedAmount - supplier.totalExpectedAmount
//                 : 0;
//               const diffPercentage = isPaymentMatrix(matrixData, type)
//                 ? ((amountDiff / supplier.totalExpectedAmount) * 100).toFixed(1)
//                 : '0';

//               return (
//                 <Table.Tr key={idx}>
//                   <Table.Td className="font-medium">{supplier.name}</Table.Td>
//                   <Table.Td className="text-center">
//                     {formatRatio(supplier.matches, supplier.total)}
//                   </Table.Td>
//                   <Table.Td className="text-center">
//                     {formatPercentage(supplier.matches, supplier.total)}
//                   </Table.Td>
//                   {isPaymentMatrix(matrixData, type) && (
//                     <>
//                       <Table.Td className="text-right">
//                         {formatCurrency(supplier.totalExpectedAmount)}
//                       </Table.Td>
//                       <Table.Td className="text-right">
//                         {formatCurrency(supplier.totalCapturedAmount)}
//                       </Table.Td>
//                       <Table.Td className="text-right">
//                         <span className={amountDiff < 0 ? "text-red-500" : "text-green-500"}>
//                           {formatCurrency(amountDiff)}
//                           <br />
//                           <span className="text-xs">({diffPercentage}%)</span>
//                         </span>
//                       </Table.Td>
//                     </>
//                   )}
//                   <Table.Td className="text-center">{supplier.missing}</Table.Td>
//                   <Table.Td>
//                     <Group gap="xs">
//                       {Object.entries(supplier.breakdown)
//                         .filter(([_, value]) => value > 0)
//                         .map(([key, value]) => {
//                           const config = getBadgeConfig(key as keyof BaseBreakdown);
//                           return (
//                             <Badge key={key} color={config.color} variant="light">
//                               {config.label} ({formatRatio(value, supplier.total)})
//                             </Badge>
//                           );
//                         })}
//                     </Group>
//                   </Table.Td>
//                 </Table.Tr>
//               );
//             })}
//             <Table.Tr className="bg-gray-50 font-semibold">
//               <Table.Td>Total</Table.Td>
//               <Table.Td className="text-center">
//                 {formatRatio(matrixData.totals.matches, matrixData.totals.total)}
//               </Table.Td>
//               <Table.Td className="text-center">
//                 {formatPercentage(matrixData.totals.matches, matrixData.totals.total)}
//               </Table.Td>
//               {isPaymentMatrix(matrixData, type) && (
//                 <>
//                   <Table.Td className="text-right">
//                     {formatCurrency(
//                       matrixData.suppliers.reduce(
//                         (sum, supplier) => sum + supplier.totalExpectedAmount,
//                         0
//                       )
//                     )}
//                   </Table.Td>
//                   <Table.Td className="text-right">
//                     {formatCurrency(
//                       matrixData.suppliers.reduce(
//                         (sum, supplier) => sum + supplier.totalCapturedAmount,
//                         0
//                       )
//                     )}
//                   </Table.Td>
//                   <Table.Td className="text-right">
//                     {formatCurrency(
//                       matrixData.suppliers.reduce(
//                         (sum, supplier) =>
//                           sum + (supplier.totalCapturedAmount - supplier.totalExpectedAmount),
//                         0
//                       )
//                     )}
//                   </Table.Td>
//                 </>
//               )}
//               <Table.Td className="text-center">{matrixData.totals.missing}</Table.Td>
//               <Table.Td>
//                 <Group gap="xs">
//                   {Object.entries(matrixData.totals.breakdown)
//                     .filter(([_, value]) => value > 0)
//                     .map(([key, value]) => {
//                       const config = getBadgeConfig(key as keyof BaseBreakdown);
//                       return (
//                         <Badge key={key} color={config.color} variant="light">
//                           {config.label} ({formatRatio(value, matrixData.totals.total)})
//                         </Badge>
//                       );
//                     })}
//                 </Group>
//               </Table.Td>
//             </Table.Tr>
//           </Table.Tbody>
//         </Table>
//       </div>
//     </div>
//   );
// };

// export default ReconciliationMatrixTable;
