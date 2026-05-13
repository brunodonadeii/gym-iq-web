import { Button } from "@/components/Button/Button";
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
import { MoreHorizontal, Search, UserPlus } from "lucide-react";

import styles from "./StudentsPage.module.css";
import { useGetStudents } from "@/queries/useGetStudents";
import { useState } from "react";

const studentColumns = [
  { width: "24%" },
  { width: "16%" },
  { width: "16%" },
  { width: "22%" },
  { width: "12%" },
  { width: "10%" },
];

export const StudentsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data } = useGetStudents(search);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <SearchBar
          icon={<Search size={15} />}
          placeholder="Buscar por nome, CPF ou email"
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          leftIcon={<UserPlus size={18} />}
          onClick={() => navigate({ to: "/students/create" })}
        >
          Novo Aluno
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
                <TableHeaderCell>CPF</TableHeaderCell>
                <TableHeaderCell>Telefone</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data?.map((d) => (
                <TableRow key={d.studentId}>
                  <TableCell>
                    <div className={styles.nameCell}>
                      <span className={styles.namePrimary}>{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{d.cpf}</TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell center>
                    <span className={styles.statusBadge}>
                      {d.active === true ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell center>
                    <button
                      className={styles.actionButton}
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "$studentId",
                          params: { studentId: d.studentId },
                        })
                      }
                    >
                      <MoreHorizontal size={16} />
                    </button>
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
