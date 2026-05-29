CREATE TABLE IF NOT EXISTS Dergesat (
  dergesa_id        INT AUTO_INCREMENT PRIMARY KEY,
  porosi_id         INT NOT NULL,
  kompania_dergeses VARCHAR(100),
  numri_gjurmimit   VARCHAR(100),
  data_dergimit     DATE,
  data_mberritjes   DATE,
  statusi           ENUM('Preparing','Shipped','In Transit','Delivered','Failed') DEFAULT 'Preparing',
  FOREIGN KEY (porosi_id) REFERENCES Porosite(porosi_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
