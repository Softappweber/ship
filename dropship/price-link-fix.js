/* price-link-fix.js
   Auto-appends ?price=XXX to all payment-page links in generated output.
   Link this AFTER your main Studio script: <script src="price-link-fix.js"></script> */

(function () {
  'use strict';

  const PAYMENT_BASE = 'https://softappweber.github.io/sushantcoder/';

  // Wrap the original functions once they exist
  function wrap() {
    if (typeof window.generateLanding === 'function' && !window.generateLanding.__patched) {
      const original = window.generateLanding;
      window.generateLanding = function () {
        original.apply(this, arguments);
        patchOutput('landingOutput');
        window.generateLanding.__patched = true;
      };
    }

    if (typeof window.generateEmail === 'function' && !window.generateEmail.__patched) {
      const original = window.generateEmail;
      window.generateEmail = function () {
        original.apply(this, arguments);
        patchOutput('emailOutput');
        window.generateEmail.__patched = true;
      };
    }

    // Patch the live preview inside the Studio tool (the .buy button)
    patchLivePreview();
  }

  function patchOutput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const price = getPrice();
    let html = el.textContent;

    // Replace any plain payment-page URL (without ?price=) with the price-tagged URL
    const escaped = PAYMENT_BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped + '(?!\\?price=)', 'g');
    html = html.replace(regex, PAYMENT_BASE + '?price=' + price);

    el.textContent = html;
  }

  function patchLivePreview() {
    // The live preview .buy link inside the Studio
    document.querySelectorAll('a.buy').forEach(a => {
      const price = getPrice();
      if (price && a.href.indexOf('sushantcoder') !== -1 && a.href.indexOf('?price=') === -1) {
        a.href = PAYMENT_BASE + '?price=' + price;
      }
    });
  }

  function getPrice() {
    const priceEl = document.getElementById('price');
    if (!priceEl) return '';
    const n = parseFloat(priceEl.value);
    return isNaN(n) || n <= 0 ? '' : n;
  }

  // Run when DOM is ready + retry a few times (in case Studio script loads slowly)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wrap);
  } else {
    wrap();
  }
  let tries = 0;
  const interval = setInterval(() => {
    wrap();
    tries++;
    if (tries > 20) clearInterval(interval);
  }, 500);

  // Also re-patch whenever the price field changes
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'price') {
      patchLivePreview();
    }
  });
})();
