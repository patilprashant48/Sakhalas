import { useForm, Controller, useWatch } from 'react-hook-form';
import { useRef, useCallback, useState, useEffect } from 'react';
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
  Box,
  Typography,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PAYMENT_FREQUENCIES } from '../../utils/constants';
import type { ExpenseFormData } from '../../types/expense.types';
import { EXPENSE_CATEGORIES, REMINDER_FREQUENCIES, PAYMENT_METHODS } from '../../utils/constants';
import { groupApi } from '../../api/group.api';
import type { SplitType, Participant } from '../../types/split.types';
import { enqueueSnackbar } from 'notistack';

const expenseSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  category: z.enum(['Materials', 'Labor', 'Equipment', 'Services', 'Travel', 'Utilities', 'Infrastructure', 'Marketing', 'Other']),
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
  // now supports multiple bill files and multiple quotation files, plus split configuration
  onSubmit: (
    data: ExpenseFormData, 
    billFiles: File[], 
    quotationFiles: File[],
    splitConfig?: { paidBy: string; splitType: SplitType; participants: Participant[]; groupId?: string }
  ) => void;
  loading?: boolean;
  projects: { id: string; name: string }[];
}

const SPLIT_TYPES: { value: SplitType; label: string }[] = [
  { value: 'equal', label: 'Equal Split' },
  { value: 'percentage', label: 'Percentage Split' },
  { value: 'exact', label: 'Exact Amount' },
  { value: 'shares', label: 'Shares/Items' },
];

export const ExpenseForm = ({ open, onClose, onSubmit, loading, projects }: ExpenseFormProps) => {
  const { user } = useAuth();
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
  const amount = useWatch({ control, name: 'amount' });
  const [billFileNames, setBillFileNames] = useState<string[]>([]);
  const [quotationFileNames, setQuotationFileNames] = useState<string[]>([]);
  
  // Split configuration state
  const [enableSplit, setEnableSplit] = useState(false);
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantId, setNewParticipantId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch groups when split is enabled
  useEffect(() => {
    if (enableSplit && groups.length === 0) {
      groupApi.getAll()
        .then(fetchedGroups => {
          setGroups(fetchedGroups.map(g => ({ id: g.id, name: g.name })));
        })
        .catch(err => {
          console.error('Failed to fetch groups', err);
        });
    }
  }, [enableSplit, groups.length]);

  const handleClose = () => {
    reset();
    setBillFileNames([]);
    setQuotationFileNames([]);
    setEnableSplit(false);
    setPaidBy('');
    setSplitType('equal');
    setParticipants([]);
    setNewParticipantId('');
    setGroupId('');
    onClose();
  };

  const addParticipant = () => {
    if (!newParticipantId.trim()) return;
    
    const exists = participants.some(p => p.userId === newParticipantId);
    if (exists) {
      enqueueSnackbar('Participant already added', { variant: 'warning' });
      return;
    }

    const newParticipant: Participant = {
      userId: newParticipantId,
      amount: splitType === 'exact' ? 0 : undefined,
      percentage: splitType === 'percentage' ? 0 : undefined,
      shares: splitType === 'shares' ? 1 : undefined,
    };
    
    setParticipants([...participants, newParticipant]);
    setNewParticipantId('');
  };

  const removeParticipant = (userId: string) => {
    setParticipants(participants.filter(p => p.userId !== userId));
  };

  const updateParticipant = (userId: string, field: keyof Participant, value: number) => {
    setParticipants(participants.map(p => 
      p.userId === userId ? { ...p, [field]: value } : p
    ));
  };

  const getTotalPercentage = () => {
    return participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
  };

  const getTotalAmount = () => {
    return participants.reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const billInputRef = useRef<HTMLInputElement | null>(null);
  const quotationInputRef = useRef<HTMLInputElement | null>(null);

  const handleBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const names = Array.from(files).map(f => f.name);
      setBillFileNames(names);
    } else {
      setBillFileNames([]);
    }
  };

  const handleQuotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const names = Array.from(files).map(f => f.name);
      setQuotationFileNames(names);
    } else {
      setQuotationFileNames([]);
    }
  };

  const onFormSubmit = useCallback(async (data: ExpenseFormData) => {
    const billFiles = billInputRef.current?.files ? Array.from(billInputRef.current.files) : [];
    const quotationFiles = quotationInputRef.current?.files ? Array.from(quotationInputRef.current.files) : [];
    
    // Validate split if enabled
    if (enableSplit) {
      if (participants.length === 0) {
        enqueueSnackbar('Please add at least one participant', { variant: 'error' });
        return;
      }
      if (splitType === 'percentage' && getTotalPercentage() !== 100) {
        enqueueSnackbar('Percentages must add up to 100%', { variant: 'error' });
        return;
      }
      if (splitType === 'exact' && Math.abs(getTotalAmount() - data.amount) > 0.01) {
        enqueueSnackbar('Exact amounts must equal the total expense amount', { variant: 'error' });
        return;
      }
      
      // Pass split configuration to parent
      onSubmit(data, billFiles, quotationFiles, { paidBy, splitType, participants, groupId });
    } else {
      // No split configuration
      onSubmit(data, billFiles, quotationFiles);
    }
  }, [onSubmit, enableSplit, paidBy, participants, splitType, getTotalPercentage, getTotalAmount]);

  const submitHandler = useCallback(
    (e: React.BaseSyntheticEvent) => {
      return handleSubmit(onFormSubmit)(e);
    },
    [handleSubmit, onFormSubmit]
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      container={() => document.body}
    >
      <DialogTitle>Add New Expense</DialogTitle>
      <form onSubmit={submitHandler}>
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

            <Grid item xs={12} sm={6}>
              <Controller
                name="paymentFrequency"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Payment Frequency" fullWidth select>
                    <MenuItem value="">-- Select Frequency --</MenuItem>
                    {PAYMENT_FREQUENCIES.map((freq) => (
                      <MenuItem key={freq} value={freq}>
                        {freq}
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
              <input
                id="bill-upload"
                ref={billInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleBillChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="bill-upload" style={{ display: 'block' }}>
                <Button variant="outlined" component="span" fullWidth>
                  Upload Bills (Image/PDF)
                </Button>
              </label>
              {billFileNames.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    ✓ {billFileNames.length} file{billFileNames.length > 1 ? 's' : ''} selected:
                  </Typography>
                  {billFileNames.map((name, idx) => (
                    <Typography key={idx} variant="caption" color="text.secondary" sx={{ display: 'block', ml: 2 }}>
                      • {name}
                    </Typography>
                  ))}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <input
                id="quotation-upload"
                ref={quotationInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={handleQuotationChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="quotation-upload" style={{ display: 'block' }}>
                <Button variant="outlined" component="span" fullWidth>
                  Upload Quotations (PDF)
                </Button>
              </label>
              {quotationFileNames.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                    ✓ {quotationFileNames.length} file{quotationFileNames.length > 1 ? 's' : ''} selected:
                  </Typography>
                  {quotationFileNames.map((name, idx) => (
                    <Typography key={idx} variant="caption" color="text.secondary" sx={{ display: 'block', ml: 2 }}>
                      • {name}
                    </Typography>
                  ))}
                </Box>
              )}
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

            {/* Split Configuration Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={enableSplit}
                    onChange={(e) => {
                      setEnableSplit(e.target.checked);
                    }}
                  />
                }
                label={<Typography variant="subtitle1" fontWeight={600}>Enable Expense Splitting</Typography>}
              />
            </Grid>

            {enableSplit && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Configure how this expense should be split among participants
                  </Alert>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Who Paid?"
                    fullWidth
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    placeholder="Enter member name"
                    helperText="The person who paid for this expense"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Group (Optional)"
                    fullWidth
                    select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    helperText="Select a group to track balances"
                  >
                    <MenuItem value="">None</MenuItem>
                    {groups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Split Type"
                    fullWidth
                    select
                    value={splitType}
                    onChange={(e) => {
                      const newType = e.target.value as SplitType;
                      setSplitType(newType);
                      // Reset participant values based on new type
                      setParticipants(participants.map(p => ({
                        userId: p.userId,
                        amount: newType === 'exact' ? 0 : undefined,
                        percentage: newType === 'percentage' ? 0 : undefined,
                        shares: newType === 'shares' ? 1 : undefined,
                      })));
                    }}
                  >
                    {SPLIT_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Participants
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      fullWidth
                      value={newParticipantId}
                      onChange={(e) => setNewParticipantId(e.target.value)}
                      placeholder="Enter member name"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addParticipant();
                        }
                      }}
                    />
                    <IconButton color="primary" onClick={addParticipant}>
                      <AddIcon />
                    </IconButton>
                  </Box>

                  {participants.map((participant) => (
                    <Box
                      key={participant.userId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Chip label={participant.userId} sx={{ flexShrink: 0 }} />
                      
                      {splitType === 'percentage' && (
                        <TextField
                          size="small"
                          type="number"
                          label="Percentage"
                          value={participant.percentage || 0}
                          onChange={(e) => updateParticipant(
                            participant.userId,
                            'percentage',
                            Number(e.target.value)
                          )}
                          inputProps={{ min: 0, max: 100, step: 0.01 }}
                          sx={{ width: 120 }}
                        />
                      )}

                      {splitType === 'exact' && (
                        <TextField
                          size="small"
                          type="number"
                          label="Amount"
                          value={participant.amount || 0}
                          onChange={(e) => updateParticipant(
                            participant.userId,
                            'amount',
                            Number(e.target.value)
                          )}
                          inputProps={{ min: 0, step: 0.01 }}
                          sx={{ width: 120 }}
                        />
                      )}

                      {splitType === 'shares' && (
                        <TextField
                          size="small"
                          type="number"
                          label="Shares"
                          value={participant.shares || 1}
                          onChange={(e) => updateParticipant(
                            participant.userId,
                            'shares',
                            Number(e.target.value)
                          )}
                          inputProps={{ min: 1, step: 1 }}
                          sx={{ width: 100 }}
                        />
                      )}

                      <Box sx={{ flexGrow: 1 }} />
                      
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeParticipant(participant.userId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}

                  {participants.length === 0 && (
                    <Alert severity="warning">No participants added yet</Alert>
                  )}

                  {splitType === 'percentage' && participants.length > 0 && (
                    <Alert severity={getTotalPercentage() === 100 ? 'success' : 'error'} sx={{ mt: 1 }}>
                      Total: {getTotalPercentage()}% {getTotalPercentage() !== 100 && '(must equal 100%)'}
                    </Alert>
                  )}

                  {splitType === 'exact' && participants.length > 0 && amount > 0 && (
                    <Alert severity={Math.abs(getTotalAmount() - amount) < 0.01 ? 'success' : 'error'} sx={{ mt: 1 }}>
                      Total: ${getTotalAmount().toFixed(2)} / ${amount.toFixed(2)}
                      {Math.abs(getTotalAmount() - amount) >= 0.01 && ' (must match expense amount)'}
                    </Alert>
                  )}

                  {splitType === 'equal' && participants.length > 0 && amount > 0 && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Each participant: ${(amount / participants.length).toFixed(2)}
                    </Alert>
                  )}
                </Grid>
              </>
            )}
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
