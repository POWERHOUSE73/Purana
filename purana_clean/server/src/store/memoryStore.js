import bcrypt from 'bcryptjs';
import { demoOrders, demoProducts, demoUsers } from './demoData.js';

export const memory = { users: [], products: [], orders: [] };

export function seedMemoryStore() {
  if (memory.users.length) return;

  const userByKey = new Map();

  for (const user of demoUsers) {
    const storedUser = {
      _id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: bcrypt.hashSync(user.password, 10),
      role: user.role,
      location: user.location,
      phone: user.phone
    };
    userByKey.set(user.key, storedUser);
    memory.users.push(storedUser);
  }

  const productByKey = new Map();

  demoProducts.forEach((product, index) => {
    const seller = userByKey.get(product.sellerKey);
    const storedProduct = {
      ...product,
      _id: `prod-${index + 1}`,
      seller: seller._id,
      sellerName: seller.name,
      status: 'available',
      createdAt: new Date().toISOString()
    };
    delete storedProduct.key;
    delete storedProduct.sellerKey;
    productByKey.set(product.key, storedProduct);
    memory.products.push(storedProduct);
  });

  for (const order of demoOrders) {
    const buyer = userByKey.get(order.buyerKey);
    const seller = userByKey.get(order.sellerKey);
    const product = productByKey.get(order.productKey);
    memory.orders.push({
      _id: order.id,
      buyer: buyer._id,
      buyerName: buyer.name,
      seller: seller._id,
      sellerName: seller.name,
      product,
      quantity: order.quantity,
      total: product.price * order.quantity,
      paymentMethod: order.paymentMethod,
      paymentDetails: order.paymentDetails,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    });
  }
}
