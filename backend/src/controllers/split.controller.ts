import { Response, NextFunction } from 'express';
import { ExpenseSplit } from '../models/ExpenseSplit.model';
import { Settlement } from '../models/Settlement.model';
import { User } from '../models/User.model';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { calculateSplits, calculateBalances } from '../utils/splitCalculator';
import mongoose from 'mongoose';

// @desc    Create expense split
export const createSplit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { expenseId, paidBy, totalAmount, splitType, participants, groupId } = req.body;

    // Sanitize groupId - convert empty string to undefined
    const sanitizedGroupId = groupId && groupId.trim() !== '' ? groupId : undefined;

    // Convert paidBy name to user ID if it's not already an ID, or keep as guest name
    let paidById = paidBy;
    if (paidBy && !mongoose.Types.ObjectId.isValid(paidBy)) {
      const paidByUser = await User.findOne({ name: { $regex: new RegExp(`^${paidBy.trim()}$`, 'i') } });
      if (paidByUser) {
        paidById = paidByUser._id.toString();
      }
      // If no user found, keep the name as-is (guest member)
    }

    // Convert participant names to user IDs if needed, or keep as guest names
    const participantsWithIds = await Promise.all(
      participants.map(async (p: any) => {
        let userId = p.userId;
        // Only try to look up user if it looks like it might be a valid ObjectId
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
          // It's already an ID, keep it
          return { ...p, userId };
        } else if (userId) {
          // Try to find a user with this name
          const user = await User.findOne({ name: { $regex: new RegExp(`^${userId}$`, 'i') } });
          if (user) {
            // Found a user, use their ID
            userId = user._id.toString();
          }
          // If no user found, keep the name as-is (guest member)
        }
        return { ...p, userId };
      })
    );

    // Calculate individual amounts
    const calculated = calculateSplits({
      totalAmount,
      splitType,
      participants: participantsWithIds,
    });

    // Map calculated amounts back to participants
    const participantsWithAmounts = participantsWithIds.map((p: { userId: string }) => {
      const calc = calculated.find((c) => c.userId === p.userId);
      return {
        ...p,
        amount: calc?.amount || 0,
      };
    });

    const split = await ExpenseSplit.create({
      expenseId,
      paidBy: paidById,
      totalAmount,
      splitType,
      participants: participantsWithAmounts,
      groupId: sanitizedGroupId,
    });

    const populatedSplit = await split.populate([
      { path: 'paidBy', select: 'name email' },
      { path: 'participants.userId', select: 'name email' },
      { path: 'groupId', select: 'name' },
    ]);

    res.status(201).json({
      success: true,
      data: populatedSplit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get split by expense ID
export const getSplitByExpenseId = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const split = await ExpenseSplit.findOne({ expenseId: req.params.expenseId })
      .populate('paidBy', 'name email')
      .populate('participants.userId', 'name email')
      .populate('groupId', 'name');

    if (!split) {
      throw createError('Split not found', 404);
    }

    res.json({
      success: true,
      data: split,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update split participant as paid
export const markParticipantPaid = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { splitId, participantUserId } = req.params;

    const split = await ExpenseSplit.findById(splitId);
    if (!split) {
      throw createError('Split not found', 404);
    }

    const participant = split.participants.find(
      (p) => p.userId.toString() === participantUserId
    );

    if (!participant) {
      throw createError('Participant not found', 404);
    }

    participant.paid = true;
    await split.save();

    res.json({
      success: true,
      data: split,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user balances (who they owe and who owes them)
export const getUserBalances = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { groupId } = req.query;

    const filter: Record<string, unknown> = {
      'participants.userId': new mongoose.Types.ObjectId(userId),
    };

    if (groupId) {
      filter.groupId = new mongoose.Types.ObjectId(groupId as string);
    }

    // Get all splits where user is involved
    const splits = await ExpenseSplit.find(filter)
      .populate('paidBy', 'name email')
      .populate('participants.userId', 'name email');

    // Also get settlements
    const settlements = await Settlement.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
      ...(groupId ? { groupId } : {}),
    });

    // Calculate balances
    const splitData = splits.map((split) => {
      // Handle paidBy as either ObjectId, string, or undefined
      let paidByValue: string | undefined;
      if (split.paidBy) {
        if (typeof split.paidBy === 'string') {
          paidByValue = split.paidBy;
        } else {
          paidByValue = (split.paidBy as any)._id?.toString() || split.paidBy.toString();
        }
      }

      return {
        paidBy: paidByValue,
        participants: split.participants.map((p) => {
          // Handle userId as either ObjectId or string
          let userIdValue: string;
          if (typeof p.userId === 'string') {
            userIdValue = p.userId;
          } else {
            userIdValue = (p.userId as any)._id?.toString() || p.userId.toString();
          }
          
          return {
            userId: userIdValue,
            amount: p.amount || 0,
            paid: p.paid || false,
          };
        }),
      };
    });

    const balances = calculateBalances(splitData);

    // Apply settlements
    const settlementsMap = new Map<string, number>();
    settlements.forEach((settlement) => {
      const key = `${settlement.fromUser}-${settlement.toUser}`;
      const current = settlementsMap.get(key) || 0;
      settlementsMap.set(key, current + settlement.amount);
    });

    const adjustedBalances = balances.map((balance) => {
      const key = `${balance.fromUserId}-${balance.toUserId}`;
      const settled = settlementsMap.get(key) || 0;
      return {
        ...balance,
        amount: Math.max(0, balance.amount - settled),
      };
    }).filter((b) => b.amount > 0.01);

    // Separate into owes and owed
    const youOwe = adjustedBalances
      .filter((b) => b.fromUserId === userId)
      .map((b) => ({
        toUserId: b.toUserId,
        amount: b.amount,
      }));

    const youAreOwed = adjustedBalances
      .filter((b) => b.toUserId === userId)
      .map((b) => ({
        fromUserId: b.fromUserId,
        amount: b.amount,
      }));

    const netBalance = youAreOwed.reduce((sum, b) => sum + b.amount, 0) -
                       youOwe.reduce((sum, b) => sum + b.amount, 0);

    res.json({
      success: true,
      data: {
        youOwe,
        youAreOwed,
        netBalance: Math.round(netBalance * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create settlement
export const createSettlement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { toUser, amount, method, transactionRef, notes, groupId } = req.body;
    const fromUser = req.user!.id;

    // Sanitize groupId - convert empty string to undefined
    const sanitizedGroupId = groupId && groupId.trim() !== '' ? groupId : undefined;

    const settlement = await Settlement.create({
      fromUser,
      toUser,
      amount,
      method,
      transactionRef,
      notes,
      groupId: sanitizedGroupId,
    });

    const populated = await settlement.populate([
      { path: 'fromUser', select: 'name email' },
      { path: 'toUser', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get settlement history
export const getSettlements = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { groupId } = req.query;

    const filter: Record<string, unknown> = {
      $or: [{ fromUser: userId }, { toUser: userId }],
    };

    if (groupId) {
      filter.groupId = groupId;
    }

    const settlements = await Settlement.find(filter)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('groupId', 'name')
      .sort({ settledAt: -1 });

    res.json({
      success: true,
      data: settlements,
    });
  } catch (error) {
    next(error);
  }
};
