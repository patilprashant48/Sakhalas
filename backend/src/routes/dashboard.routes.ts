import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// @route   GET /api/dashboard/today-payments
// @desc    Get today's payments
// @access  Public
router.get('/today-payments', dashboardController.getTodayPayments);

// Public endpoints for lists
router.get('/expenses-by-project', dashboardController.getExpensesByProject);
router.get('/expenses-by-category', dashboardController.getExpensesByCategory);
router.get('/overdue-payments', dashboardController.getOverduePayments);
router.get('/upcoming-payments', dashboardController.getUpcomingPayments);

// Protected routes require authentication
router.use(authenticate);

// @route   GET /api/dashboard/company
// @desc    Get company dashboard data
// @access  Private
router.get('/company', dashboardController.getCompanyDashboard);

// @route   GET /api/dashboard/project/:projectId
// @desc    Get project dashboard data
// @access  Private
router.get('/project/:projectId', dashboardController.getProjectDashboard);

export default router;
