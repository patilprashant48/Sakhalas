import apiClient from './axios';
import type { Project, ProjectFormData, ProjectStats } from '../types/project.types';

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<{ success: boolean; data: Project[] }>('/projects');
    return response.data.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<{ success: boolean; data: Project }>(`/projects/${id}`);
    return response.data.data;
  },

  getStats: async (id: string): Promise<ProjectStats> => {
    const response = await apiClient.get<{ success: boolean; data: ProjectStats }>(`/projects/${id}/stats`);
    return response.data.data;
  },

  create: async (data: ProjectFormData): Promise<Project> => {
    const response = await apiClient.post<{ success: boolean; data: Project }>('/projects', data);
    return response.data.data;
  },

  update: async (id: string, data: ProjectFormData): Promise<Project> => {
    const response = await apiClient.put<{ success: boolean; data: Project }>(`/projects/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  archive: async (id: string): Promise<Project> => {
    const response = await apiClient.patch<{ success: boolean; data: Project }>(`/projects/${id}/archive`);
    return response.data.data;
  },
};
