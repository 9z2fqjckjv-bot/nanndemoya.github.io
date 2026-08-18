(() => {
  const labelFor = (section) => {
    const heading = section.querySelector('h2, h1, h3');
    return heading ? heading.textContent.trim().replace(/\s+/g, ' ') : '';
  };

  const rootUrl = () => {
    const script = document.querySelector('script[src$="assets/site-enhancements.js"]');
    if (!script) return new URL('.', window.location.href);
    return new URL('.', script.src.replace(/assets\/site-enhancements\.js(?:\?.*)?$/, ''));
  };

  const rootHref = (file) => {
    return new URL(file, rootUrl()).href;
  };

  const normalizeSiteLinks = () => {
    const rootFiles = new Set([
      'index.html',
      'site-links.html',
      'information.html',
      'service.html',
      'policy.html',
      'form.html',
      'Nanndemoya365.html',
      'NanndemoyaCloud.html',
      'NCF.html',
      'house.html',
      'anytime_service_prices.html',
      'transport_cost_simulator.html',
      'UserGuide.html'
    ]);

    const pathFixes = new Map([
      ['../service/digital-service/MacStudioSheres.html', 'guide/service/subscription/digital-service/MacStudioSheres.html'],
      ['../../guide/service/digital-service/MacStudioSheres.html', 'guide/service/subscription/digital-service/MacStudioSheres.html'],
      ['guide/service/digital-service/MacStudioSheres.html', 'guide/service/subscription/digital-service/MacStudioSheres.html'],
      ['guide/policy/praivacy-policy.html', 'guide/policy/privacy-policy.html'],
      ['guide/service/subscription/Lite.html', 'guide/service/subscription/Nanndemoya365/Lite.html'],
      ['guide/service/subscription/Normal.html', 'guide/service/subscription/Nanndemoya365/Normal.html'],
      ['guide/service/subscription/Plus.html', 'guide/service/subscription/Nanndemoya365/Plus.html'],
      ['guide/service/subscription/Business.html', 'guide/service/subscription/Nanndemoya365/Business.html'],
      ['documet/Life-Event-Support_apply-book', 'form.html#life-event-embedded-form']
    ]);

    document.querySelectorAll('a[href]').forEach((link) => {
      const rawHref = link.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#')) return;

      const parsed = new URL(rawHref, window.location.href);
      if (parsed.origin !== window.location.origin) return;

      const hash = parsed.hash || '';
      const relativePath = rawHref.split('#')[0].split('?')[0];
      const cleanPath = relativePath.replace(/^\.\//, '');
      const fileName = cleanPath.split('/').pop();

      if (pathFixes.has(cleanPath)) {
        link.href = rootHref(pathFixes.get(cleanPath)) + hash;
      } else if (rootFiles.has(cleanPath)) {
        link.href = rootHref(cleanPath) + hash;
      } else if (cleanPath.startsWith('guide/') || cleanPath.startsWith('helps/') || cleanPath.startsWith('documet/')) {
        link.href = rootHref(cleanPath) + hash;
      } else if (rootFiles.has(fileName) && !cleanPath.startsWith('../')) {
        link.href = rootHref(fileName) + hash;
      }
    });
  };

  const createActionStrip = () => {
    const section = document.createElement('section');
    section.className = 'action-strip';
    section.setAttribute('aria-label', '主要アクション');
    section.innerHTML = `
      <div>
        <h2>相談・申し込みはこちら</h2>
        <p>迷った場合はフォーム一覧から目的に近い窓口を選べます。料金確認後の相談も同じ場所から進めます。</p>
      </div>
      <div class="action-strip-actions">
        <a class="button" href="${rootHref('form.html')}">フォームを選ぶ</a>
        <a class="button button-secondary" href="${rootHref('anytime_service_prices.html')}">料金を確認する</a>
      </div>
    `;
    return section;
  };

  document.addEventListener('DOMContentLoaded', () => {
    normalizeSiteLinks();

    const main = document.querySelector('main');
    if (main) {
      const sections = Array.from(main.querySelectorAll('section')).filter((section) => labelFor(section));
      sections.forEach((section, index) => {
        if (!section.id) section.id = `section-${index + 1}`;
      });

      if (!main.querySelector('.page-nav') && sections.length >= 2) {
        const nav = document.createElement('nav');
        nav.className = 'page-nav';
        nav.setAttribute('aria-label', 'ページ内メニュー');
        sections.slice(0, 8).forEach((section) => {
          const a = document.createElement('a');
          a.href = `#${section.id}`;
          a.textContent = labelFor(section);
          nav.appendChild(a);
        });
        main.insertBefore(nav, main.firstElementChild);
      }

      if (!document.querySelector('.action-strip') && !window.location.pathname.endsWith('/form.html')) {
        const actionStrip = createActionStrip();
        const reference = main.querySelector('.page-nav');
        if (reference && reference.nextSibling) {
          main.insertBefore(actionStrip, reference.nextSibling);
        } else {
          main.insertBefore(actionStrip, main.firstElementChild);
        }
      }

      if (!document.getElementById('links') && !main.querySelector('.link-grid')) {
        const related = document.createElement('section');
        related.className = 'card';
        related.id = 'links';
        related.innerHTML = `
          <h2>関連リンク</h2>
          <div class="link-grid">
            <a class="link-card" href="${rootHref('index.html')}"><h3>トップページ</h3><span>Nanndemoyaの概要ページへ移動します。</span></a>
            <a class="link-card" href="${rootHref('information.html')}"><h3>連絡先</h3><span>住所、電話番号、オンライン連絡先を確認できます。</span></a>
            <a class="link-card" href="${rootHref('site-links.html')}"><h3>サイトリンク</h3><span>公開中の各ページへ移動できます。</span></a>
          </div>
        `;
        main.appendChild(related);
      }
    }

    if (!document.querySelector('.back-top')) {
      if (!document.getElementById('top')) document.body.id = document.body.id || 'top';
      const top = document.createElement('a');
      top.className = 'back-top';
      top.href = '#top';
      top.setAttribute('aria-label', 'ページ上部へ戻る');
      top.textContent = '↑';
      document.body.appendChild(top);
    }
  });
})();
