import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Expense } from '../models/Expense.model';
import mongoose from 'mongoose';
import { Project } from '../models/Project.model';
import { ApprovalHistory } from '../models/ApprovalHistory.model';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all expenses
export const getAllExpenses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, status, category, startDate, endDate } = req.query;

    const filter: Record<string, unknown> = {};
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);
      filter.date = dateFilter;
    }

    const expenses = await Expense.find(filter)
      .populate('projectId', 'name code')
      .populate('submittedBy', 'name email')
      .sort({ date: -1 });

    // Add project name for frontend compatibility
    const formattedExpenses = expenses.map((exp) => ({
      ...exp.toObject(),
      projectName: (exp as unknown as { projectId?: { name?: string } }).projectId?.name,
      submittedByName: (exp as unknown as { submittedBy?: { name?: string } }).submittedBy?.name,
    }));

    res.json({
      success: true,
      data: formattedExpenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending approvals
export const getPendingApprovals = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const expenses = await Expense.find({ status: 'Pending' })
      .populate('projectId', 'name code')
      .populate('submittedBy', 'name email')
      .sort({ submittedAt: 1 });

    const formattedExpenses = expenses.map((exp) => ({
      ...exp.toObject(),
      projectName: (exp as unknown as { projectId?: { name?: string } }).projectId?.name,
      submittedByName: (exp as unknown as { submittedBy?: { name?: string } }).submittedBy?.name,
    }));

    res.json({
      success: true,
      data: formattedExpenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense by ID
export const getExpenseById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('projectId', 'name code')
      .populate('submittedBy', 'name email')
      .populate('paymentProofs.paidBy', 'name email');

    if (!expense) {
      throw createError('Expense not found', 404);
    }

    const formattedExpense: Record<string, unknown> = {
      ...expense.toObject(),
      projectName: (expense as unknown as { projectId?: { name?: string } }).projectId?.name,
      submittedByName: (expense as unknown as { submittedBy?: { name?: string } }).submittedBy?.name,
    };

    // Normalize file paths to URLs for frontend
    const { attachments = [], quotations = [], paymentProofs = [] } = expense as unknown as { attachments?: unknown[]; quotations?: unknown[]; paymentProofs?: unknown[] };
    
    // Add bill URLs (multiple bills)
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      (formattedExpense as Record<string, unknown>).billUrls = attachments.map((a) => {
        const billPath = a as unknown;
        const billFilename = typeof billPath === 'string' ? billPath.split(/[\\/\\]/).pop() : null;
        return billFilename ? `/uploads/${billFilename}` : null;
      }).filter(Boolean);
      // Keep legacy billUrl for backward compatibility (first bill)
      const firstBillFilename = typeof attachments[0] === 'string' ? (attachments[0] as string).split(/[\\/\\]/).pop() : null;
      if (firstBillFilename) {
        (formattedExpense as Record<string, unknown>).billUrl = `/uploads/${firstBillFilename}`;
      }
    }

    // Add quotation URLs
    if (quotations && Array.isArray(quotations) && quotations.length > 0) {
      (formattedExpense as Record<string, unknown>).quotationUrls = quotations.map((q) => {
        const quotationPath = q as unknown;
        const quotationFilename = typeof quotationPath === 'string' ? quotationPath.split(/[\\/\\]/).pop() : null;
        return quotationFilename ? `/uploads/${quotationFilename}` : null;
      }).filter(Boolean);
    }

    if (paymentProofs && Array.isArray(paymentProofs) && paymentProofs.length > 0) {
      (formattedExpense as Record<string, unknown>).paymentProofs = (paymentProofs as unknown[]).map((p) => {
        const pObj = p as unknown as { attachments?: unknown[]; _id?: unknown; paidBy?: unknown };
        const proofAttachments = pObj.attachments || [];
        const proofFilename = proofAttachments.length > 0 ? (typeof proofAttachments[0] === 'string' ? (proofAttachments[0] as string).split(/[\\/\\]/).pop() : null) : null;
        const paidByVal = pObj.paidBy && typeof pObj.paidBy === 'object' ? (pObj.paidBy as Record<string, unknown>)['_id'] || pObj.paidBy : pObj.paidBy;
        return {
          ...(p as Record<string, unknown>),
          id: pObj._id,
          paidBy: paidByVal,
          proofUrl: proofFilename ? `/uploads/${proofFilename}` : undefined,
        };
      });
    }

    res.json({
      success: true,
      data: formattedExpense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get approval history
export const getApprovalHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const history = await ApprovalHistory.find({ expenseId: req.params.id })
      .populate('performedBy', 'name email')
      .sort({ performedAt: 1 });

    const formattedHistory = history.map((item) => {
      const it = item as unknown as { _id?: unknown; action?: string; performedBy?: unknown; performedAt?: Date; comment?: string };
      const performedById = it.performedBy && typeof it.performedBy === 'object' ? (it.performedBy as Record<string, unknown>)['_id'] : it.performedBy;
      return {
        id: it._id,
        action: it.action,
        performedBy: performedById,
        performedByName: (it.performedBy as Record<string, unknown>)?.name,
        performedAt: it.performedAt,
        comment: it.comment,
      };
    });

    res.json({
      success: true,
      data: formattedHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense
export const createExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    let attachments: string[] = [];
    let quotations: string[] = [];

    if (Array.isArray(files)) {
      attachments = files.map((file) => file.path);
    } else if (files) {
      attachments = files['attachments'] ? files['attachments'].map((file) => file.path) : [];
      quotations = files['quotations'] ? files['quotations'].map((file) => file.path) : [];
    }

    const expense = await Expense.create({
      ...req.body,
      submittedBy: req.user!.id,
      attachments,
      quotations,
    });

    // Create approval history entry
    await ApprovalHistory.create({
      expenseId: expense._id,
      action: 'submitted',
      performedBy: req.user!.id,
      comment: 'Expense submitted for approval',
    });

    const populatedExpense = await expense.populate('projectId', 'name code');

    res.status(201).json({
      success: true,
      data: populatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
export const updateExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      throw createError('Expense not found', 404);
    }

    // Only allow updates to pending expenses
    if (expense.status !== 'Pending') {
      throw createError('Cannot update expense that is not pending', 400);
    }

    // Check if user is the submitter
    if (expense.submittedBy.toString() !== req.user!.id && req.user!.role !== 'Admin') {
      throw createError('Not authorized to update this expense', 403);
    }

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const newAttachments = files.map((file) => file.path);
      req.body.attachments = [...expense.attachments, ...newAttachments];
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('projectId', 'name code');

    res.json({
      success: true,
      data: updatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
export const deleteExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      throw createError('Expense not found', 404);
    }

    // Check if user is the submitter or admin
    if (expense.submittedBy.toString() !== req.user!.id && req.user!.role !== 'Admin') {
      throw createError('Not authorized to delete this expense', 403);
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject expense
export const approveExpense = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { expenseId, action, comment } = req.body;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      throw createError('Expense not found', 404);
    }

    if (expense.status !== 'Pending') {
      throw createError('Expense is not pending approval', 400);
    }

    // Update expense status
    expense.status = action === 'approve' ? 'Approved' : 'Rejected';
    await expense.save();

    // Create approval history entry
    await ApprovalHistory.create({
      expenseId: expense._id,
      action: action === 'approve' ? 'approved' : 'rejected',
      performedBy: req.user!.id,
      comment: comment || undefined,
    });

    const populatedExpense = await expense.populate('projectId', 'name code');

    res.json({
      success: true,
      data: populatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add payment to expense
export const addPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      throw createError('Expense not found', 404);
    }

    if (expense.status !== 'Approved' && expense.status !== 'Partially Paid') {
      throw createError('Expense must be approved before adding payments', 400);
    }

    const { amount, method, transactionRef, chequeNumber, bankName, cardLastFour, notes } = req.body;
    const files = req.files as Express.Multer.File[];
    const attachments = files ? files.map((file) => file.path) : [];

    const paymentAmount = parseFloat(amount);
    const newPaidAmount = expense.paidAmount + paymentAmount;

    if (newPaidAmount > expense.amount) {
      throw createError('Payment amount exceeds expense amount', 400);
    }

    // Add payment proof
    expense.paymentProofs.push({
      amount: paymentAmount,
      paidAt: new Date(),
      paidBy: new mongoose.Types.ObjectId(req.user!.id),
      method,
      transactionRef,
      chequeNumber,
      bankName,
      cardLastFour,
      notes,
      attachments,
    });

    expense.paidAmount = newPaidAmount;

    // Update status
    if (newPaidAmount >= expense.amount) {
      expense.status = 'Paid';
    } else {
      expense.status = 'Partially Paid';
    }

    await expense.save();

    // Create approval history entry
    await ApprovalHistory.create({
      expenseId: expense._id,
      action: 'payment_added',
      performedBy: req.user!.id,
      comment: `Payment of ₹${paymentAmount} added via ${method}`,
    });

    // Update project spent amount
    const project = await Project.findById(expense.projectId);
    if (project) {
      project.spent = (project.spent || 0) + paymentAmount;
      await project.save();
    }

    const populatedExpense = await expense.populate('projectId', 'name code');

    res.json({
      success: true,
      data: populatedExpense,
    });
  } catch (error) {
    next(error);
  }
};
