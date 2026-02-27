const MATERIAL_PRICES = {
  canvas: 2490,
  poster: 1790,
  framed: 3190,
};

const SIZE_MULTIPLIER = {
  '30x40': 1,
  '40x60': 1.35,
  '50x70': 1.7,
};

const CART_KEY = 'printcraft_cart';

function formatPrice(value) {
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

function getSelectedOrientation() {
  const selected = document.querySelector('input[name="orientation"]:checked');
  return selected ? selected.value : 'portrait';
}

function calculatePrice() {
  const material = document.getElementById('materialSelect')?.value;
  const size = document.getElementById('sizeSelect')?.value;
  if (!material || !size) return 0;
  return MATERIAL_PRICES[material] * SIZE_MULTIPLIER[size];
}

function updatePrice() {
  const price = calculatePrice();
  const priceEl = document.getElementById('priceValue');
  if (priceEl) priceEl.textContent = formatPrice(price);
  return price;
}

function updatePreviewClasses() {
  const preview = document.getElementById('previewWrapper');
  if (!preview) return;
  const crop = document.getElementById('cropSelect')?.value || 'fit';
  const orientation = getSelectedOrientation();
  preview.classList.remove('fill', 'fit', 'portrait', 'landscape');
  preview.classList.add(crop, orientation);
}

function handlePhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const img = document.getElementById('previewImage');
  const hint = document.getElementById('previewHint');
  if (!img || !hint) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
    img.style.display = 'block';
    hint.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function saveToCart() {
  const materialSelect = document.getElementById('materialSelect');
  const sizeSelect = document.getElementById('sizeSelect');
  const cropSelect = document.getElementById('cropSelect');
  if (!materialSelect || !sizeSelect || !cropSelect) return;

  const item = {
    title: 'Печать фото',
    material: materialSelect.options[materialSelect.selectedIndex].text,
    size: sizeSelect.value,
    crop: cropSelect.options[cropSelect.selectedIndex].text,
    orientation: getSelectedOrientation() === 'portrait' ? 'Вертикальная' : 'Горизонтальная',
    price: Math.round(updatePrice()),
  };

  localStorage.setItem(CART_KEY, JSON.stringify([item]));
  window.location.href = 'cart.html';
}

function renderCart() {
  const host = document.getElementById('cartContent');
  if (!host) return;

  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  if (!cart.length) {
    host.innerHTML = '<p class="muted">Корзина пока пустая.</p>';
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  host.innerHTML = `
    <div class="cart-card">
      <h3>${cart[0].title}</h3>
      <p>Материал: ${cart[0].material}</p>
      <p>Размер: ${cart[0].size}</p>
      <p>Кроп: ${cart[0].crop}</p>
      <p>Ориентация: ${cart[0].orientation}</p>
      <p><strong>${formatPrice(cart[0].price)}</strong></p>
      <a class="btn-primary" style="display:grid;place-items:center;text-decoration:none" href="checkout.html">Оформить заказ</a>
    </div>
    <p><strong>Итого: ${formatPrice(total)}</strong></p>
  `;
}

function renderCheckoutSummary() {
  const host = document.getElementById('summaryContent');
  if (!host) return;

  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const item = cart[0];
  if (!item) {
    host.innerHTML = '<p>Корзина пуста</p>';
    return;
  }

  host.innerHTML = `
    <div class="summary-line"><span>Товар</span><span>${item.title}</span></div>
    <div class="summary-line"><span>Материал</span><span>${item.material}</span></div>
    <div class="summary-line"><span>Размер</span><span>${item.size}</span></div>
    <div class="summary-line"><span>Ориентация</span><span>${item.orientation}</span></div>
    <hr />
    <div class="summary-line total"><span>Итого</span><span>${formatPrice(item.price)}</span></div>
  `;
}

function initConstructor() {
  const material = document.getElementById('materialSelect');
  const size = document.getElementById('sizeSelect');
  const crop = document.getElementById('cropSelect');
  const photo = document.getElementById('photoInput');
  const addBtn = document.getElementById('addToCartBtn');

  if (!material || !size || !crop || !photo || !addBtn) return;

  [material, size, crop].forEach((el) => el.addEventListener('change', () => {
    updatePrice();
    updatePreviewClasses();
  }));

  document.querySelectorAll('input[name="orientation"]').forEach((input) => {
    input.addEventListener('change', updatePreviewClasses);
  });

  photo.addEventListener('change', handlePhotoUpload);
  addBtn.addEventListener('click', saveToCart);

  updatePrice();
  updatePreviewClasses();
}

initConstructor();
renderCart();
renderCheckoutSummary();
