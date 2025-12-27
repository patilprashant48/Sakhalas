import apiClient from './axios';
import type {
  CompanyKPIs,
  ExpensesByProject,
  ExpensesByCategory,
  OverduePayment,
  UpcomingPayment,
  TodayPayment,
  ProjectDashboardData,
} from '../types/dashboard.types';

// Mock data for demo mode
const MOCK_KPIS: CompanyKPIs = {
  totalProjects: 12,
  activeProjects: 8,
  totalBudget: 500000,
  totalSpent: 340000,
  budgetUtilization: 68,
  pendingApprovals: 5,
  overduePayments: 3,
  // Financial Liabilities
  totalApprovedUnpaid: 125000, // Approved expenses not yet paid
  totalOverdueAmount: 7250, // Sum of overdue amounts
  upcomingPaymentsCount: 8, // Payments due in next 7 days
  upcomingPaymentsAmount: 42500, // Total due in next 7 days
};

const MOCK_EXPENSES_BY_PROJECT: ExpensesByProject[] = [
  { projectName: 'Website Redesign', amount: 45000, percentage: 18.3 },
  { projectName: 'Mobile App', amount: 78000, percentage: 31.8 },
  { projectName: 'Cloud Migration', amount: 52000, percentage: 21.2 },
  { projectName: 'Data Analytics', amount: 38000, percentage: 15.5 },
  { projectName: 'Marketing Campaign', amount: 32600, percentage: 13.2 },
];

const MOCK_EXPENSES_BY_CATEGORY: ExpensesByCategory[] = [
  { category: 'Development', amount: 95000, percentage: 38.8 },
  { category: 'Design', amount: 42000, percentage: 17.1 },
  { category: 'Marketing', amount: 38000, percentage: 15.5 },
  { category: 'Infrastructure', amount: 35000, percentage: 14.3 },
  { category: 'Operations', amount: 35600, percentage: 14.3 },
];

const MOCK_OVERDUE_PAYMENTS: OverduePayment[] = [
  { id: '1', projectName: 'Website Redesign', vendor: 'AWS Cloud Services', amount: 5200, dueDate: '2025-12-15', overdueDays: 11 },
  { id: '2', projectName: 'Mobile App', vendor: 'Adobe Creative Suite', amount: 1200, dueDate: '2025-12-18', overdueDays: 8 },
  { id: '3', projectName: 'Cloud Migration', vendor: 'Office Supplies Co', amount: 850, dueDate: '2025-12-20', overdueDays: 6 },
];

const MOCK_UPCOMING_PAYMENTS: UpcomingPayment[] = [
  { id: '4', projectName: 'Website Redesign', vendor: 'Figma Enterprise', amount: 8500, dueDate: '2025-12-28', daysUntilDue: 2, category: 'Software' },
  { id: '5', projectName: 'Mobile App', vendor: 'Google Cloud Platform', amount: 12000, dueDate: '2025-12-29', daysUntilDue: 3, category: 'Infrastructure' },
  { id: '6', projectName: 'Data Analytics', vendor: 'Tableau License', amount: 6500, dueDate: '2025-12-30', daysUntilDue: 4, category: 'Software' },
  { id: '7', projectName: 'Cloud Migration', vendor: 'MongoDB Atlas', amount: 4200, dueDate: '2025-12-31', daysUntilDue: 5, category: 'Database' },
  { id: '8', projectName: 'Marketing Campaign', vendor: 'LinkedIn Ads', amount: 3500, dueDate: '2026-01-01', daysUntilDue: 6, category: 'Marketing' },
  { id: '9', projectName: 'Website Redesign', vendor: 'Cloudflare Pro', amount: 2800, dueDate: '2026-01-02', daysUntilDue: 7, category: 'Infrastructure' },
];

const MOCK_TODAY_PAYMENTS: TodayPayment[] = [
  { id: '1', projectName: 'Cloud Migration', vendor: 'Microsoft Azure', amount: 8500, category: 'Infrastructure', status: 'Completed' },
  { id: '2', projectName: 'Website Redesign', vendor: 'Salesforce', amount: 3200, category: 'Software', status: 'Completed' },
  { id: '3', projectName: 'Mobile App', vendor: 'Slack Enterprise', amount: 1800, category: 'Software', status: 'Completed' },
];

export const dashboardApi = {
  getCompanyKPIs: async (): Promise<CompanyKPIs> => {
    try {
      const response = await apiClient.get<CompanyKPIs>('/dashboard/company/kpis');
      return response.data;
    } catch (error) {
      console.log('Using mock KPIs (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_KPIS;
    }
  },

  getExpensesByProject: async (): Promise<ExpensesByProject[]> => {
    try {
      const response = await apiClient.get<ExpensesByProject[]>('/dashboard/company/expenses-by-project');
      return response.data;
    } catch (error) {
      console.log('Using mock expenses by project (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_EXPENSES_BY_PROJECT;
    }
  },

  getExpensesByCategory: async (): Promise<ExpensesByCategory[]> => {
    try {
      const response = await apiClient.get<ExpensesByCategory[]>('/dashboard/company/expenses-by-category');
      return response.data;
    } catch (error) {
      console.log('Using mock expenses by category (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_EXPENSES_BY_CATEGORY;
    }
  },

  getOverduePayments: async (): Promise<OverduePayment[]> => {
    try {
      const response = await apiClient.get<OverduePayment[]>('/dashboard/company/overdue-payments');
      return response.data;
    } catch (error) {
      console.log('Using mock overdue payments (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_OVERDUE_PAYMENTS;
    }
  },

  getUpcomingPayments: async (): Promise<UpcomingPayment[]> => {
    try {
      const response = await apiClient.get<UpcomingPayment[]>('/dashboard/company/upcoming-payments');
      return response.data;
    } catch (error) {
      console.log('Using mock upcoming payments (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_UPCOMING_PAYMENTS;
    }
  },

  getProjectDashboard: async (projectId: string): Promise<ProjectDashboardData> => {
    try {
      const response = await apiClient.get<ProjectDashboardData>(`/dashboard/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.log('Using mock project dashboard (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        project: {
          id: projectId,
          name: 'Sample Project',
          budget: 100000,
          spent: 68000,
        },
        budgetVsSpent: [
          { month: 'Jan', budget: 100000, spent: 12000 },
          { month: 'Feb', budget: 100000, spent: 25000 },
          { month: 'Mar', budget: 100000, spent: 40000 },
          { month: 'Apr', budget: 100000, spent: 55000 },
          { month: 'May', budget: 100000, spent: 68000 },
        ],
        approvalPipeline: [
          { status: 'Pending', count: 5, amount: 25000 },
          { status: 'Approved', count: 12, amount: 68000 },
          { status: 'Rejected', count: 2, amount: 8000 },
        ],
        upcomingPayments: [
          { date: '2025-12-30', vendor: 'Tech Solutions Inc', amount: 15000 },
          { date: '2026-01-05', vendor: 'Cloud Services LLC', amount: 8500 },
          { date: '2026-01-10', vendor: 'Design Studio', amount: 12000 },
        ],
      };
    }
  },

  // Public endpoint - no auth required
  getTodayPayments: async (): Promise<TodayPayment[]> => {
    try {
      const response = await apiClient.get<TodayPayment[]>('/public/today-payments');
      return response.data;
    } catch (error) {
      console.log('Using mock today payments (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_TODAY_PAYMENTS;
    }
  },

  exportReport: async (params: {
    type: 'pdf' | 'csv';
    startDate?: string;
    endDate?: string;
    projectId?: string;
  }): Promise<Blob> => {
    try {
      const response = await apiClient.get('/reports/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.log('Using mock report export (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock report content
      if (params.type === 'csv') {
        const csvContent = `Project Name,Category,Amount,Vendor,Status,Date
Office Renovation,Materials,₹25000,ABC Contractors,Approved,${new Date().toISOString().split('T')[0]}
IT Infrastructure,Equipment,₹15000,TechSupply Inc,Pending,${new Date().toISOString().split('T')[0]}
Marketing Campaign,Marketing,₹8500,Creative Agency,Paid,${new Date().toISOString().split('T')[0]}
Website Redesign,Services,₹45000,Digital Agency,Approved,${new Date().toISOString().split('T')[0]}
Office Supplies,Materials,₹3500,Office Mart,Paid,${new Date().toISOString().split('T')[0]}`;
        
        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      } else {
        // Mock PDF content
        const pdfContent = `%PDF-1.4
Sakhalas - Expense Report
Generated: ${new Date().toLocaleString()}

Summary:
- Total Expenses: ₹97,000
- Total Projects: 5
- Pending Approvals: 2
- Paid Expenses: 2

This is a demo report. Connect to backend for actual data.`;
        
        return new Blob([pdfContent], { type: 'application/pdf' });
      }
    }
  },
};
