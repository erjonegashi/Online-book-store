-- Indexes eksplicite mbi kolonat e kërkuara shpesh (FK + search)
-- InnoDB krijon FK-index automatikisht, por këto i emërtojnë qartë

ALTER TABLE Librat         ADD INDEX idx_librat_autori_id    (autori_id);
ALTER TABLE Librat         ADD INDEX idx_librat_kategoria_id (kategoria_id);
ALTER TABLE Porosite       ADD INDEX idx_porosite_klient_id  (klient_id);
ALTER TABLE Detajet_Porosise ADD INDEX idx_detajet_porosi_id (porosi_id);
ALTER TABLE Vleresimet     ADD INDEX idx_vleresimet_liber_id (liber_id);
ALTER TABLE Vleresimet     ADD INDEX idx_vleresimet_klient_id(klient_id);
ALTER TABLE Njoftimet      ADD INDEX idx_njoftimet_klient_id (klient_id);
ALTER TABLE Stoku          ADD INDEX idx_stoku_liber_id      (liber_id);
