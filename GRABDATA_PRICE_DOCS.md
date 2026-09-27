# Dokumentasi Endpoint grabdata_price & grabdata_payment

## Endpoint: /grabdata_price

### Deskripsi
Endpoint ini digunakan untuk mengambil daftar harga (price list) dari tabel `wrap_price` berdasarkan `terminal_code`.

### Method
`POST`

### URL
```
http://localhost:3000/grabdata_price
```

### Request Body
```json
{
  "terminal_code": "CGK-T1B"
}
```

### Parameters
| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| terminal_code | String | Ya | Kode terminal yang ingin dicari |

### Response Success (200)
```json
{
  "code": "200",
  "message": "OK",
  "data": [
    {
      "id": 3,
      "terminal_code": "CGK-T1B",
      "pack_type": "REG",
      "name": "Harga Lama",
      "price": "50,000",
      "flag": "open"
    }
  ]
}
```

**Catatan**: Harga akan otomatis diformat dengan koma sebagai pemisah ribuan (contoh: 50000 → 50,000)

### Response Error (400) - Parameter Tidak Lengkap
```json
{
  "code": "400",
  "message": "Parameter terminal_code wajib diisi",
  "data": []
}
```

### Response Error (404) - Data Tidak Ditemukan
```json
{
  "code": "404",
  "message": "Data tidak ditemukan",
  "data": []
}
```

### Response Error (500) - Database Error
```json
{
  "code": "500",
  "message": "Database error: ...",
  "data": []
}
```

### Field yang Dikembalikan
- `id` - ID dari record
- `terminal_code` - Kode terminal
- `pack_type` - Tipe paket
- `name` - Nama harga
- `price` - Harga
- `flag` - Status flag (open/close)

### Contoh Penggunaan di Postman
1. Pilih method **POST**
2. Masukkan URL: `http://localhost:3000/grabdata_price`
3. Di tab **Body**, pilih **raw** dan **JSON**
4. Masukkan request body:
   ```json
   {
     "terminal_code": "CGK-T1B"
   }
   ```
5. Klik **Send**

---

## Endpoint: /grabdata_payment

### Deskripsi
Endpoint ini digunakan untuk mengambil **SEMUA** daftar metode pembayaran dari tabel `cfg_payment`. Endpoint ini **TIDAK** memerlukan parameter apapun dan akan mengembalikan seluruh data metode pembayaran yang ada di database.

### Method
`POST`

### URL
```
http://localhost:3000/grabdata_payment
```

### Request Body
**TIDAK MEMERLUKAN PARAMETER APAPUN**

Anda bisa mengirim request kosong atau dengan parameter apapun, hasilnya akan tetap menampilkan semua data:
```json
{}
```

### Parameters
| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| - | - | Tidak | Tidak ada parameter yang diperlukan |

**Catatan**: Jika parameter diisi, akan diabaikan. Endpoint akan tetap mengembalikan semua data.

### Response Success (200)
```json
{
  "code": "200",
  "message": "OK",
  "data": [
    {
      "id": 3,
      "code": "cash",
      "name": "cash",
      "flag": "open"
    },
    {
      "id": 4,
      "code": "qris",
      "name": "QRIS",
      "flag": "open"
    }
  ]
}
```

### Response Error (404) - Data Tidak Ditemukan
```json
{
  "code": "404",
  "message": "Data tidak ditemukan",
  "data": []
}
```

### Response Error (500) - Database Error
```json
{
  "code": "500",
  "message": "Database error: ...",
  "data": []
}
```

### Field yang Dikembalikan
- `id` - ID dari record
- `code` - Kode metode pembayaran
- `name` - Nama metode pembayaran
- `flag` - Status flag (open/close)

### Contoh Penggunaan di Postman
1. Pilih method **POST**
2. Masukkan URL: `http://localhost:3000/grabdata_payment`
3. Di tab **Body**, pilih **raw** dan **JSON**
4. Biarkan body kosong atau isi dengan `{}`
5. Klik **Send**
6. Endpoint akan mengembalikan **SEMUA** data metode pembayaran

---

## Catatan
- Kedua endpoint ini sudah terintegrasi dengan middleware logging API
- Database yang digunakan: `pkl_wrapping`
- Tabel yang digunakan: 
  - `wrap_price` untuk endpoint grabdata_price (memerlukan parameter `terminal_code`)
  - `cfg_payment` untuk endpoint grabdata_payment (tidak memerlukan parameter, select all)
- Server berjalan di port 4999 (sesuai konfigurasi)

