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
- tambahkan http eror   
- tambah kan respon code messege:

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