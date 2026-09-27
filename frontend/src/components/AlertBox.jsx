import React from 'react';

/**
 * Komponen Alert Ramah Pengguna
 * @param {string} type - 'success' | 'danger' | 'warning' | 'info'
 * @param {string} message - Pesan yang ditampilkan
 * @param {function} onClose - Fungsi opsional jika alert bisa ditutup
 */
export default function AlertBox({ type = 'info', message, onClose }) {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'bi-check-circle-fill text-success';
      case 'danger':
        return 'bi-exclamation-triangle-fill text-danger';
      case 'warning':
        return 'bi-exclamation-circle-fill text-warning';
      default:
        return 'bi-info-circle-fill text-primary';
    }
  };

  const getAlertClass = () => {
    switch (type) {
      case 'success':
        return 'alert-success border-success';
      case 'danger':
        return 'alert-danger border-danger';
      case 'warning':
        return 'alert-warning border-warning';
      default:
        return 'alert-primary border-primary';
    }
  };

  return (
    <div className={`alert ${getAlertClass()} custom-alert d-flex align-items-center justify-content-between shadow-sm my-3`} role="alert">
      <div className="d-flex align-items-center gap-3">
        <i className={`bi ${getIcon()} fs-2`}></i>
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="btn-close fs-5 ms-3"
          aria-label="Tutup"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
}
