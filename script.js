// =====================================
// PIRUNET - SISTEMA DE TIENDA
// =====================================

// PRECIOS EN PESOS ARGENTINOS
const PRICES = {
  1: { 7: 3000, 15: 4500, 30: 6000 },
  2: { 7: 5500, 15: 8000, 30: 11000 },
  3: { 7: 7500, 15: 11000, 30: 15000 },
  4: { 7: 9000, 15: 13500, 30: 18000 }
};

// CONFIGURACIÓN DE PIRUNET
const CONFIG = {
  mercadoPagoUrl: 'https://link.mercadopago.com.ar/pirunet',

  // REEMPLAZAR POR TU NÚMERO COMERCIAL
  // Formato internacional, sin +, espacios ni guiones.
  whatsappNumber: '549XXXXXXXXXX'
};

// ESTADO DE LA TIENDA
const state = {
  provider: 'Personal',
  days: 30,
  devices: 1,
  cart: []
};

const $ = selector => document.querySelector(selector);

// =====================================
// FUNCIONES GENERALES
// =====================================

function money(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount);
}

function durationLabel(days) {
  return days === 30 ? 'Un mes' : `${days} días`;
}

function deviceLabel(devices) {
  return devices === 1 ? 'dispositivo' : 'dispositivos';
}

function priceFor(devices, days) {
  return PRICES[devices][days];
}

// =====================================
// ACTUALIZAR SELECCIÓN
// =====================================

function updateSelection() {
  const price = priceFor(state.devices, state.days);

  $('#selectionName').textContent =
    `${state.provider} · ${durationLabel(state.days)} · ${state.devices} ${deviceLabel(state.devices)}`;

  $('#selectionPrice').textContent = money(price);

  $('#selectionNote').textContent =
    `Plan para ${state.devices} ${deviceLabel(state.devices)}`;
}

function setSelected(selector, attribute, value) {
  document.querySelectorAll(selector).forEach(button => {
    button.classList.toggle(
      'selected',
      button.dataset[attribute] === String(value)
    );
  });
}

// =====================================
// SELECCIÓN DE PROVEEDOR
// =====================================

document.querySelectorAll('[data-provider]').forEach(button => {
  button.addEventListener('click', () => {
    state.provider = button.dataset.provider;

    setSelected(
      '[data-provider]',
      'provider',
      state.provider
    );

    updateSelection();
  });
});

// =====================================
// SELECCIÓN DE DURACIÓN
// =====================================

document.querySelectorAll('[data-days]').forEach(button => {
  button.addEventListener('click', () => {
    state.days = Number(button.dataset.days);

    setSelected(
      '[data-days]',
      'days',
      state.days
    );

    updateSelection();
  });
});

// =====================================
// SELECCIÓN DE DISPOSITIVOS
// =====================================

document.querySelectorAll('[data-devices]').forEach(button => {
  button.addEventListener('click', () => {
    state.devices = Number(button.dataset.devices);

    setSelected(
      '[data-devices]',
      'devices',
      state.devices
    );

    updateSelection();
  });
});

// =====================================
// ANIMACIÓN DE NOTIFICACIÓN
// =====================================

function showToast() {
  const toast = $('#toast');

  toast.classList.add('show');

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

// =====================================
// AGREGAR AL CARRITO
// =====================================

function addToCart() {
  const item = {
    id: Date.now() + Math.random(),
    provider: state.provider,
    days: state.days,
    devices: state.devices,
    price: priceFor(state.devices, state.days)
  };

  state.cart.push(item);

  renderCart();
  showToast();

  const button = $('#addToCart');
  const original = button.innerHTML;

  button.innerHTML = '<span>✓</span> Agregado';
  button.classList.add('added');

  setTimeout(() => {
    button.innerHTML = original;
    button.classList.remove('added');
  }, 1100);

  $('#cartCount').animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.45)' },
      { transform: 'scale(1)' }
    ],
    { duration: 350 }
  );
}

$('#addToCart').addEventListener('click', addToCart);

// =====================================
// DIBUJAR CARRITO
// =====================================

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function renderCart() {
  const count = state.cart.length;

  const total = state.cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  $('#cartCount').textContent = count;
  $('#drawerCount').textContent = `(${count})`;
  $('#cartTotal').textContent = money(total);

  $('#cartFooter').hidden = count === 0;

  if (!count) {
    $('#cartItems').innerHTML = `
      <div class="empty-cart">
        <span>⌑</span>
        <b>Tu carrito está vacío</b>
        <p>Elegí un plan y agregalo para verlo acá.</p>
        <button class="text-link" id="backToPlans" type="button">
          Explorar planes →
        </button>
      </div>
    `;
    return;
  }

  $('#cartItems').innerHTML = state.cart.map(item => `
    <article class="cart-item">
      <div>
        <b>${escapeHTML(item.provider)} · ${durationLabel(item.days)}</b>
        <small>
          ${item.devices} ${deviceLabel(item.devices)}
        </small>
        <button
          class="remove-item"
          data-remove="${item.id}"
          type="button">
          Eliminar
        </button>
      </div>
      <strong>${money(item.price)}</strong>
    </article>
  `).join('');
}

// =====================================
// ELIMINAR PRODUCTOS
// =====================================

$('#cartItems').addEventListener('click', event => {
  const removeButton = event.target.closest('[data-remove]');

  if (removeButton) {
    state.cart = state.cart.filter(
      item => String(item.id) !== removeButton.dataset.remove
    );

    renderCart();
    return;
  }

  if (event.target.closest('#backToPlans')) {
    closeCart();

    $('#planes').scrollIntoView({
      behavior: 'smooth'
    });
  }
});

// =====================================
// ABRIR Y CERRAR CARRITO
// =====================================

function openCart() {
  $('#cartDrawer').classList.add('open');
  $('#cartBackdrop').classList.add('open');

  $('#cartDrawer').setAttribute('aria-hidden', 'false');

  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('#cartDrawer').classList.remove('open');
  $('#cartBackdrop').classList.remove('open');

  $('#cartDrawer').setAttribute('aria-hidden', 'true');

  document.body.style.overflow = '';
}

$('#openCart').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);
$('#cartBackdrop').addEventListener('click', closeCart);

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeCart();
  }
});

// =====================================
// VACIAR CARRITO
// =====================================

$('#clearCart').addEventListener('click', () => {
  state.cart = [];
  renderCart();
});

// =====================================
// CREAR PEDIDO PARA WHATSAPP
// =====================================

function orderMessage() {
  const lines = state.cart.map((item, index) => {
    return `${index + 1}. ${item.provider} | ${durationLabel(item.days)} | ${item.devices} ${deviceLabel(item.devices)} | ${money(item.price)}`;
  });

  const total = state.cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return `¡Hola! Quiero realizar este pedido de PiruNet:

${lines.join('\n')}

TOTAL: ${money(total)}

Voy a adjuntar el comprobante de pago para que puedan verificarlo.

¡Muchas gracias!`;
}

// =====================================
// MERCADO PAGO
// =====================================

$('#checkout').addEventListener('click', () => {
  if (!state.cart.length) return;

  window.open(
    CONFIG.mercadoPagoUrl,
    '_blank',
    'noopener,noreferrer'
  );
});

// =====================================
// ENVIAR PEDIDO POR WHATSAPP
// =====================================

$('#sendOrder').addEventListener('click', () => {
  if (!state.cart.length) return;

  if (!/^54\d{10,13}$/.test(CONFIG.whatsappNumber)) {
    alert('Configurá tu número comercial de WhatsApp en script.js antes de publicar.');
    return;
  }

  const url =
    `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(orderMessage())}`;

  window.open(
    url,
    '_blank',
    'noopener,noreferrer'
  );
});

// =====================================
// ANIMACIONES AL DESPLAZARSE
// =====================================

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12
});

document.querySelectorAll('.reveal').forEach(element => {
  observer.observe(element);
});

// =====================================
// AÑO AUTOMÁTICO
// =====================================

$('#year').textContent = new Date().getFullYear();

// =====================================
// INICIAR TIENDA
// =====================================

updateSelection();
renderCart();
