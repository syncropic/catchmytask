import React from "react";
import { Card, Text, Grid } from "@mantine/core";
import {
  StandardMatrix,
  PaymentMatrix,
  ReconciliationProps,
  StandardReconciliationProps,
  PaymentReconciliationProps,
} from "@components/Utils";

// Utility functions
const formatRatio = (num: number, total: number): string => `${num}/${total}`;
const formatPercentage = (num: number, total: number): string =>
  `${((num / total) * 100).toFixed(1)}%`;
const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

// Metric type definition
interface BaseMetric {
  title: string;
  value: string;
  detail: string;
  subDetail?: string;
  color: string;
}

const UnifiedSummaryMetrics: React.FC<ReconciliationProps> = (props) => {
  const getPaymentMetrics = (
    costData: PaymentMatrix,
    statusData: StandardMatrix,
    individualCostsData?: PaymentMatrix
  ): BaseMetric[] => {
    const totalExpectedAmount = costData.suppliers.reduce(
      (sum, supplier) => sum + (supplier.totalExpectedAmount || 0),
      0
    );

    const totalCapturedAmount = costData.suppliers.reduce(
      (sum, supplier) => sum + (supplier.totalCapturedAmount || 0),
      0
    );

    const amountDifference = totalCapturedAmount - totalExpectedAmount;
    const differencePercentage = (
      (amountDifference / totalExpectedAmount) *
      100
    ).toFixed(1);

    const baseMetrics: BaseMetric[] = [
      {
        title: "Payment Amount Match Rate",
        value: formatPercentage(costData.totals.matches, costData.totals.total),
        detail: `${formatRatio(
          costData.totals.matches,
          costData.totals.total
        )} bookings`,
        subDetail: `${formatCurrency(
          amountDifference
        )} total difference (${differencePercentage}%)`,
        color:
          amountDifference === 0
            ? "green"
            : amountDifference < 0
            ? "red"
            : "orange",
      },
      {
        title: "Payment Status Match Rate",
        value: formatPercentage(
          statusData.totals.matches,
          statusData.totals.total
        ),
        detail: `${formatRatio(
          statusData.totals.matches,
          statusData.totals.total
        )} bookings`,
        subDetail: `${formatPercentage(
          statusData.totals.matches,
          statusData.totals.total
        )} payment status accuracy`,
        color: "blue",
      },
    ];

    if (individualCostsData) {
      baseMetrics.push({
        title: "Individual Costs Match Rate",
        value: formatPercentage(
          individualCostsData.totals.matches,
          individualCostsData.totals.total
        ),
        detail: `${formatRatio(
          individualCostsData.totals.matches,
          individualCostsData.totals.total
        )} bookings`,
        subDetail: `${individualCostsData.totals.missing} unreconciled entries`,
        color: "violet",
      });
    }

    const additionalMetrics: BaseMetric[] = [
      {
        title: "Total Expected Amount",
        value: formatCurrency(totalExpectedAmount),
        detail: `Across ${costData.totals.total} bookings`,
        color: "dark",
      },
      {
        title: "Total Captured Amount",
        value: formatCurrency(totalCapturedAmount),
        detail: `From ${costData.suppliers.length} suppliers`,
        subDetail:
          costData.totals.missing > 0
            ? `${costData.totals.missing} missing payment records`
            : "All payments recorded",
        color: "dark",
      },
      {
        title: "Overall Data Coverage",
        value: formatPercentage(
          costData.totals.total - costData.totals.missing,
          costData.totals.total
        ),
        detail: `${costData.totals.missing} missing entries`,
        subDetail: "Across all payment metrics",
        color: "gray",
      },
    ];

    return [...baseMetrics, ...additionalMetrics];
  };

  const getSupplierMetrics = (
    costData: StandardMatrix,
    statusData: StandardMatrix
  ): BaseMetric[] => [
    {
      title: "Overall Cost Match Rate",
      value: formatPercentage(costData.totals.matches, costData.totals.total),
      detail: `${formatRatio(
        costData.totals.matches,
        costData.totals.total
      )} bookings`,
      color: "green",
    },
    {
      title: "Overall Status Match Rate",
      value: formatPercentage(
        statusData.totals.matches,
        statusData.totals.total
      ),
      detail: `${formatRatio(
        statusData.totals.matches,
        statusData.totals.total
      )} bookings`,
      color: "blue",
    },
    {
      title: "Data Coverage",
      value: formatPercentage(
        costData.totals.total - costData.totals.missing,
        costData.totals.total
      ),
      detail: `${costData.totals.missing} missing entries`,
      color: "violet",
    },
  ];

  const metrics =
    props.type === "payment"
      ? getPaymentMetrics(
          (props as PaymentReconciliationProps).costData,
          props.statusData,
          (props as PaymentReconciliationProps).individualCostsData
        )
      : getSupplierMetrics(
          (props as StandardReconciliationProps).costData,
          props.statusData
        );

  const MetricCard: React.FC<{ metric: BaseMetric }> = ({ metric }) => (
    <Card withBorder>
      <div className="text-center">
        <Text size="sm" c="dimmed">
          {metric.title}
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

  if (props.type === "payment") {
    const mainMetrics = metrics.slice(0, 3);
    const additionalMetrics = metrics.slice(3);

    return (
      <div className="space-y-4 mb-6">
        <Grid>
          {mainMetrics.map((metric, idx) => (
            <Grid.Col key={idx} span={4}>
              <MetricCard metric={metric} />
            </Grid.Col>
          ))}
        </Grid>
        <Grid>
          {additionalMetrics.map((metric, idx) => (
            <Grid.Col key={idx} span={4}>
              <MetricCard metric={metric} />
            </Grid.Col>
          ))}
        </Grid>
      </div>
    );
  }

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

export default UnifiedSummaryMetrics;
