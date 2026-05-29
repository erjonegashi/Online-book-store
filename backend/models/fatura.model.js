'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query(`
    SELECT f.*, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
    FROM Faturat f
    LEFT JOIN Porosite  p ON f.porosi_id = p.porosi_id
    LEFT JOIN Klientet  k ON p.klient_id = k.klient_id
    ORDER BY f.fatura_id DESC`).then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Faturat WHERE fatura_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = ({ porosi_id, numri_fatures, data, shuma_total, tatimi, paguar }) =>
  db.query(
    `INSERT INTO Faturat (porosi_id, numri_fatures, data, shuma_total, tatimi, paguar)
     VALUES (?,?,?,?,?,?)`,
    [porosi_id, numri_fatures || null, data || new Date().toISOString().slice(0, 10),
     shuma_total, tatimi || 0, paguar ? 1 : 0]
  ).then(([result]) => result.insertId);

exports.update = (id, { porosi_id, numri_fatures, data, shuma_total, tatimi, paguar }) =>
  db.query(
    `UPDATE Faturat SET porosi_id=?, numri_fatures=?, data=?, shuma_total=?, tatimi=?, paguar=?
     WHERE fatura_id=?`,
    [porosi_id, numri_fatures || null, data, shuma_total, tatimi || 0, paguar ? 1 : 0, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Faturat WHERE fatura_id = ?', [id]);
