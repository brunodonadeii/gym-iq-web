import { Button } from "@/components/Button/Button";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/Table/Table";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Search, Trash2, UserPlus } from "lucide-react";
import styles from "./Plans.module.css";
import { useGetPlans } from "@/queries/useGetPlans";
import { useDeletePlan } from "@/mutations/useDeletePlan";

const studentColumns = [
  { width: "24%" },
  { width: "16%" },
  { width: "16%" },
  { width: "22%" },
  { width: "12%" },
  { width: "10%" },
];

export const PlansPage = () => {
  const navigate = useNavigate();
  const { data } = useGetPlans();
  const { mutate: deletePlan } = useDeletePlan();

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <SearchBar
          icon={<Search size={15} />}
          placeholder="Buscar por nome, CPF ou email"
        />
        <Button
          leftIcon={<UserPlus size={18} />}
          onClick={() => navigate({ to: "/plans/create" })}
        >
          Novo Plano
        </Button>
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
              {data?.map((d) => (
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
                    <span className={styles.statusBadge}>
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
