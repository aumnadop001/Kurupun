import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type UseAuthResult = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const useAuth = (): UseAuthResult => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const login = (t: string) => {
    localStorage.setItem('token', t);
    // If you have additional user info, save it here
  };

  const logout = () => {
    localStorage.removeItem('token');
  };

  return {
    token,
    isAuthenticated: !!token,
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
