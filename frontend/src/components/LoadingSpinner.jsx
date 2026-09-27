import React from 'react';

/**
 * Indikator Loading yang jelas dan tidak membingungkan
 */
export default function LoadingSpinner({ text = 'Sedang memuat data, mohon tunggu...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
      <div className="spinner-border text-primary" style={{ width: '3.5rem', height: '3.5rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 fs-5 fw-bold text-secondary">{text}</p>
    </div>
  );
}
