import { SelectField } from "@/components/SelectField/SelectField";
import type { PageResponse } from "@/types/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

type PaginationPage = Pick<
  PageResponse<unknown>,
  "totalElements" | "totalPages" | "size" | "number" | "first" | "last"
>;

type PaginationProps = {
  page?: PaginationPage;
  currentPage?: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  sizeOptions?: number[];
};

export const Pagination = ({
  page,
  currentPage,
  loading = false,
  onPageChange,
  onSizeChange,
  sizeOptions = [10, 20, 50],
}: PaginationProps) => {
  if (!page) return null;

  const activePage = currentPage ?? page.number;
  const totalPages = Math.max(page.totalPages, 1);
  const firstItem = page.totalElements === 0 ? 0 : activePage * page.size + 1;
  const lastItem = Math.min((activePage + 1) * page.size, page.totalElements);
  const isFirstPage = activePage <= 0;
  const isLastPage = activePage >= totalPages - 1;

  return (
    <div className={styles.wrapper}>
      <div className={styles.summary}>
        <strong>
          {firstItem}-{lastItem}
        </strong>
        <span>de {page.totalElements} registro(s)</span>
      </div>

      <div className={styles.controls}>
        {onSizeChange && (
          <SelectField
            label="Itens"
            id="pageSize"
            value={String(page.size)}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            options={sizeOptions.map((option) => ({
              label: String(option),
              value: String(option),
            }))}
            containerProps={{ className: styles.sizeField }}
          />
        )}

        <div className={styles.pageControls}>
          <button
            className={styles.navButton}
            onClick={() => onPageChange(activePage - 1)}
            disabled={loading || isFirstPage}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <span className={styles.pageIndicator}>
            Página {activePage + 1} de {totalPages}
          </span>

          <button
            className={styles.navButton}
            onClick={() => onPageChange(activePage + 1)}
            disabled={loading || isLastPage}
            aria-label="Próxima página"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
