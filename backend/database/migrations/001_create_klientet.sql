CREATE TABLE IF NOT EXISTS Klientet (
  klient_id         INT AUTO_INCREMENT PRIMARY KEY,
  emri              VARCHAR(100) NOT NULL,
  mbiemri           VARCHAR(100) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  fjalekalimi_hash  VARCHAR(255) NOT NULL,
  telefoni          VARCHAR(30),
  adresa            VARCHAR(255),
  qyteti            VARCHAR(100),
  kodi_postar       VARCHAR(20),
  data_regjistrimit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
