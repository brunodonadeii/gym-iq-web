import type {
  FinancialDashboard,
  OperationsDashboard,
  RetentionDashboard,
} from "@/pages/Dashboard/types";
import { BarChart, PieChart } from "@mui/x-charts";
import type { MouseEvent } from "react";
import { useState } from "react";
import { chartColors } from "../constants";
import styles from "../DashboardPage.module.css";
import {
  formatCurrency,
  formatNumber,
  hasPositiveValues,
} from "../utils";
import {
  ChartLegend,
  ChartPanel,
} from "./ChartPanel";
import { chartSx, chartTooltipSlotProps } from "./chartConfig";

type DashboardChartProps<TData> = {
  data?: TData;
  loading?: boolean;
};

type ChartDatum = {
  name: string;
  value: number;
  fill: string;
  description: string;
};

type ActiveTooltip = {
  x: number;
  y: number;
  item: ChartDatum;
  value: string;
};

const getTooltipCoordinates = (
  event: MouseEvent<HTMLDivElement>,
): Pick<ActiveTooltip, "x" | "y"> => {
  const rect = event.currentTarget.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;
  const x = pointerX > rect.width - 260 ? pointerX - 230 : pointerX + 14;
  const y = Math.max(8, pointerY + 14);

  return { x, y };
};

const getBarItemFromPointer = (
  event: MouseEvent<HTMLDivElement>,
  items: ChartDatum[],
  margin: { left: number; right: number },
) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const plotWidth = rect.width - margin.left - margin.right;
  const relativeX = pointerX - margin.left;

  if (relativeX < 0 || relativeX > plotWidth) {
    return undefined;
  }

  const index = Math.floor((relativeX / plotWidth) * items.length);
  return items[index];
};

const getPieItemFromPointer = (
  event: MouseEvent<HTMLDivElement>,
  items: ChartDatum[],
) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const distance = Math.hypot(pointerX - centerX, pointerY - centerY);

  if (distance < 58 || distance > 100) {
    return undefined;
  }

  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) {
    return undefined;
  }

  const angle =
    (Math.atan2(pointerY - centerY, pointerX - centerX) + Math.PI / 2 + Math.PI * 2) %
    (Math.PI * 2);
  let accumulated = 0;

  return items.find((item) => {
    if (item.value <= 0) {
      return false;
    }

    accumulated += (item.value / total) * Math.PI * 2;
    return angle <= accumulated;
  });
};

const DashboardChartTooltip = ({ tooltip }: { tooltip?: ActiveTooltip }) => {
  if (!tooltip) {
    return null;
  }

  return (
    <div
      className={styles.chartTooltip}
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      <div className={styles.chartTooltipHeader}>
        <span
          className={styles.chartTooltipDot}
          style={{ backgroundColor: tooltip.item.fill }}
        />
        <span>
          {tooltip.item.name}: {tooltip.value}
        </span>
      </div>
      <span className={styles.chartTooltipDescription}>
        {tooltip.item.description}
      </span>
    </div>
  );
};

export const RiskDistributionChart = ({
  data,
  loading,
}: DashboardChartProps<RetentionDashboard>) => {
  const chartData = [
    {
      name: "Baixo",
      value: data?.lowRiskStudents ?? 0,
      fill: chartColors.low,
      description: "Alunos com poucos sinais de abandono.",
    },
    {
      name: "Médio",
      value: data?.mediumRiskStudents ?? 0,
      fill: chartColors.medium,
      description: "Alunos que merecem acompanhamento preventivo.",
    },
    {
      name: "Alto",
      value: data?.highRiskStudents ?? 0,
      fill: chartColors.high,
      description: "Alunos com sinais fortes de evasão.",
    },
    {
      name: "Crítico",
      value: data?.criticalRiskStudents ?? 0,
      fill: chartColors.critical,
      description: "Alunos que precisam de ação imediata.",
    },
  ];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const [tooltip, setTooltip] = useState<ActiveTooltip>();

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const item = getBarItemFromPointer(event, chartData, { left: 38, right: 16 });

    if (!item) {
      setTooltip(undefined);
      return;
    }

    setTooltip({
      ...getTooltipCoordinates(event),
      item,
      value: formatNumber(item.value),
    });
  };

  return (
    <ChartPanel
      title="Distribuição por risco"
      description="Quantidade de alunos em cada nível de risco de retenção."
      summary={`${formatNumber(total)} aluno(s) avaliados`}
      loading={loading}
      hasData={hasPositiveValues(chartData.map((item) => item.value))}
      legend={<ChartLegend items={chartData} />}
    >
      <div
        className={styles.chartCanvas}
        onMouseLeave={() => setTooltip(undefined)}
        onMouseMove={handleMouseMove}
      >
        <BarChart
          height={260}
          hideLegend
          xAxis={[
            {
              data: chartData.map((item) => item.name),
              scaleType: "band",
              colorMap: {
                type: "ordinal",
                values: chartData.map((item) => item.name),
                colors: chartData.map((item) => item.fill),
              },
            },
          ]}
          yAxis={[{ min: 0 }]}
          series={[
            {
              label: "Alunos",
              data: chartData.map((item) => item.value),
              valueFormatter: (value) => formatNumber(value ?? 0),
            },
          ]}
          grid={{ horizontal: true }}
          margin={{ top: 16, right: 16, bottom: 34, left: 38 }}
          sx={chartSx}
          slotProps={chartTooltipSlotProps}
        />
        <DashboardChartTooltip tooltip={tooltip} />
      </div>
    </ChartPanel>
  );
};

export const FinancialStatusChart = ({
  data,
  loading,
}: DashboardChartProps<FinancialDashboard>) => {
  const chartData = [
    {
      name: "Pago",
      value: data?.paidAmountCurrentMonth ?? 0,
      fill: chartColors.paid,
      description: "Valor já recebido no mês atual.",
    },
    {
      name: "Pendente",
      value: data?.pendingAmountCurrentMonth ?? 0,
      fill: chartColors.pending,
      description: "Valor previsto que ainda não foi pago.",
    },
    {
      name: "Atrasado",
      value: data?.overdueAmountCurrentMonth ?? 0,
      fill: chartColors.overdue,
      description: "Valor vencido no mês atual.",
    },
  ];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const [tooltip, setTooltip] = useState<ActiveTooltip>();

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const item = getPieItemFromPointer(event, chartData);

    if (!item) {
      setTooltip(undefined);
      return;
    }

    setTooltip({
      ...getTooltipCoordinates(event),
      item,
      value: formatCurrency(item.value),
    });
  };

  return (
    <ChartPanel
      title="Distribuição financeira"
      description="Comparação entre valores pagos, pendentes e atrasados."
      summary={`Total analisado: ${formatCurrency(total)}`}
      loading={loading}
      hasData={hasPositiveValues(chartData.map((item) => item.value))}
      legend={<ChartLegend items={chartData} valueFormatter={formatCurrency} />}
    >
      <div
        className={styles.chartCanvas}
        onMouseLeave={() => setTooltip(undefined)}
        onMouseMove={handleMouseMove}
      >
        <PieChart
          height={260}
          hideLegend
          series={[
            {
              data: chartData.map((item) => ({
                id: item.name,
                value: item.value,
                label: item.name,
                color: item.fill,
              })),
              innerRadius: 58,
              outerRadius: 92,
              paddingAngle: 3,
              valueFormatter: (item) => formatCurrency(item.value),
            },
          ]}
          sx={chartSx}
          slotProps={chartTooltipSlotProps}
        />
        <DashboardChartTooltip tooltip={tooltip} />
      </div>
    </ChartPanel>
  );
};

export const EnrollmentStatusChart = ({
  data,
  loading,
}: DashboardChartProps<OperationsDashboard>) => {
  const chartData = [
    {
      name: "Ativas",
      value: data?.activeEnrollments ?? 0,
      fill: chartColors.active,
      description: "Matrículas em uso no momento.",
    },
    {
      name: "Suspensas",
      value: data?.suspendedEnrollments ?? 0,
      fill: chartColors.suspended,
      description: "Matrículas temporariamente pausadas.",
    },
    {
      name: "Canceladas",
      value: data?.canceledEnrollments ?? 0,
      fill: chartColors.canceled,
      description: "Matrículas encerradas.",
    },
  ];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const [tooltip, setTooltip] = useState<ActiveTooltip>();

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const item = getBarItemFromPointer(event, chartData, { left: 38, right: 16 });

    if (!item) {
      setTooltip(undefined);
      return;
    }

    setTooltip({
      ...getTooltipCoordinates(event),
      item,
      value: formatNumber(item.value),
    });
  };

  return (
    <ChartPanel
      title="Status das matrículas"
      description="Distribuição atual das matrículas por status operacional."
      summary={`${formatNumber(total)} matrícula(s) no total`}
      loading={loading}
      hasData={hasPositiveValues(chartData.map((item) => item.value))}
      legend={<ChartLegend items={chartData} />}
    >
      <div
        className={styles.chartCanvas}
        onMouseLeave={() => setTooltip(undefined)}
        onMouseMove={handleMouseMove}
      >
        <BarChart
          height={260}
          hideLegend
          xAxis={[
            {
              data: chartData.map((item) => item.name),
              scaleType: "band",
              colorMap: {
                type: "ordinal",
                values: chartData.map((item) => item.name),
                colors: chartData.map((item) => item.fill),
              },
            },
          ]}
          yAxis={[{ min: 0 }]}
          series={[
            {
              label: "Matrículas",
              data: chartData.map((item) => item.value),
              valueFormatter: (value) => formatNumber(value ?? 0),
            },
          ]}
          grid={{ horizontal: true }}
          margin={{ top: 16, right: 16, bottom: 34, left: 38 }}
          sx={chartSx}
          slotProps={chartTooltipSlotProps}
        />
        <DashboardChartTooltip tooltip={tooltip} />
      </div>
    </ChartPanel>
  );
};


