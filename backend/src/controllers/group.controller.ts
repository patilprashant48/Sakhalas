import { Response, NextFunction } from 'express';
import { Group } from '../models/Group.model';
import { User } from '../models/User.model';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// @desc    Create new group
export const createGroup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, type, members } = req.body;
    const createdBy = req.user!.id;

    // Ensure creator is in members list
    const allMembers = Array.from(new Set([createdBy, ...members]));

    const group = await Group.create({
      name,
      description,
      type,
      members: allMembers,
      createdBy,
    });

    const populated = await group.populate('members', 'name email');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user's groups
export const getUserGroups = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;

    const groups = await Group.find({
      members: userId,
      isActive: true,
    })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group by ID
export const getGroupById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!group) {
      throw createError('Group not found', 404);
    }

    // Check if user is member
    const userId = req.user!.id;
    const isMember = group.members.some(
      (member) => member._id.toString() === userId
    );

    if (!isMember) {
      throw createError('Access denied', 403);
    }

    res.json({
      success: true,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update group
export const updateGroup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, type } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      throw createError('Group not found', 404);
    }

    // Only creator can update
    if (group.createdBy.toString() !== req.user!.id) {
      throw createError('Only group creator can update', 403);
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (type) group.type = type;

    await group.save();

    const populated = await group.populate('members', 'name email');

    res.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to group
export const addMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, name } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      throw createError('Group not found', 404);
    }

    // Check if requester is member
    const requesterId = req.user!.id;
    const isMember = group.members.some(
      (member) => member.toString() === requesterId
    );

    if (!isMember) {
      throw createError('Only members can add new members', 403);
    }

    let userIdToAdd = userId;

    // If name is provided instead of userId, search for user by name
    if (!userIdToAdd && name) {
      const user = await User.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      
      if (!user) {
        // User not found - add as guest member
        // Initialize guestMembers array if it doesn't exist
        if (!group.guestMembers) {
          group.guestMembers = [];
        }
        
        // Check if guest member already exists
        if (group.guestMembers.includes(name)) {
          throw createError('Member already added to group', 400);
        }
        
        group.guestMembers.push(name);
        await group.save();
        
        const populated = await group.populate('members', 'name email');
        return res.status(200).json({
          success: true,
          data: populated,
        });
      }
      
      userIdToAdd = user._id.toString();
    }

    if (!userIdToAdd) {
      throw createError('User ID or name is required', 400);
    }

    // Check if user already a member
    if (group.members.some((member) => member.toString() === userIdToAdd)) {
      throw createError('User already a member', 400);
    }

    group.members.push(userIdToAdd);
    await group.save();

    const populated = await group.populate('members', 'name email');

    res.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from group
export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, name } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      throw createError('Group not found', 404);
    }

    // Only creator can remove members (or user can remove themselves)
    const requesterId = req.user!.id;
    if (group.createdBy.toString() !== requesterId && userId !== requesterId) {
      throw createError('Only group creator can remove members', 403);
    }

    // If name is provided, try to remove from guest members
    if (name && group.guestMembers) {
      const guestIndex = group.guestMembers.findIndex(g => g === name);
      if (guestIndex !== -1) {
        group.guestMembers.splice(guestIndex, 1);
        await group.save();
        const populated = await group.populate('members', 'name email');
        return res.json({
          success: true,
          data: populated,
        });
      }
    }

    // Cannot remove creator
    if (userId === group.createdBy.toString()) {
      throw createError('Cannot remove group creator', 400);
    }

    group.members = group.members.filter(
      (member) => member.toString() !== userId
    );
    await group.save();

    const populated = await group.populate('members', 'name email');

    res.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate group
export const deactivateGroup = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      throw createError('Group not found', 404);
    }

    // Only creator can deactivate
    if (group.createdBy.toString() !== req.user!.id) {
      throw createError('Only group creator can deactivate', 403);
    }

    group.isActive = false;
    await group.save();

    res.json({
      success: true,
      message: 'Group deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
