import { Router } from 'express';
import { body } from 'express-validator';
import * as groupController from '../controllers/group.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// @route   POST /api/groups
// @desc    Create new group
// @access  Private
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Group name is required'),
    body('type').isIn(['trip', 'roommates', 'event', 'project', 'household', 'other']).withMessage('Invalid group type'),
    body('members').isArray().withMessage('Members must be an array'),
  ],
  groupController.createGroup
);

// @route   GET /api/groups
// @desc    Get all user's groups
// @access  Private
router.get('/', groupController.getUserGroups);

// @route   GET /api/groups/:id
// @desc    Get group by ID
// @access  Private
router.get('/:id', groupController.getGroupById);

// @route   PUT /api/groups/:id
// @desc    Update group
// @access  Private
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Group name cannot be empty'),
    body('type').optional().isIn(['trip', 'roommates', 'event', 'project', 'household', 'other']).withMessage('Invalid group type'),
  ],
  groupController.updateGroup
);

// @route   POST /api/groups/:id/members
// @desc    Add member to group
// @access  Private
router.post(
  '/:id/members',
  [
    body('userId').optional().notEmpty().withMessage('User ID cannot be empty'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  ],
  groupController.addMember
);

// @route   DELETE /api/groups/:id/members
// @desc    Remove member from group
// @access  Private
router.delete(
  '/:id/members',
  [body('userId').notEmpty().withMessage('User ID is required')],
  groupController.removeMember
);

// @route   DELETE /api/groups/:id
// @desc    Deactivate group
// @access  Private
router.delete('/:id', groupController.deactivateGroup);

export default router;
