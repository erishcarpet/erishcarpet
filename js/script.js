/* Modern JS for products, carousel, cart (localStorage), filters, detail rendering and small animations */
const productsData = [
  { id:1, slug:'carpet-silk-lux', name:'فرش ابریشم لوکس', price:5500000, priceLabel:'5,500,000 تومان', img:'images/carpet1.jpg', desc:'فرش ابریشم با طراحی مدرن و کیفیت عالی.'},
  { id:2, slug:'carpet-royal', name:'فرش ماشینی سلطنتی', price:3200000, priceLabel:'3,200,000 تومان', img:'images/carpet2.jpg', desc:'طرح کلاسیک با حس سلطنتی.'},
  { id:3, slug:'carpet-art', name:'تابلو فرش هنری', price:2800000, priceLabel:'2,800,000 تومان', img:'images/carpet3.jpg', desc:'تابلو فرش مناسب دکوراسیون مدرن.'},
  { id:4, slug:'carpet-modern', name:'فرش فانتزی مدرن', price:2500000, priceLabel:'2,500,000 تومان', img:'images/carpet4.jpg', desc:'طرح جوان‌پسند و مینیمال.'},
  { id:5, slug:'carpet-classic', name:'فرش کلاسیک ایرانی', price:4000000, priceLabel:'4,000,000 تومان', img:'images/carpet5.jpg', desc:'ترکیب سنتی با کیفیت بالا.'}
];

/* ---------------- cart (localStorage) ---------------- */
const CART_KEY = 'erish_cart_v1';
function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){return []}}
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCounts(); }
function addToCart(productId, qty=1){
  const cart = getCart();
  const p = productsData.find(x=>x.id===productId);
  if(!p) return;
  const found = cart.find(i=>i.id===productId);
  if(found){ found.qty += qty } else { cart.push({id:productId, qty, name:p.name, price:p.price, img:p.img}) }
  saveCart(cart);
  showToast('محصول به سبد اضافه شد');
}
function removeFromCart(productId){
  let cart = getCart();
  cart = cart.filter(i=>i.id!==productId);
  saveCart(cart);
}
function clearCart(){ localStorage.removeItem(CART_KEY); updateCartCounts(); renderCart(); showToast('سبد خرید خالی شد') }
function updateCartCounts(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  document.querySelectorAll('[id^="cart-count"]').forEach(el=>el.textContent = count);
}

/* ---------------- render products ---------------- */
function renderCarousel(){
  const container = document.getElementById('carousel');
  if(!container) return;
  container.innerHTML = '';
  productsData.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.priceLabel}</p>
      <div style="display:flex;gap:8px;justify-content:center">
        <a class="small-btn" href="product-detail.html?slug=${p.slug}">جزئیات</a>
        <button class="small-btn" data-add="${p.id}">افزودن</button>
      </div>
    `;
    container.appendChild(card);
  });
  // attach add buttons
  container.querySelectorAll('[data-add]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = Number(btn.getAttribute('data-add'));
      addToCart(id,1);
    })
  });
  // very simple carousel auto-scroll
  let scrollPos = 0;
  setInterval(()=> {
    if(!container) return;
    scrollPos += 280;
    if(scrollPos > container.scrollWidth - container.clientWidth) scrollPos = 0;
    container.scrollTo({left:scrollPos, behavior:'smooth'});
  }, 3500);
}

function renderProductsGrid(){
  const grid = document.getElementById('products-grid');
  if(!grid) return;
  grid.innerHTML = '';
  productsData.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.priceLabel}</p>
      <div style="display:flex;gap:8px;justify-content:center">
        <a class="small-btn" href="product-detail.html?slug=${p.slug}">جزئیات</a>
        <button class="small-btn" data-add="${p.id}">افزودن</button>
      </div>
    `;
    grid.appendChild(div);
  });
  grid.querySelectorAll('[data-add]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = Number(btn.getAttribute('data-add'));
      addToCart(id,1);
    })
  });
}

/* ---------------- filters on products page ---------------- */
function initProductFilters(){
  const search = document.getElementById('search');
  const maxPrice = document.getElementById('max-price');
  const clear = document.getElementById('clear-filters');
  if(!search && !maxPrice) return;
  function apply(){
    const q = search.value.trim();
    const max = Number(maxPrice.value) || Infinity;
    const filtered = productsData.filter(p=>{
      const nameMatch = p.name.includes(q);
      const priceMatch = p.price <= max;
      return nameMatch && priceMatch;
    });
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    filtered.forEach(p=>{
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `<img src="${p.img}" alt="${p.name}"><h3>${p.name}</h3><p>${p.priceLabel}</p>
        <div style="display:flex;gap:8px;justify-content:center"><a class="small-btn" href="product-detail.html?slug=${p.slug}">جزئیات</a><button class="small-btn" data-add="${p.id}">افزودن</button></div>`;
      grid.appendChild(div);
    });
    grid.querySelectorAll('[data-add]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        addToCart(Number(btn.getAttribute('data-add')),1);
      })
    });
  }
  [search, maxPrice].forEach(el=>el && el.addEventListener('input', apply));
  clear && clear.addEventListener('click', ()=>{
    if(search) search.value='';
    if(maxPrice) maxPrice.value='';
    apply();
  });
  apply();
}

/* ---------------- product detail ---------------- */
function renderProductDetail(){
  const root = document.getElementById('detail-root');
  if(!root) return;
  // read slug from query
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  let product = productsData.find(p=>p.slug===slug) || productsData[0];
  root.innerHTML = `
    <div>
      <img class="detail-img" src="${product.img}" alt="${product.name}">
    </div>
    <div class="detail-info">
      <h2>${product.name}</h2>
      <p class="price">${product.priceLabel}</p>
      <p>${product.desc}</p>
      <div style="margin-top:14px">
        <button class="btn primary" id="add-detail">افزودن به سبد خرید</button>
        <a class="btn ghost" href="contact.html">پرسش درباره محصول</a>
      </div>
    </div>
  `;
  document.getElementById('add-detail').addEventListener('click', ()=> addToCart(product.id,1));
}

/* ---------------- cart rendering ---------------- */
function renderCart(){
  const root = document.getElementById('cart-root');
  if(!root) return;
  const cart = getCart();
  if(cart.length===0){
    root.innerHTML = `<p>سبد خرید شما خالی است.</p>`;
    return;
  }
  let html = '';
  let total = 0;
  cart.forEach(item=>{
    const p = productsData.find(x=>x.id===item.id);
    const lineTotal = item.qty * (p ? p.price : item.price);
    total += lineTotal;
    html += `<div class="cart-item">
      <img src="${item.img}" alt="${item.name}">
      <div style="flex:1">
        <strong>${item.name}</strong>
        <div style="color:var(--muted);margin-top:6px">${(p? p.priceLabel : item.price.toLocaleString())}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:center">
        <div>تعداد: <input data-qty="${item.id}" type="number" value="${item.qty}" min="1" style="width:64px;padding:6px;border-radius:6px"></div>
        <button data-remove="${item.id}" class="btn ghost">حذف</button>
      </div>
    </div>`;
  });
  html += `<div style="margin-top:12px;padding:12px;border-radius:10px;background:rgba(255,255,255,0.02)">جمع کل: <strong>${total.toLocaleString()} تومان</strong></div>`;
  root.innerHTML = html;

  // attach qty change
  root.querySelectorAll('[data-qty]').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      const id = Number(inp.getAttribute('data-qty'));
      const cart = getCart();
      const found = cart.find(i=>i.id===id);
      if(found){
        found.qty = Math.max(1, Number(inp.value));
        saveCart(cart);
        renderCart();
      }
    })
  });
  root.querySelectorAll('[data-remove]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = Number(btn.getAttribute('data-remove'));
      removeFromCart(id);
      renderCart();
      showToast('محصول حذف شد');
    })
  });
}

/* ---------------- checkout summary ---------------- */
function renderCheckoutSummary(){
  const summary = document.getElementById('checkout-summary');
  if(!summary) return;
  const cart = getCart();
  if(cart.length===0){ summary.innerHTML = '<p>سبد خرید شما خالی است.</p>'; return; }
  let total = 0;
  let html = '<ul style="list-style:none;padding:0;margin:0">';
  cart.forEach(i=>{
    const p = productsData.find(x=>x.id===i.id);
    const price = p ? p.price : i.price;
    total += (price * i.qty);
    html += `<li style="padding:6px 0;border-bottom:1px dashed rgba(255,255,255,0.02)">${i.name} × ${i.qty} — ${ (price*i.qty).toLocaleString() } تومان</li>`
  });
  html += `</ul><div style="margin-top:10px">جمع کل: <strong>${total.toLocaleString()} تومان</strong></div>`;
  summary.innerHTML = html;
}

/* ---------------- small UI utils ---------------- */
function showToast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position='fixed';
  t.style.left='20px';
  t.style.bottom='20px';
  t.style.background='rgba(0,0,0,0.7)';
  t.style.color='#fff';
  t.style.padding='12px 16px';
  t.style.borderRadius='10px';
  t.style.zIndex=9999;
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity='0',2000);
  setTimeout(()=> t.remove(),2600);
}

/* ---------------- small interactions ---------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  updateCartCounts();
  renderCarousel();
  renderProductsGrid();
  renderProductDetail();
  renderCart();
  renderCheckoutSummary();
  initProductFilters();

  // bind clear cart button
  const clearBtn = document.getElementById('clear-cart');
  if(clearBtn) clearBtn.addEventListener('click', clearCart);

  // checkout form
  const checkoutForm = document.getElementById('checkout-form');
  if(checkoutForm) {
    checkoutForm.addEventListener('submit', e=>{
      e.preventDefault();
      // here you would post to server / payment / or send whatsapp
      const data = new FormData(checkoutForm);
      const summary = getCart().map(i=>`${i.name} ×${i.qty}`).join('%0A');
      const text = `سفارش جدید:%0A${summary}%0A%0Aنام:${data.get('name')}%0Aشماره:${data.get('phone')}%0Aآدرس:${data.get('address')}`;
      // open whatsapp for notification (optional)
      window.open(`https://wa.me/09229289822?text=${text}`,'_blank');
      clearCart();
      showToast('سفارش ارسال شد، از طریق واتساپ پیگیری کنید');
    })
  }

  // contact form simple
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      showToast('پیام ارسال شد، ما در اسرع وقت پاسخ می‌دهیم');
      contactForm.reset();
    })
  }

  // product detail add handled inside render
  // hamburger for mobile
  const ham = document.querySelector('.hamburger');
  const nav = document.querySelector('.main-nav');
  if(ham){
    ham.addEventListener('click', ()=> nav.style.display = nav.style.display==='flex' ? 'none':'flex');
  }

  // search param quick open: if no slug, open first product detail via click from index carousel details
  // prev/next for carousel (if present)
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const carousel = document.getElementById('carousel');
  if(prev && next && carousel){
    prev.addEventListener('click', ()=> carousel.scrollBy({left:-280, behavior:'smooth'}));
    next.addEventListener('click', ()=> carousel.scrollBy({left:280, behavior:'smooth'}));
  }

  // small parallax effect on scroll for hero
  const heroParallax = document.querySelector('.hero-parallax');
  if(heroParallax){
    window.addEventListener('scroll', ()=>{
      const y = window.scrollY;
      heroParallax.style.transform = `translateY(${y * 0.15}px) scale(${1 + Math.min(y/3000, 0.04)})`;
    })
  }

  // animate on appear (intersection observer)
  const io = new IntersectionObserver(entries=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting) ent.target.style.transform='translateY(0) translateZ(0) scale(1)';
    })
  }, {threshold:0.15});
  document.querySelectorAll('.feature, .product-card, .gallery .strip').forEach(el=>{
    el.style.transform='translateY(18px) scale(.995)';
    el.style.transition='transform .6s cubic-bezier(.2,.9,.3,1)';
    io.observe(el);
  });
});