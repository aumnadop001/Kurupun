import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { store } from '../stores/store';
type UseAuthResult = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const useAuth = (): UseAuthResult => {
  const user = store.getState().auth;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const login = (t: string) => {
    localStorage.setItem('accessToken', t);
    // If you have additional user info, save it here
  };

  const logout = () => {
    localStorage.removeItem('token');
  };

  return {
    token,
    isAuthenticated: user.isLoggedIn,
    login,
    logout,
  };
};

// A small route guard component that redirects to /login when no token is present.
export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default useAuth;
