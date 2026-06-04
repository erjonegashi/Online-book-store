'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query(`
    SELECT d.*, l.titulli, p.data_porosise
    FROM Detajet_Porosise d
    LEFT JOIN Librat   l ON d.liber_id  = l.liber_id
    LEFT JOIN Porosite p ON d.porosi_id = p.porosi_id
    ORDER BY d.detaji_id DESC`).then(([rows]) => rows);

exports.getByPorosi = (porosi_id) =>
  db.query(
    'SELECT d.*,l.titulli FROM Detajet_Porosise d LEFT JOIN Librat l ON d.liber_id=l.liber_id WHERE d.porosi_id=?',
    [porosi_id]
  ).then(([rows]) => rows);

exports.getByPorosiWithDetails = (porosi_id) =>
  db.query(
    `SELECT d.*, l.titulli, l.foto_url, l.liber_id as book_id
     FROM Detajet_Porosise d
     LEFT JOIN Librat l ON d.liber_id = l.liber_id
     WHERE d.porosi_id = ?`,
    [porosi_id]
  ).then(([rows]) => rows);

exports.create = async ({ porosi_id, liber_id, sasia, cmimi_njesi }) => {
  const cmimi_total = sasia * cmimi_njesi;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Kontrollo stokun para se të krijosh detajin
    const [[stok]] = await conn.query(
      'SELECT sasia_stok FROM Librat WHERE liber_id = ? FOR UPDATE',
      [liber_id]
    );
    if (!stok) throw Object.assign(new Error('Libri nuk u gjet'), { status: 404 });
    if (stok.sasia_stok < sasia)
      throw Object.assign(new Error('Stoku i pamjaftueshëm për këtë libër'), { status: 400 });

    const [result] = await conn.query(
      'INSERT INTO Detajet_Porosise (porosi_id,liber_id,sasia,cmimi_njesi,cmimi_total) VALUES (?,?,?,?,?)',
      [porosi_id, liber_id, sasia, cmimi_njesi, cmimi_total]
    );
    await conn.query(
      'UPDATE Librat SET sasia_stok = sasia_stok - ? WHERE liber_id = ?',
      [sasia, liber_id]
    );

    await conn.commit();
    return result.insertId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.update = (id, { porosi_id, liber_id, sasia, cmimi_njesi }) => {
  const cmimi_total = sasia * cmimi_njesi;
  return db.query(
    'UPDATE Detajet_Porosise SET porosi_id=?,liber_id=?,sasia=?,cmimi_njesi=?,cmimi_total=? WHERE detaji_id=?',
    [porosi_id, liber_id, sasia, cmimi_njesi, cmimi_total, id]
  );
};

exports.remove = (id) =>
  db.query('DELETE FROM Detajet_Porosise WHERE detaji_id = ?', [id]);
