import { useAuth } from './useAuth';
import type { UserRole } from '../types/auth.types';
import type { Permission } from '../utils/permissions';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAllPermissions(user.role, permissions);
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    hasRole,
    hasAnyRole,
    canView: checkPermission('view_dashboard'),
    canCreateProject: checkPermission('create_project'),
    canEditProject: checkPermission('edit_project'),
    canCreateExpense: checkPermission('create_expense'),
    canApproveExpense: checkPermission('approve_expense'),
    canAddPayment: checkPermission('add_payment'),
    canExportReports: checkPermission('export_reports'),
  };
};
