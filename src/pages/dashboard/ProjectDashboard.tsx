import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  alpha,
  Button,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EventIcon from '@mui/icons-material/Event';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import { dashboardApi } from '../../api/dashboard.api';
import type { ProjectDashboardData } from '../../types/dashboard.types';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/formatters';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

export const ProjectDashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProjectDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (projectId) {
      fetchProjectDashboard();
    }
  }, [projectId]);

  const fetchProjectDashboard = async () => {
    if (!projectId) return;

    try {
      const dashboardData = await dashboardApi.getProjectData(projectId);
      setData(dashboardData);
    } catch {
      setError('Failed to load project dashboard');
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

  if (error || !data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'No data available'}</Alert>
      </Container>
    );
  }

  const budgetUtilization = (data.project.spent / data.project.budget) * 100;

  return (
    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2, ml: { xs: 0, sm: 0 } }}
        size="medium"
      >
        Back to Dashboard
      </Button>

      <Box mb={{ xs: 3, sm: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
          {data.project.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          Project Financial Overview and Performance Metrics
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 }}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)`,
              border: 1,
              borderColor: alpha('#3b82f6', 0.2),
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Total Budget
                </Typography>
                <Box
                  sx={{
                    bgcolor: alpha('#3b82f6', 0.1),
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    color: '#3b82f6',
                  }}
                >
                  <AttachMoneyIcon />
                </Box>
              </Stack>
              <Typography variant="h4" fontWeight={700} color="#3b82f6">
                {formatCurrency(data.project.budget)}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)`,
              border: 1,
              borderColor: alpha('#10b981', 0.2),
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Total Spent
                </Typography>
                <Box
                  sx={{
                    bgcolor: alpha('#10b981', 0.1),
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    color: '#10b981',
                  }}
                >
                  <TrendingUpIcon />
                </Box>
              </Stack>
              <Typography variant="h4" fontWeight={700} color="#10b981">
                {formatCurrency(data.project.spent)}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`,
              border: 1,
              borderColor: alpha('#f59e0b', 0.2),
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Remaining
                </Typography>
                <Box
                  sx={{
                    bgcolor: alpha('#f59e0b', 0.1),
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    color: '#f59e0b',
                  }}
                >
                  <AccountBalanceWalletIcon />
                </Box>
              </Stack>
              <Typography variant="h4" fontWeight={700} color="#f59e0b">
                {formatCurrency(data.project.budget - data.project.spent)}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(budgetUtilization > 90 ? '#dc2626' : '#8b5cf6', 0.1)} 0%, ${alpha(budgetUtilization > 90 ? '#dc2626' : '#8b5cf6', 0.05)} 100%)`,
              border: 1,
              borderColor: alpha(budgetUtilization > 90 ? '#dc2626' : '#8b5cf6', 0.2),
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Budget Utilization
                </Typography>
                <Box
                  sx={{
                    bgcolor: alpha(budgetUtilization > 90 ? '#dc2626' : '#8b5cf6', 0.1),
                    borderRadius: 2,
                    p: 1,
                    display: 'flex',
                    color: budgetUtilization > 90 ? '#dc2626' : '#8b5cf6',
                  }}
                >
                  <PendingActionsIcon />
                </Box>
              </Stack>
              <Typography variant="h4" fontWeight={700} color={budgetUtilization > 90 ? '#dc2626' : '#8b5cf6'}>
                {formatPercentage(budgetUtilization)}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                💰 Budget vs Spent Over Time
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                {mounted && data.budgetVsSpent && data.budgetVsSpent.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.budgetVsSpent}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value / 1000}k`} />
                      <Tooltip formatter={(value: number | string | (string | number)[] | undefined) => value !== undefined && typeof value === 'number' ? formatCurrency(value) : ''} />
                      <Legend />
                      <Line type="monotone" dataKey="budget" stroke="#3b82f6" strokeWidth={3} name="Budget" />
                      <Line type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={3} name="Spent" />
                    </LineChart>
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

        <Grid item xs={12} md={4}>
          <MotionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            sx={{
              background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.08)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`,
              border: 2,
              borderColor: alpha('#f59e0b', 0.2),
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📋 Pending Approvals
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                {mounted && data.approvalPipeline && data.approvalPipeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.approvalPipeline} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="status" type="category" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f59e0b" name="Count" radius={[0, 8, 8, 0]} />
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
      </Grid>

      {/* Upcoming Payments */}
      {data.upcomingPayments.length > 0 && (
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          sx={{
            background: `linear-gradient(135deg, ${alpha('#06b6d4', 0.08)} 0%, ${alpha('#0891b2', 0.05)} 100%)`,
            border: 2,
            borderColor: alpha('#06b6d4', 0.3),
            boxShadow: `0 4px 20px ${alpha('#06b6d4', 0.15)}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
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
                  Upcoming Payments
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.upcomingPayments.length} payment{data.upcomingPayments.length > 1 ? 's' : ''} scheduled for this project
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              {data.upcomingPayments.map((payment, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
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
                      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                        Due: {formatDate(payment.date)}
                      </Typography>
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
                    </Box>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </MotionCard>
      )}

      {data.upcomingPayments.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No upcoming payments scheduled for this project
        </Alert>
      )}
    </Container>
  );
};
