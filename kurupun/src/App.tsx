import { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import themes from './themes/components';
import { Toaster } from 'react-hot-toast';
import Router from './routes';
import { fetchMaster } from './apis/service/master';
import { setMasters } from './stores/services/masterSlice';
import { useDispatch } from 'react-redux';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const masterData = await fetchMaster();
        dispatch(setMasters({ masters: masterData }));
      } catch (error) {
        console.error("Error loading master data:", error);
      }
    };

    loadMasterData();
  }, []);

  return (
    <ThemeProvider theme={themes}>
      <CssBaseline />
      <Toaster position='top-right' />
      <Router />
    </ThemeProvider>
  );
}

export default App;
