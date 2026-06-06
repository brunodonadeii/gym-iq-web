import { Autocomplete } from "@/components/Autocomplete/Autocomplete";
import { Button } from "@/components/Button/Button";
import { Dropdown, type DropdownItem } from "@/components/Dropdown/Dropdown";
import { Pagination } from "@/components/Pagination/Pagination";
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
import { getApiFieldErrors } from "@/utils/apiError";
import { CheckCircle2, ClockAlert, RefreshCcw, X } from "lucide-react";
import { useState } from "react";
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
  { width: "24%" },
  { width: "22%" },
  { width: "16%" },
  { width: "16%" },
  { width: "12%" },
  { width: "10%" },
];

const statusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Atrasado",
  CANCELED: "Cancelado",
};

const paymentMethodLabels: Record<string, string> = {
  PIX: "PIX",
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  BANK_TRANSFER: "Transferência",
};

const paymentMethodOptions = [
  { label: "Não informar", value: "" },
  { label: "PIX", value: "PIX" },
  { label: "Dinheiro", value: "CASH" },
  { label: "Cartão de crédito", value: "CREDIT_CARD" },
  { label: "Cartão de débito", value: "DEBIT_CARD" },
  { label: "Transferência bancária", value: "BANK_TRANSFER" },
];

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Não informado";

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

const resolvePlanName = (payment: Payment) =>
  payment.planName ??
  payment.enrollment?.planName ??
  `Plano #${payment.planId ?? payment.enrollment?.planId ?? "-"}`;

const resolveEnrollmentOptionLabel = (enrollment: Enrollment) =>
  `${enrollment.student?.name ?? enrollment.studentName ?? `Aluno #${enrollment.studentId}`} - ${enrollment.plan?.name ?? enrollment.planName ?? `Plano #${enrollment.planId}`}`;

const isKnownPaymentMethod = (value?: string | null): value is PaymentMethod =>
  !!value && Object.prototype.hasOwnProperty.call(paymentMethodLabels, value);

export const PaymentsPage = () => {
  const [filterMode, setFilterMode] = useState<PaymentFilterMode>("all");
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("all");
  const [studentId, setStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [enrollmentId, setEnrollmentId] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [payForm, setPayForm] = useState<PaymentPayFormData>(EMPTY_PAY_FORM);
  const [payFormErrors, setPayFormErrors] = useState<
    Partial<Record<keyof PaymentPayFormData, string>>
  >({});
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

  const effectiveStatusFilter =
    filterMode === "overdue"
      ? "OVERDUE"
      : statusFilter === "all"
        ? undefined
        : statusFilter;

  const filterEnabled =
    filterMode === "student"
      ? studentId !== ""
      : filterMode === "enrollment"
        ? enrollmentId !== ""
        : true;

  const {
    data: payments,
    isLoading,
    isFetching,
  } = useGetPayments(
    {
      ...paymentsQuery,
      ...(effectiveStatusFilter ? { status: effectiveStatusFilter } : {}),
    },
    filterEnabled,
    {
      page,
      size,
    },
  );

  const visiblePayments = filterEnabled ? (payments?.content ?? []) : [];
  const tableLoading = isLoading || isFetching;

  const studentOptions =
    students?.map((student) => ({
      label: student.label,
      value: String(student.studentId),
      description: student.email,
    })) ?? [];

  const enrollmentOptions = [
    {
      label: "Selecione uma matrícula",
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
            <strong>{e?.error ?? "Erro"}</strong>
            <br />
            <span>{e?.message ?? "Erro inesperado"}</span>
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
    setPayFormErrors({});
  };

  const closePayModal = () => {
    if (isPayingPayment) return;

    setSelectedPayment(null);
    setPayForm(EMPTY_PAY_FORM);
    setPayFormErrors({});
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
          const fieldErrors = getApiFieldErrors(e, [
            "paidAt",
            "paymentMethod",
            "notes",
          ] as const);

          if (fieldErrors) {
            setPayFormErrors(fieldErrors);
            document.getElementById(Object.keys(fieldErrors)[0])?.focus();
            return;
          }

          toast.error(
            <div>
              <strong>{e?.error ?? "Erro"}</strong>
              <br />
              <span>{e?.message ?? "Erro inesperado"}</span>
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
              <strong>{e?.error ?? "Erro"}</strong>
              <br />
              <span>{e?.message ?? "Erro inesperado"}</span>
            </div>,
          );
        },
      },
    );
  };

  const getPaymentActions = (payment: Payment): DropdownItem[] => {
    const paymentId = getPaymentId(payment);
    const busy = isPayingPayment || isUpdatingStatus;

    if (payment.status === "PAID" || payment.status === "CANCELED") {
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
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <strong className={styles.topBarTitle}>Filtros e ações</strong>
          <span className={styles.topBarSubtitle}>
            Combine visão por aluno, matrícula, atrasados e status financeiro.
          </span>
        </div>

        <div className={styles.topBarActions}>
          <SelectField
            label="Visão"
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
              { label: "Por matrícula", value: "enrollment" },
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
              { label: "Cancelado", value: "CANCELED" },
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
              placeholder="Digite o nome ou o CPF/e-mail completos"
              emptyMessage="Nenhum aluno encontrado."
              containerClassName={styles.filterFieldLarge}
            />
          )}

          {filterMode === "enrollment" && (
            <SelectField
              label="Matrícula"
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
        </div>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Lista principal</h3>
            <p className={styles.sectionDescription}>
              Consulte os pagamentos com foco no que importa para acao rapida.
              Total encontrado: {payments?.totalElements ?? 0}.
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <Table columns={paymentColumns} minWidth="920px">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Plano</TableHeaderCell>
                <TableHeaderCell>Valor</TableHeaderCell>
                <TableHeaderCell>Vencimento</TableHeaderCell>
                <TableHeaderCell center>Status</TableHeaderCell>
                <TableHeaderCell center>Ações</TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableLoading && <TableSkeletonRows columns={6} />}

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
                    <TableCell>{resolvePlanName(payment)}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{formatDate(payment.dueDate)}</TableCell>
                    <TableCell center>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${payment.status}`]
                        }`}
                      >
                        {statusLabels[payment.status] ?? payment.status}
                      </span>
                    </TableCell>
                    <TableCell center>
                      <Dropdown items={getPaymentActions(payment)} />
                    </TableCell>
                  </TableRow>
                ))}

              {!tableLoading && visiblePayments.length === 0 && (
                <TableEmptyState
                  colSpan={6}
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
          <form
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payPaymentTitle"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (!isPayingPayment) handlePayPayment();
            }}
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
                type="button"
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
                optional
                onChange={(e) => {
                  setPayForm((prev) => ({ ...prev, paidAt: e.target.value }));
                  setPayFormErrors((prev) => ({ ...prev, paidAt: undefined }));
                }}
                error={payFormErrors.paidAt}
              />

              <SelectField
                label="Forma de pagamento"
                id="payPaymentMethod"
                value={payForm.paymentMethod}
                optional
                onChange={(e) => {
                  setPayForm((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value as PaymentMethod,
                  }));
                  setPayFormErrors((prev) => ({
                    ...prev,
                    paymentMethod: undefined,
                  }));
                }}
                options={paymentMethodOptions}
                error={payFormErrors.paymentMethod}
              />

              <TextField
                label="Observações"
                id="payNotes"
                value={payForm.notes}
                optional
                onChange={(e) => {
                  setPayForm((prev) => ({ ...prev, notes: e.target.value }));
                  setPayFormErrors((prev) => ({ ...prev, notes: undefined }));
                }}
                placeholder="Pago na recepção"
                error={payFormErrors.notes}
              />
            </div>

            <div className={styles.modalActions}>
              <Button type="button" onClick={closePayModal} disabled={isPayingPayment}>
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isPayingPayment}
                leftIcon={<CheckCircle2 size={18} />}
              >
                Confirmar pagamento
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};




