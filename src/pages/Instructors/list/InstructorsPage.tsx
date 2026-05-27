import { Button } from "@/components/Button/Button";
import { Dropdown, type DropdownItem } from "@/components/Dropdown/Dropdown";
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDeleteInstructor } from "@/mutations/useDeleteInstructor";
import type { Instructor } from "@/pages/Instructors/types";
import {
  type InstructorStatusFilter,
  useGetInstructors,
} from "@/queries/useGetInstructors";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  BadgeX,
  Eye,
  Search,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./InstructorsPage.module.css";

const instructorColumns = [
  { width: "20%" },
  { width: "14%" },
  { width: "15%" },
  { width: "21%" },
  { width: "14%" },
  { width: "10%" },
  { width: "6%" },
];

const statusOptions: { label: string; value: InstructorStatusFilter }[] = [
  { label: "Ativos", value: "ACTIVE" },
  { label: "Inativos", value: "INACTIVE" },
  { label: "Todos", value: "ALL" },
];

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Não informado";

export const InstructorsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<InstructorStatusFilter>("ACTIVE");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading, isFetching } = useGetInstructors(
    debouncedSearch,
    statusFilter,
    {
      page,
      size,
      sort: "user.name,asc",
    },
  );
  const instructors = data?.content ?? [];
  const { mutate: deleteInstructor, isPending: isDeleting } =
    useDeleteInstructor();
  const tableLoading = isLoading || isFetching;

  const handleDelete = (instructor: Instructor) => {
    deleteInstructor(
      { id: String(instructor.instructorId) },
      {
        onSuccess: () => {
          toast.success("Instrutor inativado com sucesso!");
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.erro ?? "Erro"}</strong>
              <br />
              <span>
                {e?.mensagem ??
                  e?.message ??
                  "Não foi possível inativar o instrutor."}
              </span>
            </div>,
          );
        },
      },
    );
  };

  const getInstructorActions = (instructor: Instructor): DropdownItem[] => [
    {
      label: "Detalhes / editar",
      icon: <Eye size={15} />,
      onSelect: () =>
        navigate({
          to: "/instructors/$instructorId",
          params: { instructorId: String(instructor.instructorId) },
        }),
    },
    {
      label: "Inativar",
      icon: <Trash2 size={15} />,
      danger: true,
      disabled: !instructor.active || isDeleting,
      onSelect: () => handleDelete(instructor),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <strong className={styles.topBarTitle}>Busca e cadastro</strong>
          <span className={styles.topBarSubtitle}>
            Pesquise por nome, CREF ou e-mail antes de criar um novo registro.
          </span>
        </div>

        <div className={styles.topBarActions}>
          <SelectField
            label="Status"
            id="instructorStatusFilter"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as InstructorStatusFilter);
              setPage(0);
            }}
            options={statusOptions}
            containerProps={{ className: styles.filterField }}
          />
          <SearchBar
            icon={<Search size={15} />}
            placeholder="Buscar por nome, CREF ou e-mail"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
          <Button
            leftIcon={<UserRoundPlus size={18} />}
            onClick={() => navigate({ to: "/instructors/create" })}
          >
            Novo Instrutor
          </Button>
        </div>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Lista principal</h3>
            <p className={styles.sectionDescription}>
              Consulte contato, registro profissional, especialidade e status.
              Total encontrado: {data?.totalElements ?? 0}.
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={instructorColumns} minWidth="1120px">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>CREF</TableHeaderCell>
                <TableHeaderCell>Telefone</TableHeaderCell>
                <TableHeaderCell>E-mail</TableHeaderCell>
                <TableHeaderCell>Especialidade</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={7} />}

              {!tableLoading &&
                instructors.map((instructor) => (
                  <TableRow key={instructor.instructorId}>
                    <TableCell>
                      <div className={styles.nameCell}>
                        <span className={styles.namePrimary}>
                          {instructor.name}
                        </span>
                        <span className={styles.nameSecondary}>
                          Criado em {formatDate(instructor.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{instructor.cref}</TableCell>
                    <TableCell>{instructor.phone}</TableCell>
                    <TableCell>{instructor.email}</TableCell>
                    <TableCell>{instructor.specialty || "-"}</TableCell>
                    <TableCell center>
                      <span
                        className={`${styles.statusBadge} ${
                          instructor.active
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {instructor.active ? (
                          <BadgeCheck size={14} />
                        ) : (
                          <BadgeX size={14} />
                        )}
                        {instructor.active ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell center>
                      <Dropdown items={getInstructorActions(instructor)} />
                    </TableCell>
                  </TableRow>
                ))}

              {!tableLoading && instructors.length === 0 && (
                <TableEmptyState
                  colSpan={7}
                  message="Nenhum instrutor encontrado."
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
