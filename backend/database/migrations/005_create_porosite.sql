CREATE TABLE IF NOT EXISTS Porosite (
  porosi_id         INT AUTO_INCREMENT PRIMARY KEY,
  klient_id         INT,
  shuma_totale      DECIMAL(10,2) NOT NULL DEFAULT 0,
  kostoja_dergeses  DECIMAL(10,2) NOT NULL DEFAULT 0,
  statusi           ENUM('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  metoda_pageses    ENUM('Cash','Card','PayPal','Bank Transfer') DEFAULT 'Card',
  adresa_dergeses   VARCHAR(255),
  data_porosise     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (klient_id) REFERENCES Klientet(klient_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
