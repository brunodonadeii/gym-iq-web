import { Button } from "@/components/Button/Button";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { Pagination } from "@/components/Pagination/Pagination";
import { SelectField } from "@/components/SelectField/SelectField";
import { Skeleton } from "@/components/Skeleton/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeletonRows,
} from "@/components/Table/Table";
import { useDeletePlan } from "@/mutations/useDeletePlan";
import { useGetPlans } from "@/queries/useGetPlans";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./Plans.module.css";

type PlanStatusFilter = "active" | "inactive" | "all";

const planColumns = [
  { width: "20%" },
  { width: "20%" },
  { width: "20%" },
  { width: "20%" },
  { width: "20%" },
  { width: "20%" },
];

export const PlansPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<PlanStatusFilter>("active");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const queryMode = statusFilter === "active" ? "active" : "all";
  const { data, isLoading, isFetching } = useGetPlans(queryMode, {
    page,
    size,
    sort: "name,asc",
  });
  const { mutate: deletePlan } = useDeletePlan();
  const tableLoading = isLoading || isFetching;
  const plans = useMemo(() => {
    const pageContent = data?.content ?? [];

    if (statusFilter === "inactive") {
      return pageContent.filter((plan) => !plan.active);
    }

    return pageContent;
  }, [data, statusFilter]);

  const activeCount = plans.filter((plan) => plan.active).length;
  const inactiveCount = plans.length - activeCount;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <strong className={styles.topBarTitle}>
            {tableLoading ? (
              <Skeleton width="160px" height="18px" />
            ) : (
              `${plans.length} plano(s) exibido(s)`
            )}
          </strong>
          <span className={styles.topBarSubtitle}>
            {tableLoading ? (
              <Skeleton width="220px" height="14px" />
            ) : (
              `${activeCount} ativo(s) e ${inactiveCount} inativo(s) neste recorte.`
            )}
          </span>
        </div>

        <div className={styles.topBarActions}>
          <SelectField
            label="Status"
            id="planStatusFilter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PlanStatusFilter);
              setPage(0);
            }}
            options={[
              { label: "Ativos", value: "active" },
              { label: "Inativos", value: "inactive" },
              { label: "Todos", value: "all" },
            ]}
            containerProps={{ className: styles.filterField }}
          />
          <Button
            leftIcon={<UserPlus size={18} />}
            onClick={() => navigate({ to: "/plans/create" })}
          >
            Novo Plano
          </Button>
        </div>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Lista principal</h3>
            <p className={styles.sectionDescription}>
              {data?.totalElements ?? 0} plano(s) retornado(s) pelo endpoint.
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={planColumns}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Descrição</TableHeaderCell>
                <TableHeaderCell>Valor mensal</TableHeaderCell>
                <TableHeaderCell>Duração em meses</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={6} />}

              {!tableLoading &&
                plans.map((plan) => (
                  <TableRow key={plan.planId}>
                    <TableCell>
                      <div className={styles.nameCell}>
                        <span className={styles.namePrimary}>{plan.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{plan.description}</TableCell>
                    <TableCell>R${plan.monthlyPrice}</TableCell>
                    <TableCell>{plan.durationMonths} meses</TableCell>
                    <TableCell center>
                      <span
                        className={`${styles.statusBadge} ${
                          plan.active
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {plan.active ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell center>
                      <Dropdown
                        items={[
                          {
                            label: "Editar",
                            icon: <Pencil size={15} />,
                            onSelect: () =>
                              navigate({
                                to: "/plans/$planId",
                                params: { planId: String(plan.planId) },
                              }),
                          },
                          {
                            label: "Excluir",
                            icon: <Trash2 size={15} />,
                            danger: true,
                            onSelect: () => {
                              deletePlan({ id: String(plan.planId) });
                            },
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}

              {!tableLoading && plans.length === 0 && (
                <TableEmptyState
                  colSpan={6}
                  message="Nenhum plano encontrado para o filtro atual."
                />
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          page={data}
          currentPage={page}
          loading={isFetching}
          onPageChange={setPage}
          onSizeChange={(nextSize) => {
            setSize(nextSize);
            setPage(0);
          }}
        />
      </section>
    </div>
  );
};
