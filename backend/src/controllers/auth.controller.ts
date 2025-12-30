import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { createError } from '../middleware/errorHandler';
import { AuthRequest, authenticate } from '../middleware/auth';

// Generate JWT token
const generateToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const options: jwt.SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' };
  return jwt.sign(
    { id: userId, email, role },
    secret,
    options
  );
};

// @desc    Register new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, department, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError('User already exists with this email', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
      department,
      phone,
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          requiresTwoFactor: user.requiresTwoFactor,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      throw createError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          requiresTwoFactor: user.requiresTwoFactor,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
export const getCurrentUser = [
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone,
          requiresTwoFactor: user.requiresTwoFactor,
        },
      });
    } catch (error) {
      next(error);
    }
  },
];

// @desc    Update user profile
export const updateProfile = [
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, department, phone } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user!.id,
        { name, department, phone },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
];

// @desc    Change password
export const changePassword = [
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user!.id).select('+password');
      if (!user) {
        throw createError('User not found', 404);
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw createError('Current password is incorrect', 401);
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },
];
