# Frontend Sistem Wrapping (Vite + React + Bootstrap 5)

Aplikasi Web Frontend mandiri yang dirancang khusus dengan tombol besar, tulisan jelas, dan alur ramah untuk **orang tua dan teknisi lapangan**.

## 🚀 Cara Menjalankan

### 1. Masuk ke folder frontend & install dependensi:
```bash
cd frontend
npm install
```

### 2. Jalankan server development:
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:5173`.

### 3. Konfigurasi Backend:
Pastikan backend Node.js aktif di port `4999`. Konfigurasi URL backend dapat diatur di file `.env`:
```env
VITE_API_BASE_URL=http://localhost:4999
```

---

## 📱 Fitur Utama
1. **Masuk / Login (`/login`):** Input besar, tombol tampilkan password, dan pesan error jelas.
2. **Menu Utama / Dashboard (`/`):** Kartu menu berukuran besar (Absen Shift, Transaksi, Kelola Karyawan).
3. **Absen & Shift Kerja (`/shift`):** Mulai shift (Pagi/Siang/Malam), catat riwayat, dan selesaikan jam kerja.
4. **Input Transaksi Wrapping (`/transaksi`):** Pemilihan paket harga wrapping visual, tombol +/- jumlah yang besar, pilihan pembayaran Tunai/EDC/QRIS, dan hitung total otomatis.
5. **Kelola Data Karyawan (`/users`):** Tambah, edit, dan hapus user/kasir dengan modal formulir yang mudah dipahami.
