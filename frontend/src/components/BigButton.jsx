import React from 'react';

/**
 * Tombol Besar Ramah Layar Sentuh & Penglihatan
 * @param {string} variant - 'primary' | 'success' | 'danger' | 'warning' | 'secondary'
 * @param {string} icon - nama class ikon bootstrap, misal 'bi-plus-circle'
 * @param {string} size - 'lg' | 'xl'
 */
export default function BigButton({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  icon = '',
  disabled = false,
  type = 'button',
  className = '',
  fullWidth = false,
}) {
  const sizeClass = size === 'xl' ? 'btn-xl' : 'btn-lg';
  const widthClass = fullWidth ? 'w-100' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} ${sizeClass} ${widthClass} ${className} shadow-sm`}
    >
      {icon && <i className={`bi ${icon} fs-4`}></i>}
      <span>{children}</span>
    </button>
  );
}
