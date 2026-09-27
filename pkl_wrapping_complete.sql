-- =======================================================
-- Database Setup Script: pkl_wrapping
-- =======================================================

CREATE DATABASE IF NOT EXISTS `pkl_wrapping` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `pkl_wrapping`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `userdesc` varchar(255) DEFAULT NULL,
  `pass` varchar(255) NOT NULL,
  `usertype` varchar(50) DEFAULT NULL,
  `jenisuser` int(11) DEFAULT NULL,
  `cabang` int(11) DEFAULT NULL,
  `cookie1` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: wrap_price
DROP TABLE IF EXISTS `wrap_price`;
CREATE TABLE `wrap_price` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `terminal_code` varchar(50) DEFAULT 'ALL',
  `pack_type` varchar(50) DEFAULT 'REG',
  `name` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT 0.00,
  `flag` varchar(20) DEFAULT 'open',
  PRIMARY KEY (`id`),
  KEY `idx_terminal_code` (`terminal_code`),
  KEY `idx_pack_type` (`pack_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: empshift
DROP TABLE IF EXISTS `empshift`;
CREATE TABLE `empshift` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `work_in` time DEFAULT '00:00:00',
  `work_out` time DEFAULT '00:00:00',
  `flag` varchar(20) DEFAULT 'open',
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: location
DROP TABLE IF EXISTS `location`;
CREATE TABLE `location` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `airport` varchar(50) DEFAULT NULL,
  `flag` varchar(20) DEFAULT 'open',
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: cfg_payment
DROP TABLE IF EXISTS `cfg_payment`;
CREATE TABLE `cfg_payment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `flag` varchar(20) DEFAULT 'open',
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: engine
DROP TABLE IF EXISTS `engine`;
CREATE TABLE `engine` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL,
  `location_code` varchar(50) DEFAULT NULL,
  `engine_count` int(11) DEFAULT 0,
  `flag` varchar(20) DEFAULT 'open',
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table: webconfig
DROP TABLE IF EXISTS `webconfig`;
CREATE TABLE `webconfig` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `value` text DEFAULT NULL,
  `flag` varchar(20) DEFAULT 'open',
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table: penjualan
DROP TABLE IF EXISTS `penjualan`;
CREATE TABLE `penjualan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `no_trans` varchar(50) DEFAULT NULL,
  `trx_type` varchar(50) DEFAULT NULL,
  `location_code` varchar(50) DEFAULT NULL,
  `shift_code` varchar(50) DEFAULT NULL,
  `shift` int(11) DEFAULT NULL,
  `operator` varchar(100) DEFAULT NULL,
  `user_code` varchar(100) DEFAULT NULL,
  `engine_code` varchar(50) DEFAULT NULL,
  `qty` int(11) DEFAULT 1,
  `trx_code` varchar(100) DEFAULT NULL,
  `pack_type` varchar(50) DEFAULT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `payment_reff` varchar(100) DEFAULT NULL,
  `parent_code` varchar(100) DEFAULT NULL,
  `tgl` datetime DEFAULT NULL,
  `upload_date` datetime DEFAULT NULL,
  `shift_date` date DEFAULT NULL,
  `reprint` int(11) DEFAULT 1,
  `uang` decimal(15,2) DEFAULT 0.00,
  `req_get` text DEFAULT NULL,
  `req_post` text DEFAULT NULL,
  `req_server` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trx_code` (`trx_code`),
  KEY `idx_parent_code` (`parent_code`),
  KEY `idx_shift_code` (`shift_code`),
  KEY `idx_shift_date` (`shift_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table: api_log
DROP TABLE IF EXISTS `api_log`;
CREATE TABLE `api_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `incoming` datetime NOT NULL,
  `from_ip` varchar(45) DEFAULT NULL,
  `duration` varchar(20) DEFAULT NULL,
  `url_method` varchar(10) DEFAULT NULL,
  `url_hit` varchar(255) DEFAULT NULL,
  `url_full` text DEFAULT NULL,
  `req_post` text DEFAULT NULL,
  `req_get` text DEFAULT NULL,
  `outgoing` datetime DEFAULT NULL,
  `app_response` text DEFAULT NULL,
  `geo_ip` varchar(45) DEFAULT NULL,
  `agent_detect` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_incoming` (`incoming`),
  KEY `idx_from_ip` (`from_ip`),
  KEY `idx_url_method` (`url_method`),
  KEY `idx_url_hit` (`url_hit`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Table: extapi_log
DROP TABLE IF EXISTS `extapi_log`;
CREATE TABLE `extapi_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trx_code` varchar(100) DEFAULT NULL,
  `from_ip` varchar(45) DEFAULT NULL,
  `trx_req` text DEFAULT NULL,
  `duration` varchar(20) DEFAULT NULL,
  `trx_resp` text DEFAULT NULL,
  `api_target` varchar(255) DEFAULT NULL,
  `target_get` text DEFAULT NULL,
  `target_post` text DEFAULT NULL,
  `target_header` text DEFAULT NULL,
  `response` text DEFAULT NULL,
  `flag` varchar(20) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trx_code` (`trx_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- Initial / Default Data Seeding
-- =======================================================

-- Data awal wrap_price
INSERT INTO `wrap_price` (`id`, `terminal_code`, `pack_type`, `name`, `price`, `flag`) VALUES
(1, 'ALL', 'REG', 'Harga Lama', 50000.00, 'open'),
(2, 'CGK-T1A', 'REG', 'Harga Lama', 50000.00, 'close'),
(3, 'CGK-T1B', 'REG', 'Harga Lama', 50000.00, 'open'),
(4, 'CGK-T1C', 'REG', 'Harga Lama', 50000.00, 'open'),
(5, 'CGK-2', 'REG', 'Harga Lama', 50000.00, 'open'),
(6, 'CGK-3', 'REG', 'Harga Lama', 50000.00, 'open'),
(8, 'CGK-T1A', 'KK', 'Standar', 80000.00, 'open'),
(9, 'CGK-T1A', 'KM', 'Golfbag', 120000.00, 'close'),
(10, 'CGK-T1A', 'KB', 'Oversize', 150000.00, 'open');

-- Data awal empshift
INSERT INTO `empshift` (`id`, `code`, `name`, `work_in`, `work_out`, `flag`) VALUES
(1, 'Shift 01', 'Shift Pagi', '08:00:00', '19:59:00', 'open'),
(2, 'Shift 02', 'Shift Malam 1', '20:00:00', '23:59:00', 'open'),
(3, 'Shift 02', 'Shift Malam 2', '00:00:00', '07:59:00', 'open'),
(4, 'Shift 03', 'Shift Cadangan', '00:00:00', '08:00:00', 'close');

-- Data awal location
INSERT INTO `location` (`id`, `code`, `name`, `airport`, `flag`) VALUES
(1, 'CGK-T1A', 'Terminal 1A Soekarno-Hatta', 'CGK', 'open'),
(2, 'CGK-T1B', 'Terminal 1B Soekarno-Hatta', 'CGK', 'open'),
(3, 'CGK-T1C', 'Terminal 1C Soekarno-Hatta', 'CGK', 'open'),
(4, 'CGK-2', 'Terminal 2 Soekarno-Hatta', 'CGK', 'open'),
(5, 'CGK-3', 'Terminal 3 Soekarno-Hatta', 'CGK', 'open');

-- Data awal cfg_payment
INSERT INTO `cfg_payment` (`id`, `code`, `name`, `flag`) VALUES
(1, 'CASH', 'Cash / Tunai', 'open'),
(2, 'QRIS', 'QRIS Payment', 'open'),
(3, 'DEBIT', 'Debit Card', 'open');

-- Data awal webconfig
INSERT INTO `webconfig` (`id`, `code`, `name`, `type`, `value`, `flag`) VALUES
(1, 'APP_NAME', 'PKL Wrapping App', 'general', 'PKL Wrapping', 'open');

-- Data awal engine
INSERT INTO `engine` (`id`, `code`, `location_code`, `engine_count`, `flag`) VALUES
(1, 'ENG001', 'CGK-T1A', 5, 'open');

-- Data awal users (password default: admin123 -> bcrypt hash $2a$10$w00K7yD7i1b.yv3c7mQ.CeoK5gZfWlR8j9P7yE8vH/9Q2fJ0.gG2q atau bisa diganti)
-- Password plain test: admin123
INSERT INTO `users` (`id`, `username`, `userdesc`, `pass`, `usertype`, `jenisuser`, `cabang`, `cookie1`) VALUES
(1, 'admin', 'Administrator', '$2a$10$tQ1lE0v1K9xV8eA7jCjSgOFfJ5wK4kO3k3u.aZzX9l0gQx9n7G/bW', 'admin', 1, 1, '');

SET FOREIGN_KEY_CHECKS = 1;
