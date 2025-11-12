import { ThemeProvider, CssBaseline } from '@mui/material';
import themes from './themes/components';
import { Toaster } from 'react-hot-toast';
import Router from './routes';

function App() {
  return (
    <ThemeProvider theme={themes}>
      <CssBaseline />
      <Toaster />
      <Router />
    </ThemeProvider>
  );
}

export default App;
