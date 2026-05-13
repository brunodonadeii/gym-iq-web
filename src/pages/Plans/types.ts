export type Plan = {
  planId: number;
  name: string;
  description: string;
  monthlyPrice: number;
  durationDays: number;
  active: boolean;
  createdAt: string;
};

export type PlanFormData = {
  name: string;
  description: string;
  monthlyPrice: number;
  durationDays: number;
};
