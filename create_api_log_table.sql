-- Script untuk membuat tabel api_log
-- Jalankan script ini di database MySQL Navicat

CREATE TABLE IF NOT EXISTS `api_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `incoming` datetime NOT NULL COMMENT 'Waktu request masuk (format: YYYY-MM-DD HH:mm:ss)',
  `from_ip` varchar(45) DEFAULT NULL COMMENT 'IP address pengirim request',
  `duration` varchar(20) DEFAULT NULL COMMENT 'Durasi response dalam ms',
  `url_method` varchar(10) DEFAULT NULL COMMENT 'HTTP method (GET, POST, PUT, DELETE)',
  `url_hit` varchar(255) DEFAULT NULL COMMENT 'Endpoint yang diakses',
  `url_full` text COMMENT 'URL lengkap dengan IP address (contoh: http://192.168.100.56:4999/users/create)',
  `req_post` text COMMENT 'Request body untuk POST/PUT (JSON string)',
  `req_get` text COMMENT 'Query parameters untuk GET (JSON string)',
  `outgoing` datetime DEFAULT NULL COMMENT 'Waktu response keluar (format: YYYY-MM-DD HH:mm:ss)',
  `app_response` text COMMENT 'Response dari aplikasi',
  `geo_ip` varchar(45) DEFAULT NULL COMMENT 'IP address untuk geolocation',
  `agent_detect` text COMMENT 'User-Agent dari client',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu record dibuat',
  PRIMARY KEY (`id`),
  KEY `idx_incoming` (`incoming`),
  KEY `idx_from_ip` (`from_ip`),
  KEY `idx_url_method` (`url_method`),
  KEY `idx_url_hit` (`url_hit`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel untuk logging semua API request dan response';

-- Tambahkan index untuk performa query
CREATE INDEX IF NOT EXISTS `idx_incoming_date` ON `api_log` (DATE(`incoming`));
CREATE INDEX IF NOT EXISTS `idx_method_date` ON `api_log` (`url_method`, DATE(`incoming`));
CREATE INDEX IF NOT EXISTS `idx_ip_date` ON `api_log` (`from_ip`, DATE(`incoming`));

-- Insert sample data untuk testing (opsional)
-- INSERT INTO api_log (incoming, from_ip, url_method, url_hit, url_full, agent_detect) 
-- VALUES ('2025-01-16 14:30:00', '127.0.0.1', 'POST', '/users/create', 'http://192.168.100.56:4999/users/create', 'Mozilla/5.0 (Test)');
