export interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'Archived' | 'On Hold';
  managerId: string;
  managerName: string;
  teamMembers: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  managerId: string;
  teamMemberIds: string[];
}

export interface ProjectStats {
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  pendingApprovals: number;
  upcomingPayments: number;
}
