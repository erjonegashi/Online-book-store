CREATE TABLE IF NOT EXISTS Kategorite (
  kategori_id        INT AUTO_INCREMENT PRIMARY KEY,
  emri               VARCHAR(100) NOT NULL,
  pershkrimi         TEXT,
  kategoria_prind_id INT,
  FOREIGN KEY (kategoria_prind_id) REFERENCES Kategorite(kategori_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
