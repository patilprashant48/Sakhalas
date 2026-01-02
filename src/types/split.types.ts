export type SplitType = 'equal' | 'percentage' | 'exact' | 'shares';

export interface Participant {
  userId: string;
  userName?: string;
  amount?: number;
  percentage?: number;
  shares?: number;
  paid?: boolean;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  paidBy: string;
  paidByName?: string;
  totalAmount: number;
  splitType: SplitType;
  participants: Participant[];
  groupId?: string;
  groupName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Balance {
  fromUserId: string;
  toUserId: string;
  toUserName?: string;
  fromUserName?: string;
  amount: number;
}

export interface UserBalances {
  youOwe: Array<{ toUserId: string; amount: number }>;
  youAreOwed: Array<{ fromUserId: string; amount: number }>;
  netBalance: number;
}

export interface Settlement {
  id: string;
  fromUser: string;
  fromUserName?: string;
  toUser: string;
  toUserName?: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'wallet' | 'other';
  transactionRef?: string;
  notes?: string;
  groupId?: string;
  settledAt: string;
  createdAt: string;
}

export interface SplitFormData {
  expenseId: string;
  paidBy: string;
  totalAmount: number;
  splitType: SplitType;
  participants: Participant[];
  groupId?: string;
}

export interface SettlementFormData {
  toUser: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'wallet' | 'other';
  transactionRef?: string;
  notes?: string;
  groupId?: string;
}
