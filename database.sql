-- ============================================
-- Online Bookstore - Database Schema
-- ============================================
CREATE DATABASE IF NOT EXISTS online_book_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE online_book_store;

-- 1. Autoret (Authors)
CREATE TABLE IF NOT EXISTS Autoret (
    autori_id  INT          AUTO_INCREMENT PRIMARY KEY,
    emri       VARCHAR(100) NOT NULL,
    mbiemri    VARCHAR(100) NOT NULL,
    biografia  TEXT,
    shtati     VARCHAR(100),
    website    VARCHAR(255),
    email      VARCHAR(255)
) ENGINE=InnoDB;

-- 2. Kategorite (Categories)
CREATE TABLE IF NOT EXISTS Kategorite (
    kategori_id        INT          AUTO_INCREMENT PRIMARY KEY,
    emri               VARCHAR(100) NOT NULL,
    pershkrimi         TEXT,
    kategoria_prind_id INT          DEFAULT NULL,
    FOREIGN KEY (kategoria_prind_id) REFERENCES Kategorite(kategori_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Klientet (Clients)
CREATE TABLE IF NOT EXISTS Klientet (
    klient_id          INT          AUTO_INCREMENT PRIMARY KEY,
    emri               VARCHAR(100) NOT NULL,
    mbiemri            VARCHAR(100) NOT NULL,
    email              VARCHAR(255) UNIQUE NOT NULL,
    telefoni           VARCHAR(20),
    adresa             TEXT,
    qyteti             VARCHAR(100),
    kodi_postar        VARCHAR(20),
    data_regjistrimit  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    fjalekalimi_hash   VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- 4. Librat (Books)
CREATE TABLE IF NOT EXISTS Librat (
    liber_id     INT           AUTO_INCREMENT PRIMARY KEY,
    titulli      VARCHAR(255)  NOT NULL,
    autori_id    INT,
    isbn         VARCHAR(20)   UNIQUE,
    kategoria_id INT,
    botuesi      VARCHAR(255),
    viti_botimit YEAR,
    cmimi        DECIMAL(10,2) NOT NULL,
    sasia_stok   INT           DEFAULT 0,
    pershkrimi   TEXT,
    formati      ENUM('Hardcover','Softcover','Ebook','Audio') DEFAULT 'Softcover',
    FOREIGN KEY (autori_id)    REFERENCES Autoret(autori_id)       ON DELETE SET NULL,
    FOREIGN KEY (kategoria_id) REFERENCES Kategorite(kategori_id)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Porosite (Orders)
CREATE TABLE IF NOT EXISTS Porosite (
    porosi_id        INT           AUTO_INCREMENT PRIMARY KEY,
    klient_id        INT           NOT NULL,
    data_porosise    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    shuma_totale     DECIMAL(10,2) NOT NULL,
    kostoja_dergeses DECIMAL(10,2) DEFAULT 0.00,
    statusi          ENUM('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
    metoda_pageses   ENUM('Cash','Card','PayPal','Bank Transfer') DEFAULT 'Card',
    adresa_dergeses  TEXT,
    FOREIGN KEY (klient_id) REFERENCES Klientet(klient_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Detajet_Porosise (Order Details)
CREATE TABLE IF NOT EXISTS Detajet_Porosise (
    detaji_id    INT           AUTO_INCREMENT PRIMARY KEY,
    porosi_id    INT           NOT NULL,
    liber_id     INT           NOT NULL,
    sasia        INT           NOT NULL,
    cmimi_njesi  DECIMAL(10,2) NOT NULL,
    cmimi_total  DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (porosi_id) REFERENCES Porosite(porosi_id) ON DELETE CASCADE,
    FOREIGN KEY (liber_id)  REFERENCES Librat(liber_id)    ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Dergesat (Deliveries)
CREATE TABLE IF NOT EXISTS Dergesat (
    dergesa_id        INT         AUTO_INCREMENT PRIMARY KEY,
    porosi_id         INT         NOT NULL,
    kompania_dergeses VARCHAR(255),
    numri_gjurmimit   VARCHAR(100),
    data_dergimit     DATE,
    data_mberritjes   DATE,
    statusi           ENUM('Preparing','Shipped','In Transit','Delivered','Failed') DEFAULT 'Preparing',
    FOREIGN KEY (porosi_id) REFERENCES Porosite(porosi_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Vleresimet (Reviews)
CREATE TABLE IF NOT EXISTS Vleresimet (
    vleresim_id INT      AUTO_INCREMENT PRIMARY KEY,
    liber_id    INT      NOT NULL,
    klient_id   INT      NOT NULL,
    nota        TINYINT  CHECK (nota BETWEEN 1 AND 5),
    komenti     TEXT,
    data        DATETIME DEFAULT CURRENT_TIMESTAMP,
    statusi     ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
    FOREIGN KEY (liber_id)  REFERENCES Librat(liber_id)    ON DELETE CASCADE,
    FOREIGN KEY (klient_id) REFERENCES Klientet(klient_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Lista_Deshirave (Wishlist)
CREATE TABLE IF NOT EXISTS Lista_Deshirave (
    deshire_id   INT      AUTO_INCREMENT PRIMARY KEY,
    klient_id    INT      NOT NULL,
    liber_id     INT      NOT NULL,
    data_shtimit DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_wishlist (klient_id, liber_id),
    FOREIGN KEY (klient_id) REFERENCES Klientet(klient_id) ON DELETE CASCADE,
    FOREIGN KEY (liber_id)  REFERENCES Librat(liber_id)    ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Kuponat (Coupons)
CREATE TABLE IF NOT EXISTS Kuponat (
    kupon_id           INT           AUTO_INCREMENT PRIMARY KEY,
    kodi               VARCHAR(50)   UNIQUE NOT NULL,
    pershkrimi         TEXT,
    perqindja_zbritjes DECIMAL(5,2)  NOT NULL,
    vlera_minimale     DECIMAL(10,2) DEFAULT 0.00,
    data_fillimit      DATE,
    data_perfundimit   DATE,
    statusi            ENUM('Active','Inactive','Expired') DEFAULT 'Active'
) ENGINE=InnoDB;

-- 11. Pagesat (Payments)
CREATE TABLE IF NOT EXISTS Pagesat (
    pagese_id               INT           AUTO_INCREMENT PRIMARY KEY,
    porosi_id               INT           NOT NULL,
    data_pageses            DATETIME      DEFAULT CURRENT_TIMESTAMP,
    shuma                   DECIMAL(10,2) NOT NULL,
    metoda                  ENUM('Cash','Card','PayPal','Bank Transfer') DEFAULT 'Card',
    statusi                 ENUM('Pending','Completed','Failed','Refunded') DEFAULT 'Pending',
    referenca_transaksionit VARCHAR(255),
    FOREIGN KEY (porosi_id) REFERENCES Porosite(porosi_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Adresat_Dergeses (Delivery Addresses)
CREATE TABLE IF NOT EXISTS Adresat_Dergeses (
    adrese_id       INT         AUTO_INCREMENT PRIMARY KEY,
    klient_id       INT         NOT NULL,
    emri_pranuesit  VARCHAR(255) NOT NULL,
    adresa          TEXT        NOT NULL,
    qyteti          VARCHAR(100) NOT NULL,
    kodi_postar     VARCHAR(20),
    telefoni        VARCHAR(20),
    eshte_kryesore  TINYINT(1)  DEFAULT 0,
    FOREIGN KEY (klient_id) REFERENCES Klientet(klient_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- Sample Data
-- ============================================
INSERT INTO Autoret (emri, mbiemri, biografia, shtati, email) VALUES
('Ismail',  'Kadare',    'Shkrimtar i shquar shqiptar, laureat i çmimeve ndërkombëtare.',    'Shqipëri', 'kadare@example.com'),
('Naim',    'Frashëri',  'Poet kombëtar shqiptar, romantik i rilindjes kombëtare.',           'Shqipëri', 'frasheri@example.com'),
('Fan S.',  'Noli',      'Klerik, politikan dhe shkrimtar shqiptar-amerikan.',                 'SHBA',     'noli@example.com'),
('Gjergj',  'Fishta',    'Poet i madh shqiptar, autor i epikës Lahuta e Malcís.',             'Shqipëri', 'fishta@example.com');

INSERT INTO Kategorite (emri, pershkrimi) VALUES
('Letërsi',    'Libra letërsie shqiptare dhe botërore'),
('Histori',    'Libra me temë historike'),
('Shkencë',    'Libra shkencore dhe teknike'),
('Fëmijë',     'Libra për fëmijë dhe të rinj'),
('Filozofi',   'Libra filozofike dhe psikologjike');

-- Password for admin is "admin123"
INSERT INTO Klientet (emri, mbiemri, email, fjalekalimi_hash, telefoni, qyteti) VALUES
('Admin', 'Bookstore', 'admin@bookstore.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 '0691234567', 'Tiranë');

INSERT INTO Librat (titulli, autori_id, isbn, kategoria_id, botuesi, viti_botimit, cmimi, sasia_stok, formati, pershkrimi) VALUES
('Gjenerali i Ushtrisë së Vdekur', 1, '978-9928-05-001-1', 1, 'Onufri',   2010, 1200.00, 25, 'Softcover', 'Roman i famshëm i Kadaresë.'),
('Kronikë në Gur',                 1, '978-9928-05-002-2', 1, 'Onufri',   2012, 1100.00, 30, 'Softcover', 'Roman autobiografik.'),
('Bagëti e Bujqësia',              2, '978-9928-05-003-3', 1, 'ASHSH',    2005,  800.00, 15, 'Hardcover', 'Vepra e Naim Frashërit.'),
('Lahuta e Malcís',                4, '978-9928-05-004-4', 1, 'Shkodra',  2008,  950.00, 20, 'Hardcover', 'Epos kombëtar shqiptar.');
