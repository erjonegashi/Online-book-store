CREATE TABLE IF NOT EXISTS Adminet (
  admin_id          INT AUTO_INCREMENT PRIMARY KEY,
  emri              VARCHAR(100) NOT NULL,
  mbiemri           VARCHAR(100) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  fjalekalimi_hash  VARCHAR(255) NOT NULL,
  roli              VARCHAR(50)  NOT NULL DEFAULT 'admin',
  reset_token       VARCHAR(255) DEFAULT NULL,
  reset_token_expiry DATETIME   DEFAULT NULL,
  created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
