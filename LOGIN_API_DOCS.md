# 🔐 API Login Documentation

## Endpoint
```
POST /users/login
```

## Base URL
```
http://localhost:4999
```

## Description
Endpoint untuk autentikasi user berdasarkan username dan password.

## Request

### Headers
```
Content-Type: application/x-www-form-urlencoded
```

### Body (x-www-form-urlencoded)
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `username` | string | ✅ | Username dari database |
| `pass` | string | ✅ | Password plain text |

### Example Request Body
```
username=nuyung19&pass=1234
```

## Response

### ✅ Success Response (200)
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "id": 21,
    "username": "nuyung19",
    "userdesc": "nuyung19",
    "usertype": "1",
    "jenisuser": 1,
    "cabang": 1,
    "cookie1": null
  },
  "login_time": "31/8/2025 21:59:00"
}
```

### ❌ Error Responses

#### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "message": "Username dan password harus diisi"
}
```

#### 401 Unauthorized - Username Not Found
```json
{
  "success": false,
  "message": "Username tidak ditemukan",
  "error_code": "USERNAME_NOT_FOUND"
}
```

#### 401 Unauthorized - Invalid Password
```json
{
  "success": false,
  "message": "Password salah",
  "error_code": "INVALID_PASSWORD"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Terjadi kesalahan server"
}
```

## Testing

### 1. Test dengan Postman
1. Buka Postman
2. Set method ke `POST`
3. Masukkan URL: `http://localhost:4999/users/login`
4. Pilih tab `Body`
5. Pilih `x-www-form-urlencoded`
6. Tambahkan key-value pairs:
   - `username`: `nuyung19`
   - `pass`: `1234`
7. Klik `Send`

### 2. Test dengan cURL
```bash
curl -X POST http://localhost:4999/users/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=nuyung19&pass=1234"
```

### 3. Test dengan Node.js
```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:4999/users/login', {
  username: 'nuyung19',
  pass: '1234'
}, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

console.log(response.data);
```

## Security Features

- ✅ **Input Sanitization**: Mencegah SQL injection
- ✅ **Password Hashing**: Menggunakan bcrypt untuk verifikasi
- ✅ **Secure Response**: Tidak menampilkan password hash
- ✅ **Input Validation**: Validasi required fields
- ✅ **Error Handling**: Error handling yang aman
- ✅ **Auto Logging**: Semua request tercatat otomatis

## Database Schema

Berdasarkan tabel `users` di database `pkl_wrapping`:

| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `username` | varchar(50) | Username untuk login |
| `userdesc` | varchar(50) | Deskripsi user |
| `pass` | varchar(100) | Password hash (bcrypt) |
| `usertype` | varchar(5) | Tipe user (admin/user/1) |
| `jenisuser` | int | Jenis user |
| `cabang` | int | Cabang user |
| `cookie1` | varchar | Cookie field |

## Notes

- Password di database sudah di-hash menggunakan bcrypt
- Endpoint ini otomatis tercatat di tabel `api_log`
- Response time dan IP address user tercatat otomatis
- Gunakan username dan password yang valid dari database untuk testing
