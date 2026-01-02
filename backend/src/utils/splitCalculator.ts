import { SplitType } from '../models/ExpenseSplit.model';

export interface SplitInput {
  totalAmount: number;
  splitType: SplitType;
  participants: Array<{
    userId: string;
    amount?: number;
    percentage?: number;
    shares?: number;
  }>;
}

export interface CalculatedSplit {
  userId: string;
  amount: number;
}

/**
 * Calculate individual amounts for expense splits
 */
export const calculateSplits = (input: SplitInput): CalculatedSplit[] => {
  const { totalAmount, splitType, participants } = input;

  switch (splitType) {
    case 'equal':
      return calculateEqualSplit(totalAmount, participants);
    
    case 'percentage':
      return calculatePercentageSplit(totalAmount, participants);
    
    case 'exact':
      return calculateExactSplit(participants);
    
    case 'shares':
      return calculateSharesSplit(totalAmount, participants);
    
    default:
      throw new Error(`Unknown split type: ${splitType}`);
  }
};

/**
 * Equal split - divide total equally among participants
 */
const calculateEqualSplit = (
  totalAmount: number,
  participants: SplitInput['participants']
): CalculatedSplit[] => {
  const perPerson = totalAmount / participants.length;
  
  return participants.map((p) => ({
    userId: p.userId,
    amount: Math.round(perPerson * 100) / 100, // Round to 2 decimals
  }));
};

/**
 * Percentage split - each person pays their percentage
 */
const calculatePercentageSplit = (
  totalAmount: number,
  participants: SplitInput['participants']
): CalculatedSplit[] => {
  // Validate percentages sum to 100
  const totalPercentage = participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
  
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Percentages must sum to 100. Current total: ${totalPercentage}`);
  }

  return participants.map((p) => ({
    userId: p.userId,
    amount: Math.round((totalAmount * (p.percentage || 0) / 100) * 100) / 100,
  }));
};

/**
 * Exact split - each person pays exact specified amount
 */
const calculateExactSplit = (
  participants: SplitInput['participants']
): CalculatedSplit[] => {
  return participants.map((p) => ({
    userId: p.userId,
    amount: p.amount || 0,
  }));
};

/**
 * Shares split - divide based on number of shares/items
 */
const calculateSharesSplit = (
  totalAmount: number,
  participants: SplitInput['participants']
): CalculatedSplit[] => {
  const totalShares = participants.reduce((sum, p) => sum + (p.shares || 0), 0);
  
  if (totalShares === 0) {
    throw new Error('Total shares must be greater than 0');
  }

  const perShare = totalAmount / totalShares;

  return participants.map((p) => ({
    userId: p.userId,
    amount: Math.round(perShare * (p.shares || 0) * 100) / 100,
  }));
};

/**
 * Calculate balances between users
 * Returns who owes whom
 */
export interface Balance {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export const calculateBalances = (
  splits: Array<{
    paidBy?: string;
    participants: Array<{ userId: string; amount: number; paid?: boolean }>;
  }>
): Balance[] => {
  // Calculate net balance for each user (positive = owed, negative = owes)
  const netBalances = new Map<string, number>();

  splits.forEach((split) => {
    const { paidBy, participants } = split;
    
    // Skip if no payer specified
    if (!paidBy) return;

    participants.forEach((participant) => {
      if (!participant.paid) {
        // Payer is owed this amount
        const currentPayerBalance = netBalances.get(paidBy) || 0;
        netBalances.set(paidBy, currentPayerBalance + participant.amount);

        // Participant owes this amount
        const currentParticipantBalance = netBalances.get(participant.userId) || 0;
        netBalances.set(participant.userId, currentParticipantBalance - participant.amount);
      }
    });
  });

  // Simplify debts using greedy algorithm
  return simplifyDebts(netBalances);
};

/**
 * Simplify debts to minimum number of transactions
 */
const simplifyDebts = (netBalances: Map<string, number>): Balance[] => {
  const creditors: Array<{ userId: string; amount: number }> = [];
  const debtors: Array<{ userId: string; amount: number }> = [];

  // Separate creditors (owed money) and debtors (owe money)
  netBalances.forEach((balance, userId) => {
    if (balance > 0.01) {
      creditors.push({ userId, amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ userId, amount: Math.abs(balance) });
    }
  });

  const balances: Balance[] = [];

  // Greedy matching
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const settleAmount = Math.min(creditor.amount, debtor.amount);

    if (settleAmount > 0.01) {
      balances.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: Math.round(settleAmount * 100) / 100,
      });
    }

    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;

    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }

  return balances;
};
