// حاتي المجنون - لوحة إدارة المحتوى السريعة للمالك (CMS Studio)
// Allows non-technical business owners to manage products dynamically in real-time

let editingProductId = null;

function toggleCmsModal() {
  const modal = document.getElementById('cms-studio-modal');
  if (!modal) return;
  const isHidden = modal.classList.contains('hidden');
  if (isHidden) {
    modal.classList.remove('hidden');
    renderCmsProductsTable();
  } else {
    modal.classList.add('hidden');
    resetCmsForm();
  }
}

// Render the CMS Dynamic Products Table
function renderCmsProductsTable() {
  const tableBody = document.getElementById('cms-products-tbody');
  const countEl = document.getElementById('cms-total-items-badge');
  if (!tableBody) return;

  if (countEl) countEl.textContent = `${siteData.products.length} صنف مسجل`;

  tableBody.innerHTML = siteData.products.map(prod => `
    <tr class="border-b border-stone-800 hover:bg-stone-900/60 transition">
      <td class="p-3 text-right">
        <div class="flex items-center gap-2">
          <img src="${prod.image || 'images/chicken_rice.jpg'}" alt="${prod.name}" class="w-10 h-10 object-cover rounded-lg border border-stone-700">
          <div>
            <div class="font-bold text-white text-sm">${prod.name}</div>
            <div class="text-[11px] text-stone-400">${prod.unit || 'وجبة'} • <span class="text-amber-400 font-mono">${prod.id}</span></div>
          </div>
        </div>
      </td>
      <td class="p-3 text-right">
        <span class="text-xs bg-stone-800 text-stone-300 px-2.5 py-1 rounded-md">${getCategoryArabicName(prod.category)}</span>
      </td>
      <td class="p-3 text-right">
        <div class="font-bold text-amber-400">${prod.discountPrice || prod.price} ج.م</div>
        ${prod.discountPrice ? `<div class="text-[11px] text-stone-500 line-through">${prod.price} ج.م</div>` : ''}
      </td>
      <td class="p-3 text-center">
        <button onclick="toggleProductAvailability('${prod.id}')" class="text-xs px-2.5 py-1 rounded-full font-bold ${prod.isAvailable !== false ? 'bg-green-950 text-green-300 border border-green-800' : 'bg-red-950 text-red-300 border border-red-800'}">
          ${prod.isAvailable !== false ? 'متوفر' : 'غير متوفر'}
        </button>
      </td>
      <td class="p-3 text-left">
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="editProductInCms('${prod.id}')" class="p-1.5 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 transition" title="تعديل">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="deleteProductFromCms('${prod.id}')" class="p-1.5 rounded-lg bg-stone-800 hover:bg-red-600 hover:text-white text-stone-300 transition" title="حذف">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function getCategoryArabicName(catId) {
  const map = {
    family_feasts: 'صواني العزومات واللمة',
    grills_kilo: 'مشويات بلدي بالكيلو',
    chicken_meals: 'فراخ وشيش على الفحم',
    single_meals: 'وجبات فردية وسريعة',
    sides_casseroles: 'طواجن ومقبلات وسلطات'
  };
  return map[catId] || catId;
}

// Open Form to Add New Product
function openAddNewProductForm() {
  editingProductId = null;
  document.getElementById('cms-form-title').textContent = '➕ إضافة صنف جديد للمنيو';
  document.getElementById('cms-prod-id').value = `prod-${String(siteData.products.length + 1).padStart(3, '0')}`;
  document.getElementById('cms-prod-name').value = '';
  document.getElementById('cms-prod-category').value = 'family_feasts';
  document.getElementById('cms-prod-price').value = '';
  document.getElementById('cms-prod-discount').value = '';
  document.getElementById('cms-prod-unit').value = '1 كجم';
  document.getElementById('cms-prod-weight').value = 'صافي وزن معتمد';
  document.getElementById('cms-prod-desc').value = '';
  document.getElementById('cms-prod-badge').value = '';
  document.getElementById('cms-prod-image').value = 'images/food_platter.jpg';
  document.getElementById('cms-prod-available').checked = true;

  document.getElementById('cms-edit-form-container').classList.remove('hidden');
}

// Open Form to Edit Existing Product
function editProductInCms(prodId) {
  const prod = siteData.products.find(p => p.id === prodId);
  if (!prod) return;

  editingProductId = prodId;
  document.getElementById('cms-form-title').textContent = `✏️ تعديل صنف: ${prod.name}`;
  document.getElementById('cms-prod-id').value = prod.id;
  document.getElementById('cms-prod-name').value = prod.name;
  document.getElementById('cms-prod-category').value = prod.category;
  document.getElementById('cms-prod-price').value = prod.price;
  document.getElementById('cms-prod-discount').value = prod.discountPrice || '';
  document.getElementById('cms-prod-unit').value = prod.unit || '';
  document.getElementById('cms-prod-weight').value = prod.weightInfo || '';
  document.getElementById('cms-prod-desc').value = prod.description || '';
  document.getElementById('cms-prod-badge').value = prod.badge || '';
  document.getElementById('cms-prod-image').value = prod.image || 'images/chicken_rice.jpg';
  document.getElementById('cms-prod-available').checked = prod.isAvailable !== false;

  document.getElementById('cms-edit-form-container').classList.remove('hidden');
}

// Save Product (Create or Update)
function saveProductFromCms(e) {
  e.preventDefault();

  const id = document.getElementById('cms-prod-id').value.trim();
  const name = document.getElementById('cms-prod-name').value.trim();
  const category = document.getElementById('cms-prod-category').value;
  const price = parseFloat(document.getElementById('cms-prod-price').value);
  const discountVal = document.getElementById('cms-prod-discount').value.trim();
  const discountPrice = discountVal ? parseFloat(discountVal) : null;
  const unit = document.getElementById('cms-prod-unit').value.trim();
  const weightInfo = document.getElementById('cms-prod-weight').value.trim();
  const description = document.getElementById('cms-prod-desc').value.trim();
  const badge = document.getElementById('cms-prod-badge').value.trim();
  const image = document.getElementById('cms-prod-image').value.trim() || 'images/chicken_rice.jpg';
  const isAvailable = document.getElementById('cms-prod-available').checked;

  if (!name || isNaN(price)) {
    alert('يرجى كتابة اسم الصنف والسعر بشكل صحيح');
    return;
  }

  if (editingProductId) {
    // Update existing
    const idx = siteData.products.findIndex(p => p.id === editingProductId);
    if (idx !== -1) {
      siteData.products[idx] = {
        ...siteData.products[idx],
        name,
        category,
        price,
        discountPrice,
        unit,
        weightInfo,
        description,
        badge: badge || null,
        image,
        isAvailable
      };
      showToast(`تم تحديث الصنف "${name}" بنجاح`);
    }
  } else {
    // Add new product
    const newProduct = {
      id: id || `prod-${Date.now()}`,
      name,
      category,
      price,
      discountPrice,
      unit,
      weightInfo,
      description,
      ingredients: ["لحم بلدي طازج", "بهارات حاتي"],
      image,
      badge: badge || null,
      isAvailable,
      isFeatured: false,
      preparationTime: "25-30 دقيقة",
      servings: "2 - 3 أفراد"
    };
    siteData.products.push(newProduct);
    showToast(`تمت إضافة الصنف الجديد "${name}" إلى القائمة!`);
  }

  // Refresh both CMS table and public UI
  renderCmsProductsTable();
  renderProducts();
  resetCmsForm();
}

// Delete Product
function deleteProductFromCms(prodId) {
  const prod = siteData.products.find(p => p.id === prodId);
  if (!prod) return;

  if (confirm(`هل أنت متأكد من حذف الصنف "${prod.name}" من قائمة الطعام؟`)) {
    siteData.products = siteData.products.filter(p => p.id !== prodId);
    renderCmsProductsTable();
    renderProducts();
    showToast(`تم حذف الصنف "${prod.name}" بنجاح`);
  }
}

// Toggle Availability
function toggleProductAvailability(prodId) {
  const prod = siteData.products.find(p => p.id === prodId);
  if (!prod) return;
  prod.isAvailable = prod.isAvailable === false ? true : false;
  renderCmsProductsTable();
  renderProducts();
  showToast(`تم تغيير حالة الصنف "${prod.name}" إلى: ${prod.isAvailable ? 'متوفر' : 'غير متوفر'}`);
}

function resetCmsForm() {
  editingProductId = null;
  const formContainer = document.getElementById('cms-edit-form-container');
  if (formContainer) formContainer.classList.add('hidden');
}

// Export updated products JSON file for owner or git commit
function exportProductsJson() {
  const jsonStr = JSON.stringify(siteData.products, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('تم تحميل ملف products.json المحدث بنجاح');
}
