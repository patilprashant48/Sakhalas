import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
} from '@mui/material';
import type { ExpenseFormData } from '../../types/expense.types';
import { EXPENSE_CATEGORIES, REMINDER_FREQUENCIES, PAYMENT_METHODS } from '../../utils/constants';

const expenseSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  category: z.enum(['Materials', 'Labor', 'Equipment', 'Services', 'Travel', 'Utilities', 'Other']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  vendor: z.string().min(2, 'Vendor name is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  date: z.string().min(1, 'Date is required'),
  reminderDate: z.string().optional(),
  reminderFrequency: z.enum(['Daily', 'Weekly', 'Monthly']).optional(),
  dueDate: z.string().optional(),
  paymentMethod: z.enum(['Card', 'Cash', 'Cheque', 'Bank Transfer', 'Other']).optional(),
  // Card payment fields
  cardOwnerName: z.string().optional(),
  cardLast4Digits: z.string().regex(/^\d{4}$/, 'Must be exactly 4 digits').optional(),
  // Cheque payment fields
  chequeNumber: z.string().optional(),
  bankName: z.string().optional(),
  // Bank Transfer field
  transferReference: z.string().optional(),
  // Other payment field
  paymentNotes: z.string().optional(),
  status: z.enum(['Draft', 'Pending']),
}).refine(
  (data) => {
    // Validate Card payment
    if (data.paymentMethod === 'Card') {
      return data.cardOwnerName && data.cardLast4Digits;
    }
    // Validate Cheque payment
    if (data.paymentMethod === 'Cheque') {
      return data.chequeNumber && data.bankName;
    }
    // Validate Bank Transfer
    if (data.paymentMethod === 'Bank Transfer') {
      return data.transferReference;
    }
    return true;
  },
  {
    message: 'Please fill in all required payment details',
    path: ['paymentMethod'],
  }
);

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData, file?: File) => void;
  loading?: boolean;
  projects: { id: string; name: string }[];
}

export const ExpenseForm = ({ open, onClose, onSubmit, loading, projects }: ExpenseFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      projectId: '',
      category: 'Materials',
      amount: 0,
      vendor: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    },
  });

  const paymentMethod = useWatch({ control, name: 'paymentMethod' });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onFormSubmit = (data: ExpenseFormData) => {
    const fileInput = document.getElementById('bill-upload') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    onSubmit(data, file);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Expense</DialogTitle>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="projectId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Project"
                    fullWidth
                    select
                    error={!!errors.projectId}
                    helperText={errors.projectId?.message}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Category"
                    fullWidth
                    select
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  >
                    {EXPENSE_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="amount"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    onChange={(e) => onChange(Number(e.target.value))}
                    label="Amount"
                    type="number"
                    fullWidth
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="vendor"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Vendor"
                    fullWidth
                    error={!!errors.vendor}
                    helperText={errors.vendor?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Expense Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Due Date (Optional)"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.dueDate}
                    helperText={errors.dueDate?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="reminderDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Reminder Date (Optional)"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="reminderFrequency"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Reminder Frequency" fullWidth select>
                    {REMINDER_FREQUENCIES.map((freq) => (
                      <MenuItem key={freq} value={freq}>
                        {freq}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Payment Method Section */}
            <Grid item xs={12}>
              <TextField
                label="Payment Details"
                fullWidth
                disabled
                value="Payment Details"
                InputProps={{
                  style: { fontWeight: 600, color: 'primary.main' }
                }}
                sx={{ 
                  '& .MuiInputBase-input.Mui-disabled': { 
                    WebkitTextFillColor: (theme) => theme.palette.text.primary,
                    fontWeight: 600,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    label="Payment Method" 
                    fullWidth 
                    select
                    error={!!errors.paymentMethod}
                    helperText={errors.paymentMethod?.message}
                  >
                    <MenuItem value="">-- Select Payment Method --</MenuItem>
                    {PAYMENT_METHODS.map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Card Payment Fields */}
            {paymentMethod === 'Card' && (
              <>
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    🔒 <strong>Security:</strong> Never enter full card numbers. Only last 4 digits are required.
                  </Alert>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="cardOwnerName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Card Owner Name *"
                        fullWidth
                        placeholder="e.g., John Doe"
                        error={!!errors.cardOwnerName}
                        helperText={errors.cardOwnerName?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="cardLast4Digits"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Last 4 Digits *"
                        fullWidth
                        placeholder="1234"
                        inputProps={{ maxLength: 4, pattern: '[0-9]{4}' }}
                        error={!!errors.cardLast4Digits}
                        helperText={errors.cardLast4Digits?.message || 'Only last 4 digits'}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            {/* Cheque Payment Fields */}
            {paymentMethod === 'Cheque' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="chequeNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cheque Number *"
                        fullWidth
                        placeholder="e.g., 123456"
                        error={!!errors.chequeNumber}
                        helperText={errors.chequeNumber?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="bankName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Bank Name *"
                        fullWidth
                        placeholder="e.g., HDFC Bank"
                        error={!!errors.bankName}
                        helperText={errors.bankName?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            {/* Bank Transfer Fields */}
            {paymentMethod === 'Bank Transfer' && (
              <Grid item xs={12}>
                <Controller
                  name="transferReference"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Reference Number *"
                      fullWidth
                      placeholder="e.g., TXN123456789"
                      error={!!errors.transferReference}
                      helperText={errors.transferReference?.message}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Other Payment Fields */}
            {paymentMethod === 'Other' && (
              <Grid item xs={12}>
                <Controller
                  name="paymentNotes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Payment Notes"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Describe the payment method used..."
                      error={!!errors.paymentNotes}
                      helperText={errors.paymentNotes?.message}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Cash - No additional fields needed */}
            {paymentMethod === 'Cash' && (
              <Grid item xs={12}>
                <Alert severity="info">
                  ✅ Cash payment selected. No additional details required.
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth>
                Upload Bill (Image/PDF)
                <input id="bill-upload" type="file" hidden accept="image/*,.pdf" />
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Status" fullWidth select>
                    <MenuItem value="Draft">Save as Draft</MenuItem>
                    <MenuItem value="Pending">Submit for Approval</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Save Expense
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
