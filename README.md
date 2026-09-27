## mandatoring
1.username ✅+
2.userdesc✅
3.pass✅
4.id✅+
5.usertype✅
6.jenisuser✅
7.cabang✅

pr pak harit
27 Agustus 2025
-di postman setiap crud beda endpoint✅
-parameternya harus sama seperti di database✅
-read bisa select semua parameter✅

Pr pa harit
28 Agustus 2025
-Mindahin tabel dari xampp ke navicat✅
-Mindahin tabel users dari xampp ke navicat✅
-konekin api ke navicat bukan ke xampp✅


Pr pa harit
29 Agustus 2025
- coba ngehit ip laptop lain di postman ✅
- api_log✅

Senin 1 september pagi, sudah harus selesai
1. Perbaikan table
-semua table dibuat✅
-semua field disamakan✅
-semua tipe data disesuaikan✅
-perbaikan default value untuk datetime dan varchar
contoh date time : '0000-00-00 00:00:00'
contoh varchar : '-'

2. hit endpoint teman
-Kalingga hit endpoint ipat✅
-ipat hit endpoint kalingga✅
-test semua fungsi endpoint✅

3. buat endpoint login
- buat route login✅
- buat parameter ussername dan password postman✅
-check apakah parameter sudah masuk ke routing✅
- buat validasi username dan password✅
- ussername berhasil menampilkan row data username tersebut.✅
- jika berhasil, maka sistem akan menampilkan row data username tersebut✅
- jika gagal, maka menampilkan username tidak ditemukan.✅
- tambahkan http eror  ✅
- tambah kan respon code messege:✅

{
    "code":200
    "messege":"OK"
    "data":[
    {
        1:1
    }
    ]
}

Contoh agent_detect :
{
    "CONTENT_TYPE": "application/x-www-form-urlencoded",
    "CONTENT_LENGTH": "22",
    "HTTP_HOST": "103.90.248.246",
    "HTTP_CONNECTION": "Keep-Alive",
    "HTTP_ACCEPT_ENCODING": "gzip",
    "HTTP_USER_AGENT": "okhttp/3.10.0",
    "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin",
    "SERVER_SIGNATURE": "<address>Apache/2.4.41 (Ubuntu) Server at 103.90.248.246 Port 80</address>
",
    "SERVER_SOFTWARE": "Apache/2.4.41 (Ubuntu)",
    "SERVER_NAME": "103.90.248.246",
    "SERVER_ADDR": "192.168.80.100",
    "SERVER_PORT": "80",
    "REMOTE_ADDR": "103.82.14.5",
    "DOCUMENT_ROOT": "/var/www/html",
    "REQUEST_SCHEME": "http",
    "CONTEXT_PREFIX": "",
    "CONTEXT_DOCUMENT_ROOT": "/var/www/html",
    "SERVER_ADMIN": "webmaster@localhost",
    "SCRIPT_FILENAME": "/var/www/html/wrapapk/Grab_Setup.php",
    "REMOTE_PORT": "28208",
    "GATEWAY_INTERFACE": "CGI/1.1",
    "SERVER_PROTOCOL": "HTTP/1.1",
    "REQUEST_METHOD": "POST",
    "QUERY_STRING": "", 
    "REQUEST_URI": "/wrapapk/Grab_Setup.php",=
    "SCRIPT_NAME": "/wrapapk/Grab_Setup.php",
    "PHP_SELF": "/wrapapk/Grab_Setup.php",
    "REQUEST_TIME_FLOAT": 1745913079.717708,
    "REQUEST_TIME": 1745913079
}


{
  "table_name": "empshift",
  "action": "create",
  "code": "Shift 01",
  "work_in": "08:00:00",
  "work_out": "16:00:00",
  "flag": "open"
}

{
  "table_name": "empshift",
  "action": "update",
  "id": 4,
  "work_in": "09:00:00",
  "work_out": "17:00:00",
  "flag": "open"
}

{
  "table_name": "empshift",
  "action": "read",
  "work_in": "09:00:00",
  "work_out": "17:00:00",
  "flag": "open"
}

{
  "table_name": "empshift",
  "action": "delete",
  "id": 59
}


{
  "table_name": "cfg_payment",
  "action": "create",
  "code": "CASH01",
  "name": "Pembayaran Tunai",
  "flag": "open"
}   

{
  "table_name": "cfg_payment",  
  "action": "read",
  "code": "CASH01",
  "name": "Pembayaran Tunai",
  "flag": "open"
}   

{
  "table_name": "engine",
  "action": "create",
  "code": "ENG001",
  "location_code": "L001",
  "engine_count": 5,
  "flag": "open"
}


{
  "table_name": "location",
  "action": "create",
  "code": "L001",
  "name": "Jakarta Utara",
  "flag": "open"
}


{
  "table_name": "web_config",
  "action": "create",
  "code": "WC001",
  "name": "Max Upload Size",
  "value": "10MB",
  "flag": "open"
}

{
  "table_name": "wrapprice",
  "action": "create",
  "code": "WP001",
  "name": "Wrapping Premium",
  "price": 150000.00,
  "flag": "open"
}


{
  "operations": [
    {
      "table": "location",
      "action": "create",
      "data": {
        "code": "L003",
        "name": "Bandung"
      }
    },
    {
      "table": "engine",
      "action": "create",
      "data": {
        "code": "ENG003",
        "location_code": "L003",
        "engine_count": 12
      }
    },
    {
      "table": "wrap_price",
      "action": "create",
      "data": {
        "terminal_code": "BDG-T1A",
        "pack_type": "REG",
        "name": "Wrapping Bandung",
        "price": 120000.00
      }
    }
  ]
}


{
  "operations": [
    {
      "table": "location",
      "action": "create",
      "data": {
        "code": "L005",
        "name": "Jakarta Pusat",
        "airport": "CGK"
      }
    },
    {
      "table": "engine",
      "action": "read",
      "data": {
        "location_code": "L005"
      }
    },
    {
      "table": "wrap_price",
      "action": "create",
      "data": {
        "terminal_code": "JKT-T1A",
        "pack_type": "REG",
        "name": "Wrapping Jakarta",
        "price": 100000
      }
    },
    {
      "table": "cfg_payment",
      "action": "create",
      "data": {
        "code": "PAY001",
        "name": "Cash Payment"
      }
    },
    {
      "table": "empshift",
      "action": "create",
      "data": {
        "code": "SHIFT001",
        "name": "Shift Pagi"
      }
    },
    {
      "table": "webconfig",
      "action": "create",
      "data": {
        "code": "WEB001",
        "name": "Main Config",
        "type": "setting"
      }
    },
    {
      "table": "location",
      "action": "update",
      "data": {
        "id": 1,
        "name": "Jakarta Updated"
      }
    },
    {
      "table": "engine",
      "action": "delete",
      "data": {
        "id": 1
      }
    },
    {
      "table": "wrap_price",
      "action": "read",
      "data": {
        "terminal_code": "JKT-T1A"
      }
    },
    {
      "table": "cfg_payment",
      "action": "update",
      "data": {
        "id": 1,
        "name": "Updated Payment"
      }
    },
    {
      "table": "empshift",
      "action": "read",
      "data": {}
    },
    {
      "table": "webconfig",
      "action": "delete",
      "data": {
        "id": 1
      }
    }
  ]
}





