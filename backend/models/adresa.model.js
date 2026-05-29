'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query(`
    SELECT a.*, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
    FROM Adresat_Dergeses a
    LEFT JOIN Klientet k ON a.klient_id = k.klient_id
    ORDER BY a.adrese_id DESC`).then(([rows]) => rows);

exports.getByKlient = (klient_id) =>
  db.query(
    'SELECT * FROM Adresat_Dergeses WHERE klient_id = ? ORDER BY eshte_kryesore DESC',
    [klient_id]
  ).then(([rows]) => rows);

exports.clearPrimary = (klient_id) =>
  db.query('UPDATE Adresat_Dergeses SET eshte_kryesore=0 WHERE klient_id=?', [klient_id]);

exports.create = async ({ klient_id, emri_pranuesit, adresa, qyteti, kodi_postar, telefoni, eshte_kryesore }) => {
  if (eshte_kryesore) await exports.clearPrimary(klient_id);
  const [result] = await db.query(
    'INSERT INTO Adresat_Dergeses (klient_id,emri_pranuesit,adresa,qyteti,kodi_postar,telefoni,eshte_kryesore) VALUES (?,?,?,?,?,?,?)',
    [klient_id, emri_pranuesit, adresa, qyteti, kodi_postar||null, telefoni||null, eshte_kryesore?1:0]
  );
  return result.insertId;
};

exports.update = async (id, { klient_id, emri_pranuesit, adresa, qyteti, kodi_postar, telefoni, eshte_kryesore }) => {
  if (eshte_kryesore) await exports.clearPrimary(klient_id);
  return db.query(
    'UPDATE Adresat_Dergeses SET klient_id=?,emri_pranuesit=?,adresa=?,qyteti=?,kodi_postar=?,telefoni=?,eshte_kryesore=? WHERE adrese_id=?',
    [klient_id, emri_pranuesit, adresa, qyteti, kodi_postar||null, telefoni||null, eshte_kryesore?1:0, id]
  );
};

exports.remove = (id) =>
  db.query('DELETE FROM Adresat_Dergeses WHERE adrese_id = ?', [id]);
