'use strict';

const bcrypt = require('bcryptjs');
const db     = require('../config/db');

const COLS = 'klient_id,emri,mbiemri,email,telefoni,adresa,qyteti,kodi_postar,data_regjistrimit';

exports.getAll = () =>
  db.query(`SELECT ${COLS} FROM Klientet ORDER BY klient_id DESC`).then(([rows]) => rows);

exports.getById = (id) =>
  db.query(`SELECT ${COLS} FROM Klientet WHERE klient_id=?`, [id]).then(([rows]) => rows[0] ?? null);

exports.getOrders = async (id) => {
  const [orders]   = await db.query('SELECT * FROM Porosite WHERE klient_id=? ORDER BY porosi_id DESC', [id]);
  const [[stats]]  = await db.query(
    'SELECT COUNT(*) as total, COALESCE(SUM(shuma_totale),0) as shpenzuar FROM Porosite WHERE klient_id=?',
    [id]
  );
  return { orders, total: stats.total, shpenzuar: stats.shpenzuar };
};

exports.create = async ({ emri, mbiemri, email, password, telefoni, adresa, qyteti, kodi_postar }) => {
  const hash = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO Klientet (emri,mbiemri,email,fjalekalimi_hash,telefoni,adresa,qyteti,kodi_postar) VALUES (?,?,?,?,?,?,?,?)',
    [emri, mbiemri, email, hash, telefoni||null, adresa||null, qyteti||null, kodi_postar||null]
  );
  return result.insertId;
};

exports.update = async (id, { emri, mbiemri, email, password, telefoni, adresa, qyteti, kodi_postar }) => {
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    return db.query(
      'UPDATE Klientet SET emri=?,mbiemri=?,email=?,fjalekalimi_hash=?,telefoni=?,adresa=?,qyteti=?,kodi_postar=? WHERE klient_id=?',
      [emri, mbiemri, email, hash, telefoni||null, adresa||null, qyteti||null, kodi_postar||null, id]
    );
  }
  return db.query(
    'UPDATE Klientet SET emri=?,mbiemri=?,email=?,telefoni=?,adresa=?,qyteti=?,kodi_postar=? WHERE klient_id=?',
    [emri, mbiemri, email, telefoni||null, adresa||null, qyteti||null, kodi_postar||null, id]
  );
};

exports.remove = (id) =>
  db.query('DELETE FROM Klientet WHERE klient_id = ?', [id]);

// ── User self-service ─────────────────────────────────────────────────────────

exports.getHashById = (id) =>
  db.query('SELECT fjalekalimi_hash FROM Klientet WHERE klient_id=?', [id])
    .then(([rows]) => rows[0] ?? null);

exports.updateProfile = (id, { emri, mbiemri, email, telefoni, adresa, qyteti, kodi_postar }) =>
  db.query(
    'UPDATE Klientet SET emri=?,mbiemri=?,email=?,telefoni=?,adresa=?,qyteti=?,kodi_postar=? WHERE klient_id=?',
    [emri, mbiemri, email, telefoni||null, adresa||null, qyteti||null, kodi_postar||null, id]
  );

exports.updateProfileWithHash = (id, hash, { emri, mbiemri, email, telefoni, adresa, qyteti, kodi_postar }) =>
  db.query(
    'UPDATE Klientet SET emri=?,mbiemri=?,email=?,fjalekalimi_hash=?,telefoni=?,adresa=?,qyteti=?,kodi_postar=? WHERE klient_id=?',
    [emri, mbiemri, email, hash, telefoni||null, adresa||null, qyteti||null, kodi_postar||null, id]
  );

exports.getMyOrders = async (id) => {
  const [orders] = await db.query('SELECT * FROM Porosite WHERE klient_id=? ORDER BY porosi_id DESC', [id]);
  if (!orders.length) return [];

  const orderIds = orders.map(o => o.porosi_id);
  const [items] = await db.query(
    `SELECT d.*, l.titulli, l.foto_url, l.liber_id as book_id
     FROM Detajet_Porosise d
     LEFT JOIN Librat l ON d.liber_id = l.liber_id
     WHERE d.porosi_id IN (?)`,
    [orderIds]
  );

  const itemsByOrder = {};
  for (const item of items) {
    if (!itemsByOrder[item.porosi_id]) itemsByOrder[item.porosi_id] = [];
    itemsByOrder[item.porosi_id].push(item);
  }

  return orders.map(o => ({ ...o, items: itemsByOrder[o.porosi_id] || [] }));
};
