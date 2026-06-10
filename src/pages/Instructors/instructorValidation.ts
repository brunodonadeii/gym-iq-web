import type {
  InstructorCreateFormData,
  InstructorUpdateFormData,
} from "@/pages/Instructors/types";
import { INSTRUCTOR_SPECIALTY_OPTIONS } from "@/pages/Instructors/specialties";

export const INSTRUCTOR_LIMITS = {
  name: {
    minLength: 2,
    maxLength: 100,
  },
  password: {
    minLength: 6,
  },
  cref: {
    maxLength: 11,
  },
  phone: {
    maxLength: 20,
  },
  specialty: {
    maxLength: 100,
  },
} as const;

export type InstructorFormField = keyof InstructorCreateFormData;
export type InstructorFormErrors = Partial<
  Record<InstructorFormField, string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateCommonFields = (
  data: InstructorUpdateFormData,
): InstructorFormErrors => {
  const errors: InstructorFormErrors = {};
  const name = data.name.trim();
  const email = data.email.trim();
  const cref = data.cref.trim();
  const phone = data.phone.trim();
  const specialty = data.specialty.trim();

  if (!name) {
    errors.name = "Informe o nome.";
  } else if (
    name.length < INSTRUCTOR_LIMITS.name.minLength ||
    name.length > INSTRUCTOR_LIMITS.name.maxLength
  ) {
    errors.name = "O nome deve ter entre 2 e 100 caracteres.";
  }

  if (!email) {
    errors.email = "Informe o e-mail.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!cref) {
    errors.cref = "Informe o CREF.";
  } else if (!/^\d{6}-[A-Z]\/[A-Z]{2}$/.test(cref)) {
    errors.cref = "Informe o CREF no formato 123456-G/SP.";
  }

  if (!phone) {
    errors.phone = "Informe o telefone.";
  } else if (phone.length > INSTRUCTOR_LIMITS.phone.maxLength) {
    errors.phone = "O telefone deve ter no máximo 20 caracteres.";
  }

  if (!specialty) {
    errors.specialty = "Selecione uma especialidade.";
  } else if (specialty.length > INSTRUCTOR_LIMITS.specialty.maxLength) {
    errors.specialty = "A especialidade deve ter no máximo 100 caracteres.";
  } else if (!INSTRUCTOR_SPECIALTY_OPTIONS.some((item) => item === specialty)) {
    errors.specialty = "Selecione uma especialidade válida.";
  }

  return errors;
};

export const validateInstructorCreate = (
  data: InstructorCreateFormData,
): InstructorFormErrors => {
  const errors = validateCommonFields(data);

  if (!data.password) {
    errors.password = "Informe a senha.";
  } else if (data.password.length < INSTRUCTOR_LIMITS.password.minLength) {
    errors.password = "A senha deve ter no mínimo 6 caracteres.";
  }

  if (!data.lgpdAccepted) {
    errors.lgpdAccepted = "É necessário aceitar os termos de LGPD.";
  }

  return errors;
};

export const validateInstructorUpdate = (
  data: InstructorUpdateFormData,
): InstructorFormErrors => validateCommonFields(data);

export const formatCrefInput = (value: string) => {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const registration = compact.replace(/\D/g, "").slice(0, 6);

  if (registration.length < 6) {
    return registration;
  }

  const letters = compact.slice(6).replace(/[^A-Z]/g, "").slice(0, 3);
  const category = letters.slice(0, 1);
  const state = letters.slice(1, 3);

  return [
    registration,
    category ? `-${category}` : "",
    state ? `/${state}` : "",
  ].join("");
};
