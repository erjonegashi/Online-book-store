'use strict';

const db = require('../config/db');

exports.getAll = () =>
  db.query('SELECT * FROM Promocionet ORDER BY promovim_id DESC').then(([rows]) => rows);

exports.getById = (id) =>
  db.query('SELECT * FROM Promocionet WHERE promovim_id = ?', [id]).then(([rows]) => rows[0] ?? null);

exports.create = ({ titulli, pershkrim, perqindja_zbritjes, kodi, data_fillimit, data_mbarimit, aktive }) =>
  db.query(
    `INSERT INTO Promocionet
       (titulli, pershkrim, perqindja_zbritjes, kodi, data_fillimit, data_mbarimit, aktive)
     VALUES (?,?,?,?,?,?,?)`,
    [titulli, pershkrim || null, perqindja_zbritjes, kodi || null,
     data_fillimit || null, data_mbarimit || null, aktive !== undefined ? aktive : 1]
  ).then(([result]) => result.insertId);

exports.update = (id, { titulli, pershkrim, perqindja_zbritjes, kodi, data_fillimit, data_mbarimit, aktive }) =>
  db.query(
    `UPDATE Promocionet
        SET titulli=?, pershkrim=?, perqindja_zbritjes=?, kodi=?,
            data_fillimit=?, data_mbarimit=?, aktive=?
      WHERE promovim_id=?`,
    [titulli, pershkrim || null, perqindja_zbritjes, kodi || null,
     data_fillimit || null, data_mbarimit || null, aktive ? 1 : 0, id]
  );

exports.remove = (id) =>
  db.query('DELETE FROM Promocionet WHERE promovim_id = ?', [id]);
