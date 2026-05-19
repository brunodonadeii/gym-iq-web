import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
import { Dropdown, type DropdownItem } from "@/components/Dropdown/Dropdown";
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
import { TextField } from "@/components/TextField/TextField";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePayPayment } from "@/mutations/usePayPayment";
import { useRefreshOverduePayments } from "@/mutations/useRefreshOverduePayments";
import { useUpdatePaymentStatus } from "@/mutations/useUpdatePaymentStatus";
import type { Enrollment } from "@/pages/Enrollments/types";
import type {
  Payment,
  PaymentMethod,
  PaymentPayFormData,
  PaymentStatus,
} from "@/pages/Payments/types";
import { useGetEnrollments } from "@/queries/useGetEnrollments";
import { useGetPayments } from "@/queries/useGetPayments";
import { useGetStudentOptions } from "@/queries/useGetStudentOptions";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClockAlert,
  PlusCircle,
  RefreshCcw,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import styles from "./PaymentsPage.module.css";

type PaymentFilterMode = "all" | "student" | "enrollment" | "overdue";
type PaymentStatusFilter = "all" | PaymentStatus;

const EMPTY_PAY_FORM: PaymentPayFormData = {
  paidAt: "",
  paymentMethod: "",
  notes: "",
};

const paymentColumns = [
  { width: "10%" },
  { width: "10%" },
  { width: "10%" },
  { width: "10%" },
  { width: "10%" },
  { width: "10%" },
  { width: "10%" },
  { width: "10%" },
  { width: "10%" },
  { width: "10%" },
];

const statusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Atrasado",
};

const paymentMethodLabels: Record<string, string> = {
  PIX: "PIX",
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartao de credito",
  DEBIT_CARD: "Cartao de debito",
  BANK_TRANSFER: "Transferencia",
};

const paymentMethodOptions = [
  { label: "Nao informar", value: "" },
  { label: "PIX", value: "PIX" },
  { label: "Dinheiro", value: "CASH" },
  { label: "Cartao de credito", value: "CREDIT_CARD" },
  { label: "Cartao de debito", value: "DEBIT_CARD" },
  { label: "Transferencia bancaria", value: "BANK_TRANSFER" },
];

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Nao informado";

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Nao informado";

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);

const getPaymentId = (payment: Payment) =>
  String(payment.paymentId ?? payment.id ?? "");

const resolveStudentName = (payment: Payment) =>
  payment.student?.name ??
  payment.enrollment?.student?.name ??
  payment.studentName ??
  payment.enrollment?.studentName ??
  `Aluno #${payment.studentId ?? payment.enrollment?.studentId ?? "-"}`;

const resolveStudentEmail = (payment: Payment) =>
  payment.student?.email ??
  payment.enrollment?.student?.email ??
  payment.studentEmail ??
  payment.enrollment?.studentEmail ??
  "Sem email";

const resolvePlanName = (payment: Payment) =>
  payment.planName ??
  payment.enrollment?.planName ??
  `Plano #${payment.planId ?? payment.enrollment?.planId ?? "-"}`;

const resolvePaymentMethod = (paymentMethod?: string | null) =>
  paymentMethod ? (paymentMethodLabels[paymentMethod] ?? paymentMethod) : "-";

const resolveEnrollmentOptionLabel = (enrollment: Enrollment) =>
  `${enrollment.student?.name ?? enrollment.studentName ?? `Aluno #${enrollment.studentId}`} - ${enrollment.plan?.name ?? enrollment.planName ?? `Plano #${enrollment.planId}`}`;

const isKnownPaymentMethod = (value?: string | null): value is PaymentMethod =>
  !!value && Object.prototype.hasOwnProperty.call(paymentMethodLabels, value);

export const PaymentsPage = () => {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState<PaymentFilterMode>("all");
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("all");
  const [studentId, setStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [payForm, setPayForm] = useState<PaymentPayFormData>(EMPTY_PAY_FORM);
  const debouncedStudentSearch = useDebouncedValue(studentSearch);

  const { data: students, isFetching: isFetchingStudents } =
    useGetStudentOptions(debouncedStudentSearch, filterMode === "student");
  const { data: enrollments } = useGetEnrollments({
    size: 100,
    sort: "createdAt,desc",
  });
  const { mutate: payPayment, isPending: isPayingPayment } = usePayPayment();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdatePaymentStatus();
  const { mutate: refreshOverdue, isPending: isRefreshingOverdue } =
    useRefreshOverduePayments();

  const paymentsQuery =
    filterMode === "student"
      ? ({ mode: "student", studentId } as const)
      : filterMode === "enrollment"
        ? ({ mode: "enrollment", enrollmentId } as const)
        : filterMode === "overdue"
          ? ({ mode: "overdue" } as const)
          : ({ mode: "all" } as const);

  const filterEnabled =
    filterMode === "student"
      ? studentId !== ""
      : filterMode === "enrollment"
        ? enrollmentId !== ""
        : true;

  const { data: payments, isLoading, isFetching } = useGetPayments(
    paymentsQuery,
    filterEnabled,
    {
      page,
      size,
    },
  );

  const visiblePayments = useMemo(() => {
    const source = filterEnabled ? (payments?.content ?? []) : [];

    if (statusFilter === "all") return source;

    return source.filter((payment) => payment.status === statusFilter);
  }, [filterEnabled, payments, statusFilter]);
  const tableLoading = isLoading || isFetching;

  const paidCount = useMemo(
    () => visiblePayments.filter((payment) => payment.status === "PAID").length,
    [visiblePayments],
  );

  const overdueCount = useMemo(
    () =>
      visiblePayments.filter((payment) => payment.status === "OVERDUE").length,
    [visiblePayments],
  );

  const pendingCount = useMemo(
    () =>
      visiblePayments.filter((payment) => payment.status === "PENDING").length,
    [visiblePayments],
  );

  const studentOptions =
    students?.map((student) => ({
      label: student.label,
      value: String(student.studentId),
      description: student.email,
    })) ?? [];

  const enrollmentOptions = [
    {
      label: "Selecione uma matricula",
      value: "",
      disabled: filterMode === "enrollment",
    },
    ...(enrollments?.content.map((enrollment) => ({
      label: resolveEnrollmentOptionLabel(enrollment),
      value: String(enrollment.enrollmentId),
    })) ?? []),
  ];

  const handleRefreshOverdue = () => {
    refreshOverdue(undefined, {
      onSuccess: () => {
        toast.success("Pagamentos vencidos atualizados com sucesso!");
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
    });
  };

  const openPayModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setPayForm({
      paidAt: "",
      paymentMethod: isKnownPaymentMethod(payment.paymentMethod)
        ? payment.paymentMethod
        : "",
      notes: payment.notes ?? "",
    });
  };

  const closePayModal = () => {
    if (isPayingPayment) return;

    setSelectedPayment(null);
    setPayForm(EMPTY_PAY_FORM);
  };

  const handlePayPayment = () => {
    if (!selectedPayment) return;

    const paymentId = getPaymentId(selectedPayment);

    payPayment(
      { id: paymentId, data: payForm },
      {
        onSuccess: () => {
          toast.success("Pagamento marcado como pago!");
          closePayModal();
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

  const handleMarkOverdue = (id: string) => {
    updateStatus(
      { id, newStatus: "OVERDUE" },
      {
        onSuccess: () => {
          toast.success("Pagamento marcado como atrasado!");
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

  const getPaymentActions = (payment: Payment): DropdownItem[] => {
    const paymentId = getPaymentId(payment);
    const busy = isPayingPayment || isUpdatingStatus;

    if (payment.status === "PAID") {
      return [
        {
          label: "Apenas visualizar",
          disabled: true,
        },
      ];
    }

    const actions: DropdownItem[] = [
      {
        label: "Marcar como pago",
        icon: <CheckCircle2 size={15} />,
        disabled: busy || !paymentId,
        onSelect: () => openPayModal(payment),
      },
    ];

    if (payment.status === "PENDING") {
      actions.push({
        label: "Marcar como atrasado",
        icon: <ClockAlert size={15} />,
        danger: true,
        disabled: busy || !paymentId,
        onSelect: () => handleMarkOverdue(paymentId),
      });
    }

    return actions;
  };

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
                visiblePayments.length
              )}
            </strong>
            <p className={styles.metricHint}>Pagamentos no recorte atual.</p>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Pagos</span>
            <strong className={styles.metricValue}>
              {tableLoading ? (
                <Skeleton width="48px" height="30px" />
              ) : (
                paidCount
              )}
            </strong>
            <p className={styles.metricHint}>Baixas confirmadas no sistema.</p>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Atrasados</span>
            <strong className={styles.metricValue}>
              {tableLoading ? (
                <Skeleton width="48px" height="30px" />
              ) : (
                overdueCount
              )}
            </strong>
            <p className={styles.metricHint}>Cobrancas vencidas no recorte.</p>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Pendentes</span>
            <strong className={styles.metricValue}>
              {tableLoading ? (
                <Skeleton width="48px" height="30px" />
              ) : (
                pendingCount
              )}
            </strong>
            <p className={styles.metricHint}>Aguardando confirmacao.</p>
          </div>
        </div>
      </section>

      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <strong className={styles.topBarTitle}>Filtros e acoes</strong>
          <span className={styles.topBarSubtitle}>
            Combine visao por aluno, matricula, atrasados e status financeiro.
          </span>
        </div>

        <div className={styles.topBarActions}>
          <SelectField
            label="Visao"
            id="paymentFilterMode"
            value={filterMode}
            onChange={(e) => {
              setFilterMode(e.target.value as PaymentFilterMode);
              setStudentId("");
              setStudentSearch("");
              setEnrollmentId("");
              setPage(0);
            }}
            options={[
              { label: "Todos", value: "all" },
              { label: "Por aluno", value: "student" },
              { label: "Por matricula", value: "enrollment" },
              { label: "Atrasados", value: "overdue" },
            ]}
            containerProps={{ className: styles.filterField }}
          />

          <SelectField
            label="Status"
            id="paymentStatusFilter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PaymentStatusFilter);
              setPage(0);
            }}
            options={[
              { label: "Todos", value: "all" },
              { label: "Pendente", value: "PENDING" },
              { label: "Pago", value: "PAID" },
              { label: "Atrasado", value: "OVERDUE" },
            ]}
            containerProps={{ className: styles.filterField }}
          />

          {filterMode === "student" && (
            <Autocomplete
              label="Aluno"
              id="paymentStudentFilter"
              search={studentSearch}
              onSearchChange={(value) => {
                setStudentSearch(value);
                setStudentId("");
                setPage(0);
              }}
              options={studentOptions}
              onSelect={(option) => {
                setStudentSearch(option.label);
                setStudentId(option.value);
                setPage(0);
              }}
              onClear={() => {
                setStudentSearch("");
                setStudentId("");
                setPage(0);
              }}
              loading={isFetchingStudents}
              placeholder="Digite nome, CPF ou e-mail"
              emptyMessage="Nenhum aluno encontrado."
              containerClassName={styles.filterFieldLarge}
            />
          )}

          {filterMode === "enrollment" && (
            <SelectField
              label="Matricula"
              id="paymentEnrollmentFilter"
              value={enrollmentId}
              onChange={(e) => {
                setEnrollmentId(e.target.value);
                setPage(0);
              }}
              options={enrollmentOptions}
              containerProps={{ className: styles.filterFieldLarge }}
            />
          )}

          <Button
            leftIcon={<RefreshCcw size={18} />}
            onClick={handleRefreshOverdue}
            loading={isRefreshingOverdue}
          >
            Atualizar vencidos
          </Button>
          <Button
            leftIcon={<PlusCircle size={18} />}
            onClick={() => navigate({ to: "/payments/create" })}
          >
            Nova cobranca
          </Button>
        </div>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Lista principal</h3>
            <p className={styles.sectionDescription}>
              Consulte aluno, plano, valor, vencimento, baixa, metodo e status
              financeiro em uma visao unica. Total encontrado:{" "}
              {payments?.totalElements ?? 0}.
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={paymentColumns} minWidth="1360px">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Aluno</TableHeaderCell>
                <TableHeaderCell>E-mail</TableHeaderCell>
                <TableHeaderCell>Plano</TableHeaderCell>
                <TableHeaderCell>Valor</TableHeaderCell>
                <TableHeaderCell>Vencimento</TableHeaderCell>
                <TableHeaderCell>Pagamento</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell>Metodo</TableHeaderCell>
                <TableHeaderCell>Observacoes</TableHeaderCell>
                <TableHeaderCell center>Acoes</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={10} />}

              {!tableLoading &&
                visiblePayments.map((payment) => (
                  <TableRow
                    key={
                      getPaymentId(payment) ||
                      `${payment.enrollmentId}-${payment.dueDate}`
                    }
                  >
                    <TableCell>
                      <div className={styles.nameCell}>
                        <span className={styles.namePrimary}>
                          {resolveStudentName(payment)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{resolveStudentEmail(payment)}</TableCell>
                    <TableCell>{resolvePlanName(payment)}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{formatDate(payment.dueDate)}</TableCell>
                    <TableCell>{formatDateTime(payment.paidAt)}</TableCell>
                    <TableCell center>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${payment.status}`]
                        }`}
                      >
                        {statusLabels[payment.status] ?? payment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {resolvePaymentMethod(payment.paymentMethod)}
                    </TableCell>
                    <TableCell className={styles.notesCell}>
                      {payment.notes || "-"}
                    </TableCell>
                    <TableCell center>
                      <Dropdown items={getPaymentActions(payment)} />
                    </TableCell>
                  </TableRow>
                ))}

              {!tableLoading && visiblePayments.length === 0 && (
                <TableEmptyState
                  colSpan={10}
                  message="Nenhum pagamento encontrado para os filtros atuais."
                />
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          page={payments}
          currentPage={page}
          loading={isFetching}
          onPageChange={setPage}
          onSizeChange={(nextSize) => {
            setSize(nextSize);
            setPage(0);
          }}
        />
      </section>

      {selectedPayment && (
        <div className={styles.modalOverlay} role="presentation">
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payPaymentTitle"
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalEyebrow}>Baixa de pagamento</span>
                <h3 className={styles.modalTitle} id="payPaymentTitle">
                  Marcar cobranca como paga
                </h3>
                <p className={styles.modalDescription}>
                  Todos os campos sao opcionais. Se a data ficar vazia, o
                  backend usa o horario atual.
                </p>
              </div>

              <button
                className={styles.modalClose}
                onClick={closePayModal}
                aria-label="Fechar modal"
                disabled={isPayingPayment}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalSummary}>
              <div>
                <span>Aluno</span>
                <strong>{resolveStudentName(selectedPayment)}</strong>
              </div>
              <div>
                <span>Valor</span>
                <strong>{formatCurrency(selectedPayment.amount)}</strong>
              </div>
              <div>
                <span>Vencimento</span>
                <strong>{formatDate(selectedPayment.dueDate)}</strong>
              </div>
            </div>

            <div className={styles.modalFields}>
              <TextField
                label="Data/hora do pagamento"
                id="paidAt"
                type="datetime-local"
                value={payForm.paidAt}
                onChange={(e) =>
                  setPayForm((prev) => ({ ...prev, paidAt: e.target.value }))
                }
              />

              <SelectField
                label="Forma de pagamento"
                id="payPaymentMethod"
                value={payForm.paymentMethod}
                onChange={(e) =>
                  setPayForm((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value as PaymentMethod,
                  }))
                }
                options={paymentMethodOptions}
              />

              <TextField
                label="Observacoes"
                id="payNotes"
                value={payForm.notes}
                onChange={(e) =>
                  setPayForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Pago na recepcao"
              />
            </div>

            <div className={styles.modalActions}>
              <Button onClick={closePayModal} disabled={isPayingPayment}>
                Cancelar
              </Button>
              <Button
                onClick={handlePayPayment}
                loading={isPayingPayment}
                leftIcon={<CheckCircle2 size={18} />}
              >
                Confirmar pagamento
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
