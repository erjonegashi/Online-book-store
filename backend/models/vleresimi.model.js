'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query(`
    SELECT v.*, l.titulli, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
    FROM Vleresimet v
    LEFT JOIN Librat    l ON v.liber_id  = l.liber_id
    LEFT JOIN Klientet  k ON v.klient_id = k.klient_id
    ORDER BY v.data DESC`).then(([rows]) => rows);

exports.create = ({ liber_id, klient_id, nota, komenti, statusi }) =>
  db.query(
    'INSERT INTO Vleresimet (liber_id,klient_id,nota,komenti,statusi) VALUES (?,?,?,?,?)',
    [liber_id, klient_id, nota, komenti||null, statusi||'Pending']
  ).then(([result]) => result.insertId);

exports.update = (id, { liber_id, klient_id, nota, komenti, statusi }) =>
  db.query(
    'UPDATE Vleresimet SET liber_id=?,klient_id=?,nota=?,komenti=?,statusi=? WHERE vleresim_id=?',
    [liber_id, klient_id, nota, komenti||null, statusi, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Vleresimet WHERE vleresim_id = ?', [id]);
