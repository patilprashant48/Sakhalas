import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FolderIcon from '@mui/icons-material/Folder';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import { dashboardApi } from '../../api/dashboard.api';
import type {
  CompanyKPIs,
  ExpensesByProject,
  ExpensesByCategory,
  OverduePayment,
} from '../../types/dashboard.types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const CompanyDashboard = () => {
  const [kpis, setKpis] = useState<CompanyKPIs | null>(null);
  const [expensesByProject, setExpensesByProject] = useState<ExpensesByProject[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpensesByCategory[]>([]);
  const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [kpisData, projectData, categoryData, overdueData] = await Promise.all([
        dashboardApi.getCompanyKPIs(),
        dashboardApi.getExpensesByProject(),
        dashboardApi.getExpensesByCategory(),
        dashboardApi.getOverduePayments(),
      ]);

      setKpis(kpisData);
      setExpensesByProject(projectData);
      setExpensesByCategory(categoryData);
      setOverduePayments(overdueData);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !kpis) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'No data available'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Company Dashboard
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FolderIcon color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Projects
                </Typography>
              </Box>
              <Typography variant="h4">{kpis.activeProjects}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active of {kpis.totalProjects} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon color="success" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Budget
                </Typography>
              </Box>
              <Typography variant="h4">{formatCurrency(kpis.totalBudget)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total allocated
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="info" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Spent
                </Typography>
              </Box>
              <Typography variant="h4">{formatCurrency(kpis.totalSpent)}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatPercentage(kpis.budgetUtilization)} utilized
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="warning" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Overdue
                </Typography>
              </Box>
              <Typography variant="h4">{kpis.overduePayments}</Typography>
              <Typography variant="body2" color="text.secondary">
                Payments pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Project
            </Typography>
            {mounted && expensesByProject.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByProject as any}
                    dataKey="amount"
                    nameKey="projectName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry: any) => `${entry.projectName}: ${formatPercentage(entry.percentage)}`}
                  >
                    {expensesByProject.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}                  </Pie>
                  <Tooltip formatter={(value: number | string | (string | number)[] | undefined) => value !== undefined && typeof value === 'number' ? formatCurrency(value) : (value ?? '')} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No data available
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            {mounted && expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value: number | string | (string | number)[] | undefined) => value !== undefined && typeof value === 'number' ? formatCurrency(value) : (value ?? '')} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Overdue Payments */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Overdue Payments
            </Typography>
            {overduePayments.length > 0 ? (
              <Box>
                {overduePayments.map((payment) => (
                  <Box
                    key={payment.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      mb: 1,
                      bgcolor: 'error.light',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {payment.projectName}
                      </Typography>
                      <Typography variant="body2">{payment.vendor}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6">{formatCurrency(payment.amount)}</Typography>
                      <Typography variant="caption" color="error">
                        Overdue by {payment.overdueDays} days
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="success">No overdue payments</Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
