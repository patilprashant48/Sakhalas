import apiClient from './axios';
import type { Expense, ApprovalAction, ApprovalHistoryItem } from '../types/expense.types';

// Mock expenses for demo mode
const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    projectId: '1',
    projectName: 'Website Redesign',
    category: 'Infrastructure',
    amount: 2500,
    vendor: 'AWS Cloud Services',
    description: 'Cloud hosting services',
    date: '2025-12-20',
    status: 'Approved',
    submittedBy: 'emp1',
    submittedByName: 'John Doe',
    submittedAt: '2025-12-20T10:00:00Z',
    isOverdue: false,
    paidAmount: 2500,
    paymentProofs: [
      {
        id: 'p1',
        amount: 2500,
        paidAt: '2025-12-21T10:00:00Z',
        paidBy: 'treasurer@company.com',
        notes: 'Paid via bank transfer',
      },
    ],
  },
  {
    id: '2',
    projectId: '2',
    projectName: 'Mobile App Development',
    category: 'Services',
    amount: 1200,
    vendor: 'Adobe Inc.',
    description: 'Design software license',
    date: '2025-12-22',
    status: 'Pending',
    submittedBy: 'emp2',
    submittedByName: 'Jane Smith',
    submittedAt: '2025-12-22T14:30:00Z',
    isOverdue: false,
    paidAmount: 0,
    paymentProofs: [],
  },
  {
    id: '3',
    projectId: '1',
    projectName: 'Website Redesign',
    category: 'Marketing',
    amount: 850,
    vendor: 'PrintPro Services',
    description: 'Marketing materials',
    date: '2025-12-23',
    status: 'Pending',
    submittedBy: 'emp3',
    submittedByName: 'Mike Johnson',
    submittedAt: '2025-12-23T09:15:00Z',
    isOverdue: false,
    paidAmount: 0,
    paymentProofs: [],
  },
];

export const expenseApi = {
  getAll: async (params?: { 
    projectId?: string; 
    status?: string; 
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Expense[]> => {
    try {
      const response = await apiClient.get<Expense[]>('/expenses', { params });
      return response.data;
    } catch (error) {
      console.log('Using mock expenses (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filtered = [...MOCK_EXPENSES];
      if (params?.projectId) {
        filtered = filtered.filter(e => e.projectId === params.projectId);
      }
      if (params?.status) {
        filtered = filtered.filter(e => e.status === params.status);
      }
      if (params?.category) {
        filtered = filtered.filter(e => e.category === params.category);
      }
      return filtered;
    }
  },

  getById: async (id: string): Promise<Expense> => {
    try {
      const response = await apiClient.get<Expense>(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.log('Using mock expense (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      const expense = MOCK_EXPENSES.find(e => e.id === id);
      if (!expense) throw new Error('Expense not found');
      return expense;
    }
  },

  create: async (data: FormData): Promise<Expense> => {
    try {
      const response = await apiClient.post<Expense>('/expenses', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.log('Mock create expense (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: String(MOCK_EXPENSES.length + 1),
        projectId: data.get('projectId') as string || '1',
        projectName: 'Sample Project',
        vendor: data.get('vendor') as string || 'Sample Vendor',
        description: data.get('description') as string || '',
        amount: Number(data.get('amount')) || 0,
        category: (data.get('category') as string || 'Other') as any,
        date: data.get('date') as string || new Date().toISOString().split('T')[0],
        status: 'Pending',
        submittedBy: 'user1',
        submittedByName: 'Current User',
        submittedAt: new Date().toISOString(),
        isOverdue: false,
        paidAmount: 0,
        paymentProofs: [],
      };
    }
  },

  update: async (id: string, data: FormData): Promise<Expense> => {
    try {
      const response = await apiClient.put<Expense>(`/expenses/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.log('Mock update expense (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      const expense = MOCK_EXPENSES.find(e => e.id === id);
      if (!expense) throw new Error('Expense not found');
      return expense;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/expenses/${id}`);
    } catch (error) {
      console.log('Mock delete expense (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  },

  approve: async (data: ApprovalAction): Promise<Expense> => {
    try {
      const response = await apiClient.post<Expense>('/expenses/approve', data);
      return response.data;
    } catch (error) {
      console.log('Mock approve expense (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      const expense = MOCK_EXPENSES.find(e => e.id === data.expenseId);
      if (!expense) throw new Error('Expense not found');
      return { ...expense, status: data.action === 'approve' ? 'Approved' : 'Rejected' };
    }
  },

  addPayment: async (expenseId: string, data: FormData): Promise<Expense> => {
    try {
      const response = await apiClient.post<Expense>(
        `/expenses/${expenseId}/payments`,
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.log('Mock add payment (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      const expense = MOCK_EXPENSES.find(e => e.id === expenseId);
      if (!expense) throw new Error('Expense not found');
      return { ...expense, status: 'Paid' };
    }
  },

  getApprovalHistory: async (expenseId: string): Promise<ApprovalHistoryItem[]> => {
    try {
      const response = await apiClient.get<ApprovalHistoryItem[]>(`/expenses/${expenseId}/history`);
      return response.data;
    } catch (error) {
      console.log('Mock approval history (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          id: '1',
          action: 'submitted',
          performedBy: 'user1',
          performedByName: 'John Doe',
          performedAt: '2025-12-20T10:00:00Z',
          comment: 'Initial submission',
        },
        {
          id: '2',
          action: 'approved',
          performedBy: 'manager1',
          performedByName: 'Sarah Manager',
          performedAt: '2025-12-21T09:30:00Z',
          comment: 'Approved for payment',
        },
      ];
    }
  },

  getPendingApprovals: async (): Promise<Expense[]> => {
    try {
      const response = await apiClient.get<Expense[]>('/expenses/pending-approvals');
      return response.data;
    } catch (error) {
      console.log('Mock pending approvals (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_EXPENSES.filter(e => e.status === 'Pending');
    }
  },
};
