import React from 'react';
import { Link } from 'react-router-dom';
import { shiftService } from '../services/shiftService';

export default function DashboardPage({ currentUser }) {
  const activeShift = shiftService.getActiveShift();

  return (
    <div className="container py-4 py-md-5">
      
      {/* Sambutan & Status Shift Saat Ini */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white p-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h2 className="h3 fw-bold text-dark mb-1">
              Selamat Bekerja, <span className="text-primary">{currentUser?.userdesc || currentUser?.username || 'Petugas'}</span>! 👋
            </h2>
            <p className="text-secondary fs-6 mb-0">
              Cabang: <strong>{currentUser?.cabang || 'Utama'}</strong> | Jenis: <strong>{currentUser?.jenisuser || 'Operator'}</strong>
            </p>
          </div>

          <div>
            {activeShift ? (
              <div className="alert alert-success d-flex align-items-center gap-3 mb-0 py-2 px-3 border-2 border-success rounded-3">
                <i className="bi bi-check-circle-fill text-success fs-2"></i>
                <div>
                  <div className="fw-bold fs-6">Shift Sedang Aktif: {activeShift.shiftCode}</div>
                  <small className="text-muted">Mulai: {new Date(activeShift.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning d-flex align-items-center gap-3 mb-0 py-2 px-3 border-2 border-warning rounded-3">
                <i className="bi bi-exclamation-triangle-fill text-warning fs-2"></i>
                <div>
                  <div className="fw-bold fs-6 text-dark">Anda Belum Mulai Shift</div>
                  <small className="text-muted">Silakan klik menu Absen / Shift di bawah</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="h4 fw-bold text-dark mb-3">
          <i className="bi bi-grid-fill text-primary me-2"></i>
          PILIH MENU UTAMA:
        </h3>
      </div>

      {/* Grid Menu Kartu Besar */}
      <div className="row g-4">
        
        {/* Menu 1: Shift */}
        <div className="col-12 col-md-6 col-lg-6">
          <Link to="/shift" className="menu-card text-decoration-none">
            <div>
              <div className="menu-card-icon text-primary">⏱️</div>
              <div className="menu-card-title text-dark">ABSEN & SHIFT KERJA</div>
              <p className="menu-card-desc">
                Mulai jam kerja harian, pilih shift (Pagi/Siang/Malam), atau selesaikan shift operasional Anda.
              </p>
            </div>
            <div className="mt-3">
              <span className={`btn ${activeShift ? 'btn-success' : 'btn-primary'} btn-lg w-100`}>
                <i className="bi bi-arrow-right-circle-fill"></i>
                {activeShift ? 'Lihat / Selesaikan Shift' : 'Mulai Shift Baru'}
              </span>
            </div>
          </Link>
        </div>

        {/* Menu 2: Transaksi Wrapping */}
        <div className="col-12 col-md-6 col-lg-6">
          <Link to="/transaksi" className="menu-card text-decoration-none">
            <div>
              <div className="menu-card-icon text-success">📦</div>
              <div className="menu-card-title text-dark">INPUT TRANSAKSI WRAPPING</div>
              <p className="menu-card-desc">
                Catat pembungkusan koper, pilih tipe paket/harga, jenis pembayaran (Tunai, EDC, QRIS).
              </p>
            </div>
            <div className="mt-3">
              <span className="btn btn-success btn-lg w-100">
                <i className="bi bi-cart-plus-fill"></i>
                Buka Form Transaksi
              </span>
            </div>
          </Link>
        </div>

        {/* Menu 3: Kelola User */}
        <div className="col-12 col-md-6 col-lg-6">
          <Link to="/users" className="menu-card text-decoration-none">
            <div>
              <div className="menu-card-icon text-warning">👥</div>
              <div className="menu-card-title text-dark">DATA KARYAWAN / USER</div>
              <p className="menu-card-desc">
                Lihat daftar petugas, tambah akun baru, ubah cabang, atau perbarui data staf lapangan.
              </p>
            </div>
            <div className="mt-3">
              <span className="btn btn-outline-dark btn-lg w-100">
                <i className="bi bi-people-fill"></i>
                Kelola Daftar User
              </span>
            </div>
          </Link>
        </div>

        {/* Menu 4: Status API & Server */}
        <div className="col-12 col-md-6 col-lg-6">
          <div className="menu-card">
            <div>
              <div className="menu-card-icon text-info">🔌</div>
              <div className="menu-card-title text-dark">STATUS KONEKSI SERVER</div>
              <p className="menu-card-desc">
                Backend Node.js aktif di <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:4999'}</code>.
              </p>
            </div>
            <div className="mt-3">
              <span className="badge bg-success p-3 fs-6 w-100 d-flex align-items-center justify-content-center gap-2">
                <i className="bi bi-wifi"></i>
                Sistem Siap Digunakan
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
