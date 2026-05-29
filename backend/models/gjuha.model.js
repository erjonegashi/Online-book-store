'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query('SELECT * FROM Gjuhet ORDER BY emri ASC').then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Gjuhet WHERE gjuhe_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = ({ emri, kodi }) =>
  db.query(
    'INSERT INTO Gjuhet (emri, kodi) VALUES (?,?)',
    [emri, kodi || null]
  ).then(([result]) => result.insertId);

exports.update = (id, { emri, kodi }) =>
  db.query(
    'UPDATE Gjuhet SET emri=?, kodi=? WHERE gjuhe_id=?',
    [emri, kodi || null, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Gjuhet WHERE gjuhe_id = ?', [id]);
