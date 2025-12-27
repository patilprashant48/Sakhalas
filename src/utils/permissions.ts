import type { UserRole } from '../types/auth.types';

export type Permission =
  | 'view_dashboard'
  | 'view_projects'
  | 'create_project'
  | 'edit_project'
  | 'archive_project'
  | 'view_expenses'
  | 'create_expense'
  | 'edit_expense'
  | 'delete_expense'
  | 'approve_expense'
  | 'reject_expense'
  | 'view_payments'
  | 'add_payment'
  | 'view_reports'
  | 'export_reports'
  | 'manage_users';

const rolePermissions: Record<UserRole, Permission[]> = {
  'Admin': [
    'view_dashboard',
    'view_projects',
    'create_project',
    'edit_project',
    'archive_project',
    'view_expenses',
    'create_expense',
    'edit_expense',
    'delete_expense',
    'approve_expense',
    'reject_expense',
    'view_payments',
    'add_payment',
    'view_reports',
    'export_reports',
    'manage_users',
  ],
  'Project Manager': [
    'view_dashboard',
    'view_projects',
    'create_project',
    'edit_project',
    'view_expenses',
    'create_expense',
    'edit_expense',
    'approve_expense',
    'reject_expense',
    'view_payments',
    'view_reports',
    'export_reports',
  ],
  'Employee': [
    'view_dashboard',
    'view_projects',
    'view_expenses',
    'create_expense',
    'edit_expense',
    'view_payments',
  ],
  'Treasurer': [
    'view_dashboard',
    'view_projects',
    'view_expenses',
    'approve_expense',
    'reject_expense',
    'view_payments',
    'add_payment',
    'view_reports',
    'export_reports',
  ],
  'Auditor': [
    'view_dashboard',
    'view_projects',
    'view_expenses',
    'view_payments',
    'view_reports',
    'export_reports',
  ],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return rolePermissions[role]?.includes(permission) ?? false;
};

export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(role, permission));
};

export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every((permission) => hasPermission(role, permission));
};

export const canApprove = (role: UserRole): boolean => {
  return hasPermission(role, 'approve_expense');
};

export const canManagePayments = (role: UserRole): boolean => {
  return hasPermission(role, 'add_payment');
};

export const canManageProjects = (role: UserRole): boolean => {
  return hasPermission(role, 'create_project');
};

export const isReadOnly = (role: UserRole): boolean => {
  return role === 'Auditor';
};
