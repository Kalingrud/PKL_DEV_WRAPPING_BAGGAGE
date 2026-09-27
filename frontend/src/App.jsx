import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ShiftPage from './pages/ShiftPage';
import TransactionPage from './pages/TransactionPage';
import UserManagement from './pages/UserManagement';

export default function App() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    // Sync state jika ada perubahan storage
    const handleStorage = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-vh-100 d-flex flex-column bg-light">
        {currentUser && (
          <Navbar
            currentUser={currentUser}
            onLogout={() => setCurrentUser(null)}
          />
        )}

        <main className="flex-grow-1">
          <Routes>
            {/* Route Login */}
            <Route
              path="/login"
              element={
                currentUser ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />
                )
              }
            />

            {/* Route Utama / Dashboard */}
            <Route
              path="/"
              element={
                currentUser ? (
                  <DashboardPage currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Route Shift / Absen */}
            <Route
              path="/shift"
              element={
                currentUser ? (
                  <ShiftPage currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Route Transaksi Wrapping */}
            <Route
              path="/transaksi"
              element={
                currentUser ? (
                  <TransactionPage currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Route Kelola User */}
            <Route
              path="/users"
              element={
                currentUser ? (
                  <UserManagement currentUser={currentUser} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-white border-top py-3 text-center text-muted">
          <div className="container">
            <small className="fw-semibold">
              © {new Date().getFullYear()} PT Wrapping Indonesia • Sistem Operasional Lapangan & Kasir
            </small>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
