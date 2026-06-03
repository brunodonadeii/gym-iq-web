export type AdminUserRole = "ADMIN" | "RECEPTION";

export type AdminUser = {
  userId?: string;
  id?: string;
  name: string;
  email: string;
  role: AdminUserRole;
  active?: boolean;
  lgpdAccepted?: boolean;
  lgpdAcceptedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUserCreateFormData = {
  name: string;
  email: string;
  password: string;
  role: AdminUserRole;
  lgpdAccepted: boolean;
};

export type AdminUserUpdateFormData = {
  name: string;
  email: string;
  role: AdminUserRole;
  lgpdAccepted: boolean;
};
