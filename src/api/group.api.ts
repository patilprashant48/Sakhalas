import axiosInstance from './axios';
import type { Group, GroupFormData } from '../types/group.types';

export const groupApi = {
  // Create new group
  create: async (data: GroupFormData): Promise<Group> => {
    const response = await axiosInstance.post('/groups', data);
    return response.data.data;
  },

  // Get all user's groups
  getAll: async (): Promise<Group[]> => {
    const response = await axiosInstance.get('/groups');
    return response.data.data.map((g: any) => ({ ...g, id: g.id || g._id }));
  },

  // Get group by ID
  getById: async (id: string): Promise<Group> => {
    const response = await axiosInstance.get(`/groups/${id}`);
    const g = response.data.data;
    return { ...g, id: g.id || g._id };
  },

  // Update group
  update: async (id: string, data: Partial<GroupFormData>): Promise<Group> => {
    const response = await axiosInstance.put(`/groups/${id}`, data);
    const g = response.data.data;
    return { ...g, id: g.id || g._id };
  },

  // Add member
  addMember: async (groupId: string, memberName: string): Promise<Group> => {
    const response = await axiosInstance.post(`/groups/${groupId}/members`, { name: memberName });
    const g = response.data.data;
    return { ...g, id: g.id || g._id };
  },

  // Remove member
  removeMember: async (groupId: string, userId: string): Promise<Group> => {
    const response = await axiosInstance.delete(`/groups/${groupId}/members`, {
      data: { userId },
    });
    const g = response.data.data;
    return { ...g, id: g.id || g._id };
  },

  // Deactivate group
  deactivate: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/groups/${id}`);
  },
};
