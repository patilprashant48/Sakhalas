export type GroupType = 'trip' | 'roommates' | 'event' | 'project' | 'household' | 'other';

export interface GroupMember {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  type: GroupType;
  members: GroupMember[];
  guestMembers?: string[]; // Members without accounts
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupFormData {
  name: string;
  description?: string;
  type: GroupType;
  members: string[];
}
