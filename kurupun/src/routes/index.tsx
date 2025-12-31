import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '../hooks/useAuth';
import LoginPage from '../pages/LoginPage';
import Documents from '../pages/Document';
import DocumentForm from '../pages/Document/form/form';
import Inventories from '../pages/Inventory';
import InventoryForm from '../pages/Inventory/form/form';
import PaymentIntentForm from '../pages/Inventory/form/PaymentIntentForm';
import RegisterPage from '../pages/Register';
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
                <Documents />
              </SidebarLayout>
            }
          />
          <Route
            path="/documents/create"
            element={
              <RequireAuth>
                <SidebarLayout>
                  <DocumentForm />
                </SidebarLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/documents/edit/:id"
            element={
              <SidebarLayout>
                <DocumentForm />
              </SidebarLayout>
            }
          />
          <Route
            path="/inventory"
            element={
              <SidebarLayout>
                <Inventories />
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
            path="/inventory/edit/:id"
            element={
              <SidebarLayout>
                <InventoryForm />
              </SidebarLayout>
            }
          />
          <Route
            path="/payment-intent/create"
            element={
              <RequireAuth>
                <SidebarLayout>
                  <PaymentIntentForm />
                </SidebarLayout>
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
