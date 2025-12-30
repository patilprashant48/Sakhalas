import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Project } from '../models/Project.model';
import { Expense } from '../models/Expense.model';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all projects
export const getAllProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, managerId, search } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (managerId) filter.managerId = managerId;
    if (search) {
      filter.$text = { $search: search as string };
    }

    const projects = await Project.find(filter)
      .populate('managerId', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('managerId', 'name email')
      .populate('createdBy', 'name email');

    if (!project) {
      throw createError('Project not found', 404);
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project statistics
export const getProjectStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw createError('Project not found', 404);
    }

    // Calculate expenses
    const expenses = await Expense.find({ projectId: req.params.id });
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const paidExpenses = expenses
      .filter((e) => e.status === 'Paid')
      .reduce((sum, exp) => sum + exp.amount, 0);
    const pendingExpenses = expenses
      .filter((e) => e.status === 'Pending')
      .reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      success: true,
      data: {
        budget: project.budget,
        spent: project.spent,
        totalExpenses,
        paidExpenses,
        pendingExpenses,
        remaining: project.budget - project.spent,
        progress: project.progress,
        expenseCount: expenses.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.create({
      ...req.body,
      createdBy: req.user!.id,
    });

    const populatedProject = await project.populate('managerId', 'name email');

    res.status(201).json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('managerId', 'name email');

    if (!project) {
      throw createError('Project not found', 404);
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      throw createError('Project not found', 404);
    }

    // Also delete associated expenses
    await Expense.deleteMany({ projectId: req.params.id });

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive project
export const archiveProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'Archived' },
      { new: true }
    );

    if (!project) {
      throw createError('Project not found', 404);
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
