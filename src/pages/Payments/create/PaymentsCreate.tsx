import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import { SelectField } from "@/components/SelectField/SelectField";
import { TextField } from "@/components/TextField/TextField";
import { useFormInputs } from "@/hooks/useFormInputs";
import { useCreatePayment } from "@/mutations/useCreatePayment";
import type { Enrollment } from "@/pages/Enrollments/types";
import type { PaymentCreateFormData } from "@/pages/Payments/types";
import { useGetEnrollments } from "@/queries/useGetEnrollments";
import { useNavigate } from "@tanstack/react-router";
import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import styles from "./PaymentsCreate.module.css";

const EMPTY_FORM: PaymentCreateFormData = {
  enrollmentId: "",
  amount: "",
  dueDate: "",
  paymentMethod: "",
  notes: "",
};

const paymentMethodOptions = [
  { label: "Nao informar agora", value: "" },
  { label: "PIX", value: "PIX" },
  { label: "Dinheiro", value: "CASH" },
  { label: "Cartao de credito", value: "CREDIT_CARD" },
  { label: "Cartao de debito", value: "DEBIT_CARD" },
  { label: "Transferencia bancaria", value: "BANK_TRANSFER" },
];

const resolveEnrollmentOptionLabel = (enrollment: Enrollment) =>
  `${enrollment.student?.name ?? enrollment.studentName ?? `Aluno #${enrollment.studentId}`} - ${enrollment.plan?.name ?? enrollment.planName ?? `Plano #${enrollment.planId}`}`;

export const PaymentsCreate = () => {
  const [data, setData] = useState<PaymentCreateFormData>(EMPTY_FORM);
  const { set, setMasked } = useFormInputs(setData);
  const navigate = useNavigate();
  const { data: enrollments, isLoading } = useGetEnrollments({
    size: 100,
    sort: "createdAt,desc",
  });
  const { mutate, isPending } = useCreatePayment();

  const activeEnrollments = useMemo(
    () =>
      enrollments?.content.filter((enrollment) => enrollment.status === "ACTIVE") ??
      [],
    [enrollments],
  );

  const selectedEnrollment = activeEnrollments.find(
    (enrollment) => String(enrollment.enrollmentId) === data.enrollmentId,
  );

  const enrollmentOptions = [
    { label: "Selecione uma matricula", value: "", disabled: true },
    ...activeEnrollments.map((enrollment) => ({
      label: resolveEnrollmentOptionLabel(enrollment),
      value: String(enrollment.enrollmentId),
    })),
  ];

  const handleEnrollmentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextEnrollmentId = e.target.value;
    const nextEnrollment = activeEnrollments.find(
      (enrollment) => String(enrollment.enrollmentId) === nextEnrollmentId,
    );

    setData((prev) => ({
      ...prev,
      enrollmentId: nextEnrollmentId,
      amount:
        nextEnrollment?.plan?.monthlyPrice !== undefined
          ? nextEnrollment.plan.monthlyPrice.toFixed(2)
          : prev.amount,
    }));
  };

  const handleSubmit = () => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Cobranca criada com sucesso!");
        navigate({ to: "/payments" });
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

  return (
    <Form
      title="Dados da cobranca"
      description="Vincule a cobranca a uma matricula e informe valor e vencimento."
      loading={isLoading}
      actions={
        <>
          <Button
            onClick={() => navigate({ to: "/payments" })}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isPending}
            disabled={!data.enrollmentId || !data.dueDate}
          >
            Salvar
          </Button>
        </>
      }
    >
      <div className={styles.row}>
        <SelectField
          label="Matricula"
          id="enrollmentId"
          value={data.enrollmentId}
          onChange={handleEnrollmentChange}
          options={enrollmentOptions}
          required
        />
      </div>

      <div className={styles.row}>
        <TextField
          label="Valor"
          id="amount"
          value={data.amount}
          onChange={setMasked("amount", "#####.##")}
          placeholder="150.00"
          helperText={
            selectedEnrollment?.plan?.monthlyPrice !== undefined
              ? "Preenchido com o valor mensal do plano, mas pode ser ajustado."
              : "Opcional. Se ficar vazio, o backend usa o valor mensal do plano."
          }
        />
        <TextField
          label="Vencimento"
          id="dueDate"
          type="date"
          value={data.dueDate}
          onChange={set("dueDate")}
          required
        />
      </div>

      <div className={styles.row}>
        <SelectField
          label="Forma de pagamento"
          id="paymentMethod"
          value={data.paymentMethod}
          onChange={set("paymentMethod")}
          options={paymentMethodOptions}
        />
        <TextField
          label="Observacoes"
          id="notes"
          value={data.notes}
          onChange={set("notes")}
          placeholder="Mensalidade de maio"
        />
      </div>
    </Form>
  );
};
