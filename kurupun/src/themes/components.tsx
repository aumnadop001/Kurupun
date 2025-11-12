// theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',       // Purple gradient base
      light: '#8b9aff',
      dark: '#5568d3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',       // Violet gradient
      light: '#9266c7',
      dark: '#6a4190',
      contrastText: '#ffffff',
    },
    info: {
      main: '#667eea',       // Purple accent
      light: '#8b9aff',
      dark: '#5568d3',
    },
    background: {
      default: '#f8f9fc',    // Very light purple-tinted background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#6B7280',
    },
  },
  shape: {
    borderRadius: 16,        // มุมโค้งมนขึ้น (จาก 12 เป็น 16)
  },
  typography: {
    fontFamily: `Sarabun, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: 'small'
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '5px 12px',
          fontSize: '0.95rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(102, 126, 234, 0.25)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
          },
          '&:active': {
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: '#667eea',
          color: '#667eea',
          '&:hover': {
            borderWidth: '2px',
            borderColor: '#5568d3',
            backgroundColor: 'rgba(102, 126, 234, 0.04)',
          },
        },
        text: {
          color: '#667eea',
          '&:hover': {
            backgroundColor: 'rgba(102, 126, 234, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.1)',
        },
        elevation4: {
          boxShadow: '0px 8px 24px rgba(102, 126, 234, 0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(102, 126, 234, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small'
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: '#667eea',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#667eea',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          color: '#667eea',
          '&:hover': {
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(102, 126, 234, 0.1)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(102, 126, 234, 0.05)',
          color: '#667eea',
        },
      },
    },
  },
});

export default theme;
