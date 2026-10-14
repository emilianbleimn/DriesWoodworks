/* =========================================================================
   PEAZE — Movement Creates Flow
   ========================================================================= */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  const moneyText = cents => euro.format(cents / 100);
  // Michroma ships a broken U+20AC, so the sign gets the body face via <i class="eur">.
  const money = cents => moneyText(cents).replace('\u20AC', '<i class="eur">\u20AC</i>');

  /* ---------------------------------------------------------------- data */

  const CLOTHING = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const PRODUCTS = [
    {
      id: 'set', art: 'g-set', vb: '0 20 418 276', wide: true,
      name: 'PEAZE Complete Set', sub: 'Tracksuit + 1 Dose Padelbälle',
      price: 14500, was: 14800, sizes: CLOTHING, flag: '3 <i class="eur">€</i> sparen'
    },
    {
      id: 'tracksuit', art: 'g-jacket', vb: '0 0 300 372',
      name: 'PEAZE Tracksuit', sub: 'Jacke + Hose · Shell-Polyester',
      price: 12900, sizes: CLOTHING, flag: 'Bestseller'
    },
    {
      id: 'shorts', art: 'g-shorts', vb: '0 0 300 250',
      name: 'PEAZE Sport Shorts', sub: 'Mit Seitentaschen · leicht',
      price: 4900, sizes: CLOTHING
    },
    {
      id: 'tanktop', art: 'g-tank', vb: '0 0 300 290',
      name: 'PEAZE Tanktop', sub: 'Atmungsaktiv · Regular Fit',
      price: 3900, sizes: CLOTHING
    },
    {
      id: 'balls', art: 'g-balls', vb: '0 0 300 250',
      name: 'PEAZE Padel Balls', sub: '1 Dose · 3 Bälle mit PEAZE-Logo',
      price: 1900, sizes: null
    }
  ];

  const BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

  const WAYS = {
    tuerkis: 'Türkis', blau: 'Latin Blau', rot: 'Rot',
    orange: 'Orange', weiss: 'Weiss', schwarz: 'Schwarz'
  };

  /* --------------------------------------------------------------- toast */

  const toastEl = $('#toast');
  let toastTimer;
  const toast = msg => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  };

  /* ----------------------------------------------------------- colourway */

  const root = document.documentElement;

  const setWay = way => {
    if (!WAYS[way]) return;
    root.dataset.colorway = way;
    $$('.sw').forEach(b => {
      const on = b.dataset.way === way;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    try { localStorage.setItem('peaze:way', way); } catch {}
  };

  const swatches = $$('.sw');

  swatches.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      setWay(btn.dataset.way);
      toast(`Farbe: ${WAYS[btn.dataset.way]}`);
    });
    // role="radio" means one tab stop for the group plus arrow-key traversal
    btn.addEventListener('keydown', e => {
      const map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let next;
      if (e.key in map) next = (i + map[e.key] + swatches.length) % swatches.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = swatches.length - 1;
      else return;
      e.preventDefault();
      swatches[next].focus();
      setWay(swatches[next].dataset.way);
    });
  });

  let startWay = root.dataset.colorway || 'tuerkis';
  try {
    const saved = localStorage.getItem('peaze:way');
    if (saved && WAYS[saved]) startWay = saved;
  } catch {}
  setWay(startWay); // also seeds the roving tabindex

  /* ---------------------------------------------------------- product grid */

  const flat = (art, vb, label) =>
    `<svg class="flat" viewBox="${vb}" role="img" aria-label="${label}"><use href="#${art}"/></svg>`;

  const grid = $('#grid');

  grid.innerHTML = PRODUCTS.map(p => `
    <article class="card reveal${p.wide ? ' card--wide' : ''}" data-id="${p.id}">
      <div class="card__media">
        ${p.flag ? `<span class="card__flag">${p.flag}</span>` : ''}
        ${flat(p.art, p.vb, p.name)}
      </div>
      <div class="card__body">
        <h3 class="card__name">${p.name}</h3>
        <p class="card__sub">${p.sub}</p>
        <p class="card__price">
          <span>${money(p.price)}</span>
          ${p.was ? `<del>${money(p.was)}</del>` : ''}
        </p>
        ${p.sizes ? `
          <div class="card__sizes" role="group" aria-label="Grösse für ${p.name}">
            ${p.sizes.map((s, i) => `
              <button class="size" type="button" data-size="${s}" aria-pressed="${i === 2}">${s}</button>
            `).join('')}
          </div>` : ''}
        <button class="btn btn--solid" type="button" data-add="${p.id}">In den Warenkorb</button>
      </div>
    </article>
  `).join('');

  grid.addEventListener('click', e => {
    const sizeBtn = e.target.closest('.size');
    if (sizeBtn) {
      const group = sizeBtn.closest('.card__sizes');
      $$('.size', group).forEach(b => b.setAttribute('aria-pressed', String(b === sizeBtn)));
      return;
    }
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      const card = addBtn.closest('.card');
      const size = $('.size[aria-pressed="true"]', card)?.dataset.size ?? null;
      addToCart(addBtn.dataset.add, size);
    }
  });

  /* ----------------------------------------------------------------- cart */

  const KEY = 'peaze:cart';
  let cart = [];

  const load = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(raw)) {
        cart = raw.filter(l => BY_ID[l.id] && Number.isFinite(l.qty) && l.qty > 0)
                  .map(l => ({ id: l.id, size: l.size ?? null, way: l.way ?? 'tuerkis', qty: Math.min(99, l.qty | 0) }));
      }
    } catch { cart = []; }
  };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {} };

  const count = () => cart.reduce((n, l) => n + l.qty, 0);
  const total = () => cart.reduce((n, l) => n + BY_ID[l.id].price * l.qty, 0);

  const countEl = $('#cartCount');
  const bodyEl  = $('#cartBody');
  const footEl  = $('#cartFoot');
  const totalEl = $('#cartTotal');

  function renderCart() {
    const n = count();
    countEl.textContent = String(n);
    countEl.classList.remove('is-bump');
    void countEl.offsetWidth;
    if (n) countEl.classList.add('is-bump');
    $('#cartOpen').setAttribute('aria-label', n ? `Warenkorb öffnen, ${n} Artikel` : 'Warenkorb öffnen');

    if (!cart.length) {
      bodyEl.innerHTML = `
        <div class="cart__empty">
          <p>Dein Warenkorb ist noch leer.</p>
          <button class="btn btn--solid" type="button" data-close="cartDrawer">Jetzt shoppen</button>
        </div>`;
      footEl.hidden = true;
      return;
    }

    bodyEl.innerHTML = `<ul class="cart__list">${cart.map((l, i) => {
      const p = BY_ID[l.id];
      return `
        <li class="cart__item" data-i="${i}">
          <div class="cart__thumb">${flat(p.art, p.vb, '')}</div>
          <div class="cart__info">
            <h4 class="cart__name">${p.name}</h4>
            <p class="cart__opt">${WAYS[l.way]}${l.size ? ` · Grösse ${l.size}` : ''}</p>
            <div class="cart__row">
              <div class="qty">
                <button type="button" data-step="-1" aria-label="Menge verringern">−</button>
                <span>${l.qty}</span>
                <button type="button" data-step="1" aria-label="Menge erhöhen">+</button>
              </div>
              <span class="cart__price">${money(p.price * l.qty)}</span>
            </div>
            <button class="cart__del" type="button" data-del aria-label="${p.name} entfernen">Entfernen</button>
          </div>
        </li>`;
    }).join('')}</ul>`;

    totalEl.innerHTML = money(total());
    footEl.hidden = false;
  }

  function addToCart(id, size) {
    const p = BY_ID[id];
    if (!p) return;
    const way = root.dataset.colorway;
    const line = cart.find(l => l.id === id && l.size === size && l.way === way);
    if (line) line.qty = Math.min(99, line.qty + 1);
    else cart.push({ id, size, way, qty: 1 });
    save();
    renderCart();
    toast(`${p.name} hinzugefügt`);
  }

  bodyEl.addEventListener('click', e => {
    const item = e.target.closest('.cart__item');
    if (!item) return;
    const i = Number(item.dataset.i);
    if (e.target.closest('[data-del]')) cart.splice(i, 1);
    else if (e.target.closest('[data-step]')) {
      const step = Number(e.target.closest('[data-step]').dataset.step);
      cart[i].qty += step;
      if (cart[i].qty < 1) cart.splice(i, 1);
      else cart[i].qty = Math.min(99, cart[i].qty);
    } else return;
    save();
    renderCart();
  });

  $('#checkout').addEventListener('click', () => {
    toast('Demo-Shop — Checkout noch nicht angebunden');
  });

  load();
  renderCart();

  /* -------------------------------------------------------------- drawers */

  const hasSDA   = CSS.supports('animation-timeline: scroll()');
  const hasSIT   = CSS.supports('scroll-initial-target', 'nearest');
  const hasPop   = typeof HTMLElement.prototype.showPopover === 'function';
  const pageBits = [$('#main'), $('.head'), $('.foot'), $('.ticker')].filter(Boolean);

  function makeDrawer(el, side) {
    const scroller = $('.drawer__scroller', el);
    const sheet    = $('.drawer__sheet', el);
    const triggers = $$(`[aria-controls="${el.id}"]`);
    const maxScroll = () => scroller.scrollWidth - scroller.clientWidth;
    const openX  = () => (side === 'left' ? 0 : maxScroll());
    const closeX = () => (side === 'left' ? maxScroll() : 0);

    let veil = null;
    if (!hasPop) {
      el.classList.add('is-fallback');
      veil = document.createElement('div');
      veil.className = 'drawer__veil';
      el.prepend(veil);
    }

    const show = () => (hasPop ? el.showPopover() : el.classList.add('is-open'));
    const hide = () => (hasPop ? el.matches(':popover-open') && el.hidePopover() : el.classList.remove('is-open'));

    let isOpen = false;

    async function open() {
      if (isOpen) return;
      show();
      if (!hasSIT) {
        scroller.scrollTo({ left: closeX(), behavior: 'instant' });
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      }
      scroller.scrollTo({ left: openX(), behavior: 'auto' });
    }

    function close() {
      if (!isOpen && !el.matches('.is-open, :popover-open')) return;
      scroller.scrollTo({ left: closeX(), behavior: 'auto' });
    }

    function onOpened() {
      if (isOpen) return;
      isOpen = true;
      pageBits.forEach(n => { n.inert = true; });
      triggers.forEach(t => t.setAttribute('aria-expanded', 'true'));
      sheet.focus();
    }

    function onClosed() {
      hide();
      if (!isOpen) return;
      isOpen = false;
      pageBits.forEach(n => { n.inert = false; });
      triggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
      triggers[0]?.focus();
    }

    const tiny = 1 / Math.max(window.innerWidth, 1);
    new IntersectionObserver(entries => {
      const e = entries.at(-1);
      if (e.intersectionRatio < tiny) onClosed();
      else if (e.intersectionRatio === 1) onOpened();
    }, { root: el, threshold: [tiny, 1] }).observe(sheet);

    if (!hasSDA) {
      scroller.addEventListener('scroll', () => {
        const max = maxScroll() || 1;
        const r = side === 'left' ? 1 - scroller.scrollLeft / max : scroller.scrollLeft / max;
        el.style.setProperty('--drawer-backdrop', String(Math.min(1, Math.max(0, r))));
      }, { passive: true });
    }

    triggers.forEach(t => t.addEventListener('click', open));
    el.addEventListener('click', e => { if (!sheet.contains(e.target)) close(); });
    $$('[data-close]', el).forEach(b => b.addEventListener('click', close));
    sheet.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) close(); });

    return { open, close, el };
  }

  const drawers = [
    makeDrawer($('#navDrawer'), 'left'),
    makeDrawer($('#cartDrawer'), 'right')
  ];

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') drawers.forEach(d => d.close());
  });

  // "Jetzt shoppen" inside the empty cart is rendered after wiring, so delegate.
  bodyEl.addEventListener('click', e => {
    if (e.target.closest('[data-close="cartDrawer"]')) drawers[1].close();
  });

  /* ----------------------------------------------------------- newsletter */

  const form = $('#newsForm');
  const msg  = $('#newsMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#newsMail');
    const ok = input.value.trim() !== '' && input.checkValidity();
    msg.classList.toggle('is-err', !ok);
    if (!ok) {
      msg.textContent = 'Bitte gültige E-Mail-Adresse eingeben.';
      input.focus();
      return;
    }
    msg.textContent = 'Danke — Demo-Formular, es wird nichts gespeichert.';
    form.reset();
  });

  /* ------------------------------------------------------- sticky header */

  const head = $('#head');
  const hero = $('.hero');
  if (hero) {
    new IntersectionObserver(
      ([e]) => head.classList.toggle('is-stuck', !e.isIntersecting),
      { rootMargin: `-${parseInt(getComputedStyle(root).getPropertyValue('--head-h')) || 72}px 0px 0px 0px`, threshold: 0 }
    ).observe(hero);
  }

  /* ------------------------------------------------------- scroll reveal */

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const targets = $$('.ways, .tile, .card, .details__grid li, .spec__fig, .spec__meta, .story__copy, .socials, .news__form, .support__row');
    targets.forEach(t => t.classList.add('reveal'));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(t => io.observe(t));
  }

  /* --------------------------------------------------------------- misc */

  $('#year').textContent = String(new Date().getFullYear());
})();
