CREATE TABLE IF NOT EXISTS Vleresimet (
  vleresim_id INT AUTO_INCREMENT PRIMARY KEY,
  liber_id    INT,
  klient_id   INT,
  nota        TINYINT NOT NULL,
  komenti     TEXT,
  statusi     ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  data        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (liber_id)  REFERENCES Librat(liber_id)    ON DELETE CASCADE,
  FOREIGN KEY (klient_id) REFERENCES Klientet(klient_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
