import { Button } from "@/components/Button/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { Dropdown, type DropdownItem } from "@/components/Dropdown/Dropdown";
import { ListToolbar } from "@/components/ListToolbar/ListToolbar";
import { Pagination } from "@/components/Pagination/Pagination";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { SelectField } from "@/components/SelectField/SelectField";
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
import { useActivatePlan } from "@/mutations/useActivatePlan";
import { useDeactivatePlan } from "@/mutations/useDeactivatePlan";
import { useDeletePlan } from "@/mutations/useDeletePlan";
import type { Plan } from "@/pages/Plans/types";
import { useGetPlans } from "@/queries/useGetPlans";
import { auth } from "@/utils/auth";
import { useNavigate } from "@tanstack/react-router";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Ban, Pencil, RotateCcw, Search, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./Plans.module.css";
import type { ApiError } from "@/utils/apiError";

type PlanStatusFilter = "active" | "inactive" | "all";

type ConfirmAction = { type: "deactivate" | "delete"; plan: Plan };

const planColumns = [
  { width: "20%" },
  { width: "20%" },
  { width: "20%" },
  { width: "20%" },
  { width: "20%" },
  { width: "20%" },
];

const showMutationError = (
  error: ApiError,
  fallback = "Não foi possível concluir a ação.",
) => {
  toast.error(
    <div>
      <strong>{error?.error ?? "Erro"}</strong>
      <br />
      <span>{error?.message ?? fallback}</span>
    </div>,
  );
};

export const PlansPage = () => {
  const isAdmin = auth.hasAnyRole(["ADMIN"]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlanStatusFilter>("active");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading, isFetching } = useGetPlans(statusFilter, debouncedSearch, {
    page,
    size,
    sort: "name,asc",
  });
  const { mutate: activatePlan, isPending: isActivating } = useActivatePlan();
  const { mutate: deactivatePlan, isPending: isDeactivating } =
    useDeactivatePlan();
  const { mutate: deletePlan, isPending: isDeleting } = useDeletePlan();
  const mutationPending = isActivating || isDeactivating || isDeleting;
  const tableLoading = isLoading || isFetching;
  const plans = data?.content ?? [];

  const handleActivatePlan = (plan: Plan) => {
    activatePlan(
      { id: String(plan.planId) },
      {
        onSuccess: () => toast.success("Plano ativado com sucesso!"),
        onError: (error) => showMutationError(error),
      },
    );
  };

  const handleDeactivatePlan = (plan: Plan) => {
    deactivatePlan(
      { id: String(plan.planId) },
      {
        onSuccess: () => {
          toast.success("Plano inativado com sucesso!");
          setConfirmAction(null);
        },
        onError: (error) => showMutationError(error),
      },
    );
  };

  const handleDeletePlan = (plan: Plan) => {
    deletePlan(
      { id: String(plan.planId) },
      {
        onSuccess: () => {
          toast.success("Plano excluído definitivamente.");
          setConfirmAction(null);
        },
        onError: (error) =>
          showMutationError(
            error,
            "Não é possível excluir plano vinculado a matrículas.",
          ),
      },
    );
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "delete") {
      handleDeletePlan(confirmAction.plan);
      return;
    }

    handleDeactivatePlan(confirmAction.plan);
  };

  const getPlanActions = (plan: Plan): DropdownItem[] => {
    if (!isAdmin) {
      return [];
    }

    const actions: DropdownItem[] = [
      {
        label: "Editar",
        icon: <Pencil size={15} />,
        onSelect: () =>
          navigate({
            to: "/plans/$planId",
            params: { planId: String(plan.planId) },
          }),
      },
    ];

    if (plan.active) {
      actions.push({
        label: "Inativar",
        icon: <Ban size={15} />,
        danger: true,
        disabled: mutationPending,
        onSelect: () => setConfirmAction({ type: "deactivate", plan }),
      });

      return actions;
    }

    actions.push(
      {
        label: "Ativar",
        icon: <RotateCcw size={15} />,
        disabled: mutationPending,
        onSelect: () => handleActivatePlan(plan),
      },
      {
        label: "Excluir definitivamente",
        icon: <Trash2 size={15} />,
        danger: true,
        disabled: mutationPending,
        onSelect: () => setConfirmAction({ type: "delete", plan }),
      },
    );

    return actions;
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <ListToolbar
          search={
            <SearchBar
              icon={<Search size={15} />}
              placeholder="Buscar por nome ou descrição"
              value={search}
              containerClassName={styles.searchField}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          }
          filters={
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
                ...(isAdmin
                  ? [
                      { label: "Inativos", value: "inactive" as const },
                      { label: "Todos", value: "all" as const },
                    ]
                  : []),
              ]}
              containerProps={{ className: styles.filterField }}
            />
          }
          action={
            isAdmin ? (
              <Button
                leftIcon={<UserPlus size={18} />}
                onClick={() => navigate({ to: "/plans/create" })}
              >
                Novo Plano
              </Button>
            ) : null
          }
        />
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Lista principal</h3>
            <p className={styles.sectionDescription}>
              {data?.totalElements ?? 0} plano(s) encontrado(s) para o filtro.
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
                      {isAdmin ? <Dropdown items={getPlanActions(plan)} /> : "-"}
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

      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === "delete"
            ? "Excluir plano definitivamente?"
            : "Inativar plano?"
        }
        description={
          confirmAction?.type === "delete"
            ? (
                <>
                  O plano <strong>{confirmAction.plan.name}</strong> será{" "}
                  <strong>excluído definitivamente</strong>. Planos vinculados a
                  matrículas podem ser bloqueados pelo servidor.
                </>
              )
            : confirmAction
              ? (
                  <>
                    O plano <strong>{confirmAction.plan.name}</strong> será{" "}
                    <strong>inativado</strong> e deixará de estar disponível
                    para novas matrículas.
                  </>
                )
              : ""
        }
        confirmLabel={
          confirmAction?.type === "delete" ? "Excluir plano" : "Inativar plano"
        }
        loading={mutationPending}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};


