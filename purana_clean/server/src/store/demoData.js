export const demoUsers = [
  {
    key: 'buyer',
    id: 'buyer-demo',
    name: 'Aarya Buyer',
    email: 'buyer@purana.com',
    password: 'password123',
    role: 'buyer',
    location: 'Lalitpur, Nepal',
    phone: '9800000001'
  },
  {
    key: 'seller',
    id: 'seller-demo',
    name: 'Maya Seller',
    email: 'seller@purana.com',
    password: 'password123',
    role: 'seller',
    location: 'Pokhara, Nepal',
    phone: '9800000002'
  }
];

export const demoProducts = [
  { key: 'men-denim-jacket', sellerKey: 'seller', title: 'Men Vintage Denim Jacket', brand: 'Levis', audience: 'Men', type: 'Jacket', size: 'M', color: 'Blue', price: 1850, condition: 'Gently used', description: 'Structured denim jacket, ideal for Kathmandu evenings.', imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80' },
  { key: 'men-linen-shirt', sellerKey: 'seller', title: 'Men Linen Summer Shirt', brand: 'Uniqlo', audience: 'Men', type: 'Shirt', size: 'L', color: 'Green', price: 950, condition: 'Like new', description: 'Breathable linen shirt for warm Terai days.', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80' },
  { key: 'men-hoodie', sellerKey: 'seller', title: 'Men Fleece Hoodie', brand: 'North Face', audience: 'Men', type: 'Hoodie', size: 'XL', color: 'Black', price: 1450, condition: 'Good', description: 'Warm hoodie with a relaxed fit and clean cuffs.', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80' },
  { key: 'men-check-shirt', sellerKey: 'seller', title: 'Men Check Flannel Shirt', brand: 'Muji', audience: 'Men', type: 'Shirt', size: 'M', color: 'Red', price: 1050, condition: 'Gently used', description: 'Soft brushed flannel shirt with clean buttons and a regular fit.', imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80' },
  { key: 'men-cargo-pants', sellerKey: 'seller', title: 'Men Utility Cargo Pants', brand: 'Dockers', audience: 'Men', type: 'Pants', size: 'L', color: 'Green', price: 1350, condition: 'Good', description: 'Durable cargo pants with roomy side pockets and light fading.', imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80' },
  { key: 'men-wool-coat', sellerKey: 'seller', title: 'Men Wool Blend Coat', brand: 'Zara', audience: 'Men', type: 'Jacket', size: 'XL', color: 'Black', price: 2400, condition: 'Like new', description: 'Warm tailored coat for office commutes and winter evenings.', imageUrl: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=900&q=80' },
  { key: 'men-running-shoes', sellerKey: 'seller', title: 'Men Running Shoes', brand: 'Nike', audience: 'Men', type: 'Shoes', size: 'Free Size', color: 'White', price: 1750, condition: 'Good', description: 'Light running shoes with comfortable soles and minor scuffs.', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' },
  { key: 'men-polo-shirt', sellerKey: 'seller', title: 'Men Classic Polo Shirt', brand: 'Lacoste', audience: 'Men', type: 'T-Shirt', size: 'M', color: 'Blue', price: 900, condition: 'Gently used', description: 'Simple polo shirt for daily wear, washed and ready to use.', imageUrl: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=900&q=80' },
  { key: 'men-windbreaker', sellerKey: 'seller', title: 'Men Lightweight Windbreaker', brand: 'Adidas', audience: 'Men', type: 'Jacket', size: 'L', color: 'Green', price: 1500, condition: 'Good', description: 'Packable windbreaker for travel, hiking, and windy evenings.', imageUrl: 'https://images.unsplash.com/photo-1506629905607-d9f297d20f3b?auto=format&fit=crop&w=900&q=80' },
  { key: 'women-dress', sellerKey: 'seller', title: 'Women Floral Wrap Dress', brand: 'Zara', audience: 'Women', type: 'Dress', size: 'S', color: 'Pink', price: 1600, condition: 'Like new', description: 'Light wrap dress for brunch, college events or casual parties.', imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80' },
  { key: 'women-kurta', sellerKey: 'seller', title: 'Women Cotton Kurta', brand: 'Local Loom', audience: 'Women', type: 'Kurta', size: 'M', color: 'Red', price: 1100, condition: 'Gently used', description: 'Comfortable cotton kurta with side pockets.', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80' },
  { key: 'women-sweater', sellerKey: 'seller', title: 'Women Wool Blend Sweater', brand: 'H&M', audience: 'Women', type: 'Sweater', size: 'S', color: 'Cream', price: 1250, condition: 'Good', description: 'Soft neutral sweater with light wear.', imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80' },
  { key: 'women-silk-saree', sellerKey: 'seller', title: 'Women Festive Silk Saree', brand: 'Local Loom', audience: 'Women', type: 'Saree', size: 'Free Size', color: 'Red', price: 2200, condition: 'Gently used', description: 'Elegant saree with a soft drape and subtle border detailing.', imageUrl: 'https://images.unsplash.com/photo-1610189012195-683a0bdb4a62?auto=format&fit=crop&w=900&q=80' },
  { key: 'women-denim-jacket', sellerKey: 'seller', title: 'Women Cropped Denim Jacket', brand: 'Levis', audience: 'Women', type: 'Jacket', size: 'M', color: 'Blue', price: 1700, condition: 'Good', description: 'Cropped denim layer with a neat collar and sturdy hardware.', imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80' },
  { key: 'women-wide-pants', sellerKey: 'seller', title: 'Women Wide Leg Pants', brand: 'Uniqlo', audience: 'Women', type: 'Pants', size: 'M', color: 'Black', price: 1300, condition: 'Like new', description: 'Comfortable wide-leg pants with a clean waistband and easy drape.', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80' },
  { key: 'women-linen-blouse', sellerKey: 'seller', title: 'Women Linen Blouse', brand: 'Mango', audience: 'Women', type: 'Shirt', size: 'S', color: 'White', price: 1000, condition: 'Gently used', description: 'Breathable blouse with soft fabric and minimal everyday styling.', imageUrl: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=80' },
  { key: 'women-cardigan', sellerKey: 'seller', title: 'Women Button Cardigan', brand: 'H&M', audience: 'Women', type: 'Sweater', size: 'L', color: 'Cream', price: 1150, condition: 'Good', description: 'Easy layering cardigan with ribbed cuffs and a relaxed fit.', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80' },
  { key: 'women-sneakers', sellerKey: 'seller', title: 'Women Everyday Sneakers', brand: 'Converse', audience: 'Women', type: 'Shoes', size: 'Free Size', color: 'Pink', price: 1550, condition: 'Good', description: 'Casual sneakers with clean canvas and comfortable soles.', imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80' },
  { key: 'kids-rain-jacket', sellerKey: 'seller', title: 'Kids Rain Jacket', brand: 'Decathlon', audience: 'Kids', type: 'Jacket', size: 'S', color: 'Blue', price: 850, condition: 'Good', description: 'Water-resistant jacket for school runs and monsoon walks.', imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80' },
  { key: 'kids-shirt-pack', sellerKey: 'seller', title: 'Kids Cotton T-Shirt Pack', brand: 'Mothercare', audience: 'Kids', type: 'T-Shirt', size: 'XS', color: 'White', price: 700, condition: 'Gently used', description: 'Two soft cotton tees, washed and ready for daily wear.', imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80' },
  { key: 'kids-shoes', sellerKey: 'seller', title: 'Kids Canvas Shoes', brand: 'Bata', audience: 'Kids', type: 'Shoes', size: 'Free Size', color: 'Black', price: 900, condition: 'Good', description: 'Durable canvas shoes with plenty of life left.', imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80' },
  { key: 'kids-denim-shorts', sellerKey: 'seller', title: 'Kids Denim Shorts', brand: 'Gap Kids', audience: 'Kids', type: 'Shorts', size: 'S', color: 'Blue', price: 650, condition: 'Good', description: 'Sturdy denim shorts for play days with adjustable waist tabs.', imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80' },
  { key: 'kids-fleece-hoodie', sellerKey: 'seller', title: 'Kids Fleece Hoodie', brand: 'H&M Kids', audience: 'Kids', type: 'Hoodie', size: 'M', color: 'Green', price: 780, condition: 'Gently used', description: 'Soft hoodie for school and weekend wear with a cozy kangaroo pocket.', imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80' },
  { key: 'kids-party-dress', sellerKey: 'seller', title: 'Kids Party Dress', brand: 'Mothercare', audience: 'Kids', type: 'Dress', size: 'XS', color: 'Pink', price: 980, condition: 'Like new', description: 'Light party dress with a comfortable lining and cheerful color.', imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80' },
  { key: 'kids-school-shirt', sellerKey: 'seller', title: 'Kids White School Shirt', brand: 'Bata School', audience: 'Kids', type: 'Shirt', size: 'M', color: 'White', price: 520, condition: 'Good', description: 'Simple white shirt suitable for school uniforms and formal days.', imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=80' },
  { key: 'kids-wool-sweater', sellerKey: 'seller', title: 'Kids Wool Sweater', brand: 'Local Knit', audience: 'Kids', type: 'Sweater', size: 'S', color: 'Red', price: 820, condition: 'Gently used', description: 'Warm knit sweater for cool mornings and winter school runs.', imageUrl: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=900&q=80' },
  { key: 'kids-track-pants', sellerKey: 'seller', title: 'Kids Track Pants', brand: 'Decathlon', audience: 'Kids', type: 'Pants', size: 'L', color: 'Black', price: 720, condition: 'Good', description: 'Stretchy track pants for sports, school activities, and daily wear.', imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80' }
];

export const demoOrders = [
  {
    id: 'order-1',
    buyerKey: 'buyer',
    sellerKey: 'seller',
    productKey: 'women-sweater',
    quantity: 1,
    paymentMethod: 'Cash on Delivery',
    paymentDetails: {},
    deliveryAddress: 'Jawalakhel, Lalitpur',
    status: 'in-progress'
  }
];
