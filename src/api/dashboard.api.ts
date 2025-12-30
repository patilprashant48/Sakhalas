import apiClient from './axios';
import type { 
  CompanyDashboardData, 
  ProjectDashboardData, 
  TodayPayment 
} from '../types/dashboard.types';

export const dashboardApi = {
  getCompanyData: async (): Promise<CompanyDashboardData> => {
    const response = await apiClient.get<{ success: boolean; data: CompanyDashboardData }>('/dashboard/company');
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
