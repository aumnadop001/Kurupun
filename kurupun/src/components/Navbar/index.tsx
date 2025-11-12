import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { store } from '../../stores/store';

interface NavbarProps {
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const user = store.getState().auth.user as { username: string } | null | undefined
  return (
    <AppBar position="static" color='primary'>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Karupun
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">
            User: {user?.username || 'Guest'}
          </Typography>
          <Button color="inherit" onClick={onLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;