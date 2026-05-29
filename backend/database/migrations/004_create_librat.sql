CREATE TABLE IF NOT EXISTS Librat (
  liber_id     INT AUTO_INCREMENT PRIMARY KEY,
  titulli      VARCHAR(255) NOT NULL,
  autori_id    INT,
  isbn         VARCHAR(20),
  kategoria_id INT,
  botuesi      VARCHAR(150),
  viti_botimit YEAR,
  cmimi        DECIMAL(10,2) NOT NULL DEFAULT 0,
  sasia_stok   INT NOT NULL DEFAULT 0,
  pershkrimi   TEXT,
  formati      ENUM('Hardcover','Softcover','Ebook','Audiobook') DEFAULT 'Softcover',
  foto_url     VARCHAR(512),
  FOREIGN KEY (autori_id)    REFERENCES Autoret(autori_id)      ON DELETE SET NULL,
  FOREIGN KEY (kategoria_id) REFERENCES Kategorite(kategori_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
