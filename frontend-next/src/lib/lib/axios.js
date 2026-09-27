import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4999';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Interceptor Request: Sisipkan user ID jika ada
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const user = localStorage.getItem('wrapping_user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                if (parsed.id) config.headers['x-user-id'] = parsed.id;
            } catch (e) {
                console.error(e);
            }
        }
    }
    return config;
});

// Interceptor Response: Format pesan error ramah pengguna
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        let friendlyMessage = 'Terjadi kesalahan sistem. Silakan untuk dicoba kembali.';
        if (!error.response) {
            friendlyMessage = `Tidak dapat terhubung ke server backend (${API_BASE_URL}). Pastikan server backend berjalan.`;
        } else {
            const { data, status } = error.response;
            if (data && data.message) friendlyMessage = data.message;
            else if (status === 401) friendlyMessage = 'Username atau Password salah.';
            else if (status === 404) friendlyMessage = 'Data tidak ditemukan.';
            else if (status === 500) friendlyMessage = 'Server backend tidak berjalan atau mengalami kendala internal silahkan menghubungi pihak aplikasi.';
        }
        return Promise.reject({ ...error, friendlyMessage });
    }
);

export default apiClient;
