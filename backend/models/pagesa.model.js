'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query(`
    SELECT pg.*, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
    FROM Pagesat pg
    LEFT JOIN Porosite  p ON pg.porosi_id = p.porosi_id
    LEFT JOIN Klientet  k ON p.klient_id  = k.klient_id
    ORDER BY pg.pagese_id DESC`).then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Pagesat WHERE pagese_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = ({ porosi_id, shuma, metoda, statusi, referenca_transaksionit }) =>
  db.query(
    'INSERT INTO Pagesat (porosi_id,shuma,metoda,statusi,referenca_transaksionit) VALUES (?,?,?,?,?)',
    [porosi_id, shuma, metoda||'Card', statusi||'Pending', referenca_transaksionit||null]
  ).then(([result]) => result.insertId);

exports.update = (id, { porosi_id, shuma, metoda, statusi, referenca_transaksionit }) =>
  db.query(
    'UPDATE Pagesat SET porosi_id=?,shuma=?,metoda=?,statusi=?,referenca_transaksionit=? WHERE pagese_id=?',
    [porosi_id, shuma, metoda, statusi, referenca_transaksionit||null, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Pagesat WHERE pagese_id = ?', [id]);
