CREATE TABLE IF NOT EXISTS Autoret (
  autori_id  INT AUTO_INCREMENT PRIMARY KEY,
  emri       VARCHAR(100) NOT NULL,
  mbiemri    VARCHAR(100) NOT NULL,
  biografia  TEXT,
  shtati     VARCHAR(100),
  foto_url   VARCHAR(512),
  website    VARCHAR(255),
  email      VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
