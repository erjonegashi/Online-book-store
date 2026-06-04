'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query(`
    SELECT ld.*, l.titulli, l.cmimi, l.foto_url, l.sasia_stok,
      CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
    FROM Lista_Deshirave ld
    LEFT JOIN Librat    l ON ld.liber_id  = l.liber_id
    LEFT JOIN Klientet  k ON ld.klient_id = k.klient_id
    ORDER BY ld.deshire_id DESC`).then(([rows]) => rows);

exports.getByKlient = (klient_id) =>
  db.query(`
    SELECT ld.*, l.titulli, l.cmimi, l.foto_url, l.sasia_stok
    FROM Lista_Deshirave ld
    LEFT JOIN Librat l ON ld.liber_id = l.liber_id
    WHERE ld.klient_id = ?
    ORDER BY ld.deshire_id DESC`, [klient_id]).then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Lista_Deshirave WHERE deshire_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = ({ klient_id, liber_id }) =>
  db.query(
    'INSERT INTO Lista_Deshirave (klient_id,liber_id) VALUES (?,?)',
    [klient_id, liber_id]
  ).then(([result]) => result.insertId);

exports.update = (id, { klient_id, liber_id }) =>
  db.query(
    'UPDATE Lista_Deshirave SET klient_id=?, liber_id=? WHERE deshire_id=?',
    [klient_id, liber_id, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Lista_Deshirave WHERE deshire_id = ?', [id]);
