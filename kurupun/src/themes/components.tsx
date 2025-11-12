// theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0C2B4E',       // Navy เข้ม
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1A3D64',       // Navy โทนอ่อน
    },
    info: {
      main: '#1D546C',       // Blue-ish accent
    },
    background: {
      default: '#F4F4F4',    // พื้นหลัง soft
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0D0D0D',
      secondary: '#555555',
    },
  },
  shape: {
    borderRadius: 12,        // โค้งมน
  },
  typography: {
    fontFamily: `'Roboto', 'Helvetica', 'Arial', sans-serif`,
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 2px rgba(0,0,0,0.10)',
          '&:hover': {
            boxShadow: '0px 3px 6px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 3px rgba(0,0,0,0.10)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

export default theme;
