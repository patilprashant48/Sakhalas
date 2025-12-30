import apiClient from './axios';
import type { Expense, ApprovalAction, ApprovalHistoryItem, PaymentFormData } from '../types/expense.types';

export const expenseApi = {
  getAll: async (params?: { 
    projectId?: string; 
    status?: string; 
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Expense[]> => {
    const response = await apiClient.get<{ success: boolean; data: Expense[] }>('/expenses', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Expense> => {
    const response = await apiClient.get<{ success: boolean; data: Expense }>(`/expenses/${id}`);
    return response.data.data;
  },

  create: async (data: FormData): Promise<Expense> => {
    const response = await apiClient.post<{ success: boolean; data: Expense }>('/expenses', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  update: async (id: string, data: FormData): Promise<Expense> => {
    const response = await apiClient.put<{ success: boolean; data: Expense }>(`/expenses/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  approve: async (data: ApprovalAction): Promise<Expense> => {
    const response = await apiClient.post<{ success: boolean; data: Expense }>('/expenses/approve', data);
    return response.data.data;
  },

  addPayment: async (expenseId: string, data: FormData): Promise<Expense> => {
    const response = await apiClient.post<{ success: boolean; data: Expense }>(
      `/expenses/${expenseId}/payments`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  getApprovalHistory: async (expenseId: string): Promise<ApprovalHistoryItem[]> => {
    const response = await apiClient.get<{ success: boolean; data: ApprovalHistoryItem[] }>(`/expenses/${expenseId}/history`);
    return response.data.data;
  },

  getPendingApprovals: async (): Promise<Expense[]> => {
    const response = await apiClient.get<{ success: boolean; data: Expense[] }>('/expenses/pending-approvals');
    return response.data.data;
  },
};
