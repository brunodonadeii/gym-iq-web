import { Button } from "@/components/Button/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { Dropdown } from "@/components/Dropdown/Dropdown";
import { Pagination } from "@/components/Pagination/Pagination";
import { SearchBar } from "@/components/SearchBar/SearchBar";
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
import { useDeleteAdminUser } from "@/mutations/useDeleteAdminUser";
import type { AdminUser, AdminUserRole } from "@/pages/AdminUsers/types";
import { useGetAdminUsers } from "@/queries/useGetAdminUsers";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import styles from "./AdminUsersPage.module.css";

const userColumns = [
  { width: "28%" },
  { width: "28%" },
  { width: "14%" },
  { width: "12%" },
  { width: "12%" },
  { width: "6%" },
];

const roleLabels: Record<AdminUserRole, string> = {
  ADMIN: "Administrador",
  RECEPTION: "Recepção",
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";

const getAdminUserId = (user: AdminUser) => String(user.userId ?? user.id ?? "");

export const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading, isFetching } = useGetAdminUsers(debouncedSearch, {
    page,
    size,
    sort: "createdAt,desc",
  });
  const { mutate: deleteAdminUser, isPending: isDeleting } =
    useDeleteAdminUser();
  const users = data?.content ?? [];

  const handleDelete = () => {
    if (!userToDelete) return;

    deleteAdminUser(
      { id: getAdminUserId(userToDelete) },
      {
        onSuccess: () => {
          toast.success("Usuário administrativo removido com sucesso.");
          setUserToDelete(null);
        },
        onError: (e) => {
          toast.error(
            <div>
              <strong>{e?.erro ?? "Erro"}</strong>
              <br />
              <span>
                {e?.mensagem ?? "Não foi possível remover este usuário."}
              </span>
            </div>,
          );
        },
      },
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <SearchBar
          icon={<Search size={15} />}
          placeholder="Buscar por nome, e-mail ou permissão"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />

        <Button
          leftIcon={<PlusCircle size={18} />}
          onClick={() => navigate({ to: "/admin-users/create" })}
        >
          Novo usuário
        </Button>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Usuários administrativos</h3>
          <p className={styles.sectionDescription}>
            {data?.totalElements ?? 0} usuário(s) interno(s) encontrado(s).
          </p>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={userColumns} minWidth="920px">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>E-mail</TableHeaderCell>
                <TableHeaderCell>Permissão</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell>Criado em</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading && <TableSkeletonRows columns={6} />}

              {!isLoading &&
                users.map((user) => {
                  const userId = getAdminUserId(user);

                  return (
                    <TableRow key={userId || user.email}>
                      <TableCell>
                        <div className={styles.nameCell}>
                          <span className={styles.namePrimary}>
                            {user.name}
                          </span>
                          <span className={styles.nameSecondary}>
                            {user.lgpdAccepted
                              ? "LGPD aceita"
                              : "LGPD pendente"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{roleLabels[user.role]}</TableCell>
                      <TableCell center>
                        <span
                          className={`${styles.statusBadge} ${
                            user.active === false
                              ? styles.statusInactive
                              : styles.statusActive
                          }`}
                        >
                          {user.active === false ? "Inativo" : "Ativo"}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell center>
                        <Dropdown
                          items={[
                            {
                              label: "Editar",
                              icon: <Pencil size={15} />,
                              disabled: !userId,
                              onSelect: () =>
                                navigate({
                                  to: "/admin-users/$userId",
                                  params: { userId },
                                }),
                            },
                            {
                              label: "Remover",
                              icon: <Trash2 size={15} />,
                              danger: true,
                              disabled: !userId || isDeleting,
                              onSelect: () => setUserToDelete(user),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!isLoading && users.length === 0 && (
                <TableEmptyState
                  colSpan={6}
                  message="Nenhum usuário administrativo encontrado."
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
        open={!!userToDelete}
        title="Remover usuário administrativo?"
        description={
          userToDelete
            ? `O acesso de ${userToDelete.name} será removido. Esta ação deve ser usada apenas para usuários internos.`
            : ""
        }
        confirmLabel="Remover usuário"
        loading={isDeleting}
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
