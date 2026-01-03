import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  alpha,
  Divider,
} from '@mui/material';
import {
  AccountBalance,
  Schedule,
  Assessment,
  ArrowForward,
  CheckCircle,
  Speed,
  Security,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import sakhalasLogo from '../../assets/sakhalas-logo.png';
import { dashboardApi } from '../../api/dashboard.api';
import type { TodayPayment } from '../../types/dashboard.types';
import { formatCurrency } from '../../utils/formatters';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const MotionPaper = motion.create(Paper);

export const HomePublic = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<TodayPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodayPayments();
  }, []);

  const fetchTodayPayments = async () => {
    try {
      // Check if user is authenticated before fetching
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // Not authenticated - skip fetching payments on public page
        setLoading(false);
        return;
      }
      
      const data = await dashboardApi.getTodayPayments();
      setPayments(data);
      setError(null);
    } catch (_err) {
      console.error('Failed to fetch payments:', _err);
      // Don't show error on public page - just skip the payments section
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Approved':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box 
      sx={{ 
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)',
        minHeight: '100vh', 
        py: { xs: 4, md: 8 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <MotionBox
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: (theme) => alpha(theme.palette.primary.main, 0.1),
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <MotionBox
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: (theme) => alpha(theme.palette.secondary.main, 0.08),
          filter: 'blur(100px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', mb: 8 }}
        >
          <Box
            sx={{
              display: 'inline-block',
              mb: 3,
              p: { xs: 1.5, md: 2 },
              borderRadius: 3,
              background: (theme) => alpha(theme.palette.primary.main, 0.05),
              border: 1,
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
              maxWidth: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
              <img 
                src={sakhalasLogo} 
                alt="Sakhalas Logo" 
                style={{ 
                  height: 'auto',
                  width: '100%',
                  maxWidth: '200px',
                  maxHeight: '120px',
                  objectFit: 'contain'
                }} 
              />
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 400,
                color: 'text.secondary',
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Finance Management
            </Typography>
          </Box>
          
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              px: { xs: 2, md: 0 },
            }}
          >
            Smart Financial Management for Modern Teams
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: 4, 
              maxWidth: 700, 
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.25rem' },
              px: { xs: 2, md: 0 },
            }}
          >
            Streamline project expenses, automate payment workflows, and gain real-time insights into your financial operations
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            endIcon={<ArrowForward />}
            sx={{ 
              px: { xs: 3, md: 4 },
              py: { xs: 1.25, md: 1.5 },
              borderRadius: 3,
              textTransform: 'none',
              fontSize: { xs: '1rem', md: '1.1rem' },
              fontWeight: 600,
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.primary.main, 0.5)}`,
              },
              transition: 'all 0.3s',
            }}
          >
            Get Started Free
          </Button>
        </MotionBox>

        {/* Stats Section */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 8 }}>
          {[
            { label: 'Active Users', value: '10K+', color: '#2563eb' },
            { label: 'Projects Managed', value: '50K+', color: '#06b6d4' },
            { label: 'Payments Processed', value: '₹500M+', color: '#8b5cf6' },
            { label: 'Time Saved', value: '70%', color: '#10b981' },
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={stat.label}>
              <MotionCard
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                sx={{
                  textAlign: 'center',
                  p: { xs: 2, md: 3 },
                  background: (_theme) => alpha(stat.color, 0.05),
                  border: 2,
                  borderColor: (_theme) => alpha(stat.color, 0.2),
                  '&:hover': {
                    borderColor: stat.color,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${alpha(stat.color, 0.2)}`,
                  },
                  transition: 'all 0.3s',
                }}
              >
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.6)} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                  }}
                >
                  {stat.label}
                </Typography>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Today's Payments Section */}
        <MotionPaper
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: (theme) => theme.palette.mode === 'dark'
              ? alpha('#1e293b', 0.6)
              : '#ffffff',
            backdropFilter: 'blur(10px)',
            border: 2,
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                📅 Today's Payments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time payment tracking and status updates
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress size={48} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && payments.length === 0 && (
            <Alert 
              severity="success" 
              sx={{ 
                borderRadius: 2,
                border: 1,
                borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
              }}
            >
              ✅ All caught up! No payments scheduled for today.
            </Alert>
          )}

          {!loading && !error && payments.length > 0 && (
            <TableContainer 
              sx={{ 
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow 
                      key={payment.id}
                      sx={{
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                        },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {payment.projectName}
                        </Typography>
                      </TableCell>
                      <TableCell>{payment.vendor}</TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.category} 
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color="primary">
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={getStatusColor(payment.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MotionPaper>
      </Container>
    </Box>
  );
};
