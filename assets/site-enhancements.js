(() => {
  const rootUrl = () => {
    return new URL('/', window.location.origin).href;
  };

  const normalizeText = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();

  let searchIndexCache = null;

  const fetchSearchIndex = async () => {
    if (searchIndexCache) return searchIndexCache;
    try {
      const res = await fetch('/search-index.json');
      if (!res.ok) throw new Error('Network response was not ok');
      searchIndexCache = await res.json();
      return searchIndexCache;
    } catch (e) {
      console.error('Failed to load search index:', e);
      return [];
    }
  };

  const searchSite = async (query) => {
    const terms = normalizeText(query).split(' ').filter(Boolean);
    if (!terms.length) return [];

    const pages = await fetchSearchIndex();
    return pages
      .map((page) => {
        const titleText = normalizeText(page.title);
        const searchableText = `${titleText} ${page.text}`;
        if (!terms.every((term) => searchableText.includes(term))) return null;

        const firstIndex = Math.min(...terms.map((term) => {
          const index = page.text.indexOf(term);
          return index >= 0 ? index : Number.POSITIVE_INFINITY;
        }));
        const snippetStart = Number.isFinite(firstIndex) ? Math.max(0, firstIndex - 48) : 0;
        const snippet = page.text.slice(snippetStart, snippetStart + 132);
        const titleScore = terms.some((term) => titleText.includes(term)) ? 2 : 0;
        return { ...page, snippet, score: titleScore + terms.length };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'ja'));
  };

  const createSearchPanel = () => {
    const section = document.createElement('section');
    section.className = 'card site-search';
    section.id = 'site-search';
    section.innerHTML = `
      <h2>サイト内検索</h2>
      <form class="site-search-form" role="search">
        <label class="site-search-label" for="site-search-input">検索キーワード</label>
        <div class="site-search-row">
          <input id="site-search-input" class="site-search-input" type="search" autocomplete="off" placeholder="例：料金、基金、連絡先">
          <button class="button site-search-button" type="submit">検索</button>
        </div>
      </form>
      <div class="site-search-status" aria-live="polite"></div>
      <div class="site-search-results"></div>
    `;

    const form = section.querySelector('.site-search-form');
    const input = section.querySelector('.site-search-input');
    const status = section.querySelector('.site-search-status');
    const results = section.querySelector('.site-search-results');

    const renderResults = async () => {
      const query = input.value.trim();
      results.innerHTML = '';
      if (!query) {
        status.textContent = '検索したい言葉を入力してください。';
        return;
      }

      status.textContent = '検索しています。';
      const matches = await searchSite(query);
      if (!matches.length) {
        status.textContent = '一致するページは見つかりませんでした。';
        return;
      }

      status.textContent = `${matches.length}件見つかりました。`;
      const list = document.createElement('ol');
      list.className = 'site-search-list';
      matches.slice(0, 12).forEach((match) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        const snippet = document.createElement('p');
        link.href = match.url;
        link.textContent = match.title;
        snippet.textContent = match.snippet;
        item.append(link, snippet);
        list.appendChild(item);
      });
      results.appendChild(list);
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      renderResults();
    });

    return section;
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
        <a class="button" href="/form.html">フォームを選ぶ</a>
        <a class="button button-secondary" href="/anytime-service-prices.html">料金を確認する</a>
      </div>
    `;
    return section;
  };

  const createPremiumPrices = (basicPrices) => {
    return Object.fromEntries(Object.entries(basicPrices).map(([timeBand, units]) => [
      timeBand,
      Object.fromEntries(Object.entries(units).map(([unitType, counts]) => [
        unitType,
        Object.fromEntries(Object.entries(counts).map(([count, price]) => [count, price * 2]))
      ]))
    ]));
  };

  const initPriceSimulator = () => {
    const getElement = (id) => document.getElementById(id);
    const serviceType = getElement('serviceType');
    const priceType = getElement('priceType');
    const timeBand = getElement('timeBand');
    const unitType = getElement('unitType');
    const unitCount = getElement('unitCount');
    const quantity = getElement('quantity');
    const totalPrice = getElement('totalPrice');
    const breakdown = getElement('breakdown');

    if (!serviceType || !priceType || !timeBand || !unitType || !unitCount || !quantity || !totalPrice || !breakdown) {
      return;
    }

    const basicPrices = {
      free: {
        day: {
          hour: { 1: 1000, 3: 2750, 6: 5000, 12: 9000 },
          day: { 1: 7500, 3: 21000, 6: 40000, 12: 75000 },
          week: { 1: 45000, 3: 130000, 6: 255000, 12: 500000 },
          month: { 1: 215000, 3: 630000, 6: 1230000, 12: 2400000 }
        },
        night: {
          hour: { 1: 1500, 3: 4125, 6: 7500, 12: 13500 },
          day: { 1: 11250, 3: 31500, 6: 60000, 12: 112500 },
          week: { 1: 67500, 3: 195000, 6: 382500, 12: 750000 },
          month: { 1: 322500, 3: 945000, 6: 1845000, 12: 3600000 }
        }
      },
      assistant: {
        day: {
          hour: { 1: 2000, 3: 5500, 6: 10000, 12: 18000 },
          day: { 1: 15000, 3: 42000, 6: 80000, 12: 150000 },
          week: { 1: 90000, 3: 260000, 6: 510000, 12: 1000000 },
          month: { 1: 430000, 3: 1260000, 6: 2460000, 12: 4800000 }
        },
        night: {
          hour: { 1: 2200, 3: 6050, 6: 11000, 12: 19800 },
          day: { 1: 16500, 3: 46200, 6: 88000, 12: 165000 },
          week: { 1: 99000, 3: 286000, 6: 561000, 12: 1100000 },
          month: { 1: 473000, 3: 1386000, 6: 2706000, 12: 5280000 }
        }
      },
      business: {
        day: {
          hour: { 1: 1500, 3: 4125, 6: 7500, 12: 13500 },
          day: { 1: 11250, 3: 31500, 6: 60000, 12: 112500 },
          week: { 1: 67500, 3: 195000, 6: 382500, 12: 750000 },
          month: { 1: 322500, 3: 945000, 6: 1845000, 12: 3600000 }
        },
        night: {
          hour: { 1: 1950, 3: 5363, 6: 9750, 12: 17550 },
          day: { 1: 14625, 3: 40950, 6: 78000, 12: 146250 },
          week: { 1: 87750, 3: 253500, 6: 497250, 12: 975000 },
          month: { 1: 419250, 3: 1228500, 6: 2398500, 12: 4680000 }
        }
      },
      kids: {
        day: {
          hour: { 1: 500, 3: 1375, 6: 2500, 12: 4500 },
          day: { 1: 3750, 3: 10500, 6: 20000, 12: 37500 },
          week: { 1: 22500, 3: 65000, 6: 127500, 12: 250000 },
          month: { 1: 107500, 3: 315000, 6: 615000, 12: 1200000 }
        },
        night: {
          hour: { 1: 525, 3: 1444, 6: 2625, 12: 4725 },
          day: { 1: 3938, 3: 11025, 6: 21000, 12: 39375 },
          week: { 1: 23625, 3: 68250, 6: 133875, 12: 262500 },
          month: { 1: 112875, 3: 330750, 6: 645750, 12: 1260000 }
        }
      },
      senior: {
        day: {
          hour: { 1: 500, 3: 1375, 6: 2500, 12: 4500 },
          day: { 1: 3750, 3: 10500, 6: 20000, 12: 37500 },
          week: { 1: 22500, 3: 65000, 6: 127500, 12: 250000 },
          month: { 1: 107500, 3: 315000, 6: 615000, 12: 1200000 }
        },
        night: {
          hour: { 1: 525, 3: 1444, 6: 2625, 12: 4725 },
          day: { 1: 3938, 3: 11025, 6: 21000, 12: 39375 },
          week: { 1: 23625, 3: 68250, 6: 133875, 12: 262500 },
          month: { 1: 112875, 3: 330750, 6: 645750, 12: 1260000 }
        }
      }
    };

    const serviceLabels = {
      free: 'フリーサービス',
      assistant: 'アシスタントサービス',
      business: 'ビジネスアシスタントサービス',
      kids: '子ども向けサービス',
      senior: 'シニアサービス'
    };
    const priceTypeLabels = { basic: '基本料金', premium: 'プレミアム料金' };
    const timeBandLabels = { day: '日中', night: '夜間' };
    const unitTypeLabels = { hour: '時間給', day: '日給', week: '週給', month: '月給' };
    const prices = Object.fromEntries(Object.entries(basicPrices).map(([service, basic]) => [
      service,
      { basic, premium: createPremiumPrices(basic) }
    ]));
    const yen = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0
    });

    unitCount.innerHTML = [1, 3, 6, 12]
      .map((count) => `<option value="${count}">${count}</option>`)
      .join('');

    const render = () => {
      const unitPrice = prices[serviceType.value]?.[priceType.value]?.[timeBand.value]?.[unitType.value]?.[unitCount.value] ?? 0;
      const quantityValue = Math.max(1, Number.parseInt(quantity.value, 10) || 1);
      const total = unitPrice * quantityValue;

      totalPrice.textContent = yen.format(total);
      breakdown.innerHTML = `
        <li><span>サービス</span><strong>${serviceLabels[serviceType.value]}</strong></li>
        <li><span>条件</span><strong>${priceTypeLabels[priceType.value]} / ${timeBandLabels[timeBand.value]} / ${unitTypeLabels[unitType.value]} ${unitCount.value}</strong></li>
        <li><span>単価</span><strong>${yen.format(unitPrice)}</strong></li>
        <li><span>数量</span><strong>${quantityValue}</strong></li>
      `;
    };

    [serviceType, priceType, timeBand, unitType, unitCount, quantity].forEach((control) => {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });

    render();
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Links inside src/_includes/layouts/base.njk are already absolute paths like /index.html,
    // so we don't need normalizeSiteLinks anymore unless there's dynamic content injected.

    initPriceSimulator();

    const main = document.querySelector('main');
    if (main) {
      const sections = Array.from(main.querySelectorAll('section')).filter((section) => {
        const heading = section.querySelector('h2, h1, h3');
        return heading ? heading.textContent.trim() : '';
      });

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
          const heading = section.querySelector('h2, h1, h3');
          a.textContent = heading ? heading.textContent.trim() : '';
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

      if (!document.getElementById('site-search')) {
        const searchPanel = createSearchPanel();
        const reference = main.querySelector('.action-strip') || main.querySelector('.page-nav');
        if (reference && reference.nextSibling) {
          main.insertBefore(searchPanel, reference.nextSibling);
        } else {
          main.insertBefore(searchPanel, main.firstElementChild);
        }
      }

      if (!document.getElementById('links') && !main.querySelector('.link-grid')) {
        const related = document.createElement('section');
        related.className = 'card';
        related.id = 'links';
        related.innerHTML = `
          <h2>関連リンク</h2>
          <div class="link-grid">
            <a class="link-card" href="/index.html"><h3>トップページ</h3><span>Nanndemoyaの概要ページへ移動します。</span></a>
            <a class="link-card" href="/information.html"><h3>連絡先</h3><span>住所、電話番号、オンライン連絡先を確認できます。</span></a>
            <a class="link-card" href="/site-links.html"><h3>サイトリンク</h3><span>公開中の各ページへ移動できます。</span></a>
          </div>
        `;
        main.appendChild(related);
      }
    }
  });
})();
