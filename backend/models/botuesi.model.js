'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query('SELECT * FROM Botuesit ORDER BY botues_id DESC').then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Botuesit WHERE botues_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = ({ emri, vendi, website, tel, email }) =>
  db.query(
    'INSERT INTO Botuesit (emri, vendi, website, tel, email) VALUES (?,?,?,?,?)',
    [emri, vendi || null, website || null, tel || null, email || null]
  ).then(([result]) => result.insertId);

exports.update = (id, { emri, vendi, website, tel, email }) =>
  db.query(
    'UPDATE Botuesit SET emri=?, vendi=?, website=?, tel=?, email=? WHERE botues_id=?',
    [emri, vendi || null, website || null, tel || null, email || null, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Botuesit WHERE botues_id = ?', [id]);
