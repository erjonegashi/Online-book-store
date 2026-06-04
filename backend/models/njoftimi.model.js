'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query(`
    SELECT n.*, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
    FROM Njoftimet n
    LEFT JOIN Klientet k ON n.klient_id = k.klient_id
    ORDER BY n.created_at DESC`).then(([rows]) => rows);

exports.getByKlient = (klient_id) =>
  db.query(
    'SELECT * FROM Njoftimet WHERE klient_id = ? OR klient_id IS NULL ORDER BY created_at DESC',
    [klient_id]
  ).then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Njoftimet WHERE njoftime_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = ({ titulli, mesazhi, lloji, klient_id }) =>
  db.query(
    'INSERT INTO Njoftimet (titulli, mesazhi, lloji, klient_id) VALUES (?,?,?,?)',
    [titulli, mesazhi, lloji || 'info', klient_id || null]
  ).then(([result]) => result.insertId);

exports.update = (id, { titulli, mesazhi, lloji, klient_id, lexuar }) =>
  db.query(
    'UPDATE Njoftimet SET titulli=?, mesazhi=?, lloji=?, klient_id=?, lexuar=? WHERE njoftime_id=?',
    [titulli, mesazhi, lloji || 'info', klient_id || null, lexuar ? 1 : 0, id]
  );

exports.markRead = (id) =>
  db.query('UPDATE Njoftimet SET lexuar = 1 WHERE njoftime_id = ?', [id]);

exports.markReadForUser = async (id, klient_id) => {
  const [result] = await db.query(
    'UPDATE Njoftimet SET lexuar = 1 WHERE njoftime_id = ? AND (klient_id = ? OR klient_id IS NULL)',
    [id, klient_id]
  );
  return result.affectedRows > 0;
};

exports.remove = (id) =>
  db.query('DELETE FROM Njoftimet WHERE njoftime_id = ?', [id]);
