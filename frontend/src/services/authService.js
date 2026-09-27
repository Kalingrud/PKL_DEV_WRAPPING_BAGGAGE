import axiosClient from '../api/axiosClient';

export const authService = {
  // Login user
  async login(username, pass) {
    const res = await axiosClient.post('/login', {
      username: username.trim(),
      pass: pass.trim(),
    });
    return res;
  },

  // Simpan data user yang sedang login
  setCurrentUser(user) {
    localStorage.setItem('wrapping_user', JSON.stringify(user));
  },

  // Ambil user yang sedang login
  getCurrentUser() {
    const userStr = localStorage.getItem('wrapping_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('wrapping_user');
    localStorage.removeItem('wrapping_active_shift');
  }
};
