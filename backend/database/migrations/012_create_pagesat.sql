CREATE TABLE IF NOT EXISTS Pagesat (
  pagese_id               INT AUTO_INCREMENT PRIMARY KEY,
  porosi_id               INT,
  shuma                   DECIMAL(10,2) NOT NULL,
  metoda                  ENUM('Cash','Card','PayPal','Bank Transfer') DEFAULT 'Card',
  statusi                 ENUM('Pending','Completed','Failed','Refunded') DEFAULT 'Pending',
  referenca_transaksionit VARCHAR(150),
  data_pageses            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (porosi_id) REFERENCES Porosite(porosi_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
