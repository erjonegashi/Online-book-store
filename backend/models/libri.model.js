'use strict';

const db = require('../config/db');

const SELECT = `
  SELECT l.*,
    CONCAT(a.emri,' ',a.mbiemri) AS autori_emri,
    k.emri AS kategoria_emri
  FROM Librat l
  LEFT JOIN Autoret    a ON l.autori_id    = a.autori_id
  LEFT JOIN Kategorite k ON l.kategoria_id = k.kategori_id`;

exports.getAll = (search, { kategoria_id, exclude_id, limit } = {}) => {
  let sql = SELECT;
  const params = [];
  const conditions = [];

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(`(l.titulli LIKE ? OR CONCAT(a.emri,' ',a.mbiemri) LIKE ? OR k.emri LIKE ?)`);
    params.push(term, term, term);
  }
  if (kategoria_id) { conditions.push('l.kategoria_id = ?'); params.push(kategoria_id); }
  if (exclude_id)   { conditions.push('l.liber_id != ?');    params.push(exclude_id); }

  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY l.liber_id DESC';
  if (limit) { sql += ' LIMIT ?'; params.push(Number(limit)); }

  return db.query(sql, params).then(([rows]) => rows);
};

exports.getById = (id) =>
  db.query(SELECT + ' WHERE l.liber_id = ?', [id])
    .then(([rows]) => rows[0] ?? null);

exports.create = ({ titulli, autori_id, isbn, kategoria_id, botuesi, viti_botimit, cmimi, sasia_stok, pershkrimi, formati, foto_url }) =>
  db.query(
    'INSERT INTO Librat (titulli,autori_id,isbn,kategoria_id,botuesi,viti_botimit,cmimi,sasia_stok,pershkrimi,formati,foto_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [titulli, autori_id||null, isbn||null, kategoria_id||null, botuesi||null, viti_botimit||null, cmimi, sasia_stok||0, pershkrimi||null, formati||'Softcover', foto_url||null]
  ).then(([result]) => result.insertId);

exports.update = (id, { titulli, autori_id, isbn, kategoria_id, botuesi, viti_botimit, cmimi, sasia_stok, pershkrimi, formati, foto_url }) =>
  db.query(
    'UPDATE Librat SET titulli=?,autori_id=?,isbn=?,kategoria_id=?,botuesi=?,viti_botimit=?,cmimi=?,sasia_stok=?,pershkrimi=?,formati=?,foto_url=? WHERE liber_id=?',
    [titulli, autori_id||null, isbn||null, kategoria_id||null, botuesi||null, viti_botimit||null, cmimi, sasia_stok||0, pershkrimi||null, formati||'Softcover', foto_url||null, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Librat WHERE liber_id = ?', [id]);
