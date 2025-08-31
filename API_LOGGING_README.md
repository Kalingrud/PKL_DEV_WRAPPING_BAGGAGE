# API Logging System Documentation

## Overview
Sistem API logging yang terintegrasi dengan database MySQL Navicat untuk mencatat semua request dan response dari endpoint API.

## Fitur Utama

### 1. Format Waktu yang Benar
- **Sebelum**: `2025-08-31T09:31:28.898Z` (ISO format)
- **Sesudah**: `2025-01-16 14:30:25` (YYYY-MM-DD HH:mm:ss)

### 2. Data yang Dicatat
- **incoming**: Waktu request masuk
- **outgoing**: Waktu response keluar  
- **duration**: Durasi response dalam milidetik
- **from_ip**: IP address pengirim
- **url_method**: HTTP method (GET, POST, PUT, DELETE)
- **url_hit**: Endpoint yang diakses (contoh: `/users/create`)
- **url_full**: URL lengkap dengan IP address (contoh: `http://192.168.100.56:4999/users/create`)
- **req_post**: Request body untuk POST/PUT
- **req_get**: Query parameters untuk GET
- **app_response**: Response dari aplikasi
- **agent_detect**: User-Agent dari client

## Setup Database

### 1. Jalankan Script SQL
```sql
-- Jalankan file create_api_log_table.sql di Navicat
-- Script akan membuat tabel api_log dengan struktur yang sesuai
```

### 2. Struktur Tabel
```sql
CREATE TABLE `api_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `incoming` datetime NOT NULL,
  `from_ip` varchar(45) DEFAULT NULL,
  `duration` varchar(20) DEFAULT NULL,
  `url_method` varchar(10) DEFAULT NULL,
  `url_hit` varchar(255) DEFAULT NULL,
  `url_full` text,
  `req_post` text,
  `req_get` text,
  `outgoing` datetime DEFAULT NULL,
  `app_response` text,
  `geo_ip` varchar(45) DEFAULT NULL,
  `agent_detect` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

## Penggunaan

### 1. Middleware Otomatis
Semua endpoint di `index.js` akan otomatis tercatat:
- `GET /` - Server info
- `POST /users/create` - Create user
- `POST /users/read` - Read users
- `POST /users/update` - Update user
- `POST /users/delete` - Delete user

### 2. Endpoint untuk Melihat Logs
```bash
# Ambil 10 logs terbaru
GET /api/logs
 # Filter berdasarkan IP
GET /api/logs?from_ip=192.168.1.100

# Filter berdasarkan method (hanya POST yang tersedia)
GET /api/logs?url_method=POST

# Filter berdasarkan endpoint
GET /api/logs?url_hit=/users/create

# Filter berdasarkan tanggal
GET /api/logs?date_from=2025-01-01&date_to=2025-01-31

# Kombinasi filter
GET /api/logs?from_ip=192.168.1.100&url_method=POST&limit=20
```

## Contoh Response Logs

### Response Sukses
```json
{
  "success": true,
  "message": "API logs berhasil diambil",
  "data": [
    {
      "id": 1,
      "incoming": "2025-01-16 14:30:25",
      "from_ip": "192.168.1.100",
      "duration": "45ms",
      "url_method": "POST",
      "url_hit": "/users/create",
      "url_full": "http://192.168.100.56:4999/users/create",
      "req_post": "{\"username\":\"test\",\"userdesc\":\"Test User\"}",
      "req_get": null,
      "outgoing": "2025-01-16 14:30:26",
      "app_response": "{\"success\":true,\"message\":\"User berhasil dibuat\"}",
      "geo_ip": "192.168.1.100",
      "agent_detect": "PostmanRuntime/7.32.3",
      "created_at": "2025-01-16 14:30:26"
    }
  ],
  "count": 1,
  "filters": {
    "from_ip": null,
    "url_method": null,
    "url_hit": null,
    "date_from": null,
    "date_to": null,
    "limit": 10
  }
}
```

## Monitoring dan Debugging

### 1. Console Logs
Setiap request akan tercatat di console:
```
📝 API Log tersimpan dengan ID: 1
⏰ Incoming: 2025-01-16 14:30:25 | Outgoing: 2025-01-16 14:30:26 | Duration: 45ms
🌐 POST /users/create dari IP: 192.168.1.100
```

### 2. Database Monitoring
- Semua request tercatat real-time
- Bisa di-query untuk analisis
- Index untuk performa optimal

## Troubleshooting

### 1. Error "Table api_log doesn't exist"
```bash
# Jalankan script SQL di Navicat
# File: create_api_log_table.sql
```

### 2. Error Koneksi Database
```bash
# Cek konfigurasi database di routes/api_log.js
# Pastikan host, user, password, dan database name benar
```

### 3. Logs Tidak Tersimpan
```bash
# Cek console untuk error messages
# Pastikan middleware apiLogMiddleware terpasang di index.js
```

## Performa

### 1. Index Database
- `idx_incoming`: Untuk query berdasarkan waktu
- `idx_from_ip`: Untuk query berdasarkan IP
- `idx_url_method`: Untuk query berdasarkan HTTP method
- `idx_url_hit`: Untuk query berdasarkan endpoint

### 2. Optimasi
- Logging asynchronous (tidak blocking response)
- Connection pooling untuk database
- Index untuk query yang sering digunakan

## Security

### 1. Data yang Aman
- Tidak menyimpan password atau data sensitif
- Request body di-sanitize sebelum disimpan
- IP address tidak di-expose ke public

### 2. Access Control
- Endpoint `/api/logs` bisa di-restrict jika diperlukan
- Database access terbatas pada aplikasi

## Maintenance

### 1. Cleanup Logs
```sql
-- Hapus logs lebih dari 30 hari
DELETE FROM api_log WHERE incoming < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Archive logs lama ke tabel terpisah
-- Backup database secara berkala
```

### 2. Monitoring
- Cek ukuran tabel secara berkala
- Monitor performa query
- Backup data penting

## Support

Untuk bantuan teknis atau pertanyaan:
1. Cek console logs untuk error messages
2. Verifikasi struktur tabel database
3. Test koneksi database
4. Cek middleware configuration
