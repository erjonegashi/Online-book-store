'use strict';

const db = require('../config/db');

const SELECT = `
  SELECT p.*,
    CONCAT(k.emri,' ',k.mbiemri) AS klient_emri,
    k.email AS klient_email
  FROM Porosite p
  LEFT JOIN Klientet k ON p.klient_id = k.klient_id`;

exports.getAll = () =>
  db.query(SELECT + ' ORDER BY p.porosi_id DESC').then(([rows]) => rows);

exports.getById = async (id) => {
  const [rows] = await db.query(SELECT + ' WHERE p.porosi_id = ?', [id]);
  if (!rows.length) return null;
  const [details] = await db.query(
    'SELECT d.*, l.titulli FROM Detajet_Porosise d LEFT JOIN Librat l ON d.liber_id = l.liber_id WHERE d.porosi_id = ?',
    [id]
  );
  return { ...rows[0], detajet: details };
};

exports.create = ({ klient_id, shuma_totale, kostoja_dergeses, statusi, metoda_pageses, adresa_dergeses }) =>
  db.query(
    'INSERT INTO Porosite (klient_id,shuma_totale,kostoja_dergeses,statusi,metoda_pageses,adresa_dergeses) VALUES (?,?,?,?,?,?)',
    [klient_id, shuma_totale, kostoja_dergeses||0, statusi||'Pending', metoda_pageses||'Card', adresa_dergeses||null]
  ).then(([result]) => result.insertId);

exports.update = (id, { klient_id, shuma_totale, kostoja_dergeses, statusi, metoda_pageses, adresa_dergeses }) =>
  db.query(
    'UPDATE Porosite SET klient_id=?,shuma_totale=?,kostoja_dergeses=?,statusi=?,metoda_pageses=?,adresa_dergeses=? WHERE porosi_id=?',
    [klient_id, shuma_totale, kostoja_dergeses||0, statusi, metoda_pageses, adresa_dergeses||null, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Porosite WHERE porosi_id = ?', [id]);
