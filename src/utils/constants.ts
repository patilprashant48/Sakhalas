import type { UserRole } from '../types/auth.types';

export const ROLES: Record<UserRole, UserRole> = {
  'Admin': 'Admin',
  'Project Manager': 'Project Manager',
  'Employee': 'Employee',
  'Treasurer': 'Treasurer',
  'Auditor': 'Auditor',
};

export const EXPENSE_CATEGORIES = [
  'Materials',
  'Labor',
  'Equipment',
  'Services',
  'Travel',
  'Utilities',
  'Other',
] as const;

export const PAYMENT_METHODS = [
  'Card',
  'Cash',
  'Cheque',
  'Bank Transfer',
  'Other',
] as const;

export const EXPENSE_STATUSES = [
  'Draft',
  'Pending',
  'Approved',
  'Rejected',
  'Paid',
  'Partially Paid',
] as const;

export const PROJECT_STATUSES = [
  'Active',
  'Completed',
  'Archived',
  'On Hold',
] as const;

export const REMINDER_FREQUENCIES = [
  'Daily',
  'Weekly',
  'Monthly',
] as const;

export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

export const DRAWER_WIDTH = 240;
export const DRAWER_WIDTH_COLLAPSED = 64;
