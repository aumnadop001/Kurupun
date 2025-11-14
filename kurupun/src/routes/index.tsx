import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/Register';
import DocumentRegistry from '../pages/DocumentRegistry';
import FormDocumentRegistry from '../pages/DocumentRegistry/form';
import InventoryRecord from '../pages/InventoryRecord';
import FormInventoryRecord from '../pages/InventoryRecord/form';
import { RequireAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';
import SidebarLayout from '../components/Sidebar';

const Router: React.FC = () => {
  return (
    <BrowserRouter >
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <SidebarLayout>
                <DocumentRegistry />
              </SidebarLayout>
            }
          />
          <Route
            path="/document-registries/create"
            element={
              <RequireAuth>
                <SidebarLayout>
                  <FormDocumentRegistry />
                </SidebarLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/document-registries/:id"
            element={
              <SidebarLayout>
                <FormDocumentRegistry />
              </SidebarLayout>
            }
          />
          <Route
            path="/inventory-records"
            element={
              <SidebarLayout>
                <InventoryRecord />
              </SidebarLayout>
            }
          />
          <Route
            path="/inventory-records/create"
            element={
              <RequireAuth>
                <SidebarLayout>
                  <FormInventoryRecord />
                </SidebarLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/inventory-records/:id"
            element={
              <SidebarLayout>
                <FormInventoryRecord />
              </SidebarLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
