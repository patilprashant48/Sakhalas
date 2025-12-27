export interface CompanyKPIs {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  pendingApprovals: number;
  overduePayments: number;
  // Financial Liabilities
  totalApprovedUnpaid: number; // Total amount approved but not yet paid
  totalOverdueAmount: number; // Sum of all overdue payment amounts
  upcomingPaymentsCount: number; // Number of payments due in next 7 days
  upcomingPaymentsAmount: number; // Total amount due in next 7 days
}

export interface ExpensesByProject {
  projectName: string;
  amount: number;
  percentage: number;
}

export interface ExpensesByCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface OverduePayment {
  id: string;
  projectName: string;
  vendor: string;
  amount: number;
  dueDate: string;
  overdueDays: number;
}

export interface UpcomingPayment {
  id: string;
  projectName: string;
  vendor: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  category: string;
}

export interface TodayPayment {
  id: string;
  projectName: string;
  vendor: string;
  amount: number;
  category: string;
  status: string;
}

export interface ProjectDashboardData {
  project: {
    id: string;
    name: string;
    budget: number;
    spent: number;
  };
  budgetVsSpent: {
    month: string;
    budget: number;
    spent: number;
  }[];
  approvalPipeline: {
    status: string;
    count: number;
    amount: number;
  }[];
  upcomingPayments: {
    date: string;
    vendor: string;
    amount: number;
  }[];
}
