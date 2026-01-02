import mongoose, { Document, Schema } from 'mongoose';

export type SplitType = 'equal' | 'percentage' | 'exact' | 'shares';

export interface IParticipant {
  userId: mongoose.Types.ObjectId | string;
  amount?: number;
  percentage?: number;
  shares?: number;
  paid?: boolean;
}

export interface IExpenseSplit extends Document {
  expenseId: mongoose.Types.ObjectId;
  paidBy?: mongoose.Types.ObjectId | string;
  totalAmount: number;
  splitType: SplitType;
  participants: IParticipant[];
  groupId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<IParticipant>({
  userId: {
    type: Schema.Types.Mixed,
    required: true,
  },
  amount: {
    type: Number,
    min: 0,
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  shares: {
    type: Number,
    min: 0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
});

const expenseSplitSchema = new Schema<IExpenseSplit>(
  {
    expenseId: {
      type: Schema.Types.ObjectId,
      ref: 'Expense',
      required: true,
    },
    paidBy: {
      type: Schema.Types.Mixed,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    splitType: {
      type: String,
      enum: ['equal', 'percentage', 'exact', 'shares'],
      default: 'equal',
    },
    participants: [participantSchema],
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
expenseSplitSchema.index({ expenseId: 1 });
expenseSplitSchema.index({ paidBy: 1 });
expenseSplitSchema.index({ 'participants.userId': 1 });
expenseSplitSchema.index({ groupId: 1 });

export const ExpenseSplit = mongoose.model<IExpenseSplit>('ExpenseSplit', expenseSplitSchema);
