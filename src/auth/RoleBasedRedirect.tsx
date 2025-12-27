import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';
import type { UserRole } from '../types/auth.types';

export const RoleBasedRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const redirectPath = getRoleBasedPath(user.role);
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

function getRoleBasedPath(role: UserRole): string {
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
}
