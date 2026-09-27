import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { shiftService } from '../services/shiftService';

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const activeShift = shiftService.getActiveShift();

  const handleLogoutClick = () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar dari sistem?');
    if (confirmLogout) {
      authService.logout();
      if (onLogout) onLogout();
      navigate('/login');
    }
  };

  return (
    <header className="bg-white border-bottom border-2 shadow-sm sticky-top">
      <div className="container-fluid px-3 px-md-4 py-2">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          
          {/* Brand Logo & Nama Aplikasi */}
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none text-dark">
            <span className="fs-1">📦</span>
            <div>
              <h1 className="h4 mb-0 fw-bold text-primary">SISTEM WRAPPING</h1>
              <small className="text-muted fw-semibold">Operasional & Kasir Lapangan</small>
            </div>
          </Link>

          {/* Info Pengguna & Tombol Keluar */}
          {currentUser && (
            <div className="d-flex align-items-center flex-wrap gap-2 gap-md-3">
              
              {/* Badge Shift */}
              {activeShift ? (
                <span className="badge bg-success status-badge d-flex align-items-center gap-1 shadow-sm">
                  <i className="bi bi-clock-history"></i>
                  <span>Shift {activeShift.shiftCode || 'Aktif'}</span>
                </span>
              ) : (
                <span className="badge bg-secondary status-badge d-flex align-items-center gap-1">
                  <i className="bi bi-dash-circle"></i>
                  <span>Belum Mulai Shift</span>
                </span>
              )}

              {/* Info User */}
              <div className="bg-light border rounded px-3 py-1 text-end d-none d-sm-block">
                <div className="fw-bold text-dark fs-6">
                  👤 {currentUser.userdesc || currentUser.username}
                </div>
                <small className="text-secondary fw-semibold">
                  Cabang: <span className="text-primary">{currentUser.cabang || '-'}</span>
                </small>
              </div>

              {/* Tombol Beranda */}
              <Link to="/" className="btn btn-outline-primary btn-lg" title="Kembali ke Menu Utama">
                <i className="bi bi-house-door-fill"></i>
                <span className="d-none d-md-inline">Menu Utama</span>
              </Link>

              {/* Tombol Keluar */}
              <button
                type="button"
                onClick={handleLogoutClick}
                className="btn btn-danger btn-lg"
                title="Keluar dari akun"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Keluar</span>
              </button>

            </div>
          )}

        </div>
      </div>
    </header>
  );
}
