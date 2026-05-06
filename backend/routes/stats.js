const router = require('express').Router();
const db     = require('../config/db');

router.get('/', async (_req, res) => {
  try {
    const [[books]]    = await db.query('SELECT COUNT(*) as total, COALESCE(SUM(sasia_stok),0) as stok FROM Librat');
    const [[clients]]  = await db.query('SELECT COUNT(*) as total FROM Klientet');
    const [[authors]]  = await db.query('SELECT COUNT(*) as total FROM Autoret');
    const [[cats]]     = await db.query('SELECT COUNT(*) as total FROM Kategorite');
    const [orders]     = await db.query('SELECT statusi, COUNT(*) as cnt, COALESCE(SUM(shuma_totale),0) as revenue FROM Porosite GROUP BY statusi');
    const [lowStock]   = await db.query('SELECT liber_id, titulli, sasia_stok, foto_url FROM Librat WHERE sasia_stok <= 5 ORDER BY sasia_stok ASC LIMIT 6');
    const [topCats]    = await db.query(`
      SELECT k.emri, COUNT(l.liber_id) as cnt
      FROM Kategorite k LEFT JOIN Librat l ON k.kategori_id = l.kategoria_id
      GROUP BY k.kategori_id ORDER BY cnt DESC LIMIT 5`);
    const [recent]     = await db.query(`
      SELECT p.*, CONCAT(k.emri,' ',k.mbiemri) AS klient_emri
      FROM Porosite p LEFT JOIN Klientet k ON p.klient_id = k.klient_id
      ORDER BY p.porosi_id DESC LIMIT 8`);

    let totalOrders = 0, revenue = 0;
    const statusCounts = {};
    orders.forEach(o => {
      totalOrders += Number(o.cnt);
      revenue     += Number(o.revenue);
      statusCounts[o.statusi] = Number(o.cnt);
    });

    res.json({
      books: Number(books.total), totalStock: Number(books.stok),
      clients: Number(clients.total), authors: Number(authors.total),
      categories: Number(cats.total),
      orders: totalOrders, revenue,
      statusCounts, lowStock, topCats, recent,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
