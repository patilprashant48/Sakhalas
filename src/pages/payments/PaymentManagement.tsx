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
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Grid,
  Button,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { expenseApi } from '../../api/expense.api';
import { projectApi } from '../../api/project.api';
import type { Expense, PaymentFormData } from '../../types/expense.types';
import { PaymentForm } from '../../components/forms/PaymentForm';
import { usePermissions } from '../../hooks/usePermissions';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const PaymentManagement = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [filters, setFilters] = useState({
    projectId: '',
    status: 'Approved',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [expensesData, projectsData] = await Promise.all([
        expenseApi.getAll(filters),
        projectApi.getAll(),
      ]);
      // Filter to show only approved or partially paid expenses
      const payableExpenses = expensesData.filter(
        (e) => e.status === 'Approved' || e.status === 'Partially Paid'
      );
      setExpenses(payableExpenses);
      setProjects(projectsData.map((p) => ({ id: p.id, name: p.name })));
    } catch (_err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = (expense: Expense) => {
    setSelectedExpense(expense);
    setPaymentFormOpen(true);
  };

  const handlePaymentSubmit = async (data: PaymentFormData, file?: File) => {
    if (!selectedExpense) return;

    try {
      const formData = new FormData();
      formData.append('amount', data.amount.toString());
      formData.append('paidAt', data.paidAt);
      if (data.notes) formData.append('notes', data.notes);
      if (file) formData.append('proofFile', file);

      await expenseApi.addPayment(selectedExpense.id, formData);
      setPaymentFormOpen(false);
      setSelectedExpense(null);
      fetchData();
    } catch (_err) {
      console.error('Failed to add payment', _err);
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
    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
          Payment Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Process approved expenses and manage payments
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mb: { xs: 2, sm: 3 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="projectId"
              label="Project"
              select
              value={filters.projectId}
              onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
            >
              <MenuItem value="">All Projects</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="status"
              label="Status"
              select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Partially Paid">Partially Paid</MenuItem>
              <MenuItem value="">All</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {expenses.length === 0 && !loading && (
        <Alert severity="info">No expenses ready for payment</Alert>
      )}

      {expenses.length > 0 && (
        <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Paid</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Remaining</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => {
                const remaining = expense.amount - expense.paidAmount;
                return (
                  <TableRow key={expense.id} hover>
                    <TableCell sx={{ py: 2 }}>{expense.projectName}</TableCell>
                    <TableCell sx={{ py: 2 }}>{expense.vendor}</TableCell>
                    <TableCell sx={{ py: 2 }}>{expense.category}</TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>{formatCurrency(expense.paidAmount)}</TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Typography fontWeight="bold" color={remaining > 0 ? 'error' : 'success'}>
                        {formatCurrency(remaining)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={expense.status}
                        color={expense.status === 'Approved' ? 'warning' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {expense.dueDate ? (
                        <Typography
                          variant="body2"
                          color={expense.isOverdue ? 'error' : 'text.primary'}
                        >
                          {formatDate(expense.dueDate)}
                          {expense.isOverdue && ` (${expense.overdueDays}d overdue)`}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/expenses/${expense.id}`)}
                        >
                          View
                        </Button>
                        {permissions.canAddPayment && remaining > 0 && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<PaymentIcon />}
                            onClick={() => handleAddPayment(expense)}
                          >
                            Pay
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedExpense && (
        <PaymentForm
          open={paymentFormOpen}
          onClose={() => {
            setPaymentFormOpen(false);
            setSelectedExpense(null);
          }}
          onSubmit={handlePaymentSubmit}
          expenseAmount={selectedExpense.amount}
          paidAmount={selectedExpense.paidAmount}
        />
      )}
    </Container>
  );
};
