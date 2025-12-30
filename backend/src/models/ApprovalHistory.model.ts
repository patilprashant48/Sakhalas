import mongoose, { Document, Schema } from 'mongoose';

export interface IApprovalHistory extends Document {
  expenseId: mongoose.Types.ObjectId;
  action: 'submitted' | 'approved' | 'rejected' | 'payment_added';
  performedBy: mongoose.Types.ObjectId;
  performedAt: Date;
  comment?: string;
}

const approvalHistorySchema = new Schema<IApprovalHistory>(
  {
    expenseId: {
      type: Schema.Types.ObjectId,
      ref: 'Expense',
      required: true,
    },
    action: {
      type: String,
      enum: ['submitted', 'approved', 'rejected', 'payment_added'],
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedAt: {
      type: Date,
      default: Date.now,
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying history
approvalHistorySchema.index({ expenseId: 1, performedAt: -1 });

export const ApprovalHistory = mongoose.model<IApprovalHistory>(
  'ApprovalHistory',
  approvalHistorySchema
);
