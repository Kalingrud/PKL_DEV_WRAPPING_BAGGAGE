# User Management API with Auto Logging

Aplikasi Node.js untuk manajemen user dengan sistem logging otomatis untuk semua API request.

## 🏗️ Struktur Project

```
src/
├── config/          # Konfigurasi database
├── controllers/     # Business logic
├── middleware/      # Middleware (API logging)
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Helper functions
├── app.js           # Express app configuration
└── server.js        # Server entry point
```

## 🚀 Fitur Utama

- **User CRUD Operations** - Create, Read, Update, Delete user
- **Auto API Logging** - Semua request otomatis tercatat di database
- **Security Features** - Input validation dan sanitization
- **Clean Architecture** - Kode terorganisir dan mudah maintain

## 📋 Requirements

- Node.js 16+
- MySQL 8.0+
- bcryptjs untuk password hashing

## 🛠️ Installation

1. Clone repository
```bash
git clone <repository-url>
cd wrapping-node
```

2. Install dependencies
```bash
npm install
```

3. Setup database
```bash
mysql -u root -p < create_api_log_table.sql
```

4. Update database config di `src/config/database.js`

5. Run aplikasi
```bash
# Development
npm run dev

# Production
npm start
```

## 🌐 API Endpoints

### User Management
- `POST /users/create` - Buat user baru
- `GET /users/read` - Baca data user (dengan query params)
- `POST /users/read` - Baca data user (dengan body params)
- `POST /users/update` - Update data user
- `POST /users/delete` - Hapus user

### API Logging
- `GET /api/logs/recent` - Ambil log terbaru
- `GET /api/logs/filter` - Filter log berdasarkan kriteria
- `GET /api/logs/test` - Test koneksi database

### Test Endpoints
- `GET /test/log` - Test logging system
- `GET /test/unauthorized` - Test status 401
- `POST /test/unauthorized` - Test status 401

## 📊 Logging System

Setiap API request akan otomatis tercatat dengan informasi:

- **incoming**: Waktu request masuk
- **from_ip**: IP address client
- **duration**: Waktu response (format: X.XX ms)
- **url_method**: HTTP method
- **url_hit**: Path yang diakses
- **req_post**: Request body (untuk POST)
- **req_get**: Request query (untuk GET, array kosong jika tidak ada)
- **outgoing**: Waktu response keluar
- **app_response**: Response dengan format `[status_code] body`
- **geo fields**: Semua berisi `-`
- **agent_detect**: User-Agent string

## 🔒 Security Features

- Input validation untuk mencegah XSS dan SQL injection
- Password hashing dengan bcrypt
- Sanitasi input untuk karakter berbahaya
- CORS configuration

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  userdesc TEXT,
  pass VARCHAR(255) NOT NULL,
  usertype VARCHAR(50),
  jenisuser INT,
  cabang INT
);
```

### API Log Table
```sql
CREATE TABLE api_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  incoming DATETIME,
  from_ip VARCHAR(45),
  duration VARCHAR(20),
  url_method VARCHAR(10),
  url_hit VARCHAR(255),
  url_full TEXT,
  req_post TEXT,
  req_get TEXT,
  outgoing DATETIME,
  app_response TEXT,
  geo_ip VARCHAR(45),
  geo_long VARCHAR(45),
  geo_lat VARCHAR(45),
  geo_city VARCHAR(100),
  agent_detect TEXT
);
```

## 🧪 Testing

Test dengan Postman atau curl:

```bash
# Test logging
curl http://localhost:4999/test/log

# Test unauthorized
curl http://localhost:4999/test/unauthorized

# Create user
curl -X POST http://localhost:4999/users/create \
  -H "Content-Type: application/json" \
  -d '{"username":"test","userdesc":"Test User","pass":"password123","usertype":"admin","jenisuser":1,"cabang":1}'
```

## 📚 Dependencies

- **express**: Web framework
- **mysql2**: MySQL driver
- **bcryptjs**: Password hashing
- **cors**: Cross-origin resource sharing

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

ISC License

