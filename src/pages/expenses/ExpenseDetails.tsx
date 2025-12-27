import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PaymentIcon from '@mui/icons-material/Payment';
import { expenseApi } from '../../api/expense.api';
import type { Expense, ApprovalHistoryItem, PaymentFormData } from '../../types/expense.types';
import { PaymentForm } from '../../components/forms/PaymentForm';
import { usePermissions } from '../../hooks/usePermissions';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

export const ExpenseDetails = () => {
  const { expenseId } = useParams<{ expenseId: string }>();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [history, setHistory] = useState<ApprovalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);

  // Redirect if trying to create new expense - this should be handled differently
  useEffect(() => {
    if (expenseId === 'new') {
      navigate('/expenses');
      return;
    }
    if (expenseId) {
      fetchExpense();
      fetchHistory();
    }
  }, [expenseId, navigate]);

  const fetchExpense = async () => {
    if (!expenseId) return;

    try {
      const data = await expenseApi.getById(expenseId);
      setExpense(data);
    } catch (err) {
      setError('Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!expenseId) return;

    try {
      const data = await expenseApi.getApprovalHistory(expenseId);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  const handlePaymentSubmit = async (data: PaymentFormData, file?: File) => {
    if (!expenseId) return;

    try {
      const formData = new FormData();
      formData.append('amount', data.amount.toString());
      formData.append('paidAt', data.paidAt);
      if (data.notes) formData.append('notes', data.notes);
      if (file) formData.append('proofFile', file);

      await expenseApi.addPayment(expenseId, formData);
      setPaymentFormOpen(false);
      fetchExpense();
      fetchHistory();
    } catch (err) {
      console.error('Failed to add payment', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !expense) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Expense not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/expenses')} sx={{ mb: 2 }}>
        Back to Expenses
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Expense Details
        </Typography>
        <Chip label={expense.status} color="primary" />
      </Box>

      <Grid container spacing={3}>
        {/* Main Info */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Project
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {expense.projectName}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {expense.category}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Vendor
                </Typography>
                <Typography variant="body1">{expense.vendor}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">{formatDate(expense.date)}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">{expense.description}</Typography>
              </Grid>

              {expense.billUrl && (
                <Grid item xs={12}>
                  <Button startIcon={<AttachFileIcon />} variant="outlined" size="small">
                    View Bill
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Payment History */}
          {expense.paymentProofs && expense.paymentProofs.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment History
              </Typography>
              <List>
                {expense.paymentProofs.map((payment) => (
                  <ListItem key={payment.id}>
                    <ListItemText
                      primary={formatCurrency(payment.amount)}
                      secondary={`Paid on ${formatDate(payment.paidAt)} by ${payment.paidBy}`}
                    />
                    {payment.proofUrl && (
                      <Button size="small" startIcon={<AttachFileIcon />}>
                        View Proof
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Approval Timeline */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Approval History
            </Typography>
            <Timeline>
              {history.map((item, index) => (
                <TimelineItem key={item.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {formatDateTime(item.performedAt)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={item.action === 'approved' ? 'success' : item.action === 'rejected' ? 'error' : 'primary'} />
                    {index < history.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body1" fontWeight="bold">
                      {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                    </Typography>
                    <Typography variant="body2">by {item.performedByName}</Typography>
                    {item.comment && (
                      <Typography variant="body2" color="text.secondary">
                        {item.comment}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Grid>

        {/* Amount Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h4">{formatCurrency(expense.amount)}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Paid Amount
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(expense.paidAmount)}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Remaining
              </Typography>
              <Typography variant="h4" color="error.main">
                {formatCurrency(expense.amount - expense.paidAmount)}
              </Typography>
            </CardContent>
          </Card>

          {permissions.canAddPayment && expense.status === 'Approved' && expense.paidAmount < expense.amount && (
            <Button
              variant="contained"
              fullWidth
              startIcon={<PaymentIcon />}
              onClick={() => setPaymentFormOpen(true)}
            >
              Add Payment
            </Button>
          )}

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="body2" color="text.secondary">
              Submitted By
            </Typography>
            <Typography variant="body1">{expense.submittedByName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(expense.submittedAt)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <PaymentForm
        open={paymentFormOpen}
        onClose={() => setPaymentFormOpen(false)}
        onSubmit={handlePaymentSubmit}
        expenseAmount={expense.amount}
        paidAmount={expense.paidAmount}
      />
    </Container>
  );
};
