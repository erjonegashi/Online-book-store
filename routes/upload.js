const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Vetëm imazhe lejohen'));
  }
});

router.post('/', upload.single('foto'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nuk u ngarkua asnjë imazh' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
