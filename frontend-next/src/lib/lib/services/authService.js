//berisi endpoint login
import apiClient from '@/lib/axios';  //berfunsi untuk mengambil nilai base url di axios.js

export const authService = {  //berfungsi untuk authentikasi user yang login
    async login(username, pass) {   //berfungsi untuk memanggil api login
        return await apiClient.post('/login', {   //untuk mengirim username dan password login ke backend
            username: username.trim(),   //username.trim untuk membuang spasi karena tidak boleh ada spasi di awal dan di akhir
            pass: pass.trim(),  //membuang spasi karena password tidak boleh spasi di awal dan di akhir
        });
    },
    getCurrentUser() {  //berfungsi untuk mengambil data user backend yang login
        if (typeof window === 'undefined') return null;  //jika tidak ada user maka akan mengembalikan nilai null
        const u = localStorage.getItem('wrapping_user');  //mengambil data user dari database local
        return u ? JSON.parse(u) : null;   //jika ada user maka akan mengembalikan data user, jika tidak ada maka mengembalikan nilai null
    },
    setCurrentUser(user) {  //berfungsi untuk menyimpan data user backend yang login
        localStorage.setItem('wrapping_user', JSON.stringify(user)); //menyimpan data user ke database local
    },
    logout() {  //berngunsi untuk logout
        localStorage.removeItem('wrapping_user'); //menghapus data user dari table wrapping_user    
        localStorage.removeItem('wrapping_active_shift'); //menghapus data shift yang sedang aktif
    }
};
