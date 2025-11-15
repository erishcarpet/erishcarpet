/* script.js
   ERISH Carpet — unified front-end logic (v3 — professional)
   Features: products CRUD, inventory, cart, orders, admin helpers, search, stats, whatsapp link.
   Author: Generated for user
*/

(function(){
  const STORAGE_KEYS = {
    PRODUCTS: 'erish_products_v3',
    CART: 'erish_cart_v3',
    ORDERS: 'erish_orders_v3',
    ADMIN_LOGGED: 'erish_admin_logged_v3',
    PAGE_VIEWS: 'erish_pageviews_v3',
  };

  // --- Helpers ---
  function nowId(prefix='o'){ return prefix + Date.now() + Math.floor(Math.random()*9000 + 1000); }
  function toNumber(v){ return Number(v) || 0; }
  function formatCurrency(n){ try { return Number(n).toLocaleString(); } catch(e){ return n; } }
  function escapeHtml(str){
    if (str === undefined || str === null) return '';
    return String(str).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; });
  }

  // migrate from older keys if present (backwards compatibility)
  function migrateLegacy(){
    // check common old keys
    const legacy = {
      products: localStorage.getItem('products') || localStorage.getItem('erish_products'),
      cart: localStorage.getItem('cart') || localStorage.getItem('erish_cart'),
      orders: localStorage.getItem('orders') || localStorage.getItem('erish_orders'),
    };
    if (legacy.products && !localStorage.getItem(STORAGE_KEYS.PRODUCTS)){
      try { const p = JSON.parse(legacy.products); localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(p)); } catch(e){}
    }
    if (legacy.cart && !localStorage.getItem(STORAGE_KEYS.CART)){
      try { const c = JSON.parse(legacy.cart); localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(c)); } catch(e){}
    }
    if (legacy.orders && !localStorage.getItem(STORAGE_KEYS.ORDERS)){
      try { const o = JSON.parse(legacy.orders); localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(o)); } catch(e){}
    }
  }

  // --- Products API ---
  function readProducts(){
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]';
      return JSON.parse(raw);
    } catch(e){
      return [];
    }
  }
  function saveProducts(list){
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
  }

  function initDefaultProducts(){
    const sample = [
      { id: 'm1', sku:'M-001', category:'modern', name:'فرشینه مدرن خاکستری', price:600000, stock: 50, img:'images/modern1.jpg', description:'طراحی ساده و شیک برای دکورهای امروزی' },
      { id: 'm2', sku:'M-002', category:'modern', name:'فرشینه مدرن طلایی', price:600000, stock: 20, img:'images/modern2.jpg', description:'لاکچری با جلوه‌ای خاص' },
      { id: 'c1', sku:'C-001', category:'classic', name:'فرشینه کلاسیک کرم', price:600000, stock: 30, img:'images/classic1.jpg', description:'طرح سنتی ایرانی' },
      { id: 'f1', sku:'F-001', category:'fantasy', name:'فرشینه فانتزی رنگارنگ', price:600000, stock: 40, img:'images/fantasy1.jpg', description:'پر از رنگ و انرژی' }
    ];
    saveProducts(sample);
    return sample;
  }

  function addProduct(product){
    const list = readProducts();
    product.id = product.id || nowId('p');
    list.push(product);
    saveProducts(list);
    return product;
  }

  function updateProduct(id, patch){
    const list = readProducts();
    const i = list.findIndex(p=> p.id === id);
    if(i === -1) throw new Error('Product not found');
    list[i] = Object.assign({}, list[i], patch);
    saveProducts(list);
    return list[i];
  }

  function deleteProduct(id){
    let list = readProducts();
    list = list.filter(p=> p.id !== id);
    saveProducts(list);
  }

  function getProductById(id){
    return readProducts().find(p=> p.id === id) || null;
  }

  // Search & filter
  function searchProducts(query, opts = {}){
    // opts: {category, minPrice, maxPrice, inStockOnly}
    query = (query||'').trim().toLowerCase();
    let res = readProducts();
    if (opts.category) res = res.filter(r=> r.category === opts.category);
    if (opts.inStockOnly) res = res.filter(r=> toNumber(r.stock) > 0);
    if (typeof opts.minPrice !== 'undefined')res = res.filter(r=> toNumber(r.price) >= toNumber(opts.minPrice));
    if (typeof opts.maxPrice !== 'undefined') res = res.filter(r=> toNumber(r.price) <= toNumber(opts.maxPrice));
    if (query) {
      res = res.filter(r => (r.name||'').toLowerCase().includes(query) || (r.sku||'').toLowerCase().includes(query) || (r.description||'').toLowerCase().includes(query));
    }
    return res;
  }

  // --- Cart API (per-browser) ---
  function readCart(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]'); } catch(e){ return []; }
  }
  function saveCart(c){ localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(c)); }
  function clearCart(){ localStorage.removeItem(STORAGE_KEYS.CART); updateCartCounter(); }
  function updateCartCounter(){
    // update any element with id cartCount
    const count = readCart().length;
    const els = document.querySelectorAll('#cartCount');
    els.forEach(el => el.textContent = count);
  }

  function addToCart(productId, qty = 1, meta = ''){
    // check product exists and stock
    const p = getProductById(productId);
    if(!p) { alert('محصول یافت نشد'); return false; }
    if (toNumber(p.stock) <= 0) { alert('متأسفانه این محصول موجود نیست'); return false; }
    // push to cart item (store snapshot of name and price)
    const cart = readCart();
    cart.push({
      cartId: nowId('c'),
      productId: p.id,
      name: p.name,
      price: toNumber(p.price),
      qty: toNumber(qty),
      meta: meta || '',
    });
    saveCart(cart);
    updateCartCounter();
    return true;
  }

  function removeFromCart(cartId){
    let cart = readCart();
    cart = cart.filter(it => it.cartId !== cartId);
    saveCart(cart);
    updateCartCounter();
  }

  // --- Orders API ---
  function readOrders(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]'); } catch(e){ return []; }
  }
  function saveOrders(list){ localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list)); }

  function placeOrder({name, phone, city, address, sendToWhatsApp = true}){
    const cart = readCart();
    if(!cart || cart.length === 0) { throw new Error('Cart is empty'); }
    if(!name || !phone || !city || !address) { throw new Error('Missing customer info'); }

    // create order
    const orderId = nowId('o');
    const total = cart.reduce((s,i)=> s + toNumber(i.price) * toNumber(i.qty), 0);

    const order = {
      id: orderId,
      name: name,
      phone: phone,
      city: city,
      address: address,
      cart: cart,
      total: total,
      date: new Date().toLocaleString('fa-IR'),
      status: 'ثبت جدید'
    };

    const orders = readOrders();
    orders.push(order);
    saveOrders(orders);

    // reduce inventory
    try {
      cart.forEach(ci => {
        const prod = getProductById(ci.productId);
        if(prod && typeof prod.stock !== 'undefined') {
          prod.stock = Math.max(0, toNumber(prod.stock) - toNumber(ci.qty));
          updateProduct(prod.id, { stock: prod.stock });
        }
      });
    } catch(e){ console.warn('Inventory update failed', e); }

    // clear cart
    clearCart();

    // send whatsapp link if requested
    let waLink = '';
    if(sendToWhatsApp){
      let text = `سفارش جدید از سایت ERISH Carpet\n\nنام: ${escapeHtml(name)}\nشماره: ${escapeHtml(phone)}\nشهر: ${escapeHtml(city)}\nآدرس:\n${escapeHtml(address)}\n\nمحصولات:\n`;
      order.cart.forEach(it => {
        text += `• ${escapeHtml(it.name)} × ${escapeHtml(String(it.qty))} — ${formatCurrency(it.price)} تومان\n`;
      });
      text += `\nجمع کل: ${formatCurrency(order.total)} تومان\nکد سفارش: ${order.id}`;
      // whatsapp number — change if needed
      const phoneNumber = '989229289822';
      waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    }

    return { order, waLink };
  }

  // --- Admin helpers ---
  const ADMIN_PASS = 'erish2025';
  function adminLogin(pass){
    if(pass === ADMIN_PASS){
      localStorage.setItem(STORAGE_KEYS.ADMIN_LOGGED, '1');
      return true;
    }
    return false;
  }
  function adminLogout(){
    localStorage.removeItem(STORAGE_KEYS.ADMIN_LOGGED);
  }
  function isAdmin(){
    return localStorage.getItem(STORAGE_KEYS.ADMIN_LOGGED) === '1';
  }

  function changeOrderStatus(orderId, status){
    const orders = readOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if(idx === -1) throw new Error('Order not found');
    orders[idx].status = status;
    saveOrders(orders);
  }

  function deleteOrder(orderId){
    let orders = readOrders();
    orders = orders.filter(o => o.id !== orderId);
    saveOrders(orders);
  }

  // --- Stats & page views ---
  function incrementPageView(page){
    try {
      const pv = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAGE_VIEWS) || '{}');
      pv[page] = (pv[page] || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.PAGE_VIEWS, JSON.stringify(pv));
    } catch(e){}
  }
  function getPageViews(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAGE_VIEWS) || '{}'); }

  function getStats(){
    const orders = readOrders();
    const revenue = orders.reduce((s,o)=> s + toNumber(o.total), 0);
    return {
      ordersCount: orders.length,
      revenue,
      pageViews: getPageViews()
    };
  }

  // --- Public API exported to window.ERISH ---
  const API = {
    // Migration and init
    migrateLegacy,
    initDefaultProducts,

    // Products
    readProducts,
    saveProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    searchProducts,

    // Cart
    readCart,
    saveCart,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartCounter,

    // Orders
    readOrders,
    saveOrders,
    placeOrder,

    // Admin
    adminLogin,
    adminLogout,
    isAdmin,
    changeOrderStatus,
    deleteOrder,

    // Stats
    incrementPageView,
    getPageViews,
    getStats,

    // Utils
    nowId,
    formatCurrency,
    escapeHtml,
  };

  // quick auto-init & migration
  migrateLegacy();
  if(!localStorage.getItem(STORAGE_KEYS.PRODUCTS)){
    // do not overwrite if exists; but create sample for convenience
    initDefaultProducts();
  }
  updateCartCounter();

  // expose
  window.ERISH = API;

  // auto-increment page view for current file (helpful if added in every page)
  try {
    const page = (location.pathname || 'index').split('/').pop() || 'index.html';
    incrementPageView(page);
  } catch(e){}

  // dev log
  console.info('ERISH script v3 loaded — API: window.ERISH');

})();