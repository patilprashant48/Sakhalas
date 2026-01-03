import { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
  Paper,
  alpha,
} from '@mui/material';
import sakhalasLogo from '../assets/sakhalas-logo.jpeg';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
// Removed demo role icons to disable demo mode
import { useSnackbar } from 'notistack';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth.types';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Demo role selection removed — use real credentials

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Demo handlers removed. Login uses real credentials.

  const getRoleBasedRedirect = (role: UserRole): string => {
    switch (role) {
      case 'Admin':
        return '/dashboard';
      case 'Project Manager':
        return '/projects';
      case 'Treasurer':
        return '/payments';
      case 'Employee':
        return '/expenses';
      case 'Auditor':
        return '/reports';
      default:
        return '/dashboard';
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await login(data.email, data.password);

      if (response.requiresTwoFactor) {
        enqueueSnackbar('OTP sent to your email', { variant: 'info' });
        navigate('/two-factor');
      } else if (response.user) {
        enqueueSnackbar(`Welcome back, ${response.user.name}!`, { variant: 'success' });
        // Role-based redirect
        const redirectPath = getRoleBasedRedirect(response.user.role);
        navigate(redirectPath);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
            theme.palette.secondary.main,
            0.1
          )} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background shapes */}
      <MotionBox
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: (theme) => alpha(theme.palette.primary.main, 0.05),
          top: -200,
          left: -200,
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <MotionBox
        sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: (theme) => alpha(theme.palette.secondary.main, 0.05),
          bottom: -150,
          right: -150,
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, sm: 6, md: 8 } }}>
        <MotionCard
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: (theme) => theme.shadows[20],
          }}
        >
          {/* Header Section */}
          <Paper
            elevation={0}
            sx={{
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              p: { xs: 3, sm: 4 },
              textAlign: 'center',
            }}
          >
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <img 
                src={sakhalasLogo} 
                alt="Sakhalas Logo" 
                style={{ 
                  height: '80px',
                  width: 'auto',
                  filter: 'brightness(0) invert(1)' // Make logo white
                }} 
              />
            </MotionBox>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Sakhalas
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Finance Management
            </Typography>
          </Paper>

          {/* Form Section */}
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' } }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 3, sm: 4 } }}>
              Sign in to continue to your dashboard
            </Typography>

            {/* Demo role selection removed — form uses real credentials */}

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                size="small"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<LoginIcon />}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    '&:hover': {
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                    },
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  sx={{
                    py: 1.2,
                    fontWeight: 500,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  Create New Account
                </Button>
              </Stack>
            </form>

            {/* Removed demo credentials section */}
          </CardContent>
        </MotionCard>

        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 3 }}>
          © 2025 Sakhalas. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};
