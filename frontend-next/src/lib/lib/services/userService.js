import apiClient from '@/lib/axios';

export const userService = {
    async getUsers(filters = {}) {
        return await apiClient.post('/read', filters);
    },
    async createUser(userData) {
        return await apiClient.post('/create', userData);
    },
    async updateUser(userData) {
        return await apiClient.post('/update', userData);
    },
    async deleteUser(id, username) {
        return await apiClient.post('/delete', { id, username });
    }
};
