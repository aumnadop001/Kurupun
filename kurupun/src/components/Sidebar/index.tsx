import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import DescriptionIcon from '@mui/icons-material/Description';
import { store } from '../../stores/store';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmDialog from '../ConfirmDialog';
import { logout } from '../../stores/services/authSlice';
const DRAWER_WIDTH = 220;

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const user = store.getState().auth.user as { username: string; staff?: boolean } | null | undefined;
  const isAuthenticated = !!user;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAuth = () => {
    if (isAuthenticated) {
      setLogoutDialogOpen(true);
    } else {
      navigate('/login');
    }
  };

  const handleLogoutConfirm = () => {
    store.dispatch(logout());
    setLogoutDialogOpen(false);
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const menuItems = [
    {
      text: 'ทะเบียนคุมเอกสาร',
      icon: <DescriptionIcon />,
      path: '/',
    },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            letterSpacing: 1,
          }}
        >
          KURUPUN
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleMenuClick(item.path)}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'inherit' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* User Section */}
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {isAuthenticated && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                }}
              >
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.username || 'Guest'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.staff ? 'เจ้าหน้าที่' : 'ผู้ใช้งานทั่วไป'}
                </Typography>
              </Box>
            </Box>
          )}

          <Button
            fullWidth
            variant={isAuthenticated ? 'outlined' : 'contained'}
            color={isAuthenticated ? 'error' : 'primary'}
            startIcon={isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
            onClick={handleAuth}
            sx={{ py: 1 }}
          >
            {isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      <ConfirmDialog
        open={logoutDialogOpen}
        title="ออกจากระบบ"
        message="คุณต้องการออกจากระบบใช่หรือไม่?"
        confirmText="ออกจากระบบ"
        cancelText="ยกเลิก"
        confirmColor="error"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* AppBar for mobile */}
        {isMobile && (
          <AppBar
            position="fixed"
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                KURUPUN
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Drawer for Desktop */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Drawer for Mobile */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            mt: isMobile ? 8 : 0,
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default SidebarLayout;