import { Button } from "@/components/Button/Button";
import { Form } from "@/components/Form/Form";
import {
  isInvalidParameterError,
  isResourceNotFoundError,
} from "@/components/DetailLoadState/detailLoadError";

import styles from "./DetailLoadState.module.css";

export type DetailLoadStateEntity = {
  name: string;
  article: "este" | "esta";
  pronoun: "ele" | "ela";
};

type DetailLoadStateProps = {
  entity: DetailLoadStateEntity;
  listLabel?: string;
  loading?: boolean;
  error?: unknown;
  onBack: () => void;
};

export const DetailLoadState = ({
  entity,
  listLabel = "listagem",
  loading = false,
  error,
  onBack,
}: DetailLoadStateProps) => {
  const isInvalidParameter = isInvalidParameterError(error);
  const isNotFound = !error || isResourceNotFoundError(error);
  const title = isInvalidParameter
    ? "Identificador inválido"
    : isNotFound
      ? `${entity.name} não encontrado`
      : `Erro ao carregar ${entity.name.toLowerCase()}`;
  const description = `Não foi possível carregar ${entity.article} ${entity.name.toLowerCase()}.`;
  const message = isInvalidParameter
    ? `O identificador informado é inválido. Volte para a ${listLabel} e tente acessar novamente.`
    : isNotFound
      ? `Verifique se ${entity.pronoun} ainda existe ou volte para a ${listLabel}.`
      : `Tente novamente em instantes ou volte para a ${listLabel}.`;

  return (
    <Form
      title={title}
      description={description}
      loading={loading}
      actions={
        <Button variant="secondary" onClick={onBack}>
          Voltar para listagem
        </Button>
      }
    >
      <div className={styles.message}>{message}</div>
    </Form>
  );
};
