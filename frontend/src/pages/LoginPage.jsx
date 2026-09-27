import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import AlertBox from '../components/AlertBox';
import BigButton from '../components/BigButton';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Mohon isi Username dan Password terlebih dahulu.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.login(username, password);

      if (res && res.data && res.data.length > 0) {
        const user = res.data[0];
        authService.setCurrentUser(user);
        if (onLoginSuccess) onLoginSuccess(user);
        navigate('/');
      } else {
        setErrorMessage(res.message || 'Login gagal. Periksa kembali username dan password.');
      }
    } catch (err) {
      setErrorMessage(err.friendlyMessage || 'Gagal masuk. Periksa username dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-5">
          
          <div className="card shadow border-0 rounded-4 overflow-hidden">
            {/* Header Login */}
            <div className="bg-primary text-white text-center p-4">
              <div className="fs-1 mb-2">📦</div>
              <h2 className="h3 fw-bold mb-1">MASUK KE SISTEM</h2>
              <p className="mb-0 fs-6 opacity-75">Sistem Operasional Wrapping & Kasir</p>
            </div>

            <div className="card-body p-4 p-md-5">
              {/* Notifikasi Error */}
              <AlertBox
                type="danger"
                message={errorMessage}
                onClose={() => setErrorMessage('')}
              />

              <form onSubmit={handleSubmit} noValidate>
                {/* Input Username */}
                <div className="mb-4">
                  <label htmlFor="inputUsername" className="form-label">
                    <i className="bi bi-person-fill text-primary me-2"></i>
                    Nama Pengguna (Username)
                  </label>
                  <input
                    id="inputUsername"
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Ketik username Anda..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    autoFocus
                    required
                  />
                </div>

                {/* Input Password */}
                <div className="mb-3">
                  <label htmlFor="inputPassword" className="form-label">
                    <i className="bi bi-key-fill text-primary me-2"></i>
                    Kata Sandi (Password)
                  </label>
                  <input
                    id="inputPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control form-control-lg"
                    placeholder="Ketik password Anda..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                {/* Checkbox Lihat Password */}
                <div className="form-check mb-4 py-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showPassCheckbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    style={{ width: '22px', height: '22px', cursor: 'pointer' }}
                  />
                  <label
                    className="form-check-label fs-6 fw-bold ms-2 text-dark"
                    htmlFor="showPassCheckbox"
                    style={{ cursor: 'pointer' }}
                  >
                    Perlihatkan Kata Sandi
                  </label>
                </div>

                {/* Tombol Submit Besar */}
                <BigButton
                  type="submit"
                  variant="success"
                  size="xl"
                  fullWidth
                  disabled={isLoading}
                  icon={isLoading ? 'bi-hourglass-split' : 'bi-box-arrow-in-right'}
                >
                  {isLoading ? 'Sedang Memeriksa...' : 'MASUK SEKARANG'}
                </BigButton>
              </form>
            </div>

            <div className="card-footer bg-light text-center py-3 border-0">
              <small className="text-muted fw-semibold">
                Hubungi Admin Cabang jika Anda lupa kata sandi
              </small>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
