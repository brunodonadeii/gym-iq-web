export type RetentionRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RetentionAlertStatus = "OPEN" | "RESOLVED";

export type RetentionAlert = {
  retentionAlertId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  riskScore: number;
  riskLevel: RetentionRiskLevel;
  inactiveDays: number;
  overduePayments: number;
  message: string;
  status: RetentionAlertStatus;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RetentionDashboard = {
  activeStudents: number;
  openAlerts: number;
  lowRiskStudents: number;
  mediumRiskStudents: number;
  highRiskStudents: number;
  criticalRiskStudents: number;
  averageRiskScore: number;
  studentsWithoutCheckInOver15Days: number;
  studentsWithOverduePayments: number;
  topRiskStudents: RetentionAlert[];
  generatedAt: string;
};

export type FinancialDashboard = {
  paidAmountCurrentMonth: number;
  pendingAmountCurrentMonth: number;
  overdueAmountCurrentMonth: number;
  projectedRevenueCurrentMonth: number;
  paidPaymentsCurrentMonth: number;
  pendingPaymentsCurrentMonth: number;
  overduePaymentsCurrentMonth: number;
  defaultRate: number;
  generatedAt: string;
};

export type OperationsDashboard = {
  checkInsToday: number;
  openCheckIns: number;
  activeEnrollments: number;
  suspendedEnrollments: number;
  canceledEnrollments: number;
  enrollmentsExpiringInNext7Days: number;
  newStudentsCurrentMonth: number;
  generatedAt: string;
};
