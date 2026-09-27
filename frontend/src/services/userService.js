import axiosClient from '../api/axiosClient';

export const userService = {
  // Ambil daftar semua user (bisa dengan filter)
  async getUsers(filters = {}) {
    return await axiosClient.post('/read', filters);
  },

  // Tambah user baru
  async createUser(userData) {
    return await axiosClient.post('/create', userData);
  },

  // Update user
  async updateUser(userData) {
    return await axiosClient.post('/update', userData);
  },

  // Hapus user
  async deleteUser(id, username) {
    return await axiosClient.post('/delete', { id, username });
  },
};
