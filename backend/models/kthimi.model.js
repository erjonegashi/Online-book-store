'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query(`
    SELECT kt.*, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri,
           p.data_porosise
    FROM Kthimet kt
    LEFT JOIN Porosite  p ON kt.porosi_id = p.porosi_id
    LEFT JOIN Klientet  k ON p.klient_id  = k.klient_id
    ORDER BY kt.created_at DESC`).then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Kthimet WHERE kthim_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = ({ porosi_id, arsyeja, gjendja, shuma }) =>
  db.query(
    'INSERT INTO Kthimet (porosi_id, arsyeja, gjendja, shuma) VALUES (?,?,?,?)',
    [porosi_id, arsyeja, gjendja || 'Pending', shuma || null]
  ).then(([result]) => result.insertId);

exports.update = (id, { porosi_id, arsyeja, gjendja, shuma }) =>
  db.query(
    'UPDATE Kthimet SET porosi_id=?, arsyeja=?, gjendja=?, shuma=? WHERE kthim_id=?',
    [porosi_id, arsyeja, gjendja || 'Pending', shuma || null, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Kthimet WHERE kthim_id = ?', [id]);
