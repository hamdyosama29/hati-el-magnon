// حاتي المجنون (العبور الجديدة) - المحرك التفاعلي للموقع
// Universal AI Business Growth & Website Architecture

// Initial State with Instant Fallback
let siteData = {
  business: window.INITIAL_BUSINESS || null,
  categories: window.INITIAL_CATEGORIES || [],
  products: window.INITIAL_PRODUCTS || [],
  offers: window.INITIAL_OFFERS || [],
  reviews: window.INITIAL_REVIEWS || []
};

// Global Shopping Cart
let cart = [];

// Calculator State
let feastState = {
  guests: 6,
  meats: {
    kofta: true,
    chicken: true,
    chops: false,
    shish: true,
    tarb: false
  },
  saltLevel: 'مظبوط (تتبيلة متوازنة)',
  sides: ['rice', 'salads', 'bread']
};

let activeCategory = 'all';
let searchQuery = '';

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved cart from session storage if exists
  const savedCart = sessionStorage.getItem('hati_cart');
  if (savedCart) {
    try { cart = JSON.parse(savedCart); } catch (e) { cart = []; }
  }

  // Attempt live HTTP fetch for dynamic updates (Pages CMS / Vercel), else use initial data
  await loadLiveHttpData();

  // Setup interactions and render all sections
  setupEventListeners();
  renderHeroAndBusinessInfo();
  renderOffers();
  renderCategories();
  renderProducts();
  renderReviews();
  updateFeastCalculator();
  updateCartUI();
});

// Load live data if running on a web server (http / https)
async function loadLiveHttpData() {
  if (window.location.protocol.startsWith('http')) {
    try {
      const [bizRes, catRes, prodRes, offRes, revRes] = await Promise.all([
        fetch('data/business.json').then(r => r.json()),
        fetch('data/categories.json').then(r => r.json()),
        fetch('data/products.json').then(r => r.json()),
        fetch('data/offers.json').then(r => r.json()),
        fetch('data/reviews.json').then(r => r.json())
      ]);

      siteData.business = bizRes;
      siteData.categories = catRes;
      siteData.products = prodRes;
      siteData.offers = offRes;
      siteData.reviews = revRes;
    } catch (e) {
      console.log('Using initial embedded data state.');
    }
  }
}

// Render Business Information & Badges
function renderHeroAndBusinessInfo() {
  if (!siteData.business) return;
  const b = siteData.business;

  // Title & Slogan
  const bizTitle = document.getElementById('biz-title');
  if (bizTitle) bizTitle.textContent = b.name;

  const bizSlogan = document.getElementById('biz-slogan');
  if (bizSlogan) bizSlogan.textContent = b.slogan;

  // Working Hours & Address
  const hoursEl = document.getElementById('biz-hours');
  if (hoursEl) hoursEl.textContent = b.workingHours;

  const addressEl = document.getElementById('biz-address');
  if (addressEl) addressEl.textContent = b.address;

  // Delivery Areas
  const deliveryList = document.getElementById('delivery-zones-list');
  if (deliveryList && b.deliveryService && b.deliveryService.coverageAreas) {
    deliveryList.innerHTML = b.deliveryService.coverageAreas.map(zone => 
      `<span class="inline-flex items-center bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-full text-xs text-amber-300 font-semibold ml-2 mb-2">
        <i data-lucide="map-pin" class="w-3.5 h-3.5 ml-1 text-red-500"></i> ${zone}
      </span>`
    ).join('');
  }

  if (window.lucide) lucide.createIcons();
}

// Render Special Offers Cards
function renderOffers() {
  const container = document.getElementById('offers-container');
  if (!container || !siteData.offers) return;

  container.innerHTML = siteData.offers.map(offer => `
    <div class="card-luxury rounded-2xl overflow-hidden flex flex-col justify-between border-stone-800 hover:border-amber-500/40 group">
      <div class="relative h-48 overflow-hidden bg-stone-900">
        <img src="${offer.image}" alt="${offer.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='images/food_chicken.jpg'">
        <div class="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>
        <span class="absolute top-3 right-3 badge-gold text-xs px-3 py-1 rounded-full shadow-md font-extrabold">${offer.badge}</span>
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-white mb-2 leading-snug">${offer.title}</h3>
          <p class="text-xs text-stone-300 mb-4 leading-relaxed">${offer.description}</p>
        </div>
        <div class="pt-3 border-t border-stone-800 flex items-center justify-between">
          <div>
            ${offer.salePrice ? `
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-black text-amber-400 font-mono">${offer.salePrice}</span>
                <span class="text-xs font-bold text-amber-200">ج.م</span>
                ${offer.originalPrice ? `<span class="text-xs text-stone-500 line-through mr-1">${offer.originalPrice}</span>` : ''}
              </div>
            ` : `<span class="text-xs font-bold text-amber-300">${offer.highlight}</span>`}
          </div>
          <button onclick="orderOfferDirectly('${offer.id}')" class="btn-primary text-xs px-4 py-2 rounded-xl flex items-center font-bold">
            <span>اطلب الآن</span>
            <i data-lucide="arrow-left" class="w-3.5 h-3.5 mr-1"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// Render Categories Bar
function renderCategories() {
  const container = document.getElementById('categories-tabs');
  if (!container || !siteData.categories) return;

  container.innerHTML = siteData.categories.map((cat, idx) => `
    <button onclick="filterCategory('${cat.id}')" id="cat-tab-${cat.id}" class="category-pill ${cat.id === activeCategory ? 'active' : ''} shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer">
      <span>${cat.name}</span>
    </button>
  `).join('');
}

function filterCategory(catId) {
  activeCategory = catId;
  document.querySelectorAll('.category-pill').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`cat-tab-${catId}`);
  if (activeBtn) activeBtn.classList.add('active');
  renderProducts();
}

function handleSearch(query) {
  searchQuery = query.trim().toLowerCase();
  renderProducts();
}

// Render Products Grid
function renderProducts() {
  const container = document.getElementById('products-grid');
  const countBadge = document.getElementById('products-count');
  if (!container) return;

  let filtered = siteData.products || [];

  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchQuery) ||
      (p.description && p.description.toLowerCase().includes(searchQuery)) ||
      (p.ingredients && p.ingredients.some(ing => ing.toLowerCase().includes(searchQuery)))
    );
  }

  if (countBadge) {
    countBadge.textContent = `${filtered.length} صنف متاح للطلب`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-stone-400">
        <i data-lucide="utensils-crossed" class="w-12 h-12 mx-auto mb-3 text-amber-500/50"></i>
        <h4 class="text-base font-bold text-stone-200">لم يتم العثور على أطباق مطابقة</h4>
        <p class="text-xs mt-1 text-stone-400">جرب البحث بكلمة مثل: كفتة، فرخة، ريش، صينية</p>
        <button onclick="filterCategory('all'); document.getElementById('menu-search').value='';" class="mt-4 btn-secondary text-xs px-4 py-2 rounded-xl">
          عرض كل المنيو
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(prod => {
    const isOut = prod.isAvailable === false;
    const finalPrice = prod.discountPrice || prod.price;
    const hasDiscount = prod.discountPrice && prod.discountPrice < prod.price;

    return `
      <div class="card-luxury rounded-2xl overflow-hidden flex flex-col justify-between group border-stone-800 ${isOut ? 'opacity-60' : ''}">
        <div class="relative h-48 overflow-hidden bg-stone-900">
          <img src="${prod.image || 'images/food_platter.jpg'}" alt="${prod.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='images/food_platter.jpg'">
          <div class="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>
          
          ${prod.badge ? `
            <span class="absolute top-3 right-3 badge-gold text-[11px] px-2.5 py-0.5 rounded-full shadow-md font-black">${prod.badge}</span>
          ` : ''}

          ${isOut ? `
            <span class="absolute top-3 left-3 bg-red-600/95 text-white text-[11px] px-2.5 py-1 rounded-md font-bold">غير متوفر حالياً</span>
          ` : ''}

          <div class="absolute bottom-2.5 right-3 text-[11px] text-stone-200 bg-stone-900/90 border border-stone-700/60 px-2 py-0.5 rounded-md backdrop-blur">
            ${prod.unit || 'وجبة'}
          </div>
        </div>

        <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-amber-400 transition mb-1 leading-snug">${prod.name}</h3>
            
            <p class="text-xs text-stone-400 line-clamp-2 mb-3 leading-relaxed">${prod.description || 'مشويات طازجة على الفحم بتتبيلة حاتي المجنون المعتمدة.'}</p>
            
            ${prod.weightInfo ? `
              <div class="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg mb-3 flex items-center gap-1.5 font-medium">
                <i data-lucide="scale" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>
                <span class="truncate">${prod.weightInfo}</span>
              </div>
            ` : ''}
          </div>

          <div class="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
            <div>
              <div class="flex items-baseline gap-1">
                <span class="text-xl font-black text-amber-400 font-mono">${finalPrice}</span>
                <span class="text-xs font-bold text-amber-200">ج.م</span>
                ${hasDiscount ? `<span class="text-[11px] text-stone-500 line-through mr-1 font-mono">${prod.price}</span>` : ''}
              </div>
            </div>

            <button onclick="addToCart('${prod.id}')" ${isOut ? 'disabled' : ''} class="${isOut ? 'bg-stone-800 text-stone-500 cursor-not-allowed' : 'btn-gold'} text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition">
              <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
              <span>${isOut ? 'نفد' : 'أضف للطلب'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// -------------------------------------------------------------
// UNIQUE SALES FEATURE: Smart Feast & Gathering Planner
// "حاسبة عزومات المجنون الذكية"
// -------------------------------------------------------------

function setGuests(num) {
  feastState.guests = parseInt(num);
  document.querySelectorAll('.guest-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.guests) === feastState.guests);
  });
  updateFeastCalculator();
}

function toggleMeat(type) {
  feastState.meats[type] = !feastState.meats[type];
  const card = document.getElementById(`meat-card-${type}`);
  if (card) {
    card.classList.toggle('selected', feastState.meats[type]);
    const checkIcon = card.querySelector('.meat-check');
    if (checkIcon) {
      checkIcon.style.display = feastState.meats[type] ? 'block' : 'none';
    }
  }
  updateFeastCalculator();
}

function setSaltLevel(level) {
  feastState.saltLevel = level;
  document.querySelectorAll('.salt-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.salt === level);
  });
  updateFeastCalculator();
}

function updateFeastCalculator() {
  const g = feastState.guests;
  
  // Weight: ~350 grams cooked meat per guest
  const totalMeatGrams = g * 350;
  
  const activeMeats = Object.keys(feastState.meats).filter(k => feastState.meats[k]);
  const meatCount = Math.max(1, activeMeats.length);
  const gramsPerType = Math.round(totalMeatGrams / meatCount);

  // Price calculation
  const estimatedCost = Math.round((totalMeatGrams / 1000) * 480 + (g * 25));
  const costPerPerson = Math.round(estimatedCost / g);

  // Free Sides Calculation
  const freeSalads = g;
  const freeTahina = g;
  const freeBread = Math.round(g * 1.5);
  const basmatiPlatters = Math.ceil(g / 3);

  // Update UI Elements
  const meatWeightEl = document.getElementById('calc-meat-weight');
  if (meatWeightEl) meatWeightEl.textContent = `${(totalMeatGrams / 1000).toFixed(2)} كجم صافي`;

  const totalCostEl = document.getElementById('calc-total-cost');
  if (totalCostEl) totalCostEl.textContent = `${estimatedCost}`;

  const costPerGuestEl = document.getElementById('calc-cost-per-guest');
  if (costPerGuestEl) costPerGuestEl.textContent = `(حوالي ${costPerPerson} ج.م للفرد)`;

  const freeGiftsEl = document.getElementById('calc-free-gifts');
  if (freeGiftsEl) {
    freeGiftsEl.innerHTML = `
      <div class="flex items-center gap-1.5 text-stone-200"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0"></i> <span>${basmatiPlatters} سرفيس أرز بسمتي فاخر</span></div>
      <div class="flex items-center gap-1.5 text-stone-200"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0"></i> <span>${freeSalads} علبة سلطة خضراء بلدي</span></div>
      <div class="flex items-center gap-1.5 text-stone-200"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0"></i> <span>${freeTahina} علبة طحينة بيور سمسم</span></div>
      <div class="flex items-center gap-1.5 text-stone-200"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0"></i> <span>${freeBread} رغيف عيش بلدي سخن محمص</span></div>
    `;
  }

  const meatNamesMap = {
    kofta: 'كفتة بلدي',
    chicken: 'فراخ ع الفحم',
    chops: 'ريش وكباب',
    shish: 'شيش طاووق',
    tarb: 'طرب ضاني'
  };

  const breakdownEl = document.getElementById('calc-meats-breakdown');
  if (breakdownEl) {
    breakdownEl.innerHTML = activeMeats.map(m => `
      <span class="inline-block bg-stone-900 text-amber-300 text-xs px-2.5 py-1 rounded-lg ml-1.5 mb-1.5 border border-stone-700/80 font-medium">
        ${meatNamesMap[m]} (~${(gramsPerType/1000).toFixed(2)} كجم)
      </span>
    `).join('');
  }

  if (window.lucide) lucide.createIcons();
}

// Order the customized feast directly via WhatsApp
function orderFeastViaWhatsApp() {
  const g = feastState.guests;
  const totalCost = document.getElementById('calc-total-cost')?.textContent || '';
  const meatWeight = document.getElementById('calc-meat-weight')?.textContent || '';

  const activeMeatNames = Object.keys(feastState.meats)
    .filter(k => feastState.meats[k])
    .map(k => {
      const map = { kofta: 'كفتة بلدي', chicken: 'فراخ ع الفحم', chops: 'ريش وكباب', shish: 'شيش طاووق', tarb: 'طرب' };
      return map[k];
    }).join(' + ');

  const text = `السلام عليكم ورحمة الله،
أود طلب صينية عزومة مفصلة من "حاسبة عزومات المجنون الذكية":
👥 عدد الأفراد: ${g} أفراد
🥩 تشكيلة المشاوي: ${activeMeatNames}
⚖️ إجمالي الوزن الصافي: ${meatWeight}
🧂 درجة الملح والتتبيلة: ${feastState.saltLevel}
💰 التكلفة المقدرة: ${totalCost} جنيه مصري
🎁 شاملة الأرز البسمتي والسلطات والطحينة والعيش السخن مجاناً.

📍 العنوان للتوصيل: (العبور الجديدة - عمارة ...)`;

  const phone = siteData.business?.whatsapp || '201093078227';
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
}

// -------------------------------------------------------------
// Shopping Cart Operations
// -------------------------------------------------------------

function addToCart(prodId) {
  const product = siteData.products.find(p => p.id === prodId);
  if (!product) return;

  const existing = cart.find(item => item.id === prodId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      unit: product.unit || 'وجبة',
      image: product.image || 'images/food_platter.jpg',
      qty: 1
    });
  }

  sessionStorage.setItem('hati_cart', JSON.stringify(cart));
  updateCartUI();
  showToast(`تمت إضافة "${product.name}" إلى الطلب بنجاح`);
}

function updateCartQty(prodId, delta) {
  const item = cart.find(i => i.id === prodId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== prodId);
  }

  sessionStorage.setItem('hati_cart', JSON.stringify(cart));
  updateCartUI();
}

function removeFromCart(prodId) {
  cart = cart.filter(i => i.id !== prodId);
  sessionStorage.setItem('hati_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  // Badge count for all header and bottom nav badges
  const badges = document.querySelectorAll('.cart-count-badge');
  badges.forEach(b => {
    b.textContent = totalCount;
    b.style.display = totalCount > 0 ? 'flex' : 'none';
  });

  const itemsContainer = document.getElementById('cart-items-list');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartTotal = document.getElementById('cart-total');
  const emptyMessage = document.getElementById('cart-empty-message');
  const checkoutSection = document.getElementById('cart-checkout-section');

  if (cartSubtotal) cartSubtotal.textContent = `${totalPrice} ج.م`;
  if (cartTotal) cartTotal.textContent = `${totalPrice} ج.م`;

  if (!itemsContainer) return;

  if (cart.length === 0) {
    if (emptyMessage) emptyMessage.style.display = 'block';
    if (checkoutSection) checkoutSection.style.display = 'none';
    itemsContainer.innerHTML = '';
  } else {
    if (emptyMessage) emptyMessage.style.display = 'none';
    if (checkoutSection) checkoutSection.style.display = 'block';

    itemsContainer.innerHTML = cart.map(item => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800">
        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded-lg ml-3">
        <div class="flex-1">
          <h4 class="text-xs sm:text-sm font-bold text-white leading-tight mb-1">${item.name}</h4>
          <span class="text-xs text-amber-400 font-bold font-mono">${item.price} ج.م</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="updateCartQty('${item.id}', -1)" class="w-7 h-7 rounded-lg bg-stone-800 text-white font-bold flex items-center justify-center hover:bg-stone-700">-</button>
          <span class="text-xs sm:text-sm font-bold text-white px-1 font-mono">${item.qty}</span>
          <button onclick="updateCartQty('${item.id}', 1)" class="w-7 h-7 rounded-lg bg-stone-800 text-white font-bold flex items-center justify-center hover:bg-stone-700">+</button>
        </div>
      </div>
    `).join('');
  }

  if (window.lucide) lucide.createIcons();
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (!drawer) return;

  const isOpen = drawer.classList.contains('open');
  if (isOpen) {
    drawer.classList.remove('open');
    drawer.classList.add('closed');
    if (overlay) overlay.style.display = 'none';
  } else {
    drawer.classList.remove('closed');
    drawer.classList.add('open');
    if (overlay) overlay.style.display = 'block';
  }
}

// Send complete cart order to WhatsApp
function checkoutViaWhatsApp() {
  if (cart.length === 0) return;

  const customerName = document.getElementById('order-customer-name')?.value || 'عميل حاتي المجنون';
  const customerAddress = document.getElementById('order-customer-address')?.value || 'العبور الجديدة';
  const customerNotes = document.getElementById('order-customer-notes')?.value || 'بدون ملاحظات خاصة';
  const saltPreference = document.querySelector('input[name="cart-salt"]:checked')?.value || 'مظبوط';

  let itemsSummary = '';
  let totalPrice = 0;

  cart.forEach((item, idx) => {
    const itemTotal = item.price * item.qty;
    totalPrice += itemTotal;
    itemsSummary += `${idx + 1}. ${item.name} (عدد ${item.qty}) = ${itemTotal} ج.م\n`;
  });

  const message = `السلام عليكم ورحمة الله،
أود تأكيد طلب دليفري من موقع "حاتي المجنون - العبور الجديدة":

📋 تفاصيل الطلب:
${itemsSummary}
💰 الإجمالي: ${totalPrice} جنيه مصري

👤 اسم العميل: ${customerName}
📍 العنوان: ${customerAddress}
🧂 درجة الملح والتتبيلة: ${saltPreference}
📝 ملاحظات: ${customerNotes}

يرجى تأكيد الاستلام ووقت وصول الدليفري السخن. شكراً لكم!`;

  const phone = siteData.business?.whatsapp || '201093078227';
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

function orderOfferDirectly(offerId) {
  const offer = siteData.offers.find(o => o.id === offerId);
  if (!offer) return;

  const text = `السلام عليكم حاتي المجنون،
أود طلب "${offer.title}" بسعر العرض (${offer.salePrice || offer.originalPrice} ج.م) مع التوصيل بالعبور الجديدة.`;

  const phone = siteData.business?.whatsapp || '201093078227';
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
}

// Render Google Reviews & Transparent Management Responses
function renderReviews() {
  const container = document.getElementById('reviews-container');
  if (!container || !siteData.reviews) return;

  container.innerHTML = siteData.reviews.map(rev => `
    <div class="card-luxury p-5 rounded-2xl border-stone-800 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
              ${rev.author.charAt(0)}
            </div>
            <div>
              <h4 class="font-bold text-white text-sm">${rev.author}</h4>
              <span class="text-[11px] text-stone-400">${rev.date} • ${rev.orderType}</span>
            </div>
          </div>
          <div class="flex text-amber-400">
            ${Array.from({ length: 5 }, (_, i) => `
              <i data-lucide="star" class="w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}"></i>
            `).join('')}
          </div>
        </div>
        <p class="text-stone-300 text-xs sm:text-sm leading-relaxed mb-4">"${rev.comment}"</p>
      </div>

      ${rev.responseFromOwner ? `
        <div class="mt-3 p-3 bg-amber-500/10 border-r-3 border-amber-500 rounded-l-xl text-xs">
          <div class="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
            <span>رد إدارة حاتي المجنون:</span>
          </div>
          <p class="text-stone-300 leading-normal text-[11px]">${rev.responseFromOwner}</p>
        </div>
      ` : ''}
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// Toast notification helper
function showToast(msg) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-stone-900 border border-amber-500/60 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 transform transition duration-300 translate-y-20 opacity-0 toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-amber-400 shrink-0"></i> <span class="text-xs sm:text-sm font-semibold">${msg}</span>`;
  if (window.lucide) lucide.createIcons();

  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2600);
}

function setupEventListeners() {
  const searchInput = document.getElementById('menu-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  }
}
