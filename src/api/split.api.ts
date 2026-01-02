import axiosInstance from './axios';
import type {
  ExpenseSplit,
  SplitFormData,
  UserBalances,
  Settlement,
  SettlementFormData,
} from '../types/split.types';

export const splitApi = {
  // Create expense split
  create: async (data: SplitFormData): Promise<ExpenseSplit> => {
    const response = await axiosInstance.post('/splits', data);
    return response.data.data;
  },

  // Get split by expense ID
  getByExpenseId: async (expenseId: string): Promise<ExpenseSplit> => {
    const response = await axiosInstance.get(`/splits/expense/${expenseId}`);
    return response.data.data;
  },

  // Mark participant as paid
  markPaid: async (splitId: string, participantUserId: string): Promise<ExpenseSplit> => {
    const response = await axiosInstance.patch(
      `/splits/${splitId}/participant/${participantUserId}/paid`
    );
    return response.data.data;
  },

  // Get user balances
  getBalances: async (groupId?: string): Promise<UserBalances> => {
    const params = groupId ? { groupId } : {};
    const response = await axiosInstance.get('/splits/balances', { params });
    return response.data.data;
  },

  // Create settlement
  createSettlement: async (data: SettlementFormData): Promise<Settlement> => {
    const response = await axiosInstance.post('/splits/settlements', data);
    return response.data.data;
  },

  // Get settlement history
  getSettlements: async (groupId?: string): Promise<Settlement[]> => {
    const params = groupId ? { groupId } : {};
    const response = await axiosInstance.get('/splits/settlements', { params });
    return response.data.data;
  },
};
