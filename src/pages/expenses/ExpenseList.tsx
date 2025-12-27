import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import { expenseApi } from '../../api/expense.api';
import { projectApi } from '../../api/project.api';
import type { Expense, ExpenseFormData } from '../../types/expense.types';
import { ExpenseForm } from '../../components/forms/ExpenseForm';
import { usePermissions } from '../../hooks/usePermissions';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES } from '../../utils/constants';

export const ExpenseList = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filters, setFilters] = useState({
    projectId: '',
    status: '',
    category: '',
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
      setExpenses(expensesData);
      setProjects(projectsData.map((p) => ({ id: p.id, name: p.name })));
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: ExpenseFormData, file?: File) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      if (file) {
        formData.append('billFile', file);
      }

      await expenseApi.create(formData);
      setFormOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create expense', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'default';
      case 'Pending':
        return 'warning';
      case 'Approved':
        return 'info';
      case 'Rejected':
        return 'error';
      case 'Paid':
        return 'success';
      case 'Partially Paid':
        return 'info';
      default:
        return 'default';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Expenses</Typography>
        {permissions.canCreateExpense && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            New Expense
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
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
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Status"
              select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {EXPENSE_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Category"
              select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <MenuItem value="">All Categories</MenuItem>
              {EXPENSE_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted By</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow
                key={expense.id}
                sx={{
                  bgcolor: expense.isOverdue ? 'error.light' : 'inherit',
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {expense.isOverdue && (
                      <WarningIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                    )}
                    {expense.projectName}
                  </Box>
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.vendor}</TableCell>
                <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                <TableCell>
                  {formatDate(expense.date)}
                  {expense.isOverdue && (
                    <Box component="span" sx={{ display: 'block', fontSize: '0.75rem', color: 'error.main' }}>
                      Overdue: {expense.overdueDays} days
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={expense.status} color={getStatusColor(expense.status)} size="small" />
                </TableCell>
                <TableCell>{expense.submittedByName}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => navigate(`/expenses/${expense.id}`)}>
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ExpenseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        projects={projects}
      />
    </Container>
  );
};
