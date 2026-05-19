import {
  AlertTriangle,
  BadgeCheck,
  ClipboardList,
  CreditCard,
  Filter,
  KeyRound,
  Leaf,
  LogOut,
  MapPin,
  PackageCheck,
  Plus,
  Search,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
  UserRound,
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { api, clearSession, getSession, saveSession } from './api.js';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'Free Size'];
const colors = ['Blue', 'Green', 'Black', 'White', 'Cream', 'Red', 'Pink'];
const audiences = ['Men', 'Women', 'Kids'];
const types = ['Jacket', 'Shirt', 'T-Shirt', 'Hoodie', 'Sweater', 'Dress', 'Pants', 'Shorts', 'Kurta', 'Saree', 'Shoes', 'Accessories'];
const statuses = ['placed', 'in-progress', 'out-for-delivery', 'delivered'];
const paymentMethods = ['eSewa', 'Khalti', 'Cash on Delivery', 'Bank Transfer'];
const audienceCards = [
  { value: 'Men', title: 'Men', copy: 'Jackets, shirts, denim, hoodies and shoes' },
  { value: 'Women', title: 'Women', copy: 'Dresses, kurtas, sarees, sweaters and daily wear' },
  { value: 'Kids', title: 'Kids', copy: 'School layers, tees, shorts, rainwear and shoes' }
];
const productImageUrl = (imageUrl) => imageUrl || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80';

export function App() {
  const [session, setSession] = useState(getSession());
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({ audience: '', type: '', size: '', color: '', brand: '', minPrice: '', maxPrice: '' });
  const [message, setMessage] = useState('');
  const [buyerNotice, setBuyerNotice] = useState('');
  const [sellerNotice, setSellerNotice] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [isPublishing, setIsPublishing] = useState(false);
  const [activePage, setActivePage] = useState('shop');
  const user = session?.user;

  const loadProducts = async () => {
    const data = await api.products(filters);
    setProducts(data);
  };

  const loadPrivateData = async () => {
    if (!user) return;
    const [orderData, listingData] = await Promise.all([
      api.orders(),
      user.role === 'seller' ? api.sellerProducts() : Promise.resolve([])
    ]);
    setOrders(orderData);
    setSellerProducts(listingData);

    if (user.role === 'buyer') {
      const recommended = await api.recommendations(6);
      setRecommendations(recommended);
    }
  };

  useEffect(() => {
    loadProducts().catch((error) => setMessage(error.message));
  }, [filters]);

  useEffect(() => {
    loadPrivateData().catch((error) => setMessage(error.message));
  }, [session]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setSession(null);
      setOrders([]);
      setSellerProducts([]);
      setRecommendations([]);
      setCart([]);
      setActivePage('shop');
      setMessage('Session expired. Please login again.');
    };

    window.addEventListener('purana-session-expired', handleSessionExpired);
    return () => window.removeEventListener('purana-session-expired', handleSessionExpired);
  }, []);

  const totals = useMemo(() => {
    const spent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const inProgress = orders.filter((order) => order.status !== 'delivered').length;
    const listedValue = sellerProducts.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { spent, inProgress, listedValue, cartTotal, cartCount };
  }, [orders, sellerProducts, cart]);

  const scrollToSection = (sectionId) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const goShop = () => {
    setActivePage('shop');
    scrollToSection('shop');
  };

  const goDashboard = () => {
    setActivePage('dashboard');
    scrollToSection('dashboard');
  };

  const handleAuth = (nextSession) => {
    saveSession(nextSession);
    setSession(nextSession);
    setAuthNotice('');
    setActivePage(nextSession.user.role === 'seller' ? 'dashboard' : 'shop');
    scrollToSection(nextSession.user.role === 'seller' ? 'dashboard' : 'shop');
    setMessage(`Welcome to Purana, ${nextSession.user.name}`);
  };

  const logout = () => {
    clearSession();
    setSession(null);
    setOrders([]);
    setSellerProducts([]);
    setRecommendations([]);
    setCart([]);
    setAuthNotice('');
    setBuyerNotice('');
    setSellerNotice('');
  };

  const goAuth = (mode) => {
    setAuthMode(mode);
    window.requestAnimationFrame(() => {
      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const addToCart = (product, quantity) => {
    if (!user || user.role !== 'buyer') {
      setMessage('Please login as a buyer to add items to cart.');
      return;
    }

    setCart((current) => {
      const exists = current.find((item) => item.product.id === product.id);
      if (exists) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { product, quantity }];
    });
    setMessage(`${quantity} x ${product.title} added to cart.`);
    setBuyerNotice(`${quantity} x ${product.title} added to cart. Open your cart when you are ready to checkout.`);
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    const safeQuantity = Math.max(1, Number(quantity || 1));
    setCart((current) =>
      current.map((item) => (item.product.id === productId ? { ...item, quantity: safeQuantity } : item))
    );
  };

  const chooseAudience = (audience) => {
    setFilters((current) => ({ ...current, audience: current.audience === audience ? '' : audience }));
    setActivePage('shop');
  };

  const checkout = async ({ items, deliveryAddress, paymentMethod, paymentDetails }) => {
    if (!items.length) {
      setMessage('Select at least one cart item before checkout.');
      return;
    }

    try {
      const result = await api.checkout({
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        deliveryAddress,
        paymentMethod,
        paymentDetails
      });

      const orderedIds = new Set(items.map((item) => item.product.id));
      setCart((current) => current.filter((item) => !orderedIds.has(item.product.id)));
      goShop();
      setMessage(`Checkout complete with ${paymentMethod}. ${result.orders?.length || items.length} order(s) placed.`);
      setBuyerNotice('');
      await Promise.all([loadProducts(), loadPrivateData()]);
    } catch (error) {
      setMessage(error.message);
      setBuyerNotice(error.message);
      await loadProducts().catch(() => {});
    }
  };

  const createProduct = async (event) => {
    event.preventDefault();
    if (isPublishing) return;

    setIsPublishing(true);
    setSellerNotice('');
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;

    try {
      const created = await api.createProduct(formData);
      form.reset();
      setSellerProducts((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      setProducts((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      setMessage(`${created.title} listed successfully. Your past listings have been refreshed.`);
      setSellerNotice(`${created.title} has been published and added to your past listings.`);
      await Promise.all([loadProducts(), loadPrivateData()]);
    } catch (error) {
      setMessage(error.message);
      setSellerNotice(error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const deleteProduct = async (product) => {
    const confirmed = window.confirm(`Remove "${product.title}" from your listings?`);
    if (!confirmed) return;

    try {
      await api.deleteProduct(product.id);
      setSellerProducts((current) => current.filter((item) => item.id !== product.id));
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setMessage(`${product.title} was removed from your listings.`);
      setSellerNotice(`${product.title} has been removed.`);
      await Promise.all([loadProducts(), loadPrivateData()]);
    } catch (error) {
      setMessage(error.message);
      setSellerNotice(error.message);
    }
  };

  const updateStatus = async (orderId, status) => {
    await api.updateOrderStatus(orderId, status);
    await loadPrivateData();
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark"><Leaf size={22} /></span>
          <div>
            <h1>Purana</h1>
            <p>Nepal's circular clothes marketplace</p>
          </div>
        </div>
        <nav>
          <button className="nav-link" onClick={goShop}>Clothes</button>
          {user ? <button className="nav-link" onClick={goDashboard}>Dashboard</button> : null}
          {user?.role === 'buyer' ? (
            <button className="cart-nav" onClick={() => setActivePage('cart')} aria-label="Open cart">
              <ShoppingCart size={18} />Cart ({totals.cartCount})
            </button>
          ) : null}
          {!user ? <button className="nav-auth" type="button" onClick={() => goAuth('login')}>Login</button> : null}
          {!user ? <button className="nav-signup" type="button" onClick={() => goAuth('signup')}>Signup</button> : null}
          {user ? (
            <button className="ghost-button" onClick={logout}><LogOut size={18} />Logout</button>
          ) : null}
        </nav>
      </header>

      {(message || buyerNotice || sellerNotice || authNotice) ? (
        <div className="alert-stack" aria-live="polite">
          {message ? <AlertPopup message={message} onClose={() => setMessage('')} /> : null}
          {authNotice ? <AlertPopup message={authNotice} onClose={() => setAuthNotice('')} /> : null}
          {sellerNotice ? <AlertPopup message={sellerNotice} onClose={() => setSellerNotice('')} /> : null}
          {buyerNotice ? (
            <AlertPopup
              message={buyerNotice}
              actionLabel="View cart"
              onAction={() => {
                setActivePage('cart');
                setBuyerNotice('');
              }}
              onClose={() => setBuyerNotice('')}
            />
          ) : null}
        </div>
      ) : null}

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Thrifted in Nepal</p>
            <h2>Give great clothes another life.</h2>
            <p>
              Purana connects buyers looking for affordable style with sellers listing clean, quality pre-loved clothing
              across Kathmandu, Pokhara, Lalitpur and beyond.
            </p>
            <div className="hero-actions">
              <button className="primary-link" onClick={goShop}><ShoppingBag size={18} />View Clothes</button>
              {user?.role === 'seller' ? (
                <button className="primary-link" onClick={goDashboard}><Store size={18} />View Listings</button>
              ) : null}
              {!user ? <button className="secondary-link" type="button" onClick={() => goAuth('login')}><UserRound size={18} />Login</button> : null}
              {!user ? <button className="secondary-link" type="button" onClick={() => goAuth('signup')}><Store size={18} />Signup</button> : null}
            </div>
          </div>
          <div className="hero-panel">
            <img
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80"
              alt="Curated thrift clothing rack"
            />
          </div>
        </section>

        {!user ? <AuthPanel onAuth={handleAuth} onAlert={setAuthNotice} mode={authMode} onModeChange={setAuthMode} /> : null}

        {user?.role === 'buyer' && activePage === 'cart' ? (
          <CartPage
            cart={cart}
            user={user}
            onQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            onBack={goShop}
            onCheckout={checkout}
          />
        ) : null}

        {activePage === 'shop' ? (
          <section id="shop" className="shop-layout">
            <aside className="filters">
              <div className="section-title">
                <Filter size={20} />
                <h3>Clothes filters</h3>
              </div>
              <label>
                Search brand
                <div className="input-icon"><Search size={16} /><input value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value })} placeholder="Nike, Zara..." /></div>
              </label>
              <label>Shop for<Select value={filters.audience} onChange={(e) => setFilters({ ...filters, audience: e.target.value })} options={audiences} /></label>
              <label>Clothes type<Select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} options={types} /></label>
              <label>Size<Select value={filters.size} onChange={(e) => setFilters({ ...filters, size: e.target.value })} options={sizes} /></label>
              <label>Color<Select value={filters.color} onChange={(e) => setFilters({ ...filters, color: e.target.value })} options={colors} /></label>
              <div className="price-grid">
                <label>Min price<input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} placeholder="Rs." /></label>
                <label>Max price<input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} placeholder="Rs." /></label>
              </div>
              <button className="ghost-button wide" onClick={() => setFilters({ audience: '', type: '', size: '', color: '', brand: '', minPrice: '', maxPrice: '' })}>Clear</button>
            </aside>

            <section className="products">
              <div className="clothes-option-title">
                <p className="eyebrow">Clothes options</p>
                <h3>Choose Men, Women or Kids</h3>
              </div>
              <div className="audience-grid">
                {audienceCards.map((card) => (
                  <button
                    type="button"
                    className={filters.audience === card.value ? 'audience-card active' : 'audience-card'}
                    key={card.value}
                    onClick={() => chooseAudience(card.value)}
                  >
                    <Shirt size={20} />
                    <strong>{card.title}</strong>
                    <span>{card.copy}</span>
                  </button>
                ))}
              </div>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Available now</p>
                  <h3>{filters.audience ? `${filters.audience} thrift clothes` : 'Shop thrift clothes'}</h3>
                </div>
                <span>{products.length} items</span>
              </div>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} user={user} onAddToCart={addToCart} />
                ))}
              </div>
            </section>
          </section>
        ) : null}

        {user && activePage === 'dashboard' ? (
          <section id="dashboard" className="dashboard">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{user.role} dashboard</p>
                <h3>{user.role === 'buyer' ? 'Your buying activity' : 'Your seller studio'}</h3>
              </div>
              <UserRound size={26} />
            </div>
            {user.role === 'buyer' ? (
              <BuyerDashboard
                orders={orders}
                totals={totals}
                recommendations={recommendations}
                onAddToCart={addToCart}
                onShop={goShop}
                onCart={() => setActivePage('cart')}
              />
            ) : (
              <SellerDashboard
                orders={orders}
                products={sellerProducts}
                totals={totals}
                onCreate={createProduct}
                onStatus={updateStatus}
                onDeleteProduct={deleteProduct}
                isPublishing={isPublishing}
              />
            )}
          </section>
        ) : null}
      </main>
      <SiteFooter user={user} onShop={goShop} onDashboard={goDashboard} onLogin={() => goAuth('login')} onSignup={() => goAuth('signup')} />
    </div>
  );
}

function AlertPopup({ message, actionLabel, onAction, onClose }) {
  return (
    <article className="alert-popup" role="alert">
      <AlertTriangle className="alert-icon" size={22} />
      <p>{message}</p>
      {actionLabel ? (
        <button className="alert-action" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
      <button className="alert-close" type="button" onClick={onClose} aria-label="Close alert">
        <X size={18} />
      </button>
    </article>
  );
}

function SiteFooter({ user, onShop, onDashboard, onLogin, onSignup }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark"><Leaf size={20} /></span>
          <div>
            <strong>Purana</strong>
            <p>Nepal's circular clothes marketplace.</p>
          </div>
        </div>
        <div className="footer-group">
          <strong>Explore</strong>
          <div className="footer-links">
            <button type="button" onClick={onShop}>Clothes</button>
            {user ? <button type="button" onClick={onDashboard}>Dashboard</button> : null}
            {!user ? <button type="button" onClick={onLogin}>Login</button> : null}
            {!user ? <button type="button" onClick={onSignup}>Signup</button> : null}
          </div>
        </div>
        <div className="footer-group">
          <strong>Support</strong>
          <p>Kathmandu, Pokhara, Lalitpur and delivery-ready cities across Nepal.</p>
        </div>
      </div>
    </footer>
  );
}

function AuthPanel({ onAuth, onAlert, mode, onModeChange }) {
  const [role, setRole] = useState('buyer');

  const switchMode = (nextMode) => {
    onAlert('');
    onModeChange(nextMode);
  };

  const submit = async (event) => {
    event.preventDefault();
    onAlert('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (mode === 'forgot') {
        if (values.password !== values.confirmPassword) {
          onAlert('Passwords do not match');
          return;
        }
        const result = await api.resetPassword({ email: values.email, password: values.password, role });
        onAlert(result.message);
        event.currentTarget.reset();
        onModeChange('login');
        return;
      }

      const payload = mode === 'login'
        ? { email: values.email, password: values.password, role }
        : { ...values, role };
      const session = mode === 'login' ? await api.login(payload) : await api.signup(payload);
      onAuth(session);
    } catch (caught) {
      onAlert(caught.message);
    }
  };

  return (
    <section id="auth" className="auth-panel">
      <div>
        <p className="eyebrow">Join Purana</p>
        <h3>{mode === 'login' ? 'Login to continue' : mode === 'forgot' ? 'Reset your password' : 'Create your account'}</h3>
        <p className="muted">
          {mode === 'forgot'
            ? 'Enter the email of an existing account. If the account is not registered, create it first.'
            : 'Demo accounts: buyer@purana.com or seller@purana.com, password password123.'}
        </p>
      </div>
      <form onSubmit={submit}>
        <div className="segmented">
          <button type="button" className={role === 'buyer' ? 'active' : ''} onClick={() => setRole('buyer')}>Buyer</button>
          <button type="button" className={role === 'seller' ? 'active' : ''} onClick={() => setRole('seller')}>Seller</button>
        </div>
        {mode === 'signup' ? (
          <>
            <input name="name" placeholder="Full name" required />
            <input name="location" placeholder="Location in Nepal" defaultValue="Kathmandu, Nepal" />
            <input name="phone" placeholder="Phone number" />
          </>
        ) : null}
        <input name="email" type="email" placeholder="Email address" required />
        <input name="password" type="password" placeholder={mode === 'forgot' ? 'New password' : 'Password'} required minLength="6" />
        {mode === 'forgot' ? <input name="confirmPassword" type="password" placeholder="Confirm new password" required minLength="6" /> : null}
        <button className="primary-button" type="submit">
          {mode === 'forgot' ? <KeyRound size={17} /> : null}
          {mode === 'login' ? 'Login' : mode === 'forgot' ? 'Update password' : 'Signup'} as {role}
        </button>
        <button className="text-button" type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Need an account?' : mode === 'forgot' ? 'Back to login' : 'Already registered?'}
        </button>
        {mode === 'login' ? (
          <button className="text-button" type="button" onClick={() => switchMode('forgot')}>
            Forgot password?
          </button>
        ) : null}
      </form>
    </section>
  );
}

function Select({ options, ...props }) {
  return (
    <select {...props}>
      <option value="">All</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function ProductCard({ product, user, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <article className="product-card">
      <img src={productImageUrl(product.imageUrl)} alt={product.title} />
      <div className="product-body">
        <div className="product-topline">
          <span>{product.type}</span>
          <strong>Rs. {product.price}</strong>
        </div>
        <h4>{product.title}</h4>
        <p>{product.description}</p>
        <div className="chips">
          <span>{product.audience}</span>
          <span>{product.brand}</span>
          <span>{product.size}</span>
          <span>{product.color}</span>
          <span>{product.condition}</span>
        </div>
        <div className="quantity-row">
          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value || 1)))}
            />
          </label>
        </div>
        <button className="primary-button" onClick={() => onAddToCart(product, quantity)} disabled={user?.role === 'seller'}>
          <ShoppingCart size={17} /> Add to cart
        </button>
      </div>
    </article>
  );
}

function CartPage({ cart, user, onQuantity, onRemove, onBack, onCheckout }) {
  const [step, setStep] = useState('select');
  const [selectedIds, setSelectedIds] = useState(() => cart.map((item) => item.product.id));
  const [deliveryAddress, setDeliveryAddress] = useState(user.location || '');
  const selectedItems = cart.filter((item) => selectedIds.includes(item.product.id));
  const selectedTotal = selectedItems.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);

  useEffect(() => {
    setSelectedIds((current) => {
      const cartIds = cart.map((item) => item.product.id);
      const kept = current.filter((id) => cartIds.includes(id));
      return kept.length ? kept : cartIds;
    });
  }, [cart]);

  const toggleSelected = (productId) => {
    setSelectedIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  };

  const goDelivery = () => {
    if (!selectedItems.length) return;
    setStep('delivery');
  };

  const goPayment = (event) => {
    event.preventDefault();
    setStep('payment');
  };

  const completePayment = (payment) => {
    onCheckout({ items: selectedItems, deliveryAddress, ...payment });
  };

  return (
    <section id="cart" className="cart-page">
      <div className="cart-page-header">
        <div>
          <p className="eyebrow">Buyer cart</p>
          <h3>{step === 'select' ? 'Select items to pay' : step === 'delivery' ? 'Delivery details' : 'Payment details'}</h3>
        </div>
        <button className="ghost-button" type="button" onClick={onBack}>Back to shop</button>
      </div>

      <div className="checkout-steps">
        <span className={step === 'select' ? 'active' : ''}>1. Cart</span>
        <span className={step === 'delivery' ? 'active' : ''}>2. Delivery</span>
        <span className={step === 'payment' ? 'active' : ''}>3. Payment</span>
      </div>

      {step === 'select' ? (
        <div className="cart-grid">
          <div className="cart-items">
            {!cart.length ? <p className="empty">Your cart is empty. Add clothes from the shop first.</p> : null}
            {cart.map((item) => (
              <div className="cart-row selectable-cart-row" key={item.product.id}>
                <label className="cart-select">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.product.id)}
                    onChange={() => toggleSelected(item.product.id)}
                  />
                </label>
                <img
                  src={productImageUrl(item.product.imageUrl)}
                  alt={item.product.title}
                />
                <div>
                  <strong>{item.product.title}</strong>
                  <span>{item.product.brand} / {item.product.size} / Rs. {item.product.price}</span>
                </div>
                <label>
                  Qty
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => onQuantity(item.product.id, event.target.value)}
                  />
                </label>
                <strong>Rs. {item.product.price * item.quantity}</strong>
                <button className="icon-button" onClick={() => onRemove(item.product.id)} aria-label="Remove from cart">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <CartSummary
            count={selectedItems.length}
            total={selectedTotal}
            buttonText="Proceed to delivery"
            disabled={!selectedItems.length}
            onNext={goDelivery}
          />
        </div>
      ) : null}

      {step === 'delivery' ? (
        <div className="cart-grid">
          <form className="checkout-form" onSubmit={goPayment}>
            <div className="section-title"><MapPin size={20} /><h3>Delivery address</h3></div>
            <label>
              Full delivery details
              <textarea
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                placeholder="House number, street, city, landmark and phone note"
                required
              />
            </label>
            <div className="checkout-actions">
              <button className="ghost-button" type="button" onClick={() => setStep('select')}>Back to cart</button>
              <button className="primary-button" type="submit">Proceed to payment</button>
            </div>
          </form>
          <CartSummary count={selectedItems.length} total={selectedTotal} />
        </div>
      ) : null}

      {step === 'payment' ? (
        <div className="cart-grid">
          <PaymentForm
            total={selectedTotal}
            onBack={() => setStep('delivery')}
            onPay={completePayment}
          />
          <CartSummary count={selectedItems.length} total={selectedTotal} address={deliveryAddress} />
        </div>
      ) : null}
    </section>
  );
}

function CartSummary({ count, total, address, buttonText, disabled, onNext }) {
  return (
    <aside className="cart-summary">
      <div className="section-title"><ShoppingBag size={20} /><h3>Order summary</h3></div>
      <div className="summary-line"><span>Selected items</span><strong>{count}</strong></div>
      <div className="summary-line"><span>Total</span><strong>Rs. {total}</strong></div>
      {address ? <p className="summary-address">{address}</p> : null}
      {buttonText ? (
        <button className="primary-button" type="button" disabled={disabled} onClick={onNext}>
          {buttonText}
        </button>
      ) : null}
    </aside>
  );
}

function PaymentForm({ total, onBack, onPay }) {
  const [paymentMethod, setPaymentMethod] = useState('eSewa');
  const [walletId, setWalletId] = useState('');
  const [walletPassword, setWalletPassword] = useState('');
  const [walletMpin, setWalletMpin] = useState('');
  const [walletToken, setWalletToken] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const paymentDetails = paymentMethod === 'eSewa'
      ? { walletId, password: walletPassword, mpin: walletMpin, token: walletToken }
      : paymentMethod === 'Khalti'
        ? { walletId, password: walletPassword }
        : { bankName, accountName, accountNumber, branch };
    onPay({ paymentMethod, paymentDetails });
  };

  return (
        <form className="checkout-form" onSubmit={submit}>
          <div className="section-title"><CreditCard size={20} /><h3>Payment</h3></div>
          <div className="payment-options">
            {paymentMethods.map((method) => (
              <label className={paymentMethod === method ? 'payment-option selected' : 'payment-option'} key={method}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                {method}
              </label>
            ))}
          </div>
          {paymentMethod === 'eSewa' ? (
            <div className="payment-detail-fields">
              <p className="payment-helper">Use test IDs 9806800001 to 9806800005, password Nepal@123, MPIN 1122, token 123456.</p>
              <label>
                eSewa ID
                <input
                  value={walletId}
                  onChange={(event) => setWalletId(event.target.value)}
                  placeholder="9806800001"
                  required
                />
              </label>
              <label>
                eSewa password
                <input
                  type="password"
                  value={walletPassword}
                  onChange={(event) => setWalletPassword(event.target.value)}
                  placeholder="Nepal@123"
                  required
                />
              </label>
              <label>
                MPIN
                <input
                  value={walletMpin}
                  onChange={(event) => setWalletMpin(event.target.value)}
                  placeholder="1122"
                  required
                />
              </label>
              <label>
                Token
                <input
                  value={walletToken}
                  onChange={(event) => setWalletToken(event.target.value)}
                  placeholder="123456"
                  required
                />
              </label>
            </div>
          ) : null}
          {paymentMethod === 'Khalti' ? (
            <div className="payment-detail-fields">
              <label>
                Khalti ID
                <input
                  value={walletId}
                  onChange={(event) => setWalletId(event.target.value)}
                  placeholder="98XXXXXXXX or Khalti ID"
                  required
                />
              </label>
              <label>
                Khalti password
                <input
                  type="password"
                  value={walletPassword}
                  onChange={(event) => setWalletPassword(event.target.value)}
                  placeholder="Wallet password"
                  required
                />
              </label>
            </div>
          ) : null}
          {paymentMethod === 'Bank Transfer' ? (
            <div className="payment-detail-fields">
              <label>
                Bank name
                <input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="Nabil Bank" required />
              </label>
              <label>
                Account holder
                <input value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Full account name" required />
              </label>
              <label>
                Account number
                <input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="Bank account number" required />
              </label>
              <label>
                Branch
                <input value={branch} onChange={(event) => setBranch(event.target.value)} placeholder="Branch name" />
              </label>
            </div>
          ) : null}
          {paymentMethod === 'Cash on Delivery' ? (
            <p className="payment-note">Payment will be collected when the delivery reaches your address.</p>
          ) : null}
          <div className="checkout-total">
            <span>Total</span>
            <strong>Rs. {total}</strong>
          </div>
          <div className="checkout-actions">
            <button className="ghost-button" type="button" onClick={onBack}>Back to delivery</button>
            <button className="primary-button" type="submit"><ShoppingBag size={17} />Place order</button>
          </div>
        </form>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BuyerDashboard({ orders, totals, recommendations, onAddToCart, onShop, onCart }) {
  const latestOrders = orders.slice(0, 3);

  return (
    <>
      <section className="buyer-dashboard-landing">
        <div className="buyer-welcome">
          <p className="eyebrow">Buyer home</p>
          <h3>Track orders, continue shopping, and checkout faster.</h3>
          <p>Keep an eye on active deliveries and return to your cart whenever you are ready to place an order.</p>
          <div className="dashboard-actions">
            <button className="primary-button" type="button" onClick={onShop}>
              <ShoppingBag size={17} />Shop clothes
            </button>
            <button className="ghost-button" type="button" onClick={onCart}>
              <ShoppingCart size={17} />Open cart
            </button>
          </div>
        </div>
        <div className="buyer-activity-card">
          <div className="section-title"><Truck size={20} /><h3>Recent activity</h3></div>
          {!latestOrders.length ? <p className="empty">No buyer orders yet. Add clothes to your cart to begin.</p> : null}
          {latestOrders.map((order) => (
            <div className="activity-row" key={order.id}>
              <div>
                <strong>{order.product?.title || 'Product'}</strong>
                <span>{order.status} / {order.paymentMethod || 'Cash on Delivery'}</span>
              </div>
              <strong>Rs. {order.total}</strong>
            </div>
          ))}
        </div>
      </section>
      <div className="stats-grid">
        <Stat icon={<ClipboardList size={22} />} label="Past orders" value={orders.length} />
        <Stat icon={<Truck size={22} />} label="In progress" value={totals.inProgress} />
        <Stat icon={<BadgeCheck size={22} />} label="Total spent" value={`Rs. ${totals.spent}`} />
        <Stat icon={<ShoppingCart size={22} />} label="Cart items" value={totals.cartCount} />
      </div>
      <section className="recommendations-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recommended for you</p>
            <h3>Personalized suggestions</h3>
          </div>
          <span>Cosine + SVD</span>
        </div>
        {!recommendations.length ? (
          <p className="empty">Recommendations will improve after buyers place more orders.</p>
        ) : null}
        <div className="recommendation-grid">
          {recommendations.map((product) => (
            <div className="recommendation-card" key={product.id}>
              <ProductCard product={product} user={{ role: 'buyer' }} onAddToCart={onAddToCart} />
              <div className="recommendation-meta">
                <span>{product.recommendationReason}</span>
                <strong>Score {product.recommendationScore}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
      <OrderTable orders={orders} empty="No purchases yet." />
    </>
  );
}

function SellerDashboard({ orders, products, totals, onCreate, onStatus, onDeleteProduct, isPublishing }) {
  return (
    <div className="seller-grid">
      <div>
        <div className="stats-grid compact">
          <Stat icon={<Store size={22} />} label="Listings" value={products.length} />
          <Stat icon={<PackageCheck size={22} />} label="Orders" value={orders.length} />
          <Stat icon={<BadgeCheck size={22} />} label="Listed value" value={`Rs. ${totals.listedValue}`} />
        </div>
        <h4 className="subheading">Past listings</h4>
        <div className="listing-stack">
          {!products.length ? <p className="empty">No listed clothes yet. Add your first product from the form.</p> : null}
          {products.map((product) => (
            <div className="listing-row" key={product.id}>
              <img src={productImageUrl(product.imageUrl)} alt={product.title} />
              <div>
                <strong>{product.title}</strong>
                <span>{product.brand} / Rs. {product.price}</span>
                <div className="mini-chips">
                  <small>For: {product.audience}</small>
                  <small>Type: {product.type}</small>
                  <small>Size: {product.size}</small>
                  <small>Color: {product.color}</small>
                </div>
              </div>
              <div className="listing-actions">
                <small className="listing-status">{product.status}</small>
                <button className="danger-button" type="button" onClick={() => onDeleteProduct(product)}>
                  <Trash2 size={16} />Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <h4 className="subheading">Orders and delivery progress</h4>
        <OrderTable orders={orders} seller onStatus={onStatus} empty="No buyer orders yet." />
      </div>
      <form className="listing-form" onSubmit={onCreate}>
        <div className="section-title"><Plus size={20} /><h3>List clothes</h3></div>
        <label>
          Product title
          <input name="title" placeholder="Vintage denim jacket" required />
        </label>
        <label>
          Brand
          <input name="brand" placeholder="Levis, H&M, local brand..." required />
        </label>
        <div className="two-col">
          <label>
            Shop for
            <Select name="audience" options={audiences} required />
          </label>
          <label>
            Clothes type
            <Select name="type" options={types} required />
          </label>
        </div>
        <div className="two-col">
          <label>
            Size
            <Select name="size" options={sizes} required />
          </label>
          <label>
            Color
            <Select name="color" options={colors} required />
          </label>
        </div>
        <label>
          Price
          <input name="price" type="number" min="1" placeholder="Price in NPR" required />
        </label>
        <label>
          Condition
          <input name="condition" placeholder="Gently used, Like new, Good..." defaultValue="Gently used" />
        </label>
        <label>
          Product description
          <textarea name="description" placeholder="Describe fabric, fit, flaws and pickup notes" rows="4" />
        </label>
        <label>
          Product picture
          <input name="image" type="file" accept="image/*" />
        </label>
        <label>
          Image URL
          <input name="imageUrl" placeholder="Or paste image URL" />
        </label>
        <button className="primary-button" type="submit" disabled={isPublishing}>
          <Plus size={17} />{isPublishing ? 'Publishing...' : 'Publish listing'}
        </button>
      </form>
    </div>
  );
}

function OrderTable({ orders, seller = false, onStatus, empty }) {
  if (!orders.length) return <p className="empty">{empty}</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>{seller ? 'Buyer' : 'Seller'}</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Delivery</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.product?.title || 'Product'}</td>
              <td>{seller ? order.buyerName : order.sellerName}</td>
              <td>{order.quantity || 1}</td>
              <td>Rs. {order.total}</td>
              <td>{order.paymentMethod || 'Cash on Delivery'}</td>
              <td>
                {seller ? (
                  <select value={order.status} onChange={(event) => onStatus(order.id, event.target.value)}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                ) : (
                  <span className="status-pill">{order.status}</span>
                )}
              </td>
              <td>{order.deliveryAddress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
