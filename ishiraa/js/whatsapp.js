/**
 * WhatsApp deep-link helper.
 * Builds wa.me links with pre-filled enquiry text.
 */
(function () {
  'use strict';

  const cfg = (window.ISHIRAA_CONFIG && window.ISHIRAA_CONFIG.contact) || {};
  const currency = (window.ISHIRAA_CONFIG && window.ISHIRAA_CONFIG.currency) || { symbol: '₹' };

  function formatPrice(n) {
    if (n == null) return '';
    return `${currency.symbol}${Number(n).toLocaleString('en-IN')}`;
  }

  function buildProductEnquiry(product) {
    const lines = [
      `Hi Ishiraa, I'd like to enquire about this piece:`,
      ``,
      `• ${product.name}`,
      `• Code: ${product.code || product.id}`,
      `• Price: ${formatPrice(product.price)}`,
      ``,
      `Could you please share:`,
      `— availability & estimated delivery`,
      `— size & colour options`,
      ``,
      `My details:`,
      `Name: `,
      `City / Pincode: `,
      `Preferred size: `,
      `Preferred colour: `
    ];
    return lines.join('\n');
  }

  function buildLink(number, message) {
    const n = (number || cfg.whatsapp || '').replace(/[^\d]/g, '');
    const text = encodeURIComponent(message || '');
    return `https://wa.me/${n}?text=${text}`;
  }

  function productLink(product) {
    return buildLink(cfg.whatsapp, buildProductEnquiry(product));
  }

  function generalLink(message) {
    const text = message || `Hi Ishiraa, I'd love to know more about your collection.`;
    return buildLink(cfg.whatsapp, text);
  }

  window.IshiraaWA = { productLink, generalLink, buildLink, buildProductEnquiry, formatPrice };
})();
