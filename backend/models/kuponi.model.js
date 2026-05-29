'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query('SELECT * FROM Kuponat ORDER BY kupon_id DESC').then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Kuponat WHERE kupon_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.getByKodi = (kodi) =>
  db.query(
    'SELECT * FROM Kuponat WHERE kodi=? AND statusi="Active" AND (data_perfundimit IS NULL OR data_perfundimit >= CURDATE())',
    [kodi]
  ).then(([rows]) => rows[0] ?? null);

exports.create = ({ kodi, pershkrimi, perqindja_zbritjes, vlera_minimale, data_fillimit, data_perfundimit, statusi }) =>
  db.query(
    'INSERT INTO Kuponat (kodi,pershkrimi,perqindja_zbritjes,vlera_minimale,data_fillimit,data_perfundimit,statusi) VALUES (?,?,?,?,?,?,?)',
    [kodi, pershkrimi||null, perqindja_zbritjes, vlera_minimale||0, data_fillimit||null, data_perfundimit||null, statusi||'Active']
  ).then(([result]) => result.insertId);

exports.update = (id, { kodi, pershkrimi, perqindja_zbritjes, vlera_minimale, data_fillimit, data_perfundimit, statusi }) =>
  db.query(
    'UPDATE Kuponat SET kodi=?,pershkrimi=?,perqindja_zbritjes=?,vlera_minimale=?,data_fillimit=?,data_perfundimit=?,statusi=? WHERE kupon_id=?',
    [kodi, pershkrimi||null, perqindja_zbritjes, vlera_minimale||0, data_fillimit||null, data_perfundimit||null, statusi, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Kuponat WHERE kupon_id = ?', [id]);
