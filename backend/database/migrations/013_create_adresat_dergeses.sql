CREATE TABLE IF NOT EXISTS Adresat_Dergeses (
  adrese_id      INT AUTO_INCREMENT PRIMARY KEY,
  klient_id      INT NOT NULL,
  emri_pranuesit VARCHAR(200) NOT NULL,
  adresa         VARCHAR(255) NOT NULL,
  qyteti         VARCHAR(100) NOT NULL,
  kodi_postar    VARCHAR(20),
  telefoni       VARCHAR(30),
  eshte_kryesore TINYINT(1) DEFAULT 0,
  FOREIGN KEY (klient_id) REFERENCES Klientet(klient_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
