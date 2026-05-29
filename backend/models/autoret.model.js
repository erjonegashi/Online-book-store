'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query('SELECT * FROM Autoret ORDER BY mbiemri, emri').then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Autoret WHERE autori_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = ({ emri, mbiemri, biografia, shtati, website, email, foto_url }) =>
  db.query(
    'INSERT INTO Autoret (emri,mbiemri,biografia,shtati,website,email,foto_url) VALUES (?,?,?,?,?,?,?)',
    [emri, mbiemri, biografia||null, shtati||null, website||null, email||null, foto_url||null]
  ).then(([result]) => result.insertId);

exports.update = (id, { emri, mbiemri, biografia, shtati, website, email, foto_url }) =>
  db.query(
    'UPDATE Autoret SET emri=?,mbiemri=?,biografia=?,shtati=?,website=?,email=?,foto_url=? WHERE autori_id=?',
    [emri, mbiemri, biografia||null, shtati||null, website||null, email||null, foto_url||null, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Autoret WHERE autori_id = ?', [id]);
