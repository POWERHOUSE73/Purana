import mongoose from 'mongoose';

export const isMongoReady = () => mongoose.connection.readyState === 1;

export const publicUser = (u) => ({
  id: String(u._id), name: u.name, email: u.email,
  role: u.role, location: u.location, phone: u.phone
});

export const productDto = (p) => {
  const d = p.toObject ? p.toObject() : p;
  return {
    ...d,
    id: String(d._id),
    audience: d.audience || 'Men',
    seller: String(d.seller?._id || d.seller),
    sellerName: d.seller?.name || d.sellerName || 'Purana Seller'
  };
};

export const orderDto = (o) => {
  const d = o.toObject ? o.toObject() : o;
  return {
    ...d,
    id: String(d._id),
    buyer: String(d.buyer?._id || d.buyer),
    buyerName: d.buyer?.name || d.buyerName || 'Buyer',
    seller: String(d.seller?._id || d.seller),
    sellerName: d.seller?.name || d.sellerName || 'Seller',
    product: d.product?.title ? productDto(d.product) : d.product
  };
};
