import mongoose from 'mongoose';

export const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller'], required: true },
  location: { type: String, default: 'Kathmandu, Nepal' },
  phone: { type: String, default: '' }
}, { timestamps: true }));

export const Product = mongoose.model('Product', new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  audience: { type: String, enum: ['Men', 'Women', 'Kids'], default: 'Men' },
  type: { type: String, required: true, trim: true },
  size: { type: String, required: true, trim: true },
  color: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  condition: { type: String, default: 'Gently used' },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  status: { type: String, enum: ['available', 'reserved', 'sold'], default: 'available' }
}, { timestamps: true }));

export const Order = mongoose.model('Order', new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['eSewa', 'Khalti', 'Cash on Delivery', 'Bank Transfer'], default: 'Cash on Delivery' },
  paymentDetails: {
    walletId: String, bankName: String, accountName: String, accountNumber: String, branch: String
  },
  deliveryAddress: { type: String, required: true },
  status: { type: String, enum: ['placed', 'in-progress', 'out-for-delivery', 'delivered'], default: 'placed' }
}, { timestamps: true }));
