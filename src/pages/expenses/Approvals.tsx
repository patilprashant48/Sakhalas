import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { expenseApi } from '../../api/expense.api';
import type { Expense, ApprovalAction } from '../../types/expense.types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const Approvals = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const data = await expenseApi.getPendingApprovals();
      setExpenses(data);
    } catch (err) {
      setError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (expense: Expense, approvalAction: 'approve' | 'reject') => {
    setSelectedExpense(expense);
    setAction(approvalAction);
    setComment('');
  };

  const handleCloseDialog = () => {
    setSelectedExpense(null);
    setAction(null);
    setComment('');
  };

  const handleSubmit = async () => {
    if (!selectedExpense || !action) return;

    try {
      const approvalData: ApprovalAction = {
        expenseId: selectedExpense.id,
        action,
        comment: comment || undefined,
      };

      await expenseApi.approve(approvalData);
      handleCloseDialog();
      fetchPendingApprovals();
    } catch (err) {
      console.error('Failed to process approval', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Pending Approvals
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {expenses.length === 0 && !loading && (
        <Alert severity="info">No expenses pending approval</Alert>
      )}

      {expenses.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.projectName}</TableCell>
                  <TableCell>
                    <Chip label={expense.category} size="small" />
                  </TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>{expense.submittedByName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {expense.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleOpenDialog(expense, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleOpenDialog(expense, 'reject')}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Approval Dialog */}
      <Dialog open={!!selectedExpense && !!action} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {action === 'approve' ? 'Approve Expense' : 'Reject Expense'}
        </DialogTitle>
        <DialogContent>
          {selectedExpense && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Project: {selectedExpense.projectName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount: {formatCurrency(selectedExpense.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vendor: {selectedExpense.vendor}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            label={action === 'reject' ? 'Reason for Rejection (Required)' : 'Comment (Optional)'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required={action === 'reject'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={action === 'approve' ? 'success' : 'error'}
            disabled={action === 'reject' && !comment}
          >
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
