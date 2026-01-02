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

    // Additional KPIs
    const totalProjects = projects.length;

    const totalApprovedUnpaid = expenses
      .filter((e) => (e.status === 'Approved' || e.status === 'Partially Paid') && (e.paidAmount || 0) < e.amount)
      .reduce((sum, e) => sum + (e.amount - (e.paidAmount || 0)), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalOverdueAmount = expenses
      .filter((e) => {
        const ex = e as unknown as { dueDate?: Date | string; status?: string };
        return ex.dueDate && new Date(ex.dueDate) < today && ex.status !== 'Paid';
      })
      .reduce((sum, e) => {
        const ex = e as unknown as { amount?: number; paidAmount?: number };
        return sum + ((ex.amount || 0) - (ex.paidAmount || 0));
      }, 0);

    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);

    const upcomingPaymentsList = expenses.filter((e) => {
      const ex = e as unknown as { dueDate?: Date | string; status?: string };
      return ex.dueDate && new Date(ex.dueDate) >= today && new Date(ex.dueDate) <= sevenDays && ex.status !== 'Paid';
    });
    const upcomingPaymentsCount = upcomingPaymentsList.length;
    const upcomingPaymentsAmount = upcomingPaymentsList.reduce((sum, e) => {
      const ex = e as unknown as { amount?: number; paidAmount?: number };
      return sum + ((ex.amount || 0) - (ex.paidAmount || 0));
    }, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalProjects,
          activeProjects: projects.filter((p) => p.status === 'Active').length,
          totalBudget,
          totalSpent,
          totalExpenses,
          paidExpenses,
          pendingApprovals,
          totalApprovedUnpaid,
          totalOverdueAmount,
          upcomingPaymentsCount,
          upcomingPaymentsAmount,
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

// @desc Get expenses aggregated by project
export const getExpensesByProject = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const total = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalAmount = total[0]?.total || 0;

    const data = await Expense.aggregate([
      { $group: { _id: '$projectId', amount: { $sum: '$amount' } } },
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $project: { projectName: '$project.name', amount: 1 } },
      { $sort: { amount: -1 } },
      { $limit: 20 },
    ]);

    const result = data.map((d) => {
      const dd = d as unknown as { projectName?: string; amount?: number };
      return {
        projectName: dd.projectName || 'Unknown',
        amount: dd.amount || 0,
        percentage: totalAmount > 0 ? ((dd.amount || 0) / totalAmount) * 100 : 0,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc Get expenses aggregated by category
export const getExpensesByCategory = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const total = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalAmount = total[0]?.total || 0;

    const data = await Expense.aggregate([
      { $group: { _id: '$category', amount: { $sum: '$amount' } } },
      { $project: { category: '$_id', amount: 1, _id: 0 } },
      { $sort: { amount: -1 } },
    ]);

    const result = data.map((d) => {
      const dd = d as unknown as { category?: string; amount?: number };
      return {
        category: dd.category || 'Unknown',
        amount: dd.amount || 0,
        percentage: totalAmount > 0 ? ((dd.amount || 0) / totalAmount) * 100 : 0,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc Get overdue payments
export const getOverduePayments = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expenses = await Expense.find({
      dueDate: { $lt: today },
      status: { $ne: 'Paid' },
    })
      .populate('projectId', 'name')
      .limit(20);

    const result = expenses.map((e) => {
      const ex = e as unknown as { dueDate?: Date | string; _id?: unknown; projectId?: { name?: string }; vendor?: string; amount?: number; paidAmount?: number };
      const due = ex.dueDate ? new Date(ex.dueDate) : null;
      const diff = due ? Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return {
        id: ex._id,
        projectName: ex.projectId?.name || 'Unknown',
        vendor: ex.vendor,
        amount: (ex.amount || 0) - (ex.paidAmount || 0),
        dueDate: ex.dueDate,
        overdueDays: diff,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc Get upcoming payments (next 7 days)
export const getUpcomingPayments = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inSeven = new Date(today);
    inSeven.setDate(inSeven.getDate() + 7);

    const expenses = await Expense.find({
      dueDate: { $gte: today, $lte: inSeven },
      status: { $ne: 'Paid' },
    })
      .populate('projectId', 'name')
      .limit(20);

    const result = expenses.map((e) => {
      const ex = e as unknown as { dueDate?: Date | string; _id?: unknown; projectId?: { name?: string }; vendor?: string; category?: string; amount?: number; paidAmount?: number };
      const due = ex.dueDate ? new Date(ex.dueDate) : null;
      const diff = due ? Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return {
        id: ex._id,
        projectName: ex.projectId?.name || 'Unknown',
        vendor: ex.vendor,
        category: ex.category,
        amount: (ex.amount || 0) - (ex.paidAmount || 0),
        dueDate: ex.dueDate,
        daysUntilDue: diff,
      };
    });

    res.json({ success: true, data: result });
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

    const payments = expenses.map((expense) => {
      const ex = expense as unknown as { _id?: unknown; projectId?: { name?: string }; vendor?: string; category?: string; amount?: number; status?: string };
      return {
        id: ex._id,
        projectName: ex.projectId?.name,
        vendor: ex.vendor,
        category: ex.category,
        amount: ex.amount,
        status: ex.status,
      };
    });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};
