import { Order, Product } from '../models/index.js';
import { memory } from '../store/memoryStore.js';
import { isMongoReady, productDto } from '../utils/mode.js';

const normalize = (v) => String(v || '').trim().toLowerCase();

function features(p) {
  return [
    `brand:${normalize(p.brand)}`, `audience:${normalize(p.audience)}`, `type:${normalize(p.type)}`,
    `size:${normalize(p.size)}`, `color:${normalize(p.color)}`,
    `condition:${normalize(p.condition)}`,
    ...normalize(p.title).split(/\s+/).filter(Boolean).map((w) => `title:${w}`)
  ];
}

function vectorize(p, vocab) {
  const v = Array(vocab.length).fill(0);
  for (const f of features(p)) { const i = vocab.indexOf(f); if (i >= 0) v[i]++; }
  return v;
}

function cosine(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; ma += a[i] ** 2; mb += b[i] ** 2; }
  return ma && mb ? dot / (Math.sqrt(ma) * Math.sqrt(mb)) : 0;
}

function contentScores(buyerId, products, orders) {
  const bought = new Set(orders.filter((o) => String(o.buyer?._id || o.buyer) === buyerId).map((o) => String(o.product?._id || o.product)));
  const boughtProducts = products.filter((p) => bought.has(String(p._id)));
  if (!boughtProducts.length) return new Map();

  const vocab = [...new Set(products.flatMap(features))];
  const boughtVectors = boughtProducts.map((p) => vectorize(p, vocab));
  const scores = new Map();
  for (const p of products) {
    const id = String(p._id);
    if (bought.has(id) || p.status !== 'available') continue;
    const v = vectorize(p, vocab);
    scores.set(id, boughtVectors.reduce((sum, bv) => sum + cosine(v, bv), 0) / boughtVectors.length);
  }
  return scores;
}

function collabScores(buyerId, products, orders) {
  const buyerIds = [...new Set(orders.map((o) => String(o.buyer?._id || o.buyer)))];
  const productIds = [...new Set(products.map((p) => String(p._id)))];
  const targetIdx = buyerIds.indexOf(buyerId);
  if (targetIdx === -1 || buyerIds.length < 2 || orders.length < 3) return new Map();

  const prodIdx = new Map(productIds.map((id, i) => [id, i]));
  const bought = new Set(orders.filter((o) => String(o.buyer?._id || o.buyer) === buyerId).map((o) => String(o.product?._id || o.product)));
  const F = 4, LR = 0.015, REG = 0.04, EPOCHS = 80;
  const uf = buyerIds.map((_, i) => Array.from({ length: F }, (_, j) => 0.08 + ((i + j) % 5) * 0.01));
  const pf = productIds.map((_, i) => Array.from({ length: F }, (_, j) => 0.08 + ((i + j) % 7) * 0.01));

  const interactions = orders.map((o) => ({
    ui: buyerIds.indexOf(String(o.buyer?._id || o.buyer)),
    pi: prodIdx.get(String(o.product?._id || o.product)),
    r: Math.min(5, 1 + Number(o.quantity || 1))
  })).filter((x) => x.ui >= 0 && x.pi >= 0);

  for (let e = 0; e < EPOCHS; e++) {
    for (const { ui, pi, r } of interactions) {
      const u = uf[ui], p = pf[pi];
      const err = r - u.reduce((s, v, i) => s + v * p[i], 0);
      for (let f = 0; f < F; f++) { const uv = u[f], pv = p[f]; u[f] += LR * (err * pv - REG * uv); p[f] += LR * (err * uv - REG * pv); }
    }
  }

  const tv = uf[targetIdx];
  const scores = new Map();
  for (const p of products) {
    const id = String(p._id);
    if (bought.has(id) || p.status !== 'available') continue;
    const pv = pf[prodIdx.get(id)];
    scores.set(id, tv.reduce((s, v, i) => s + v * pv[i], 0));
  }
  return scores;
}

function normalize01(scores) {
  const vals = [...scores.values()];
  if (!vals.length) return scores;
  const min = Math.min(...vals), max = Math.max(...vals);
  if (max === min) return new Map([...scores.keys()].map((k) => [k, 0.5]));
  return new Map([...scores.entries()].map(([k, v]) => [k, (v - min) / (max - min)]));
}

export async function recommendForBuyer(buyerId, limit = 6) {
  const products = isMongoReady() ? await Product.find({}).populate('seller', 'name').sort({ createdAt: -1 }) : memory.products;
  const orders = isMongoReady() ? await Order.find({}).populate('product').lean() : memory.orders;
  const bought = new Set(orders.filter((o) => String(o.buyer?._id || o.buyer) === buyerId).map((o) => String(o.product?._id || o.product)));

  const cs = normalize01(contentScores(buyerId, products, orders));
  const cf = normalize01(collabScores(buyerId, products, orders));

  return products
    .filter((p) => p.status === 'available' && !bought.has(String(p._id)))
    .map((p) => {
      const id = String(p._id);
      const c = cs.get(id) || 0, f = cf.get(id) || 0;
      const fallback = Number(new Date(p.createdAt || Date.now())) / 10000000000000;
      return { ...productDto(p), recommendationScore: Number((c * 0.6 + f * 0.35 + fallback * 0.05).toFixed(4)), recommendationReason: c >= f ? 'Similar to your preferred clothes' : 'Personalized from buyer order patterns' };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}
