import { Button } from "@/components/Button/Button";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { SelectField } from "@/components/SelectField/SelectField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/Table/Table";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import styles from "./Plans.module.css";
import { useGetPlans } from "@/queries/useGetPlans";
import { useDeletePlan } from "@/mutations/useDeletePlan";
import { useMemo, useState } from "react";

type PlanStatusFilter = "active" | "inactive" | "all";

const studentColumns = [
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
  const queryMode = statusFilter === "active" ? "active" : "all";
  const { data } = useGetPlans(queryMode);
  const { mutate: deletePlan } = useDeletePlan();
  const plans = useMemo(() => {
    if (statusFilter === "inactive") {
      return data?.filter((plan) => !plan.active) ?? [];
    }

    return data ?? [];
  }, [data, statusFilter]);

  const activeCount = plans.filter((plan) => plan.active).length;
  const inactiveCount = plans.length - activeCount;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <strong className={styles.topBarTitle}>
            {plans.length} plano(s) exibido(s)
          </strong>
          <span className={styles.topBarSubtitle}>
            {activeCount} ativo(s) e {inactiveCount} inativo(s) neste recorte.
          </span>
        </div>

        <div className={styles.topBarActions}>
          <SelectField
            label="Status"
            id="planStatusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PlanStatusFilter)}
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
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={studentColumns}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Descrição</TableHeaderCell>
                <TableHeaderCell>Valor mensal</TableHeaderCell>
                <TableHeaderCell>Duração em dias</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {plans.map((d) => (
                <TableRow key={d.planId}>
                  <TableCell>
                    <div className={styles.nameCell}>
                      <span className={styles.namePrimary}>{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{d.description}</TableCell>
                  <TableCell>R${d.monthlyPrice}</TableCell>
                  <TableCell>{d.durationDays} dias</TableCell>
                  <TableCell center>
                    <span
                      className={`${styles.statusBadge} ${
                        d.active ? styles.statusActive : styles.statusInactive
                      }`}
                    >
                      {d.active === true ? "Ativo" : "Inativo"}
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
                              params: { planId: String(d.planId) },
                            }),
                        },
                        {
                          label: "Excluir",
                          icon: <Trash2 size={15} />,
                          danger: true,
                          onSelect: () => {
                            deletePlan({ id: String(d.planId) });
                          },
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};
