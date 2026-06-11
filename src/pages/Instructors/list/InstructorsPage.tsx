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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useActivateInstructor } from "@/mutations/useActivateInstructor";
import { useDeactivateInstructor } from "@/mutations/useDeactivateInstructor";
import { useDeleteInstructor } from "@/mutations/useDeleteInstructor";
import type { Instructor } from "@/pages/Instructors/types";
import {
  type InstructorStatusFilter,
  useGetInstructors,
} from "@/queries/useGetInstructors";
import { auth } from "@/utils/auth";
import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  RotateCcw,
  Search,
  Trash2,
  UserRoundPlus,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./InstructorsPage.module.css";

const instructorColumns = [
  { width: "34%" },
  { width: "18%" },
  { width: "24%" },
  { width: "14%" },
  { width: "10%" },
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

type ConfirmAction =
  | { type: "deactivate"; instructor: Instructor }
  | { type: "delete"; instructor: Instructor };

export const InstructorsPage = () => {
  const isAdmin = auth.hasAnyRole(["ADMIN"]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<InstructorStatusFilter>("ACTIVE");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
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
  const { mutate: activateInstructor, isPending: isActivating } =
    useActivateInstructor();
  const { mutate: deactivateInstructor, isPending: isDeactivating } =
    useDeactivateInstructor();
  const { mutate: deleteInstructor, isPending: isDeleting } =
    useDeleteInstructor();
  const mutationPending = isActivating || isDeactivating || isDeleting;
  const tableLoading = isLoading || isFetching;

  const handleDeactivate = (instructor: Instructor) => {
    deactivateInstructor(
      { id: String(instructor.instructorId) },
      {
        onSuccess: () => {
          toast.success("Instrutor inativado com sucesso!");
          setConfirmAction(null);
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.error ?? "Erro"}</strong>
              <br />
              <span>
                {e?.message ?? "Não foi possível inativar o instrutor."}
              </span>
            </div>,
          );
        },
      },
    );
  };

  const handleActivate = (instructor: Instructor) => {
    activateInstructor(
      { id: String(instructor.instructorId) },
      {
        onSuccess: () => {
          toast.success("Instrutor ativado com sucesso!");
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.error ?? "Erro"}</strong>
              <br />
              <span>{e?.message ?? "Não foi possível ativar o instrutor."}</span>
            </div>,
          );
        },
      },
    );
  };

  const handleDelete = (instructor: Instructor) => {
    deleteInstructor(
      { id: String(instructor.instructorId) },
      {
        onSuccess: () => {
          toast.success("Instrutor excluído com sucesso!");
          setConfirmAction(null);
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.error ?? "Erro"}</strong>
              <br />
              <span>{e?.message ?? "Não foi possível excluir o instrutor."}</span>
            </div>,
          );
        },
      },
    );
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction.type === "deactivate") {
      handleDeactivate(confirmAction.instructor);
      return;
    }

    handleDelete(confirmAction.instructor);
  };

  const getInstructorActions = (instructor: Instructor): DropdownItem[] => [
    {
      label: isAdmin ? "Detalhes / editar" : "Detalhes",
      icon: <Eye size={15} />,
      onSelect: () =>
        navigate({
          to: "/instructors/$instructorId",
          params: { instructorId: String(instructor.instructorId) },
        }),
    },
    ...(isAdmin
      ? instructor.active
        ? [
            {
              label: "Inativar",
              icon: <UserX size={15} />,
              danger: true,
              disabled: mutationPending,
              onSelect: () =>
                setConfirmAction({ type: "deactivate", instructor }),
            } satisfies DropdownItem,
          ]
        : [
            {
              label: "Ativar",
              icon: <RotateCcw size={15} />,
              disabled: mutationPending,
              onSelect: () => handleActivate(instructor),
            } satisfies DropdownItem,
            {
              label: "Excluir",
              icon: <Trash2 size={15} />,
              danger: true,
              disabled: mutationPending,
              onSelect: () => setConfirmAction({ type: "delete", instructor }),
            } satisfies DropdownItem,
          ]
      : []),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <ListToolbar
          search={
            <SearchBar
              icon={<Search size={15} />}
              placeholder="Buscar por nome, CREF ou e-mail completo"
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
              id="instructorStatusFilter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as InstructorStatusFilter);
                setPage(0);
              }}
              options={statusOptions}
              containerProps={{ className: styles.filterField }}
            />
          }
          action={
            isAdmin ? (
              <Button
                leftIcon={<UserRoundPlus size={18} />}
                onClick={() => navigate({ to: "/instructors/create" })}
              >
                Novo instrutor
              </Button>
            ) : null
          }
        />
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Lista de instrutores</h3>
            <p className={styles.sectionDescription}>
              {data?.totalElements ?? 0} instrutor(es) encontrado(s).
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={instructorColumns} minWidth="1120px">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>CREF</TableHeaderCell>
                <TableHeaderCell>Especialidade</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={5} />}

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
                    <TableCell>{instructor.specialty || "-"}</TableCell>
                    <TableCell center>
                      <span
                        className={`${styles.statusBadge} ${
                          instructor.active
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
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
                  colSpan={5}
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

      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === "delete"
            ? "Excluir instrutor?"
            : "Inativar instrutor?"
        }
        description={
          confirmAction?.type === "delete"
            ? (
                <>
                  O instrutor{" "}
                  <strong>{confirmAction.instructor.name}</strong> será{" "}
                  <strong>excluído definitivamente</strong>.
                </>
              )
            : confirmAction
              ? (
                  <>
                    O instrutor{" "}
                    <strong>{confirmAction.instructor.name}</strong> será{" "}
                    <strong>inativado</strong> e deixará de participar do
                    sistema até uma nova ativação.
                  </>
                )
              : ""
        }
        confirmLabel={
          confirmAction?.type === "delete"
            ? "Excluir instrutor"
            : "Inativar instrutor"
        }
        loading={mutationPending}
        onCancel={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};
