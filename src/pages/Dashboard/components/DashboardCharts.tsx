import type {
  FinancialDashboard,
  OperationsDashboard,
  RetentionDashboard,
} from "@/pages/Dashboard/types";
import { BarChart, PieChart } from "@mui/x-charts";
import { chartColors } from "../constants";
import {
  formatCurrency,
  formatNumber,
  hasPositiveValues,
} from "../utils";
import {
  ChartLegend,
  ChartPanel,
} from "./ChartPanel";
import { chartTooltipSlotProps } from "./chartConfig";

type DashboardChartProps<TData> = {
  data?: TData;
  loading?: boolean;
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

  return (
    <ChartPanel
      title="Distribuição por risco"
      description="Quantidade de alunos em cada nível de risco de retenção."
      summary={`${formatNumber(total)} aluno(s) avaliados`}
      loading={loading}
      hasData={hasPositiveValues(chartData.map((item) => item.value))}
      legend={<ChartLegend items={chartData} />}
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
        margin={{ top: 16, right: 16, bottom: 34, left: 38 }}
        slotProps={chartTooltipSlotProps}
      />
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

  return (
    <ChartPanel
      title="Distribuição financeira"
      description="Comparação entre valores pagos, pendentes e atrasados."
      summary={`Total analisado: ${formatCurrency(total)}`}
      loading={loading}
      hasData={hasPositiveValues(chartData.map((item) => item.value))}
      legend={<ChartLegend items={chartData} valueFormatter={formatCurrency} />}
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
        slotProps={chartTooltipSlotProps}
      />
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

  return (
    <ChartPanel
      title="Status das matrículas"
      description="Distribuição atual das matrículas por status operacional."
      summary={`${formatNumber(total)} matrícula(s) no total`}
      loading={loading}
      hasData={hasPositiveValues(chartData.map((item) => item.value))}
      legend={<ChartLegend items={chartData} />}
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
        margin={{ top: 16, right: 16, bottom: 34, left: 38 }}
        slotProps={chartTooltipSlotProps}
      />
    </ChartPanel>
  );
};
