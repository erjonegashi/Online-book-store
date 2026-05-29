CREATE TABLE IF NOT EXISTS Lista_Deshirave (
  deshire_id   INT AUTO_INCREMENT PRIMARY KEY,
  klient_id    INT NOT NULL,
  liber_id     INT NOT NULL,
  data_shtimit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wishlist (klient_id, liber_id),
  FOREIGN KEY (klient_id) REFERENCES Klientet(klient_id) ON DELETE CASCADE,
  FOREIGN KEY (liber_id)  REFERENCES Librat(liber_id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
