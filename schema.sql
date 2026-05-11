-- Force UTF-8 for this session before anything else
SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci';
SET character_set_client     = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results    = utf8mb4;

CREATE DATABASE IF NOT EXISTS online_book_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE online_book_store;

-- Ensure existing database uses utf8mb4 even if it was created with a different charset
ALTER DATABASE online_book_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS Autoret (
  autori_id  INT AUTO_INCREMENT PRIMARY KEY,
  emri       VARCHAR(100) NOT NULL,
  mbiemri    VARCHAR(100) NOT NULL,
  biografia  TEXT,
  shtati     VARCHAR(100),
  foto_url   VARCHAR(512),
  website    VARCHAR(255),
  email      VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Kategorite (
  kategori_id        INT AUTO_INCREMENT PRIMARY KEY,
  emri               VARCHAR(100) NOT NULL,
  pershkrimi         TEXT,
  kategoria_prind_id INT,
  FOREIGN KEY (kategoria_prind_id) REFERENCES Kategorite(kategori_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  FOREIGN KEY (autori_id)    REFERENCES Autoret(autori_id)       ON DELETE SET NULL,
  FOREIGN KEY (kategoria_id) REFERENCES Kategorite(kategori_id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS Lista_Deshirave (
  deshire_id   INT AUTO_INCREMENT PRIMARY KEY,
  klient_id    INT NOT NULL,
  liber_id     INT NOT NULL,
  data_shtimit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wishlist (klient_id, liber_id),
  FOREIGN KEY (klient_id) REFERENCES Klientet(klient_id) ON DELETE CASCADE,
  FOREIGN KEY (liber_id)  REFERENCES Librat(liber_id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Kuponat (
  kupon_id           INT AUTO_INCREMENT PRIMARY KEY,
  kodi               VARCHAR(50)  NOT NULL UNIQUE,
  pershkrimi         VARCHAR(255),
  perqindja_zbritjes DECIMAL(5,2) NOT NULL,
  vlera_minimale     DECIMAL(10,2) DEFAULT 0,
  data_fillimit      DATE,
  data_perfundimit   DATE,
  statusi            ENUM('Active','Inactive','Expired') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- -------------------------------------------------------
-- Trigger: enforce nota BETWEEN 1 AND 5 on Vleresimet
-- CHECK constraints are silently ignored in MySQL < 8.0.16;
-- triggers work on all InnoDB versions (MySQL 5.5+).
-- -------------------------------------------------------
DELIMITER //

DROP TRIGGER IF EXISTS trg_vleresimet_before_insert //
CREATE TRIGGER trg_vleresimet_before_insert
BEFORE INSERT ON Vleresimet
FOR EACH ROW
BEGIN
  IF NEW.nota NOT BETWEEN 1 AND 5 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Nota duhet te jete ndermjet 1 dhe 5';
  END IF;
END //

DROP TRIGGER IF EXISTS trg_vleresimet_before_update //
CREATE TRIGGER trg_vleresimet_before_update
BEFORE UPDATE ON Vleresimet
FOR EACH ROW
BEGIN
  IF NEW.nota NOT BETWEEN 1 AND 5 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Nota duhet te jete ndermjet 1 dhe 5';
  END IF;
END //

DELIMITER ;
