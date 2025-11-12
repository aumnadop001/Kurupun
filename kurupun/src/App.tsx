import { ThemeProvider, CssBaseline } from '@mui/material';
import themes from './themes/components';
import { Toaster } from 'react-hot-toast';
import Router from './routes';

function App() {
  return (
    <ThemeProvider theme={themes}>
      <CssBaseline />
      <Toaster position='top-right' />
      <Router />
    </ThemeProvider>
  );
}

export default App;
