import { Response, NextFunction } from 'express';
import { Project } from '../models/Project.model';
import { Expense } from '../models/Expense.model';
import { AuthRequest } from '../middleware/auth';

// @desc    Get company dashboard data
export const getCompanyDashboard = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const projects = await Project.find({ status: { $ne: 'Archived' } });
    const expenses = await Expense.find();

    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paidExpenses = expenses
      .filter((e) => e.status === 'Paid')
      .reduce((sum, e) => sum + e.amount, 0);

    // Budget utilization by project
    const budgetUtilization = projects.map((p) => ({
      name: p.name,
      budget: p.budget,
      spent: p.spent || 0,
      percentage: p.budget > 0 ? ((p.spent || 0) / p.budget) * 100 : 0,
    }));

    // Expense breakdown by category
    const categoryMap = new Map<string, number>();
    expenses.forEach((e) => {
      const current = categoryMap.get(e.category) || 0;
      categoryMap.set(e.category, current + e.amount);
    });

    const expenseBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    // Monthly spending trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          amount: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const spendingTrend = monthlyExpenses.map((item) => ({
      month: monthNames[item._id.month - 1],
      amount: item.amount,
    }));

    // Pending approvals
    const pendingApprovals = await Expense.find({ status: 'Pending' }).countDocuments();

    res.json({
      success: true,
      data: {
        summary: {
          totalBudget,
          totalSpent,
          totalExpenses,
          paidExpenses,
          pendingApprovals,
          activeProjects: projects.filter((p) => p.status === 'Active').length,
        },
        budgetUtilization,
        expenseBreakdown,
        spendingTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project dashboard data
export const getProjectDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const expenses = await Expense.find({ projectId });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paidExpenses = expenses
      .filter((e) => e.status === 'Paid')
      .reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = expenses
      .filter((e) => e.status === 'Pending')
      .reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown
    const categoryMap = new Map<string, number>();
    expenses.forEach((e) => {
      const current = categoryMap.get(e.category) || 0;
      categoryMap.set(e.category, current + e.amount);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    // Status breakdown
    const statusMap = new Map<string, number>();
    expenses.forEach((e) => {
      const current = statusMap.get(e.status) || 0;
      statusMap.set(e.status, current + 1);
    });

    const approvalPipeline = Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    res.json({
      success: true,
      data: {
        project: {
          name: project.name,
          budget: project.budget,
          spent: project.spent || 0,
          progress: project.progress || 0,
        },
        summary: {
          totalExpenses,
          paidExpenses,
          pendingExpenses,
          expenseCount: expenses.length,
        },
        categoryBreakdown,
        approvalPipeline,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's payments
export const getTodayPayments = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const expenses = await Expense.find({
      'paymentProofs.paidAt': {
        $gte: today,
        $lt: tomorrow,
      },
    })
      .populate('projectId', 'name')
      .limit(10);

    const payments = expenses.map((expense: any) => ({
      id: expense._id,
      projectName: expense.projectId?.name,
      vendor: expense.vendor,
      category: expense.category,
      amount: expense.amount,
      status: expense.status,
    }));

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};
