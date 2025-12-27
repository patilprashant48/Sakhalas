import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import WorkIcon from '@mui/icons-material/Work';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AssessmentIcon from '@mui/icons-material/Assessment';
import type { UserRole } from '../types/auth.types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface RoleOption {
  role: UserRole;
  email: string;
  password: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  features: string[];
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'Admin',
    email: 'admin@company.com',
    password: 'password123',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 48 }} />,
    color: '#f44336',
    description: 'Full system access and control',
    features: ['Manage all projects', 'User management', 'System settings', 'All reports'],
  },
  {
    role: 'Project Manager',
    email: 'manager@company.com',
    password: 'password123',
    icon: <ManageAccountsIcon sx={{ fontSize: 48 }} />,
    color: '#2196f3',
    description: 'Manage projects and expenses',
    features: ['Project oversight', 'Approve expenses', 'Team management', 'Budget tracking'],
  },
  {
    role: 'Treasurer',
    email: 'treasurer@company.com',
    password: 'password123',
    icon: <AccountBalanceIcon sx={{ fontSize: 48 }} />,
    color: '#4caf50',
    description: 'Financial oversight and payments',
    features: ['Payment approval', 'Financial reports', 'Budget review', 'Audit trails'],
  },
  {
    role: 'Employee',
    email: 'employee@company.com',
    password: 'password123',
    icon: <WorkIcon sx={{ fontSize: 48 }} />,
    color: '#ff9800',
    description: 'Submit and track expenses',
    features: ['Submit expenses', 'Track status', 'View projects', 'Upload receipts'],
  },
  {
    role: 'Auditor',
    email: 'auditor@company.com',
    password: 'password123',
    icon: <AssessmentIcon sx={{ fontSize: 48 }} />,
    color: '#9c27b0',
    description: 'Read-only access for auditing',
    features: ['View all data', 'Export reports', 'Audit logs', 'Compliance checks'],
  },
];

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRoles, setShowRoles] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleRoleSelect = (roleOption: RoleOption) => {
    setValue('email', roleOption.email);
    setValue('password', roleOption.password);
    setShowRoles(false);
  };

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
    setLoading(true);
    setError(null);

    try {
      const response = await login(data.email, data.password);

      if (response.requiresTwoFactor) {
        navigate('/two-factor');
      } else if (response.user) {
        // Role-based redirect
        const redirectPath = getRoleBasedRedirect(response.user.role);
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth={showRoles ? 'lg' : 'xs'}>
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <LockOutlinedIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>

          <Typography component="h1" variant="h4" fontWeight={600} gutterBottom>
            Sign in to Sakhalas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
            Finance Management Platform
          </Typography>

          {showRoles ? (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Select your role to continue with demo credentials
              </Typography>

              <Grid container spacing={3}>
                {ROLE_OPTIONS.map((roleOption) => (
                  <Grid item xs={12} sm={6} md={4} key={roleOption.role}>
                    <Card
                      sx={{
                        height: '100%',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardActionArea onClick={() => handleRoleSelect(roleOption)} sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Box sx={{ color: roleOption.color, mb: 2 }}>
                            {roleOption.icon}
                          </Box>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {roleOption.role}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {roleOption.description}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Stack spacing={0.5} alignItems="flex-start">
                            {roleOption.features.map((feature, index) => (
                              <Typography
                                key={index}
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                • {feature}
                              </Typography>
                            ))}
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ width: '100%', my: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Button
                variant="outlined"
                onClick={() => setShowRoles(false)}
                sx={{ textTransform: 'none' }}
              >
                Login with Custom Credentials
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Enter your credentials to access your dashboard
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      fullWidth
                      label="Email Address"
                      autoComplete="email"
                      autoFocus
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
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
                      margin="normal"
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlinedIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
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
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={() => setShowRoles(true)}
                  sx={{ textTransform: 'none' }}
                >
                  ← Back to Role Selection
                </Button>
              </Box>
            </>
          )}
        </Paper>

        {showRoles && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            This is a demo application. All roles use password: <strong>password123</strong>
          </Typography>
        )}
      </Box>
    </Container>
  );
};
