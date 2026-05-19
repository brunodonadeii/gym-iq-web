import { Button } from "@/components/Button/Button";
import { Dropdown, type DropdownItem } from "@/components/Dropdown/Dropdown";
import { Pagination } from "@/components/Pagination/Pagination";
import { SearchBar } from "@/components/SearchBar/SearchBar";
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
import { useDeleteInstructor } from "@/mutations/useDeleteInstructor";
import type { Instructor } from "@/pages/Instructors/types";
import { useGetInstructors } from "@/queries/useGetInstructors";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  BadgeX,
  Eye,
  Search,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
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

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Nao informado";

export const InstructorsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading, isFetching } = useGetInstructors(debouncedSearch, {
    page,
    size,
    sort: "user.name,asc",
  });
  const instructors = data?.content ?? [];
  const { mutate: deleteInstructor, isPending: isDeleting } =
    useDeleteInstructor();
  const tableLoading = isLoading || isFetching;

  const activeCount = useMemo(
    () => instructors.filter((instructor) => instructor.active).length,
    [instructors],
  );

  const inactiveCount = instructors.length - activeCount;

  const specialtyCount = useMemo(() => {
    const specialties = new Set(
      instructors.map((instructor) => instructor.specialty).filter(Boolean),
    );

    return specialties.size;
  }, [instructors]);

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
              <span>{e?.mensagem ?? "Erro inesperado"}</span>
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
      <section className={styles.hero}>
        <div className={styles.metricsCard}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Total exibido</span>
            <strong className={styles.metricValue}>
              {tableLoading ? (
                <Skeleton width="48px" height="30px" />
              ) : (
                instructors.length
              )}
            </strong>
            <p className={styles.metricHint}>Instrutores no recorte atual.</p>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Ativos</span>
            <strong className={styles.metricValue}>
              {tableLoading ? (
                <Skeleton width="48px" height="30px" />
              ) : (
                activeCount
              )}
            </strong>
            <p className={styles.metricHint}>Professores disponiveis.</p>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Inativos</span>
            <strong className={styles.metricValue}>
              {tableLoading ? (
                <Skeleton width="48px" height="30px" />
              ) : (
                inactiveCount
              )}
            </strong>
            <p className={styles.metricHint}>
              Registros preservados sem acesso.
            </p>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Especialidades</span>
            <strong className={styles.metricValue}>
              {tableLoading ? (
                <Skeleton width="48px" height="30px" />
              ) : (
                specialtyCount
              )}
            </strong>
            <p className={styles.metricHint}>Areas cadastradas no time.</p>
          </div>
        </div>
      </section>

      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <strong className={styles.topBarTitle}>Busca e cadastro</strong>
          <span className={styles.topBarSubtitle}>
            Pesquise por nome, CREF ou e-mail antes de criar um novo registro.
          </span>
        </div>

        <div className={styles.topBarActions}>
          <SearchBar
            icon={<Search size={15} />}
            placeholder="Buscar por nome, CREF ou email"
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
                <TableHeaderCell center>Acoes</TableHeaderCell>
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
