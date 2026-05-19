import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

import { Skeleton } from "@/components/Skeleton/Skeleton";
import styles from "./Table.module.css";

type TableColumn = {
  width?: string;
};

type TableProps = TableHTMLAttributes<HTMLTableElement> & {
  children: ReactNode;
  columns?: TableColumn[];
  minWidth?: string;
};

type AlignableCellProps = {
  children: ReactNode;
  center?: boolean;
};

type TableSectionProps = {
  children: ReactNode;
};

type TableEmptyStateProps = {
  colSpan: number;
  message: string;
};

type TableSkeletonRowsProps = {
  rows?: number;
  columns: number;
};

const getClassName = (...classNames: Array<string | false | undefined>) =>
  classNames.filter(Boolean).join(" ");

export const Table = ({
  children,
  columns,
  minWidth = "760px",
  className,
  style,
  ...rest
}: TableProps) => {
  const tableStyle: CSSProperties = {
    ...style,
    minWidth,
  };

  return (
    <div className={styles.tableContainer}>
      <table
        className={getClassName(styles.table, className)}
        style={tableStyle}
        {...rest}
      >
        {columns && columns.length > 0 && (
          <colgroup>
            {columns.map((column, index) => (
              <col key={index} style={{ width: column.width }} />
            ))}
          </colgroup>
        )}

        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children }: TableSectionProps) => {
  return <thead className={styles.tableHead}>{children}</thead>;
};

export const TableBody = ({ children }: TableSectionProps) => {
  return <tbody className={styles.tableBody}>{children}</tbody>;
};

export const TableRow = ({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLTableRowElement>) => {
  return (
    <tr className={getClassName(styles.tableRow, className)} {...rest}>
      {children}
    </tr>
  );
};

export const TableHeaderCell = ({
  children,
  center = false,
  className,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & AlignableCellProps) => {
  return (
    <th
      className={getClassName(styles.cell, center && styles.centerCell, className)}
      {...rest}
    >
      {children}
    </th>
  );
};

export const TableCell = ({
  children,
  center = false,
  className,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & AlignableCellProps) => {
  return (
    <td
      className={getClassName(styles.cell, center && styles.centerCell, className)}
      {...rest}
    >
      {children}
    </td>
  );
};

export const TableEmptyState = ({
  colSpan,
  message,
}: TableEmptyStateProps) => {
  return (
    <TableRow className={styles.emptyRow}>
      <td className={styles.emptyCell} colSpan={colSpan}>
        {message}
      </td>
    </TableRow>
  );
};

export const TableSkeletonRows = ({
  rows = 5,
  columns,
}: TableSkeletonRowsProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
              <Skeleton
                height={columnIndex === 0 ? "1.15rem" : "1rem"}
                width={columnIndex === columns - 1 ? "42px" : "100%"}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};
