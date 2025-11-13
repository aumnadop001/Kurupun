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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { store } from '../../stores/store';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmDialog from '../ConfirmDialog';
import { logout } from '../../stores/services/authSlice';
const DRAWER_WIDTH = 220;
const DRAWER_WIDTH_COLLAPSED = 70;

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const user = store.getState().auth.user as { username: string; staff?: boolean } | null | undefined;
  const isAuthenticated = !!user;

  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
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
        {!collapsed && (
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
        )}
        {collapsed && (
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            KP
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Collapse/Expand Button - Desktop only */}
      {!isMobile && (
        <Box sx={{ px: 1, pt: 1 }}>
          <IconButton
            onClick={handleCollapseToggle}
            sx={{
              width: '100%',
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      )}

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
                    justifyContent: collapsed ? 'center' : 'flex-start',
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
                      minWidth: collapsed ? 'unset' : 40,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  )}
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
                justifyContent: collapsed ? 'center' : 'flex-start',
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
              {!collapsed && (
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
              )}
            </Box>
          )}
          
          {collapsed ? (
            <IconButton
              color={isAuthenticated ? 'error' : 'primary'}
              onClick={handleAuth}
              sx={{
                width: '100%',
                borderRadius: 2,
                border: 1,
                borderColor: isAuthenticated ? 'error.main' : 'primary.main',
                '&:hover': {
                  bgcolor: isAuthenticated ? 'error.light' : 'primary.light',
                },
              }}
            >
              {isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
            </IconButton>
          ) : (
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
          )}
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
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                borderRight: '1px solid',
                borderColor: 'divider',
                transition: theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
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
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mt: isMobile ? 8 : 0,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default SidebarLayout;