import apiClient from './axios';
import type {
  CompanyKPIs,
  ExpensesByProject,
  ExpensesByCategory,
  OverduePayment,
  UpcomingPayment,
  ProjectDashboardData,
  TodayPayment,
} from '../types/dashboard.types';

export const dashboardApi = {
  getCompanyKPIs: async (): Promise<CompanyKPIs> => {
    const response = await apiClient.get<{ success: boolean; data: unknown }>('/dashboard/company');
    const respObj = response.data.data as Record<string, unknown> | undefined;
    const summary = (respObj && (respObj.summary as Record<string, unknown>)) || {};
    return {
      totalProjects: summary.totalProjects || 0,
      activeProjects: summary.activeProjects || 0,
      totalBudget: summary.totalBudget || 0,
      totalSpent: summary.totalSpent || 0,
      budgetUtilization: summary.totalBudget > 0 ? (summary.totalSpent / summary.totalBudget) * 100 : 0,
      pendingApprovals: summary.pendingApprovals || 0,
      overduePayments: summary.totalOverdueAmount ? Math.ceil(summary.totalOverdueAmount) : 0,
      totalApprovedUnpaid: summary.totalApprovedUnpaid || 0,
      totalOverdueAmount: summary.totalOverdueAmount || 0,
      upcomingPaymentsCount: summary.upcomingPaymentsCount || 0,
      upcomingPaymentsAmount: summary.upcomingPaymentsAmount || 0,
    } as CompanyKPIs;
  },

  getExpensesByProject: async (): Promise<ExpensesByProject[]> => {
    const response = await apiClient.get<{ success: boolean; data: ExpensesByProject[] }>('/dashboard/expenses-by-project');
    return response.data.data;
  },

  getExpensesByCategory: async (): Promise<ExpensesByCategory[]> => {
    const response = await apiClient.get<{ success: boolean; data: ExpensesByCategory[] }>('/dashboard/expenses-by-category');
    return response.data.data;
  },

  getOverduePayments: async (): Promise<OverduePayment[]> => {
    const response = await apiClient.get<{ success: boolean; data: OverduePayment[] }>('/dashboard/overdue-payments');
    return response.data.data;
  },

  getUpcomingPayments: async (): Promise<UpcomingPayment[]> => {
    const response = await apiClient.get<{ success: boolean; data: UpcomingPayment[] }>('/dashboard/upcoming-payments');
    return response.data.data;
  },

  getCompanyData: async (): Promise<unknown> => {
    const response = await apiClient.get<{ success: boolean; data: unknown }>('/dashboard/company');
    return response.data.data;
  },

  getProjectData: async (projectId: string): Promise<ProjectDashboardData> => {
    const response = await apiClient.get<{ success: boolean; data: ProjectDashboardData }>(`/dashboard/project/${projectId}`);
    return response.data.data;
  },

  getTodayPayments: async (): Promise<TodayPayment[]> => {
    const response = await apiClient.get<{ success: boolean; data: TodayPayment[] }>('/dashboard/today-payments');
    return response.data.data;
  },
};
