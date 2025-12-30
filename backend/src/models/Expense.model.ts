import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentProof {
  amount: number;
  paidAt: Date;
  paidBy: mongoose.Types.ObjectId;
  method: 'Card' | 'Cash' | 'Cheque' | 'Bank Transfer' | 'Other';
  transactionRef?: string;
  chequeNumber?: string;
  bankName?: string;
  cardLastFour?: string;
  notes?: string;
  attachments: string[];
}

export interface IExpense extends Document {
  projectId: mongoose.Types.ObjectId;
  category: 'Labor' | 'Materials' | 'Equipment' | 'Services' | 'Transportation' | 'Infrastructure' | 'Marketing' | 'Other';
  amount: number;
  vendor: string;
  description: string;
  date: Date;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Partially Paid' | 'Paid';
  submittedBy: mongoose.Types.ObjectId;
  submittedAt: Date;
  invoiceNumber?: string;
  billOfSupply?: string;
  attachments: string[];
  paidAmount: number;
  paymentProofs: IPaymentProof[];
  createdAt: Date;
  updatedAt: Date;
}

const paymentProofSchema = new Schema<IPaymentProof>({
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
  paidBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  method: {
    type: String,
    enum: ['Card', 'Cash', 'Cheque', 'Bank Transfer', 'Other'],
    required: true,
  },
  transactionRef: String,
  chequeNumber: String,
  bankName: String,
  cardLastFour: String,
  notes: String,
  attachments: [String],
});

const expenseSchema = new Schema<IExpense>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    category: {
      type: String,
      enum: ['Labor', 'Materials', 'Equipment', 'Services', 'Transportation', 'Infrastructure', 'Marketing', 'Other'],
      required: [true, 'Category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    vendor: {
      type: String,
      required: [true, 'Vendor is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Partially Paid', 'Paid'],
      default: 'Pending',
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    billOfSupply: {
      type: String,
      trim: true,
    },
    attachments: [String],
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentProofs: [paymentProofSchema],
  },
  {
    timestamps: true,
  }
);

// Index for searching and filtering
expenseSchema.index({ projectId: 1, status: 1, date: -1 });
expenseSchema.index({ submittedBy: 1, date: -1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
