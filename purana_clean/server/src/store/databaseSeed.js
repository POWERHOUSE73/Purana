import bcrypt from 'bcryptjs';
import { Order, Product, User } from '../models/index.js';
import { demoOrders, demoProducts, demoUsers } from './demoData.js';

const shouldRefreshDemoData = () => process.env.REFRESH_DEMO_DATA !== 'false';

async function findOrCreateDemoUser(user) {
  const existing = await User.findOne({ email: user.email });
  if (existing) {
    if (shouldRefreshDemoData()) {
      existing.name = user.name;
      existing.passwordHash = await bcrypt.hash(user.password, 10);
      existing.role = user.role;
      existing.location = user.location;
      existing.phone = user.phone;
      await existing.save();
    }
    return existing;
  }

  return User.create({
    name: user.name,
    email: user.email,
    passwordHash: await bcrypt.hash(user.password, 10),
    role: user.role,
    location: user.location,
    phone: user.phone
  });
}

async function findOrCreateDemoProduct(product, seller) {
  const existing = await Product.findOne({ title: product.title, seller: seller._id });
  if (existing) {
    if (shouldRefreshDemoData()) {
      existing.brand = product.brand;
      existing.audience = product.audience;
      existing.type = product.type;
      existing.size = product.size;
      existing.color = product.color;
      existing.price = product.price;
      existing.condition = product.condition;
      existing.description = product.description;
      existing.imageUrl = product.imageUrl;
      existing.status = 'available';
      await existing.save();
    }
    return existing;
  }

  return Product.create({
    seller: seller._id,
    title: product.title,
    brand: product.brand,
    audience: product.audience,
    type: product.type,
    size: product.size,
    color: product.color,
    price: product.price,
    condition: product.condition,
    description: product.description,
    imageUrl: product.imageUrl,
    status: 'available'
  });
}

export async function seedDatabase() {
  const usersByKey = new Map();
  for (const user of demoUsers) {
    usersByKey.set(user.key, await findOrCreateDemoUser(user));
  }

  const productsByKey = new Map();
  for (const product of demoProducts) {
    const seller = usersByKey.get(product.sellerKey);
    productsByKey.set(product.key, await findOrCreateDemoProduct(product, seller));
  }

  for (const order of demoOrders) {
    const buyer = usersByKey.get(order.buyerKey);
    const seller = usersByKey.get(order.sellerKey);
    const product = productsByKey.get(order.productKey);
    const exists = await Order.findOne({ buyer: buyer._id, seller: seller._id, product: product._id });
    if (exists) continue;

    await Order.create({
      buyer: buyer._id,
      seller: seller._id,
      product: product._id,
      quantity: order.quantity,
      total: product.price * order.quantity,
      paymentMethod: order.paymentMethod,
      paymentDetails: order.paymentDetails,
      deliveryAddress: order.deliveryAddress,
      status: order.status
    });
  }

  console.log('MongoDB demo data ready');
}
