export const chartTooltipSlotProps = {
  tooltip: {
    trigger: "none" as const,
  },
};

export const chartSx = {
  color: "var(--chart-label)",
  "& text, & tspan": {
    fill: "var(--chart-label) !important",
    color: "var(--chart-label) !important",
  },
  "& .MuiChartsAxis-root line, & .MuiChartsAxis-line, & .MuiChartsAxis-tick": {
    stroke: "var(--chart-axis) !important",
  },
  "& .MuiChartsGrid-line": {
    stroke: "var(--chart-grid) !important",
  },
  "& .MuiChartsAxis-tickLabel, & .MuiChartsAxis-label, & .MuiChartsLegend-label, & .MuiChartsText-root, & .MuiPieArcLabel-root":
    {
      fill: "var(--chart-label) !important",
      color: "var(--chart-label) !important",
    },
  "& .MuiChartsLegend-root, & .MuiChartsLegend-series": {
    color: "var(--chart-label) !important",
  },
};
