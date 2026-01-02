import { Router } from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', projectController.getAllProjects);

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', projectController.getProjectById);

// @route   GET /api/projects/:id/stats
// @desc    Get project statistics
// @access  Private
router.get('/:id/stats', projectController.getProjectStats);

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin, Project Manager)
router.post(
  '/',
  authorize('Admin', 'Project Manager'),
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('managerId').notEmpty().withMessage('Manager is required'),
    body('budget').isNumeric().withMessage('Budget must be a number'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
  ],
  projectController.createProject
);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin, Project Manager)
router.put(
  '/:id',
  authorize('Admin', 'Project Manager'),
  projectController.updateProject
);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin)
router.delete('/:id', authorize('Admin'), projectController.deleteProject);

// @route   PATCH /api/projects/:id/archive
// @desc    Archive project
// @access  Private (Admin, Project Manager)
router.patch(
  '/:id/archive',
  authorize('Admin', 'Project Manager'),
  projectController.archiveProject
);

export default router;
