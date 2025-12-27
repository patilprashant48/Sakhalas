import { useForm, Controller } from 'react-hook-form';
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
  Typography,
} from '@mui/material';
import type { PaymentFormData } from '../../types/expense.types';
import { formatCurrency } from '../../utils/formatters';

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paidAt: z.string().min(1, 'Payment date is required'),
  notes: z.string().optional(),
});

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData, file?: File) => void;
  expenseAmount: number;
  paidAmount: number;
  loading?: boolean;
}

export const PaymentForm = ({
  open,
  onClose,
  onSubmit,
  expenseAmount,
  paidAmount,
  loading,
}: PaymentFormProps) => {
  const remainingAmount = expenseAmount - paidAmount;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingAmount,
      paidAt: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onFormSubmit = (data: PaymentFormData) => {
    const fileInput = document.getElementById('payment-proof-upload') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    onSubmit(data, file);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Payment</DialogTitle>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Total Amount: {formatCurrency(expenseAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paid Amount: {formatCurrency(paidAmount)}
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                Remaining: {formatCurrency(remainingAmount)}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="amount"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    onChange={(e) => onChange(Number(e.target.value))}
                    label="Payment Amount"
                    type="number"
                    fullWidth
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    inputProps={{ max: remainingAmount, step: '0.01' }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="paidAt"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Payment Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.paidAt}
                    helperText={errors.paidAt?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notes (Optional)"
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth>
                Upload Payment Proof (Optional)
                <input
                  id="payment-proof-upload"
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Add Payment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
