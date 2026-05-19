import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Product } from '../models/index.js';
import { recommendForBuyer } from '../services/recommendations.js';
import { memory } from '../store/memoryStore.js';
import { isMongoReady, productDto } from '../utils/mode.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ storage: multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
}) });

export const productRouter = express.Router();

productRouter.get('/recommendations/mine', requireAuth, requireRole('buyer'), async (req, res) => {
  const limit = Math.min(12, Math.max(1, Number(req.query.limit || 6)));
  res.json(await recommendForBuyer(req.user.id, limit));
});

productRouter.get('/', async (req, res) => {
  const { audience, type, size, color, brand, minPrice, maxPrice, seller } = req.query;
  if (isMongoReady()) {
    const query = { status: 'available' };
    if (audience) query.audience = audience;
    if (type) query.type = type;
    if (size) query.size = size;
    if (color) query.color = color;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (seller) query.seller = seller;
    if (minPrice || maxPrice) query.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
    return res.json((await Product.find(query).populate('seller', 'name').sort({ createdAt: -1 })).map(productDto));
  }
  return res.json(
    memory.products
      .filter((p) => p.status === 'available'
        && (!audience || p.audience === audience)
        && (!type || p.type === type) && (!size || p.size === size) && (!color || p.color === color)
        && (!brand || p.brand.toLowerCase().includes(brand.toLowerCase()))
        && (!seller || p.seller === seller)
        && (!minPrice || p.price >= Number(minPrice)) && (!maxPrice || p.price <= Number(maxPrice)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(productDto)
  );
});

productRouter.get('/mine', requireAuth, requireRole('seller'), async (req, res) => {
  if (isMongoReady()) return res.json((await Product.find({ seller: req.user.id }).sort({ createdAt: -1 })).map(productDto));
  return res.json(memory.products.filter((p) => p.seller === req.user.id).map(productDto));
});

productRouter.post('/', requireAuth, requireRole('seller'), upload.single('image'), async (req, res) => {
  const payload = {
    seller: req.user.id,
    title: req.body.title, brand: req.body.brand, audience: req.body.audience || 'Men', type: req.body.type,
    size: req.body.size, color: req.body.color, price: Number(req.body.price),
    condition: req.body.condition, description: req.body.description,
    imageUrl: req.file ? `/uploads/${path.basename(req.file.path)}` : req.body.imageUrl || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80'
  };
  if (isMongoReady()) return res.status(201).json(productDto(await Product.create(payload)));
  const product = { ...payload, _id: `prod-${Date.now()}`, sellerName: req.user.name, status: 'available', createdAt: new Date().toISOString() };
  memory.products.push(product);
  return res.status(201).json(productDto(product));
});

productRouter.delete('/:id', requireAuth, requireRole('seller'), async (req, res) => {
  if (isMongoReady()) {
    const p = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user.id });
    return p ? res.json({ id: String(p._id) }) : res.status(404).json({ message: 'Listing not found' });
  }
  const idx = memory.products.findIndex((p) => p._id === req.params.id && p.seller === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Listing not found' });
  const [removed] = memory.products.splice(idx, 1);
  return res.json({ id: String(removed._id) });
});
