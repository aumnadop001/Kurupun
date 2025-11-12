import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FadeIn from 'react-fade-in';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

import { useFormik } from 'formik';
import * as yup from 'yup';

import { Login, getProfile } from '../../apis/service/auth';
import { loginSuccess, profileLogin } from '../../stores/services/authSlice';
import { store } from '../../stores/store';
import toast from 'react-hot-toast';

const validationSchema = yup.object({
  username: yup.string().required('กรุณากรอก Username'),
  password: yup.string().required('กรุณากรอกรหัสผ่าน'),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await Login({ username: values.username, password: values.password });
        if (response && response.access) {
          store.dispatch(loginSuccess({ accessToken: response.access, refreshToken: response.refresh }));

          const profile = await getProfile();
          store.dispatch(profileLogin({ user: profile }));
          toast.success('Login successful!')
          navigate('/');
        } else {
          console.error('Login failed: No token received');
          toast.error('Login failed: No token received');
        }
      } catch (error) {
        console.error('Login error:', error);
        toast.error(`Login failed: ${error}`);
      }
    },
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
          }}
        >
          <FadeIn>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f5f7ff 0%, #e6f0ff 100%)',
                p: 4,
              }}
            >
              <Box sx={{ maxWidth: 420, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                  ยินดีต้อนรับกลับ
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  เข้าสู่ระบบเพื่อจัดการเอกสารของคุณอย่างปลอดภัยและรวดเร็ว
                </Typography>

                <Box
                  component="img"
                  src="/assets/illustration-login.svg"
                  alt="Login illustration"
                  sx={{ width: '100%', maxWidth: 360, mt: 2, display: { xs: 'none', md: 'block' } }}
                />
              </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
              <Paper elevation={6} sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" component="h2" gutterBottom textAlign="center" sx={{ fontWeight: 600 }}>
                  เข้าสู่ระบบ
                </Typography>
                <form onSubmit={formik.handleSubmit}>
                  <TextField
                    fullWidth
                    id="username"
                    name="username"
                    label="ชื่อผู้ใช้"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    helperText={formik.touched.username && formik.errors.username}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="รหัสผ่าน"
                    type={showPassword ? 'text' : 'password'}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    sx={{ mb: 1.5 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                            onClick={() => setShowPassword((s) => !s)}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityIcon />
                            ) : (
                              <VisibilityOffIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Button variant="text" size="small">
                      ลืมรหัสผ่าน?
                    </Button>
                  </Box>

                  <Button fullWidth type="submit" variant="contained" size="large" sx={{ mb: 2 }}>
                    เข้าสู่ระบบ
                  </Button>
                </form>
              </Paper>
            </Box>
          </FadeIn>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;