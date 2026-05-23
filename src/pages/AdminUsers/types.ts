export type AdminUserRole = "ADMIN" | "RECEPTION";

export type AdminUser = {
  userId?: number;
  id?: number;
  name: string;
  email: string;
  role: AdminUserRole;
  active?: boolean;
  createdAt?: string;
};

export type AdminUserCreateFormData = {
  name: string;
  email: string;
  password: string;
  role: AdminUserRole;
};
