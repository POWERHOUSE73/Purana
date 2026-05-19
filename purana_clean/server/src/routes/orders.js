import express from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Order, Product } from '../models/index.js';
import { memory } from '../store/memoryStore.js';
import { isMongoReady, orderDto } from '../utils/mode.js';

export const orderRouter = express.Router();

const ALLOWED_STATUSES = ['placed', 'in-progress', 'out-for-delivery', 'delivered'];
const ALLOWED_PAYMENTS = ['eSewa', 'Khalti', 'Cash on Delivery', 'Bank Transfer'];
const ESEWA_DEFAULTS = {
  ids: ['9806800001', '9806800002', '9806800003', '9806800004', '9806800005'],
  password: 'Nepal@123',
  mpin: '1122',
  token: '123456'
};

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

function getEsewaDemoConfig() {
  return {
    ids: (process.env.ESEWA_TEST_IDS || ESEWA_DEFAULTS.ids.join(',')).split(',').map((s) => s.trim()),
    password: process.env.ESEWA_TEST_PASSWORD || ESEWA_DEFAULTS.password,
    mpin: process.env.ESEWA_TEST_MPIN || ESEWA_DEFAULTS.mpin,
    token: process.env.ESEWA_TEST_TOKEN || ESEWA_DEFAULTS.token
  };
}

function validatePayment(paymentMethod, paymentDetails = {}) {
  if (!ALLOWED_PAYMENTS.includes(paymentMethod)) return 'Invalid payment method';

  if (paymentMethod === 'eSewa') {
    const esewa = getEsewaDemoConfig();
    if (!paymentDetails.walletId || !paymentDetails.password || !paymentDetails.mpin || !paymentDetails.token) {
      return 'eSewa ID, password, MPIN and token are required';
    }
    if (!esewa.ids.includes(String(paymentDetails.walletId)) || paymentDetails.password !== esewa.password || paymentDetails.mpin !== esewa.mpin || paymentDetails.token !== esewa.token) {
      return 'Invalid eSewa test credentials';
    }
  }

  if (paymentMethod === 'Khalti' && (!paymentDetails.walletId || !paymentDetails.password)) {
    return 'Khalti ID and password are required';
  }

  if (paymentMethod === 'Bank Transfer' && (!paymentDetails.bankName || !paymentDetails.accountName || !paymentDetails.accountNumber)) {
    return 'Bank name, account name and account number are required';
  }

  return '';
}

function paymentForStorage(paymentDetails = {}) {
  return {
    walletId: paymentDetails.walletId || '',
    bankName: paymentDetails.bankName || '',
    accountName: paymentDetails.accountName || '',
    accountNumber: paymentDetails.accountNumber || '',
    branch: paymentDetails.branch || ''
  };
}

function normalizeCheckoutItems(rawItems) {
  const items = Array.isArray(rawItems) ? rawItems : [];
  const byProduct = new Map();

  for (const item of items) {
    const productId = String(item.productId || '').trim();
    if (!productId) continue;
    const quantity = Math.max(1, Number(item.quantity || 1));
    byProduct.set(productId, (byProduct.get(productId) || 0) + quantity);
  }

  return [...byProduct.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

async function checkout(req, res, { single = false } = {}) {
  if (req.user.role !== 'buyer') return res.status(403).json({ message: 'Only buyers can place orders' });

  const { deliveryAddress, paymentMethod, paymentDetails = {} } = req.body;
  const items = normalizeCheckoutItems(req.body.items);

  if (!deliveryAddress?.trim()) return res.status(400).json({ message: 'Delivery address is required' });
  if (!items.length) return res.status(400).json({ message: 'Select at least one product before checkout' });
  if (isMongoReady() && items.some((item) => !mongoose.Types.ObjectId.isValid(item.productId))) {
    return res.status(400).json({ message: 'Invalid product in cart. Refresh the shop and try again.' });
  }

  const paymentError = validatePayment(paymentMethod, paymentDetails);
  if (paymentError) return res.status(400).json({ message: paymentError });

  const savedPayment = paymentForStorage(paymentDetails);

  if (isMongoReady()) {
    const products = await Product.find({
      _id: { $in: items.map((item) => item.productId) },
      status: 'available'
    });
    const productsById = new Map(products.map((product) => [String(product._id), product]));
    const unavailable = items.filter((item) => !productsById.has(item.productId));

    if (unavailable.length) {
      return res.status(409).json({ message: 'Some cart items are no longer available. Refresh the shop and try again.' });
    }

    const createdIds = [];
    const reservedIds = [];

    try {
      for (const item of items) {
        const product = productsById.get(item.productId);
        const reserved = await Product.findOneAndUpdate(
          { _id: product._id, status: 'available' },
          { status: 'reserved' },
          { new: true }
        );

        if (!reserved) throw new Error('Some cart items are no longer available. Refresh the shop and try again.');
        reservedIds.push(reserved._id);

        const order = await Order.create({
          buyer: req.user.id,
          seller: product.seller,
          product: product._id,
          quantity: item.quantity,
          total: product.price * item.quantity,
          paymentMethod,
          paymentDetails: savedPayment,
          deliveryAddress
        });
        createdIds.push(order._id);
      }
    } catch (error) {
      if (createdIds.length) await Order.deleteMany({ _id: { $in: createdIds } });
      if (reservedIds.length) await Product.updateMany({ _id: { $in: reservedIds } }, { status: 'available' });
      return res.status(409).json({ message: error.message || 'Checkout could not be completed' });
    }

    const orders = await Order.find({ _id: { $in: createdIds } })
      .populate(['product', 'buyer', 'seller'])
      .sort({ createdAt: -1 });
    const dto = orders.map(orderDto);
    return res.status(201).json(single ? dto[0] : { orders: dto });
  }

  const productsById = new Map(memory.products.filter((p) => p.status === 'available').map((p) => [String(p._id), p]));
  const unavailable = items.filter((item) => !productsById.has(item.productId));

  if (unavailable.length) {
    return res.status(409).json({ message: 'Some cart items are no longer available. Refresh the shop and try again.' });
  }

  const orders = items.map((item, index) => {
    const product = productsById.get(item.productId);
    product.status = 'reserved';
    const order = {
      _id: `order-${Date.now()}-${index}`,
      buyer: req.user.id,
      buyerName: req.user.name,
      seller: product.seller,
      sellerName: product.sellerName,
      product,
      quantity: item.quantity,
      total: product.price * item.quantity,
      paymentMethod,
      paymentDetails: savedPayment,
      deliveryAddress,
      status: 'placed',
      createdAt: new Date().toISOString()
    };
    memory.orders.push(order);
    return orderDto(order);
  });

  return res.status(201).json(single ? orders[0] : { orders });
}

orderRouter.get('/mine', requireAuth, async (req, res) => {
  if (isMongoReady()) {
    const filter = req.user.role === 'seller' ? { seller: req.user.id } : { buyer: req.user.id };
    const orders = await Order.find(filter)
      .populate('product')
      .populate('buyer', 'name email location phone')
      .populate('seller', 'name email location phone')
      .sort({ createdAt: -1 });
    return res.json(orders.map(orderDto));
  }

  return res.json(
    memory.orders
      .filter((o) => (req.user.role === 'seller' ? o.seller === req.user.id : o.buyer === req.user.id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(orderDto)
  );
});

orderRouter.post('/checkout', requireAuth, asyncRoute((req, res) => checkout(req, res)));

orderRouter.post('/', requireAuth, asyncRoute(async (req, res) => {
  req.body.items = [{ productId: req.body.productId, quantity: req.body.quantity || 1 }];
  return checkout(req, res, { single: true });
}));

orderRouter.patch('/:id/status', requireAuth, asyncRoute(async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ message: 'Only sellers can update order status' });
  const { status } = req.body;
  if (!ALLOWED_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid order status' });

  if (isMongoReady()) {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, seller: req.user.id },
      { status },
      { new: true }
    ).populate(['product', 'buyer', 'seller']);
    return order ? res.json(orderDto(order)) : res.status(404).json({ message: 'Order not found' });
  }

  const order = memory.orders.find((o) => o._id === req.params.id && o.seller === req.user.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = status;
  return res.json(orderDto(order));
}));
