const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'products.json');

// Configuração de upload
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

// Funções auxiliares
function loadProducts() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Erro ao ler products.json:', err);
      return [];
    }
  }
  return [];
}
function saveProducts(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Erro ao salvar products.json:', err);
  }
}

// Banco em memória
let products = loadProducts();

// Middleware de autenticação simples
const adminMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === 'admin123') next();
  else res.status(401).json({ message: 'Não autorizado' });
};

// GET - lista produtos
app.get('/api/products', (req, res) => {
  res.json(products);
});

// POST - cadastra produto
app.post('/api/products', adminMiddleware, upload.single('image'), (req, res) => {
  const { name, price, size, variety, user } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || !price || !size || !variety || !user || !image) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  const product = {
    id: Date.now(),
    name,
    price,
    size,
    variety,
    user,
    image
  };

  products.push(product);
  saveProducts(products);
  res.json(product);
});

// PUT - edita produto (com suporte a imagem)
app.put('/api/products/:id', adminMiddleware, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { price, size, variety } = req.body;

  const product = products.find(p => p.id == id);
  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado' });
  }

  if (price) product.price = price;
  if (size) product.size = size;
  if (variety) product.variety = variety;

  if (req.file) {
    // remover a imagem antiga se existir
    if (product.image) {
      const oldPath = path.join(__dirname, product.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    product.image = `/uploads/${req.file.filename}`;
  }

  saveProducts(products);
  res.json(product);
});

// DELETE - exclui produto
app.delete('/api/products/:id', adminMiddleware, (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id == id);

  if (product && product.image) {
    const imagePath = path.join(__dirname, product.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  products = products.filter(p => p.id != id);
  saveProducts(products);
  res.json({ success: true });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
