import { Router } from 'express';
import { body } from 'express-validator';
import * as splitController from '../controllers/split.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/splits
// @desc    Create expense split
// @access  Private
router.post('/', splitController.createSplit);

// @route   GET /api/splits/expense/:expenseId
// @desc    Get split by expense ID
// @access  Private
router.get('/expense/:expenseId', splitController.getSplitByExpenseId);

// @route   PATCH /api/splits/:splitId/participant/:participantUserId/paid
// @desc    Mark participant as paid
// @access  Private
router.patch('/:splitId/participant/:participantUserId/paid', splitController.markParticipantPaid);

// @route   GET /api/splits/balances
// @desc    Get user balances
// @access  Private
router.get('/balances', splitController.getUserBalances);

// @route   POST /api/splits/settlements
// @desc    Create settlement
// @access  Private
router.post(
  '/settlements',
  [
    body('toUser').notEmpty().withMessage('Recipient is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('method').isIn(['cash', 'bank_transfer', 'upi', 'card', 'wallet', 'other']).withMessage('Invalid payment method'),
  ],
  splitController.createSettlement
);

// @route   GET /api/splits/settlements
// @desc    Get settlement history
// @access  Private
router.get('/settlements', splitController.getSettlements);

export default router;
