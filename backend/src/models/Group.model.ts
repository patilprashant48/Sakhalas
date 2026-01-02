import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  type: 'trip' | 'roommates' | 'event' | 'project' | 'household' | 'other';
  members: mongoose.Types.ObjectId[];
  guestMembers: string[]; // Members without accounts (just names)
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['trip', 'roommates', 'event', 'project', 'household', 'other'],
      default: 'other',
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    guestMembers: [{
      type: String,
      trim: true,
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching and filtering
groupSchema.index({ name: 1 });
groupSchema.index({ members: 1 });
groupSchema.index({ createdBy: 1 });

export const Group = mongoose.model<IGroup>('Group', groupSchema);
