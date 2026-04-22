/**
 * Product rendering + filtering + detail modal.
 * Exposes window.IshiraaProducts for page scripts to drive.
 */
(function () {
  'use strict';

  const STATUS_LABELS = {
    available: null,
    out_of_stock: 'Out of stock',
    coming_soon: 'Coming soon'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function badgeFor(product) {
    const items = [];
    if (product.isNew && product.status !== 'out_of_stock') items.push(`<span class="badge badge--new">New</span>`);
    if (product.status === 'out_of_stock') items.push(`<span class="badge badge--out">Sold out</span>`);
    if (product.status === 'coming_soon')  items.push(`<span class="badge badge--soon">Coming soon</span>`);
    return items.join('');
  }

  function primaryImage(product) {
    const img = (product.images || [])[0];
    if (img) return img;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23f2ece3"/><text x="50%" y="50%" font-family="serif" font-size="22" text-anchor="middle" fill="%238a8a8a" dominant-baseline="middle">Ishiraa</text></svg>`
    );
  }

  function cardHTML(product) {
    const price = window.formatPrice ? window.formatPrice(product.price) : `₹${product.price}`;
    const disabled = product.status === 'out_of_stock';
    const btnLabel = product.status === 'coming_soon' ? 'Enquire' : (disabled ? 'Notify me' : 'Buy via WhatsApp');
    return `
      <article class="product-card" data-id="${esc(product.id)}">
        <div class="product-card__media">
          <div class="product-card__badges">${badgeFor(product)}</div>
          <img src="${esc(primaryImage(product))}" alt="${esc(product.name)}" loading="lazy">
        </div>
        <div class="product-card__body">
          <div class="product-card__cat">${esc(product.category || '')}</div>
          <h3 class="product-card__name">${esc(product.name)}</h3>
          <div class="product-card__price">${price}</div>
          <div class="product-card__actions">
            <button class="btn btn--ghost btn--sm" data-action="view">Details</button>
            <a class="btn btn--wa btn--sm" data-action="whatsapp" href="${window.IshiraaWA.productLink(product)}" target="_blank" rel="noopener">${btnLabel}</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderGrid(mount, products) {
    if (!products.length) {
      mount.innerHTML = `<div class="empty-state"><h3>No pieces match your filters</h3><p>Try loosening a filter or resetting.</p></div>`;
      return;
    }
    mount.innerHTML = products.map(cardHTML).join('');
    mount.querySelectorAll('.product-card').forEach(card => {
      card.querySelector('[data-action="view"]').addEventListener('click', () => openModal(card.dataset.id));
    });
  }

  // ---------- Modal ----------
  function ensureModal() {
    let el = document.getElementById('productModal');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'productModal';
    el.className = 'modal-backdrop';
    el.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <button class="modal__close" aria-label="Close">&times;</button>
        <div class="modal__media">
          <img id="modalImg" src="" alt="">
          <div class="modal__thumbs" id="modalThumbs"></div>
        </div>
        <div class="modal__body">
          <div class="modal__cat" id="modalCat"></div>
          <h2 id="modalTitle"></h2>
          <div class="modal__price" id="modalPrice"></div>
          <div class="modal__code" id="modalCode"></div>
          <p class="modal__desc" id="modalDesc"></p>
          <div class="modal__attr">
            <strong>Sizes</strong>
            <div class="modal__attr-list" id="modalSizes"></div>
          </div>
          <div class="modal__attr">
            <strong>Colours</strong>
            <div class="modal__attr-list" id="modalColors"></div>
          </div>
          <div class="modal__attr" id="modalStatusWrap" hidden>
            <strong>Availability</strong>
            <div id="modalStatus"></div>
          </div>
          <div class="modal__actions">
            <a class="btn btn--wa" id="modalWA" href="#" target="_blank" rel="noopener">Buy via WhatsApp</a>
            <button class="btn btn--ghost" id="modalCloseBtn">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    const close = () => el.classList.remove('open');
    el.addEventListener('click', (e) => { if (e.target === el) close(); });
    el.querySelector('.modal__close').addEventListener('click', close);
    el.querySelector('#modalCloseBtn').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    return el;
  }

  function openModal(id) {
    const p = window.IshiraaStore.getById(id);
    if (!p) return;
    const el = ensureModal();
    const images = (p.images && p.images.length) ? p.images : [primaryImage(p)];
    const img = el.querySelector('#modalImg');
    img.src = images[0]; img.alt = p.name;
    const thumbs = el.querySelector('#modalThumbs');
    thumbs.innerHTML = images.length > 1
      ? images.map((src, i) => `<button data-i="${i}" class="${i===0?'active':''}"><img src="${esc(src)}" alt=""></button>`).join('')
      : '';
    thumbs.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      thumbs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      img.src = images[+btn.dataset.i];
    }));
    el.querySelector('#modalCat').textContent = p.category || '';
    el.querySelector('#modalTitle').textContent = p.name;
    el.querySelector('#modalPrice').textContent = window.formatPrice ? window.formatPrice(p.price) : `₹${p.price}`;
    el.querySelector('#modalCode').textContent = p.code ? `Code: ${p.code}` : '';
    el.querySelector('#modalDesc').textContent = p.description || '';
    el.querySelector('#modalSizes').innerHTML  = (p.sizes  || ['—']).map(s => `<span class="pill">${esc(s)}</span>`).join('');
    el.querySelector('#modalColors').innerHTML = (p.colors || ['—']).map(c => `<span class="pill">${esc(c)}</span>`).join('');

    const statusWrap = el.querySelector('#modalStatusWrap');
    const statusLabel = STATUS_LABELS[p.status];
    if (statusLabel) {
      statusWrap.hidden = false;
      el.querySelector('#modalStatus').textContent = statusLabel;
    } else {
      statusWrap.hidden = true;
    }

    const wa = el.querySelector('#modalWA');
    wa.href = window.IshiraaWA.productLink(p);
    wa.textContent = p.status === 'coming_soon' ? 'Enquire on WhatsApp'
                   : p.status === 'out_of_stock' ? 'Notify me on WhatsApp'
                   : 'Buy via WhatsApp';

    el.classList.add('open');
  }

  // ---------- Filter engine ----------
  function applyFilters(products, state) {
    const q = (state.search || '').trim().toLowerCase();
    return products.filter(p => {
      if (state.category && p.category !== state.category) return false;
      if (state.size && !(p.sizes || []).includes(state.size)) return false;
      if (state.color && !(p.colors || []).includes(state.color)) return false;
      if (state.minPrice != null && p.price < state.minPrice) return false;
      if (state.maxPrice != null && p.price > state.maxPrice) return false;
      if (state.availability === 'in_stock' && p.status !== 'available') return false;
      if (state.availability && state.availability !== 'in_stock' && p.status !== state.availability) return false;
      if (state.onlyNew && !p.isNew) return false;
      if (q) {
        const hay = `${p.name} ${p.category} ${p.code} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function applySort(products, sort) {
    const list = [...products];
    switch (sort) {
      case 'price_asc':  list.sort((a,b) => a.price - b.price); break;
      case 'price_desc': list.sort((a,b) => b.price - a.price); break;
      case 'name':       list.sort((a,b) => a.name.localeCompare(b.name)); break;
      case 'newest':
      default:           list.sort((a,b) => String(b.createdAt||'').localeCompare(String(a.createdAt||''))); break;
    }
    return list;
  }

  window.IshiraaProducts = { cardHTML, renderGrid, openModal, applyFilters, applySort };
})();
