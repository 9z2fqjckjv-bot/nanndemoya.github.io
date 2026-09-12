(() => {
  const ensureStyles = () => {
    if (document.querySelector('link[href="/assets/site-ir.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/site-ir.css';
    document.head.appendChild(link);
  };

  const createSiteNav = () => {
    if (document.querySelector('.site-nav')) return;
    const nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', 'サイトメニュー');
    nav.innerHTML = `
      <a class="site-nav-brand" href="/index.html">何でも屋</a>
      <button class="site-nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav-list">メニュー</button>
      <ul class="site-nav-list" id="site-nav-list">
        <li><a href="/index.html">トップ</a></li>
        <li><a href="/service.html">サービス</a></li>
        <li><a href="/anytime-service-prices.html">料金</a></li>
        <li><a href="/ncf.html">何でも屋基金</a></li>
        <li><a href="/ir/">基金・IR情報</a></li>
        <li><a href="/form.html">申し込み</a></li>
        <li><a href="/information.html">連絡先</a></li>
      </ul>
    `;
    document.body.insertBefore(nav, document.body.firstElementChild);
  };

  const bindSiteNavToggle = () => {
    const nav = document.querySelector('.site-nav');
    const toggle = document.querySelector('.site-nav-toggle');
    if (!nav || !toggle) return;
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    const path = window.location.pathname.replace(/index\.html$/, '');
    nav.querySelectorAll('.site-nav-list a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === path || href === window.location.pathname) {
        link.setAttribute('aria-current', 'page');
      }
    });
  };

  const ensureFooterIrLink = () => {
    document.querySelectorAll('.footer, body > footer').forEach((footer) => {
      if (footer.querySelector('a[href="/ir/"], a[href="/ir/index.html"]')) return;
      const info = footer.querySelector('a[href="/information.html"]');
      const ir = document.createElement('a');
      ir.href = '/ir/';
      ir.textContent = '基金・IR情報';
      if (info) {
        info.before(ir);
        ir.after(document.createTextNode(' \u00a0\u00b7\u00a0 '));
      } else {
        footer.insertBefore(ir, footer.firstChild);
      }
    });
  };

  const init = () => {
    ensureStyles();
    createSiteNav();
    bindSiteNavToggle();
    ensureFooterIrLink();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
