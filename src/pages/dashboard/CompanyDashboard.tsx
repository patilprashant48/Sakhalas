import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Chip,
  Stack,
  alpha,
  Paper,
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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventIcon from '@mui/icons-material/Event';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { dashboardApi } from '../../api/dashboard.api';
import type {
  CompanyKPIs,
  ExpensesByProject,
  ExpensesByCategory,
  OverduePayment,
  UpcomingPayment,
} from '../../types/dashboard.types';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/formatters';
import { DashboardSkeleton } from '../../components/common/LoadingSkeleton';
  import EventIcon from '@mui/icons-material/Event';
  import PendingActionsIcon from '@mui/icons-material/PendingActions';
  import { motion } from 'framer-motion';
  import { useSnackbar } from 'notistack';
  import { dashboardApi } from '../../api/dashboard.api';
  import type {
    CompanyKPIs,
    ExpensesByProject,
    ExpensesByCategory,
    OverduePayment,
    UpcomingPayment,
  } from '../../types/dashboard.types';
  import { formatCurrency, formatPercentage, formatDate } from '../../utils/formatters';
  import { DashboardSkeleton } from '../../components/common/LoadingSkeleton';

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const MotionCard = motion.create(Card);
  const MotionBox = motion.create(Box);

  // Custom tooltip for better data visualization
  type TooltipPayloadItem = { name?: string; value?: number };
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            boxShadow: 3,
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {item.name}
          </Typography>
          <Typography variant="body2" color="primary">
            {formatCurrency(item.value || 0)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    delay?: number;
  }

  const KPICard = ({ title, value, icon, color, delay = 0 }: KPICardProps) => (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: 1,
        borderColor: alpha(color, 0.2),
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Box
            sx={{
              bgcolor: alpha(color, 0.1),
              borderRadius: 2,
              p: 1,
              display: 'flex',
              color: color,
            }}
          >
            {icon}
          </Box>
        </Stack>
        <Typography variant="h4" fontWeight={700} color={color}>
          {value}
        </Typography>
      </CardContent>
    </MotionCard>
  );

  export const CompanyDashboard = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [kpis, setKpis] = useState<CompanyKPIs | null>(null);
    const [expensesByProject, setExpensesByProject] = useState<ExpensesByProject[]>([]);
    const [expensesByCategory, setExpensesByCategory] = useState<ExpensesByCategory[]>([]);
    const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([]);
    const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
      fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
      try {
        const [kpisData, projectData, categoryData, overdueData, upcomingData] = await Promise.all([
          dashboardApi.getCompanyKPIs(),
          dashboardApi.getExpensesByProject(),
          dashboardApi.getExpensesByCategory(),
          dashboardApi.getOverduePayments(),
          dashboardApi.getUpcomingPayments(),
        ]);

        setKpis(kpisData);
        setExpensesByProject(projectData);
        setExpensesByCategory(categoryData);
        setOverduePayments(overdueData);
        setUpcomingPayments(upcomingData);
      
        if (overdueData.length > 0) {
          enqueueSnackbar(`${overdueData.length} overdue payments need attention`, {
            variant: 'warning',
          });
        }
      } catch {
        setError('Failed to load dashboard data');
        enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (loading) return (
      <Box sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
        <DashboardSkeleton />
      </Box>
    );

    if (error || !kpis) {
      return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">{error || 'No data available'}</Alert>
        </Container>
      );
    }

    return (
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
        <Box mb={{ xs: 3, sm: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
            Company Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Overview of company-wide financial metrics and project performance
          </Typography>
        </Box>

        {/* KPI Cards - Row 1: Budget Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Budget"
              value={formatCurrency(kpis.totalBudget)}
              icon={<AttachMoneyIcon />}
              color="#3b82f6"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Spent"
              value={formatCurrency(kpis.totalSpent)}
              icon={<TrendingUpIcon />}
              color="#10b981"
              delay={0.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Active Projects"
              value={kpis.activeProjects}
              icon={<FolderIcon />}
              color="#8b5cf6"
              delay={0.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Pending Approvals"
              value={kpis.pendingApprovals}
              icon={<WarningIcon />}
              color="#f59e0b"
              delay={0.3}
            />
          </Grid>
        </Grid>

        {/* KPI Cards - Row 2: Financial Liabilities */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Liabilities"
              value={formatCurrency(kpis.totalApprovedUnpaid)}
              icon={<AccountBalanceWalletIcon />}
              color="#dc2626"
              delay={0.4}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Overdue Amount"
              value={formatCurrency(kpis.totalOverdueAmount)}
              icon={<WarningIcon />}
              color="#f97316"
              delay={0.5}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Upcoming (7 Days)"
              value={kpis.upcomingPaymentsCount}
              icon={<EventIcon />}
              color="#06b6d4"
              delay={0.6}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Upcoming Amount"
              value={formatCurrency(kpis.upcomingPaymentsAmount)}
              icon={<PendingActionsIcon />}
              color="#0891b2"
              delay={0.7}
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid item xs={12} md={6}>
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              sx={{ height: '100%', minHeight: 400 }}
            >
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Expenses by Project
                </Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  {mounted && expensesByProject.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={expensesByProject}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="projectName"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => value.substring(0, 10) + (value.length > 10 ? '...' : '')}
                        />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">No data available</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              sx={{ height: '100%', minHeight: 400 }}
            >
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Expenses by Category
                </Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  {mounted && expensesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: ExpensesByCategory) => `${entry.category}: ${formatPercentage(entry.percentage)}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {expensesByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">No data available</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>

        {/* Upcoming Payments */}
        {upcomingPayments.length > 0 && (
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            sx={{ 
              mb: 3,
              background: `linear-gradient(135deg, ${alpha('#06b6d4', 0.08)} 0%, ${alpha('#0891b2', 0.05)} 100%)`,
              border: 2, 
              borderColor: alpha('#06b6d4', 0.3),
              boxShadow: `0 4px 20px ${alpha('#06b6d4', 0.15)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)`,
                    boxShadow: `0 4px 12px ${alpha('#06b6d4', 0.4)}`,
                    mr: 2,
                  }}
                >
                  <EventIcon sx={{ color: '#fff', fontSize: 28 }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700} color="#0e7490">
                    Upcoming Payments (Next 7 Days)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {upcomingPayments.length} payment{upcomingPayments.length > 1 ? 's' : ''} scheduled • Total: {formatCurrency(kpis.upcomingPaymentsAmount)}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                {upcomingPayments.slice(0, 6).map((payment, index) => (
                  <Grid item xs={12} sm={6} md={4} key={payment.id}>
                    <MotionBox
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          border: 2,
                          borderColor: alpha('#06b6d4', 0.2),
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s',
                          '&:hover': {
                            borderColor: '#06b6d4',
                            boxShadow: `0 8px 24px ${alpha('#06b6d4', 0.2)}`,
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)',
                          }
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: '#1e293b' }}>
                          {payment.vendor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                          {payment.projectName}
                        </Typography>
                        <Chip 
                          label={payment.category} 
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1.5, borderColor: alpha('#06b6d4', 0.3), fontSize: '0.7rem' }}
                        />
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                          <Typography 
                            variant="h6" 
                            fontWeight={700}
                            sx={{
                              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {formatCurrency(payment.amount)}
                          </Typography>
                          <Chip 
                            label={`${payment.daysUntilDue} days`} 
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                              color: '#fff',
                              fontWeight: 600,
                              boxShadow: `0 2px 8px ${alpha('#06b6d4', 0.3)}`,
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" color="primary" display="block" mt={1} fontWeight={500}>
                          Due: {formatDate(payment.dueDate)}
                        </Typography>
                      </Box>
                    </MotionBox>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </MotionCard>
        )}

        {/* Overdue Payments */}
        {overduePayments.length > 0 && (
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            sx={{ 
              background: `linear-gradient(135deg, ${alpha('#dc2626', 0.08)} 0%, ${alpha('#f97316', 0.05)} 100%)`,
              border: 2, 
              borderColor: alpha('#dc2626', 0.3),
              boxShadow: `0 4px 20px ${alpha('#dc2626', 0.15)}`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, #dc2626 0%, #ef4444 100%)`,
                    boxShadow: `0 4px 12px ${alpha('#dc2626', 0.4)}`,
                    mr: 2,
                  }}
                >
                  <WarningIcon sx={{ color: '#fff', fontSize: 28 }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700} color="#b91c1c">
                    Overdue Payments
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {overduePayments.length} payment{overduePayments.length > 1 ? 's' : ''} require immediate attention
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                {overduePayments.slice(0, 6).map((payment, index) => (
                  <Grid item xs={12} sm={6} md={4} key={payment.id}>
                    <MotionBox
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          border: 2,
                          borderColor: alpha('#dc2626', 0.2),
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s',
                          '&:hover': {
                            borderColor: '#dc2626',
                            boxShadow: `0 8px 24px ${alpha('#dc2626', 0.2)}`,
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: 'linear-gradient(90deg, #dc2626 0%, #f97316 100%)',
                          }
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ color: '#1e293b' }}>
                          {payment.vendor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                          {payment.projectName}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                          <Typography 
                            variant="h6" 
                            fontWeight={700}
                            sx={{
                              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {formatCurrency(payment.amount)}
                          </Typography>
                          <Chip 
                            label={`${payment.overdueDays} days`} 
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                              color: '#fff',
                              fontWeight: 600,
                              boxShadow: `0 2px 8px ${alpha('#dc2626', 0.3)}`,
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" color="error.dark" display="block" mt={1} fontWeight={500}>
                          Due: {formatDate(payment.dueDate)}
                        </Typography>
                      </Box>
                    </MotionBox>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </MotionCard>
        )}
      </Container>
    );
  };
