const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const PORT = 3000;

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

let products = [];

const adminMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === 'admin123') next();
  else res.status(401).json({ message: 'Não autorizado' });
};

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', adminMiddleware, upload.single('image'), (req, res) => {
  const { name, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const product = { id: Date.now(), name, price, image };
  products.push(product);
  res.json(product);
});

app.delete('/api/products/:id', adminMiddleware, (req, res) => {
  const { id } = req.params;
  products = products.filter(p => p.id != id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
