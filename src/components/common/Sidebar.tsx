import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  alpha,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { usePermissions } from '../../hooks/usePermissions';
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from '../../utils/constants';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  desktopOpen: boolean;
}

export const Sidebar = ({ mobileOpen, onClose, desktopOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = usePermissions();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);

  // Sidebar is expanded if: manually opened OR hovered
  const isExpanded = desktopOpen || isHovered;

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      show: permissions.hasPermission('view_dashboard'),
    },
    {
      text: 'Projects',
      icon: <FolderIcon />,
      path: '/projects',
      show: permissions.hasPermission('view_projects'),
    },
    {
      text: 'Expenses',
      icon: <ReceiptIcon />,
      path: '/expenses',
      show: permissions.hasPermission('view_expenses'),
    },
    {
      text: 'Approvals',
      icon: <CheckCircleIcon />,
      path: '/approvals',
      show: permissions.hasPermission('approve_expense'),
    },
    {
      text: 'Payments',
      icon: <PaymentIcon />,
      path: '/payments',
      show: permissions.hasPermission('view_payments'),
    },
    {
      text: 'Reports',
      icon: <AssessmentIcon />,
      path: '/reports',
      show: permissions.hasPermission('view_reports'),
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawer = (
    <Box 
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <Toolbar />
      <Divider />
      
      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {menuItems
          .filter((item) => item.show)
          .map((item, index) => (
            <MotionBox
              key={item.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    px: 1.5,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                      },
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path 
                        ? 'primary.main' 
                        : 'text.secondary',
                      minWidth: isExpanded ? 44 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {isExpanded && (
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        fontSize: '0.938rem',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </MotionBox>
          ))}
      </List>

      {/* Footer Info */}
      {isExpanded && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Sakhalas
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            Finance Management
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            backgroundImage: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: isExpanded ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
            backgroundImage: 'none',
            borderRight: 1,
            borderColor: 'divider',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};
