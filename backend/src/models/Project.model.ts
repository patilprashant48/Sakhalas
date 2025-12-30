import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  code: string;
  description: string;
  managerId: mongoose.Types.ObjectId;
  budget: number;
  spent: number;
  startDate: Date;
  endDate: Date;
  status: 'Active' | 'Completed' | 'On Hold' | 'Archived';
  progress: number;
  category: string;
  location?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Project code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Manager is required'],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget must be positive'],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount must be positive'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'On Hold', 'Archived'],
      default: 'Active',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    location: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
projectSchema.index({ name: 'text', code: 'text', description: 'text' });

export const Project = mongoose.model<IProject>('Project', projectSchema);
