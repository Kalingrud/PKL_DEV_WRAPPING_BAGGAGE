# Panduan Debug Testing Cross-Day Shift

## Overview
Dokumen ini menjelaskan cara melakukan debugging dan testing untuk fitur Cross-Day Shift yang telah diimplementasikan.

## Fitur yang Ditest
- **Cross-Day Shift Logic**: Ketika Shift 02 (20:00-07:59) bertransaksi di pagi hari (00:00-07:59), `shift_date` harus menggunakan tanggal hari sebelumnya.

## Debug Logging yang Ditambahkan

### 1. Console Logs di Server
Saat melakukan transaksi, server akan menampilkan log debug berikut:

```
=== DEBUG: CROSS-DAY SHIFT ANALYSIS ===
Current time: 2024-01-11T02:30:00.000Z
Current hour: 2 Current minute: 30
Shift code: Shift 02
Shift entries found: 2
Shift entry 1: work_in=20:00:00, work_out=23:59:00
Shift entry 2: work_in=00:00:00, work_out=07:59:00
Has early morning entry (starts at 00:00): true
Early morning entry found: { work_in: '00:00:00', work_out: '07:59:00' }
Time comparison:
- Current minutes: 150 (02:30)
- Work out minutes: 479 (07:59)
- Is in early morning range? true
SHIFT DATE ADJUSTED:
- Original date: Thu Jan 11 2024
- Adjusted date: Wed Jan 10 2024
Final shift date logic:
- isCrossingShift: true
- isInEarlyMorningRange: true
=== END DEBUG: CROSS-DAY SHIFT ANALYSIS ===

=== DEBUG: FINAL DATE VALUES ===
formattedDateTime (actual transaction time): 2024-01-11 02:30:45
formattedDateOnly (shift_date): 2024-01-10
Difference: CROSS-DAY DETECTED
=== END DEBUG: FINAL DATE VALUES ===
```

## Cara Testing

### 1. Manual Testing dengan Script

#### A. Test Otomatis Semua Skenario
```bash
node debug-shift-simple.js
```

#### B. Test Shift 02 Cross-Day Scenarios
```bash
node debug-shift-simple.js shift02
```

#### C. Test Shift 01 Normal Scenarios
```bash
node debug-shift-simple.js shift01
```

#### D. Test Waktu Tertentu
```bash
node debug-shift-simple.js 2 30    # Test jam 2:30 AM
node debug-shift-simple.js 23 45   # Test jam 11:45 PM
```

### 2. Manual Testing dengan Postman/API Client

#### Request Body Example:

**Normal Request** (menggunakan waktu server):
```json
{
  "TrxType": 1,
  "Termcode": "TERM001",
  "ShiftCode": "Shift 02",
  "LoginCode": "testuser",
  "EngineCode": 1,
  "qty": 1,
  "QRCode": "TEST_QR_12345",
  "pack_type": "KK",
  "payment_type": "cash",
  "payment_reff": "TEST_REF",
  "parent_code": "TEST_PC_12345",
  "end_trx": "n"
}
```


#### Endpoint: `POST /api/lingga_trx`

### 3. Test Scenarios yang Harus Dicek

#### ✅ Skenario 1: Shift 02 - Early Morning (Cross-Day)
- **Waktu**: 02:00 AM
- **Expected Result**: 
  - `tgl`: 2024-01-11 02:00:xx (tanggal aktual)
  - `shift_date`: 2024-01-10 (tanggal shift - 1 hari)
  - **Log**: "CROSS-DAY DETECTED"

#### ✅ Skenario 2: Shift 02 - Late Night (Normal Day)
- **Waktu**: 22:00 PM
- **Expected Result**: 
  - `tgl`: 2024-01-10 22:00:xx (tanggal aktual)
  - `shift_date`: 2024-01-10 (tanggal shift sama)
  - **Log**: "NO CROSS-DAY"

#### ✅ Skenario 3: Shift 02 - End of Shift (Cross-Day)
- **Waktu**: 07:30 AM
- **Expected Result**: 
  - `tgl`: 2024-01-11 07:30:xx (tanggal aktual)
  - `shift_date`: 2024-01-10 (tanggal shift - 1 hari)
  - **Log**: "CROSS-DAY DETECTED"

#### ✅ Skenario 4: Shift 01 - Normal (No Cross-Day)
- **Waktu**: 10:00 AM dengan ShiftCode "Shift 01"
- **Expected Result**: 
  - `tgl`: 2024-01-10 10:00:xx (tanggal aktual)
  - `shift_date`: 2024-01-10 (tanggal shift sama)
  - **Log**: "NO CROSS-DAY"

#### 🕛 **Skenario 5: CRITICAL - Jam 00:00 (Midnight)**
- **Waktu**: 00:00:00 AM dengan ShiftCode "Shift 02"
- **Testing**: Lakukan testing pada jam 00:00:00 secara manual
- **Expected Result**: 
  - `tgl`: 2024-01-11 00:00:xx (tanggal aktual - hari baru)
  - `shift_date`: 2024-01-10 (tanggal shift - 1 hari, KARENA masih dalam shift hari sebelumnya)
  - **Log**: "CROSS-DAY DETECTED"

## Apa yang Harus Dicek dalam Database

Setelah testing, periksa table `penjualan` untuk memastikan:

```sql
SELECT 
    id,
    shift_code,
    tgl,
    shift_date,
    created_at
FROM penjualan 
WHERE parent_code LIKE 'TEST_%' OR parent_code LIKE 'DEBUG_%'
ORDER BY id DESC;
```

### Expected Results untuk Cross-Day:
```
| shift_code | tgl                | shift_date | Status |
|------------|-------------------|------------|--------|
| Shift 02   | 2024-01-11 02:30  | 2024-01-10 | ✅ Correct (cross-day) |
| Shift 02   | 2024-01-10 22:00  | 2024-01-10 | ✅ Correct (same day)  |
```

## Troubleshooting

### Jika Cross-Day tidak bekerja:

1. **Cek Database empshift**:
   ```sql
   SELECT * FROM empshift WHERE code = 'Shift 02' AND flag = 'open';
   ```

2. **Cek Console Logs**: Pastikan melihat log debug yang dimulai dengan `=== DEBUG: CROSS-DAY SHIFT ANALYSIS ===`

3. **Cek Time Zone**: Pastikan server menggunakan timezone yang benar

4. **Cek Data Test**: Pastikan `Termcode`, `LoginCode`, dan data lain valid di database

### Common Issues:

#### Issue 1: "ShiftCode tidak valid"
**Solution**: Pastikan ada data di table `empshift` dengan `code = 'Shift 02'` dan `flag = 'open'`

#### Issue 2: Log tidak muncul
**Solution**: Pastikan server reload setelah perubahan kode

#### Issue 3: Tanggal tidak berubah
**Solution**: Cek apakah waktu testing benar-benar dalam range 00:00 - 07:59

## Cleanup After Testing

Untuk membersihkan data test dari database:

```sql
DELETE FROM penjualan WHERE parent_code LIKE 'TEST_%' OR parent_code LIKE 'DEBUG_%';
```

## Production Deployment

Setelah testing selesai dan berhasil, **HAPUS** semua console.log debug untuk production:

1. Hapus semua baris yang berisi `console.log('=== DEBUG:`
2. Hapus semua baris yang berisi `console.log('Final shift date logic:`
3. Commit perubahan tanpa debug logs
