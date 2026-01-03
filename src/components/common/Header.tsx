import { AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Box, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import sakhalasLogo from "../../assets/sakhalas-logo.png";
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '../../utils/formatters';
import { useThemeMode } from '../../contexts/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
  onDesktopToggle: () => void;
  desktopOpen: boolean;
}

export const Header = ({ onMenuClick, onDesktopToggle, desktopOpen }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    // Log anchor info for debugging intermittent errors where Popper cannot access documentElement
    try {
      const target = event.currentTarget;
      const isElement = target && typeof (target as HTMLElement).nodeName === 'string' && (target as HTMLElement).ownerDocument;
      console.debug('Account menu click anchor:', {
        nodeName: isElement ? (target as HTMLElement).nodeName : undefined,
        hasOwnerDocument: isElement ? Boolean((target as HTMLElement).ownerDocument) : false,
        ownerDocumentHasElement: isElement ? Boolean((target as HTMLElement).ownerDocument?.documentElement) : false,
      });
      if (isElement) {
        setAnchorEl(target as HTMLElement);
      } else if (typeof document !== 'undefined' && document.body) {
        setAnchorEl(document.body);
      } else {
        setAnchorEl(null);
      }
    } catch (_err) {
      console.error('Failed to set anchor element for account menu', _err);
      if (typeof document !== 'undefined' && document.body) setAnchorEl(document.body);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(8px)',
        backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(37, 99, 235, 0.95)',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        {/* Mobile menu button */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ 
            mr: 2, 
            display: { xs: 'block', sm: 'none' },
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Desktop sidebar toggle */}
        <Tooltip title={desktopOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onDesktopToggle}
            sx={{ 
              mr: 2, 
              display: { xs: 'none', sm: 'block' },
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            {desktopOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Tooltip>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <img 
            src={sakhalasLogo} 
            alt="Sakhalas Logo" 
            style={{ 
              height: isMobile ? '48px' : '60px',
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
          {!isMobile && (
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.25rem'
              }}
            >
              Finance Management
            </Typography>
          )}
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton 
                onClick={toggleTheme} 
                color="inherit"
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', mr: 1.5 }}>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.85, lineHeight: 1.2 }}>
                {user.role}
              </Typography>
            </Box>

            <Tooltip title="Account menu">
              <IconButton 
                onClick={handleMenu} 
                color="inherit"
                sx={{
                  p: 0.5,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: { xs: 36, sm: 40 }, 
                    height: { xs: 36, sm: 40 }, 
                    bgcolor: 'secondary.main', 
                    fontWeight: 600,
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  }}
                >
                  {getInitials(user.name)}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              // Ensure Menu mounts into a valid document body (guard against missing ownerDocument)
              container={(() => {
                try {
                  if (typeof document === 'undefined') return undefined;
                  if (anchorEl && anchorEl.ownerDocument && anchorEl.ownerDocument.body) return anchorEl.ownerDocument.body;
                  return document.body;
                } catch {
                  // defensive fallback if ownerDocument or documentElement access throws
                  return typeof document !== 'undefined' ? document.body : undefined;
                }
              })()}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: theme.shadows[8],
                  },
                },
              }}
            >
              {isMobile && (
                <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={600}>{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.role}
                  </Typography>
                </Box>
              )}
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <AccountCircleIcon sx={{ mr: 1.5 }} fontSize="small" />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5 }}>
                <LogoutIcon sx={{ mr: 1.5 }} fontSize="small" />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
