'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query(`
    SELECT s.*, l.titulli
    FROM Stoku s
    LEFT JOIN Librat l ON s.liber_id = l.liber_id
    ORDER BY s.stok_id DESC`).then(([rows]) => rows);

exports.getByLiber = (liber_id) =>
  db.query(
    'SELECT * FROM Stoku WHERE liber_id = ? ORDER BY created_at DESC',
    [liber_id]
  ).then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Stoku WHERE stok_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = async ({ liber_id, sasia_ndryshimit, arsyeja }) => {
  const [result] = await db.query(
    'INSERT INTO Stoku (liber_id, sasia_ndryshimit, arsyeja) VALUES (?,?,?)',
    [liber_id, sasia_ndryshimit, arsyeja || null]
  );
  await db.query(
    'UPDATE Librat SET sasia_stok = sasia_stok + ? WHERE liber_id = ?',
    [sasia_ndryshimit, liber_id]
  );
  return result.insertId;
};

exports.update = (id, { liber_id, sasia_ndryshimit, arsyeja }) =>
  db.query(
    'UPDATE Stoku SET liber_id=?, sasia_ndryshimit=?, arsyeja=? WHERE stok_id=?',
    [liber_id, sasia_ndryshimit, arsyeja || null, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Stoku WHERE stok_id = ?', [id]);
