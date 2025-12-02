import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/Register';
import DocumentRegistry from '../pages/DocumentRegistry';
import FormDocumentRegistry from '../pages/DocumentRegistry/form';
import InventoryRecord from '../pages/InventoryRecord';
import FormInventoryRecord from '../pages/InventoryRecord/form';
import Inventory from '../pages/Inventory';
import FormInventory from '../pages/Inventory/form/form';
import InventoryForm from '../pages/Inventory/form/form';
import DocumentControl from '../pages/DocumentControl';
import FormDocumentControl from '../pages/DocumentControl/form/form';
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
            path="/inventory"
            element={
              <SidebarLayout>
                <Inventory />
              </SidebarLayout>
            }
          />
          <Route
            path="/inventory/create"
            element={
              <RequireAuth>
                <SidebarLayout>
                  <InventoryForm />
                </SidebarLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/inventory/:id"
            element={
              <SidebarLayout>
                <FormInventory />
              </SidebarLayout>
            }
          />
          <Route
            path="/"
            element={
              <SidebarLayout>
                <DocumentControl />
              </SidebarLayout>
            }
          />
          <Route
            path="/document-control"
            element={
              <SidebarLayout>
                <DocumentControl />
              </SidebarLayout>
            }
          />
          <Route
            path="/document-control/create"
            element={
              <RequireAuth>
                <SidebarLayout>
                  <FormDocumentControl />
                </SidebarLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/document-control/:id"
            element={
              <SidebarLayout>
                <FormDocumentControl />
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
