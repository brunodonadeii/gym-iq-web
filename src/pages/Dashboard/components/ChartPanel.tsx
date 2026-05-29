import { Skeleton } from "@/components/Skeleton/Skeleton";
import type { ReactNode } from "react";
import { formatNumber } from "../utils";
import styles from "../DashboardPage.module.css";

type ChartLegendItem = {
  name: string;
  value: number;
  fill: string;
  description: string;
};

type ChartPanelProps = {
  title: string;
  description: string;
  summary?: string;
  legend?: ReactNode;
  loading?: boolean;
  hasData: boolean;
  children: ReactNode;
};

export const chartTooltipSlotProps = {
  tooltip: {
    trigger: "item" as const,
    anchor: "node" as const,
    position: "top" as const,
  },
};

export const ChartPanel = ({
  title,
  description,
  summary,
  legend,
  loading,
  hasData,
  children,
}: ChartPanelProps) => (
  <div className={styles.chartPanel}>
    <div className={styles.chartHeader}>
      <div>
        <h4 className={styles.subsectionTitle}>{title}</h4>
        <p className={styles.subsectionDescription}>{description}</p>
      </div>
      {summary && <span className={styles.chartSummary}>{summary}</span>}
    </div>
    {loading ? (
      <div className={styles.chartSkeleton}>
        <Skeleton height="210px" radius="18px" />
        <Skeleton width="70%" height="16px" />
      </div>
    ) : hasData ? (
      <div className={styles.chartFrame}>
        {children}
        {legend}
      </div>
    ) : (
      <div className={styles.emptyChart}>
        <strong>Nada para exibir ainda</strong>
        <span>
          Assim que a API retornar valores maiores que zero, este gráfico será
          preenchido automaticamente.
        </span>
      </div>
    )}
  </div>
);

export const ChartLegend = ({
  items,
  valueFormatter = formatNumber,
}: {
  items: ChartLegendItem[];
  valueFormatter?: (value: number) => string;
}) => (
  <div className={styles.chartLegend}>
    {items.map((item) => (
      <div className={styles.chartLegendItem} key={item.name}>
        <span
          className={styles.legendDot}
          style={{ backgroundColor: item.fill }}
        />
        <div>
          <strong>
            {item.name}: {valueFormatter(item.value)}
          </strong>
          <span>{item.description}</span>
        </div>
      </div>
    ))}
  </div>
);
