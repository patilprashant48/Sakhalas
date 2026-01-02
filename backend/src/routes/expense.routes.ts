import { Router } from 'express';
import { body } from 'express-validator';
import * as expenseController from '../controllers/expense.controller';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/expenses
// @desc    Get all expenses
// @access  Private
router.get('/', expenseController.getAllExpenses);

// @route   GET /api/expenses/pending-approvals
// @desc    Get pending approvals
// @access  Private (Admin, Project Manager, Treasurer)
router.get(
  '/pending-approvals',
  authorize('Admin', 'Project Manager', 'Treasurer'),
  expenseController.getPendingApprovals
);

// @route   GET /api/expenses/:id
// @desc    Get expense by ID
// @access  Private
router.get('/:id', expenseController.getExpenseById);

// @route   GET /api/expenses/:id/history
// @desc    Get approval history
// @access  Private
router.get('/:id/history', expenseController.getApprovalHistory);

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private
router.post(
  '/',
  upload.fields([{ name: 'attachments', maxCount: 10 }, { name: 'quotations', maxCount: 10 }]),
  [
    body('projectId').notEmpty().withMessage('Project is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('vendor').trim().notEmpty().withMessage('Vendor is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  expenseController.createExpense
);

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put(
  '/:id',
  upload.array('attachments', 5),
  expenseController.updateExpense
);

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', expenseController.deleteExpense);

// @route   POST /api/expenses/approve
// @desc    Approve/Reject expense
// @access  Private (Admin, Project Manager, Treasurer)
router.post(
  '/approve',
  authorize('Admin', 'Project Manager', 'Treasurer'),
  [
    body('expenseId').notEmpty().withMessage('Expense ID is required'),
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  ],
  expenseController.approveExpense
);

// @route   POST /api/expenses/:id/payments
// @desc    Add payment to expense
// @access  Private (Admin, Treasurer)
router.post(
  '/:id/payments',
  authorize('Admin', 'Treasurer'),
  upload.array('attachments', 5),
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('method').isIn(['Card', 'Cash', 'Cheque', 'Bank Transfer', 'Other']).withMessage('Invalid payment method'),
  ],
  expenseController.addPayment
);

export default router;
