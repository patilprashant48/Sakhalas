export type ExpenseStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Paid' | 'Partially Paid';

export type ExpenseCategory = 
  | 'Materials' 
  | 'Labor' 
  | 'Equipment' 
  | 'Services' 
  | 'Travel' 
  | 'Utilities' 
  | 'Infrastructure'
  | 'Marketing'
  | 'Other';

export type PaymentMethod = 
  | 'Card'
  | 'Cash'
  | 'Cheque'
  | 'Bank Transfer'
  | 'Other';

export interface Expense {
  id: string;
  projectId: string;
  projectName: string;
  category: ExpenseCategory;
  amount: number;
  vendor: string;
  description: string;
  date: string;
  status: ExpenseStatus;
  billUrl?: string;
  billUrls?: string[];
  quotationUrls?: string[];
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  reminderDate?: string;
  reminderFrequency?: 'Daily' | 'Weekly' | 'Monthly';
  paymentFrequency?: 'One-time' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  dueDate?: string;
  paymentMethod?: PaymentMethod;
  // Card payment details (masked)
  cardOwnerName?: string;
  cardLast4Digits?: string; // Only last 4 digits - NEVER store full card numbers
  // Cheque payment details
  chequeNumber?: string;
  bankName?: string;
  // Bank Transfer details
  transferReference?: string;
  // Other payment details
  paymentNotes?: string;
  isOverdue: boolean;
  overdueDays?: number;
  paidAmount: number;
  paymentProofs: PaymentProof[];
}

export interface PaymentProof {
  id: string;
  amount: number;
  paidAt: string;
  paidBy: string;
  proofUrl?: string;
  notes?: string;
}

export interface ExpenseFormData {
  projectId: string;
  category: ExpenseCategory;
  amount: number;
  vendor: string;
  description: string;
  date: string;
  billFile?: File;
  reminderDate?: string;
  reminderFrequency?: 'Daily' | 'Weekly' | 'Monthly';
  paymentFrequency?: 'One-time' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  dueDate?: string;
  paymentMethod?: PaymentMethod;
  // Card payment details (masked)
  cardOwnerName?: string;
  cardLast4Digits?: string; // Only last 4 digits - NEVER store full card numbers
  // Cheque payment details
  chequeNumber?: string;
  bankName?: string;
  // Bank Transfer details
  transferReference?: string;
  // Other payment details
  paymentNotes?: string;
  status: 'Draft' | 'Pending';
}

export interface ApprovalAction {
  expenseId: string;
  action: 'approve' | 'reject';
  comment?: string;
}

export interface ApprovalHistoryItem {
  id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'paid';
  performedBy: string;
  performedByName: string;
  performedAt: string;
  comment?: string;
}

export interface PaymentFormData {
  amount: number;
  paidAt: string;
  proofFile?: File;
  notes?: string;
}
