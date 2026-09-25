import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Public pages
import BulletinVisite from './pages/public/BulletinVisite';

// Admin pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Visiteurs from './pages/admin/Visiteurs';
import Orientateurs from './pages/admin/Orientateurs';
import Referentiels from './pages/admin/Referentiels';
import Profil from './pages/admin/Profil';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes Publiques Formulaire Visiteur */}
          <Route path="/" element={<BulletinVisite />} />
          <Route path="/visite" element={<BulletinVisite />} />

          {/* Login Admin */}
          <Route path="/admin/login" element={<Login />} />

          {/* Espace Admin Protégé */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="visiteurs" element={<Visiteurs />} />
              <Route path="orientateurs" element={<Orientateurs />} />
              <Route path="referentiels" element={<Referentiels />} />
              <Route path="profil" element={<Profil />} />
            </Route>
          </Route>

          {/* Redirection fallback */}
          <Route path="*" element={<Navigate to="/visite" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
