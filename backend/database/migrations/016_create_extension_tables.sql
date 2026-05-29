CREATE TABLE IF NOT EXISTS Botuesit (
  botues_id INT AUTO_INCREMENT PRIMARY KEY,
  emri      VARCHAR(255) NOT NULL,
  vendi     VARCHAR(100) DEFAULT NULL,
  website   VARCHAR(255) DEFAULT NULL,
  tel       VARCHAR(20)  DEFAULT NULL,
  email     VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Gjuhet (
  gjuhe_id INT AUTO_INCREMENT PRIMARY KEY,
  emri     VARCHAR(100) NOT NULL,
  kodi     VARCHAR(10)  DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Seria (
  seria_id  INT AUTO_INCREMENT PRIMARY KEY,
  emri      VARCHAR(255) NOT NULL,
  pershkrim TEXT         DEFAULT NULL,
  autor_id  INT          DEFAULT NULL,
  FOREIGN KEY (autor_id) REFERENCES Autoret(autori_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Promocionet (
  promovim_id        INT AUTO_INCREMENT PRIMARY KEY,
  titulli            VARCHAR(255)   NOT NULL,
  pershkrim          TEXT           DEFAULT NULL,
  perqindja_zbritjes DECIMAL(5,2)   NOT NULL DEFAULT 0,
  kodi               VARCHAR(50)    DEFAULT NULL UNIQUE,
  data_fillimit      DATE           DEFAULT NULL,
  data_mbarimit      DATE           DEFAULT NULL,
  aktive             TINYINT(1)     NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Njoftimet (
  njoftime_id INT AUTO_INCREMENT PRIMARY KEY,
  titulli     VARCHAR(255) NOT NULL,
  mesazhi     TEXT         NOT NULL,
  lloji       VARCHAR(50)  NOT NULL DEFAULT 'info',
  klient_id   INT          DEFAULT NULL,
  lexuar      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (klient_id) REFERENCES Klientet(klient_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Kthimet (
  kthim_id   INT AUTO_INCREMENT PRIMARY KEY,
  porosi_id  INT           DEFAULT NULL,
  arsyeja    TEXT          NOT NULL,
  gjendja    VARCHAR(50)   NOT NULL DEFAULT 'Pending',
  shuma      DECIMAL(10,2) DEFAULT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (porosi_id) REFERENCES Porosite(porosi_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Faturat (
  fatura_id     INT AUTO_INCREMENT PRIMARY KEY,
  porosi_id     INT           DEFAULT NULL,
  numri_fatures VARCHAR(100)  DEFAULT NULL UNIQUE,
  data          DATE          NOT NULL,
  shuma_total   DECIMAL(10,2) NOT NULL,
  tatimi        DECIMAL(10,2) NOT NULL DEFAULT 0,
  paguar        TINYINT(1)    NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (porosi_id) REFERENCES Porosite(porosi_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Stoku (
  stok_id          INT AUTO_INCREMENT PRIMARY KEY,
  liber_id         INT          NOT NULL,
  sasia_ndryshimit INT          NOT NULL,
  arsyeja          VARCHAR(255) DEFAULT NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (liber_id) REFERENCES Librat(liber_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
