import mongoose, { Document, Schema } from 'mongoose';

export interface ISettlement extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'upi' | 'card' | 'wallet' | 'other';
  transactionRef?: string;
  notes?: string;
  groupId?: mongoose.Types.ObjectId;
  settledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const settlementSchema = new Schema<ISettlement>(
  {
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ['cash', 'bank_transfer', 'upi', 'card', 'wallet', 'other'],
      required: true,
    },
    transactionRef: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
    settledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
settlementSchema.index({ fromUser: 1, toUser: 1 });
settlementSchema.index({ groupId: 1 });
settlementSchema.index({ settledAt: -1 });

export const Settlement = mongoose.model<ISettlement>('Settlement', settlementSchema);
