import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAuth } from '../../hooks/useAuth';

export const MobileFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();

  // Don't show on login or public pages
  if (!user || location.pathname === '/' || location.pathname.startsWith('/login')) {
    return null;
  }

  const getActiveTab = () => {
    if (location.pathname.startsWith('/dashboard')) return '/dashboard';
    if (location.pathname.startsWith('/projects')) return '/projects';
    if (location.pathname.startsWith('/expenses')) return '/expenses';
    if (location.pathname.startsWith('/balances')) return '/balances';
    if (location.pathname.startsWith('/payments')) return '/payments';
    if (location.pathname.startsWith('/reports')) return '/reports';
    return '/dashboard';
  };

  const handleNavigation = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', sm: 'none' },
        zIndex: 1100,
        borderTop: 1,
        borderColor: 'divider',
      }}
      elevation={8}
    >
      <BottomNavigation
        value={getActiveTab()}
        onChange={handleNavigation}
        showLabels
        sx={{
          height: 64,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            marginTop: '4px',
          },
          '& .Mui-selected': {
            color: theme.palette.primary.main,
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              fontWeight: 600,
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Dashboard"
          value="/dashboard"
          icon={<DashboardIcon />}
        />
        <BottomNavigationAction
          label="Expenses"
          value="/expenses"
          icon={<ReceiptIcon />}
        />
        <BottomNavigationAction
          label="Balances"
          value="/balances"
          icon={<AccountBalanceWalletIcon />}
        />
        <BottomNavigationAction
          label="Projects"
          value="/projects"
          icon={<FolderIcon />}
        />
        {(user.role === 'Treasurer' || user.role === 'Admin') && (
          <BottomNavigationAction
            label="Payments"
            value="/payments"
            icon={<PaymentIcon />}
          />
        )}
        {(user.role === 'Auditor' || user.role === 'Admin') && (
          <BottomNavigationAction
            label="Reports"
            value="/reports"
            icon={<AssessmentIcon />}
          />
        )}
      </BottomNavigation>
    </Paper>
  );
};
