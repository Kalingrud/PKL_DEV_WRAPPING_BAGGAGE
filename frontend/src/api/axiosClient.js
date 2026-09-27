import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4999';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 detik timeout
});

// Interceptor untuk Request
axiosClient.interceptors.request.use(
  (config) => {
    // Ambil data user dari localStorage jika ada
    const userSession = localStorage.getItem('wrapping_user');
    if (userSession) {
      try {
        const user = JSON.parse(userSession);
        // Tambahkan info user jika diperlukan di header
        if (user && user.id) {
          config.headers['x-user-id'] = user.id;
        }
      } catch (e) {
        console.error('Gagal parse user session:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk Response & Terjemahan Error yang Ramah
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let friendlyMessage = 'Terjadi kesalahan sistem. Silakan coba lagi.';

    if (!error.response) {
      friendlyMessage = 'Tidak dapat terhubung ke server backend. Pastikan server aktif di ' + API_BASE_URL;
    } else {
      const data = error.response.data;
      const status = error.response.status;

      if (data && data.message) {
        friendlyMessage = data.message;
      } else if (status === 401) {
        friendlyMessage = 'Username atau Password salah.';
      } else if (status === 404) {
        friendlyMessage = 'Data tidak ditemukan.';
      } else if (status === 500) {
        friendlyMessage = 'Server backend mengalami kendala internal.';
      }
    }

    return Promise.reject({
      ...error,
      friendlyMessage,
    });
  }
);

export default axiosClient;
