'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query(`
    SELECT d.*, p.data_porosise, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
    FROM Dergesat d
    LEFT JOIN Porosite  p ON d.porosi_id = p.porosi_id
    LEFT JOIN Klientet  k ON p.klient_id = k.klient_id
    ORDER BY d.dergesa_id DESC`).then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Dergesat WHERE dergesa_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = ({ porosi_id, kompania_dergeses, numri_gjurmimit, data_dergimit, data_mberritjes, statusi }) =>
  db.query(
    'INSERT INTO Dergesat (porosi_id,kompania_dergeses,numri_gjurmimit,data_dergimit,data_mberritjes,statusi) VALUES (?,?,?,?,?,?)',
    [porosi_id, kompania_dergeses||null, numri_gjurmimit||null, data_dergimit||null, data_mberritjes||null, statusi||'Preparing']
  ).then(([result]) => result.insertId);

exports.update = (id, { porosi_id, kompania_dergeses, numri_gjurmimit, data_dergimit, data_mberritjes, statusi }) =>
  db.query(
    'UPDATE Dergesat SET porosi_id=?,kompania_dergeses=?,numri_gjurmimit=?,data_dergimit=?,data_mberritjes=?,statusi=? WHERE dergesa_id=?',
    [porosi_id, kompania_dergeses||null, numri_gjurmimit||null, data_dergimit||null, data_mberritjes||null, statusi, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Dergesat WHERE dergesa_id = ?', [id]);
