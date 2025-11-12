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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 135, 135, 0.2), transparent 50%)',
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: { xs: 4, md: 0 } 
        }}>
          <FadeIn>
            <Paper 
              elevation={24} 
              sx={{ 
                borderRadius: 4,
                overflow: 'hidden',
                maxWidth: 1000,
                width: '100%',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  minHeight: { md: '600px' },
                }}
              >
                {/* Left Side - Branding */}
                <Box
                  sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    p: { xs: 4, sm: 5, md: 6 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1), transparent 60%)',
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
                    <Box
                      component="img"
                      src="/images/logo.png"
                      alt="Logo"
                      sx={{ 
                        width: '100%', 
                        maxWidth: { xs: 140, sm: 180, md: 200 }, 
                        mb: 3,
                        mx: 'auto'
                      }}
                    />
                    
                    <Typography 
                      variant="h3" 
                      component="h1"
                      sx={{ 
                        fontWeight: 700,
                        fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                        mb: 2,
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                      }}
                    >
                      ยินดีต้อนรับ
                    </Typography>
                    
                    <Typography 
                      sx={{ 
                        fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' },
                        lineHeight: 1.6,
                        opacity: 0.95,
                        maxWidth: 360,
                        mx: 'auto'
                      }}
                    >
                      ระบบทะเบียนคุมเอกสาร<br/>และบัญชีคุมวัสดุ
                    </Typography>

                    <Box sx={{ mt: 4, opacity: 0.7 }}>
                      <Typography variant="caption" sx={{ fontSize: '0.85rem' }}>
                        เข้าสู่ระบบเพื่อเริ่มการทำงาน
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Right Side - Login Form */}
                <Box sx={{ 
                  flex: 1, 
                  p: { xs: 4, sm: 5, md: 6 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
                    <Typography 
                      variant="h4" 
                      component="h2" 
                      sx={{ 
                        fontWeight: 700,
                        mb: 1,
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                        color: 'primary.main'
                      }}
                    >
                      เข้าสู่ระบบ
                    </Typography>
                    
                    <Typography 
                      color="text.secondary" 
                      sx={{ mb: 4, fontSize: { xs: '0.875rem', sm: '0.95rem' } }}
                    >
                      กรุณากรอกข้อมูลเพื่อเข้าใช้งาน
                    </Typography>

                    <form onSubmit={formik.handleSubmit}>
                      <TextField
                        fullWidth
                        size='medium'
                        id="username"
                        name="username"
                        label="ชื่อผู้ใช้"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && formik.errors.username}
                        sx={{ 
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                        autoComplete="username"
                      />

                      <TextField
                        fullWidth
                        size='medium'
                        id="password"
                        name="password"
                        label="รหัสผ่าน"
                        type={showPassword ? 'text' : 'password'}
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                        sx={{ 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                        autoComplete="current-password"
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

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button 
                          variant="text" 
                          size="small"
                          sx={{ 
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            '&:hover': {
                              background: 'transparent',
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          ลืมรหัสผ่าน?
                        </Button>
                      </Box>

                      <Button 
                        fullWidth 
                        type="submit" 
                        variant="contained" 
                        size="large"
                        sx={{ 
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                          }
                        }}
                      >
                        เข้าสู่ระบบ
                      </Button>
                    </form>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </FadeIn>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;