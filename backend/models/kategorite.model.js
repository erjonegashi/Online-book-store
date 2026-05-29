'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query(`
    SELECT k.*, p.emri AS prind_emri
    FROM Kategorite k
    LEFT JOIN Kategorite p ON k.kategoria_prind_id = p.kategori_id
    ORDER BY k.emri
  `).then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Kategorite WHERE kategori_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = ({ emri, pershkrimi, kategoria_prind_id }) =>
  db.query(
    'INSERT INTO Kategorite (emri,pershkrimi,kategoria_prind_id) VALUES (?,?,?)',
    [emri, pershkrimi||null, kategoria_prind_id||null]
  ).then(([result]) => result.insertId);

exports.update = (id, { emri, pershkrimi, kategoria_prind_id }) =>
  db.query(
    'UPDATE Kategorite SET emri=?,pershkrimi=?,kategoria_prind_id=? WHERE kategori_id=?',
    [emri, pershkrimi||null, kategoria_prind_id||null, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Kategorite WHERE kategori_id = ?', [id]);
