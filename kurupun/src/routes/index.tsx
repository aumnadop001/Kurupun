import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DocumentRegistry from '../pages/DocumentRegistry';
import FormDocumentRegistry from '../pages/DocumentRegistry/form';
import { RequireAuth } from '../hooks/useAuth';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={<DocumentRegistry />}
        />
         <Route
          path="/:id"
          element={<RequireAuth><FormDocumentRegistry /></RequireAuth>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
