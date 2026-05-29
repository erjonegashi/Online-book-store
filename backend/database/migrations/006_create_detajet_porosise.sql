CREATE TABLE IF NOT EXISTS Detajet_Porosise (
  detaji_id   INT AUTO_INCREMENT PRIMARY KEY,
  porosi_id   INT NOT NULL,
  liber_id    INT,
  sasia       INT NOT NULL DEFAULT 1,
  cmimi_njesi DECIMAL(10,2) NOT NULL,
  cmimi_total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (porosi_id) REFERENCES Porosite(porosi_id) ON DELETE CASCADE,
  FOREIGN KEY (liber_id)  REFERENCES Librat(liber_id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
