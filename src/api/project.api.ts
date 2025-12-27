import apiClient from './axios';
import type { Project, ProjectFormData, ProjectStats } from '../types/project.types';

// Mock projects for demo mode
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    code: 'WEB-2025',
    description: 'Complete redesign of company website with modern UI/UX and improved performance',
    status: 'Active',
    budget: 50000,
    spent: 32000,
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    managerId: '1',
    managerName: 'Sarah Johnson',
    progress: 64,
    teamMembers: [
      { id: '1', name: 'Sarah Johnson', role: 'Project Manager', email: 'sarah.j@company.com' },
      { id: '2', name: 'Alex Kim', role: 'UI/UX Designer', email: 'alex.k@company.com' },
      { id: '3', name: 'Chris Lee', role: 'Frontend Developer', email: 'chris.l@company.com' },
    ],
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Mobile App Development',
    code: 'APP-2025',
    description: 'iOS and Android mobile application for customer engagement',
    status: 'Active',
    budget: 120000,
    spent: 78000,
    startDate: '2025-02-01',
    endDate: '2025-08-31',
    managerId: '4',
    managerName: 'Mike Chen',
    progress: 65,
    teamMembers: [
      { id: '4', name: 'Mike Chen', role: 'Project Manager', email: 'mike.c@company.com' },
      { id: '5', name: 'Emma Wilson', role: 'iOS Developer', email: 'emma.w@company.com' },
      { id: '6', name: 'James Brown', role: 'Android Developer', email: 'james.b@company.com' },
      { id: '7', name: 'Lisa Taylor', role: 'QA Engineer', email: 'lisa.t@company.com' },
    ],
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
  },
  {
    id: '3',
    name: 'Cloud Migration',
    code: 'CLOUD-2025',
    description: 'Migrate infrastructure to AWS cloud platform',
    status: 'Active',
    budget: 80000,
    spent: 52000,
    startDate: '2025-03-01',
    endDate: '2025-07-31',
    managerId: '8',
    managerName: 'David Lee',
    progress: 65,
    teamMembers: [
      { id: '8', name: 'David Lee', role: 'Project Manager', email: 'david.l@company.com' },
      { id: '9', name: 'Rachel Green', role: 'DevOps Engineer', email: 'rachel.g@company.com' },
      { id: '10', name: 'Tom Harris', role: 'Cloud Architect', email: 'tom.h@company.com' },
    ],
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2025-03-01T10:00:00Z',
  },
];

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get<Project[]>('/projects');
      return response.data;
    } catch (error) {
      console.log('Using mock projects (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_PROJECTS;
    }
  },

  getById: async (id: string): Promise<Project> => {
    try {
      const response = await apiClient.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.log('Using mock project (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      const project = MOCK_PROJECTS.find(p => p.id === id);
      if (!project) throw new Error('Project not found');
      return project;
    }
  },

  create: async (data: ProjectFormData): Promise<Project> => {
    try {
      const response = await apiClient.post<Project>('/projects', data);
      return response.data;
    } catch (error) {
      console.log('Mock create project (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: String(MOCK_PROJECTS.length + 1),
        name: data.name,
        description: data.description,
        budget: data.budget,
        spent: 0,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'Active',
        managerId: data.managerId,
        managerName: 'Manager',
        teamMembers: [],
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  update: async (id: string, data: Partial<ProjectFormData>): Promise<Project> => {
    try {
      const response = await apiClient.put<Project>(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      console.log('Mock update project (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      const project = MOCK_PROJECTS.find(p => p.id === id);
      if (!project) throw new Error('Project not found');
      return { ...project, ...data };
    }
  },

  archive: async (id: string): Promise<void> => {
    try {
      await apiClient.patch(`/projects/${id}/archive`);
    } catch (error) {
      console.log('Mock archive project (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  },

  getStats: async (id: string): Promise<ProjectStats> => {
    try {
      const response = await apiClient.get<ProjectStats>(`/projects/${id}/stats`);
      return response.data;
    } catch (error) {
      console.log('Mock project stats (demo mode)');
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        totalBudget: 50000,
        totalSpent: 32000,
        budgetUtilization: 64,
        pendingApprovals: 5,
        upcomingPayments: 8,
        totalExpenses: 32000,
      };
    }
  },
};
