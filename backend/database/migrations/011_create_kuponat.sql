CREATE TABLE IF NOT EXISTS Kuponat (
  kupon_id           INT AUTO_INCREMENT PRIMARY KEY,
  kodi               VARCHAR(50)  NOT NULL UNIQUE,
  pershkrimi         VARCHAR(255),
  perqindja_zbritjes DECIMAL(5,2) NOT NULL,
  vlera_minimale     DECIMAL(10,2) DEFAULT 0,
  data_fillimit      DATE,
  data_perfundimit   DATE,
  statusi            ENUM('Active','Inactive','Expired') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
