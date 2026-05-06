const router = require('express').Router();
const db     = require('../config/db');

const SELECT = `
  SELECT l.*,
    CONCAT(a.emri,' ',a.mbiemri) AS autori_emri,
    k.emri AS kategoria_emri
  FROM Librat l
  LEFT JOIN Autoret    a ON l.autori_id    = a.autori_id
  LEFT JOIN Kategorite k ON l.kategoria_id = k.kategori_id`;

router.get('/', async (req, res) => {
  const { search } = req.query;
  let sql = SELECT;
  const params = [];
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    sql += ` WHERE l.titulli LIKE ? OR CONCAT(a.emri,' ',a.mbiemri) LIKE ? OR k.emri LIKE ?`;
    params.push(term, term, term);
  }
  sql += ' ORDER BY l.liber_id DESC';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(SELECT + ' WHERE l.liber_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Libri nuk u gjet' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { titulli, autori_id, isbn, kategoria_id, botuesi, viti_botimit, cmimi, sasia_stok, pershkrimi, formati, foto_url } = req.body;
    const [result] = await db.query(
      'INSERT INTO Librat (titulli,autori_id,isbn,kategoria_id,botuesi,viti_botimit,cmimi,sasia_stok,pershkrimi,formati,foto_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [titulli, autori_id||null, isbn||null, kategoria_id||null, botuesi||null, viti_botimit||null, cmimi, sasia_stok||0, pershkrimi||null, formati||'Softcover', foto_url||null]
    );
    res.status(201).json({ liber_id: result.insertId, message: 'Libri u shtua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { titulli, autori_id, isbn, kategoria_id, botuesi, viti_botimit, cmimi, sasia_stok, pershkrimi, formati, foto_url } = req.body;
    await db.query(
      'UPDATE Librat SET titulli=?,autori_id=?,isbn=?,kategoria_id=?,botuesi=?,viti_botimit=?,cmimi=?,sasia_stok=?,pershkrimi=?,formati=?,foto_url=? WHERE liber_id=?',
      [titulli, autori_id||null, isbn||null, kategoria_id||null, botuesi||null, viti_botimit||null, cmimi, sasia_stok||0, pershkrimi||null, formati||'Softcover', foto_url||null, req.params.id]
    );
    res.json({ message: 'Libri u azhurnua' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Librat WHERE liber_id = ?', [req.params.id]);
    res.json({ message: 'Libri u fshi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
