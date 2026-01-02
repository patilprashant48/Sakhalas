import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { createError } from '../middleware/errorHandler';
import { AuthRequest, authenticate } from '../middleware/auth';

// Generate JWT token
const generateToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  // Convert '7d' to seconds (7 days = 604800 seconds)
  const expiresIn = 604800; // 7 days in seconds
  return jwt.sign(
    { id: userId, email, role },
    secret,
    { expiresIn }
  );
};

// @desc    Logout user (client-side token removal)
export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // If using cookies for sessions, clear cookie here. For JWT in localStorage, client removes token.
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh JWT token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET || 'default-secret';
    let payload: unknown;
    try {
      payload = jwt.verify(token, secret) as unknown;
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const payloadTyped = payload as { id?: string } | undefined;
    const user = await User.findById(payloadTyped?.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newToken = generateToken(user._id.toString(), user.email, user.role);
    res.json({ accessToken: newToken });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify two-factor (stub)
export const verifyTwoFactor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as { email?: string; otp?: string };
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // NOTE: Real OTP verification should be implemented here. This is a simple stub that
    // issues a token when called for the given email.
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          requiresTwoFactor: user.requiresTwoFactor,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
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
