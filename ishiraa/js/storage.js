/**
 * Storage layer — single source of truth for products.
 * Reads from localStorage; falls back to bundled data/products.json on first load.
 */
(function () {
  'use strict';

  const KEY_PRODUCTS = 'ishiraa:products';
  const KEY_VERSION  = 'ishiraa:data-version';
  const SEED_URL     = 'data/products.json';

  const Store = {
    _cache: null,
    _loading: null,

    async load() {
      if (this._cache) return this._cache;
      if (this._loading) return this._loading;
      this._loading = (async () => {
        const raw = localStorage.getItem(KEY_PRODUCTS);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) { this._cache = parsed; return parsed; }
          } catch (e) { console.warn('Stored product JSON was invalid, re-seeding.', e); }
        }
        // Seed from bundled JSON
        try {
          const res = await fetch(SEED_URL, { cache: 'no-cache' });
          if (!res.ok) throw new Error('seed fetch failed: ' + res.status);
          const data = await res.json();
          const products = Array.isArray(data.products) ? data.products : [];
          this.saveAll(products);
          localStorage.setItem(KEY_VERSION, String(data.version || 1));
          this._cache = products;
          return products;
        } catch (err) {
          console.error('Failed to load products:', err);
          this._cache = [];
          return [];
        }
      })();
      return this._loading;
    },

    saveAll(products) {
      this._cache = products;
      try {
        localStorage.setItem(KEY_PRODUCTS, JSON.stringify(products));
      } catch (e) {
        // Likely quota — most often caused by giant base64 images.
        console.error('Storage quota exceeded. Use image URLs rather than base64, or reduce image count.', e);
        if (window.showToast) window.showToast('Storage full — use URLs, not base64 images.');
      }
    },

    getById(id) {
      return (this._cache || []).find(p => p.id === id) || null;
    },

    upsert(product) {
      const list = [...(this._cache || [])];
      const idx = list.findIndex(p => p.id === product.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...product };
      else list.unshift(product);
      this.saveAll(list);
      return product;
    },

    remove(id) {
      const list = (this._cache || []).filter(p => p.id !== id);
      this.saveAll(list);
    },

    reset() {
      localStorage.removeItem(KEY_PRODUCTS);
      localStorage.removeItem(KEY_VERSION);
      this._cache = null;
      this._loading = null;
    },

    export() {
      const data = {
        version: Number(localStorage.getItem(KEY_VERSION) || 1),
        updatedAt: new Date().toISOString().slice(0, 10),
        products: this._cache || []
      };
      return JSON.stringify(data, null, 2);
    },

    importJSON(text) {
      const parsed = JSON.parse(text);
      const products = Array.isArray(parsed) ? parsed
        : Array.isArray(parsed.products) ? parsed.products : null;
      if (!products) throw new Error('Invalid catalog format: expected array or { products: [...] }');
      products.forEach((p, i) => {
        if (!p.id) throw new Error(`Product at index ${i} is missing "id"`);
        if (!p.name) throw new Error(`Product at index ${i} is missing "name"`);
      });
      this.saveAll(products);
      if (parsed.version != null) localStorage.setItem(KEY_VERSION, String(parsed.version));
      return products.length;
    },

    // Derived helpers
    getCategories() {
      return [...new Set((this._cache || []).map(p => p.category).filter(Boolean))].sort();
    },
    getSizes() {
      const set = new Set();
      (this._cache || []).forEach(p => (p.sizes || []).forEach(s => set.add(s)));
      return [...set];
    },
    getColors() {
      const set = new Set();
      (this._cache || []).forEach(p => (p.colors || []).forEach(c => set.add(c)));
      return [...set].sort();
    }
  };

  window.IshiraaStore = Store;
})();
