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
          hour: { 1: 1000, 3: 2500, 5: 4000, 10: 7000 },
          day: { 1: 6000, 3: 15000, 5: 25000, 10: 45000 },
          week: { 1: 40000, 3: 100000, 5: 150000, 10: 250000 },
          month: { 1: 120000, 3: 300000, 5: 500000, 10: 900000 }
        },
        night: {
          hour: { 1: 1500, 3: 3750, 5: 6000, 10: 10500 },
          day: { 1: 9000, 3: 22500, 5: 37500, 10: 67500 },
          week: { 1: 60000, 3: 150000, 5: 225000, 10: 375000 },
          month: { 1: 180000, 3: 450000, 5: 750000, 10: 1350000 }
        }
      },
      assistant: {
        day: {
          hour: { 1: 2000, 3: 5000, 5: 8000, 10: 15000 },
          day: { 1: 12500, 3: 35000, 5: 60000, 10: 110000 },
          week: { 1: 100000, 3: 250000, 5: 450000, 10: 800000 },
          month: { 1: 400000, 3: 1000000, 5: 1750000, 10: 3000000 }
        },
        night: {
          hour: { 1: 2200, 3: 5500, 5: 8800, 10: 16500 },
          day: { 1: 13750, 3: 38500, 5: 66000, 10: 121000 },
          week: { 1: 110000, 3: 275000, 5: 495000, 10: 880000 },
          month: { 1: 440000, 3: 1100000, 5: 1925000, 10: 3300000 }
        }
      },
      business: {
        day: {
          hour: { 1: 1500, 3: 3500, 5: 6000, 10: 10000 },
          day: { 1: 8000, 3: 22000, 5: 40000, 10: 70000 },
          week: { 1: 55000, 3: 150000, 5: 250000, 10: 400000 },
          month: { 1: 200000, 3: 500000, 5: 800000, 10: 1500000 }
        },
        night: {
          hour: { 1: 1950, 3: 4550, 5: 7800, 10: 13000 },
          day: { 1: 10400, 3: 28600, 5: 52000, 10: 91000 },
          week: { 1: 71500, 3: 195000, 5: 325000, 10: 520000 },
          month: { 1: 260000, 3: 650000, 5: 1040000, 10: 1950000 }
        }
      },
      kids: {
        day: {
          hour: { 1: 500, 3: 1200, 5: 2000, 10: 3000 },
          day: { 1: 2500, 3: 6000, 5: 10000, 10: 15000 },
          week: { 1: 8000, 3: 20000, 5: 35000, 10: 65000 },
          month: { 1: 30000, 3: 75000, 5: 125000, 10: 200000 }
        },
        night: {
          hour: { 1: 525, 3: 1260, 5: 2100, 10: 3150 },
          day: { 1: 2625, 3: 6300, 5: 10500, 10: 15750 },
          week: { 1: 8400, 3: 21000, 5: 36750, 10: 68250 },
          month: { 1: 31500, 3: 78750, 5: 131250, 10: 210000 }
        }
      },
      senior: {
        day: {
          hour: { 1: 500, 3: 1200, 5: 2000, 10: 3000 },
          day: { 1: 2500, 3: 6000, 5: 10000, 10: 15000 },
          week: { 1: 8000, 3: 20000, 5: 35000, 10: 65000 },
          month: { 1: 30000, 3: 75000, 5: 125000, 10: 200000 }
        },
        night: {
          hour: { 1: 525, 3: 1260, 5: 2100, 10: 3150 },
          day: { 1: 2625, 3: 6300, 5: 10500, 10: 15750 },
          week: { 1: 8400, 3: 21000, 5: 36750, 10: 68250 },
          month: { 1: 31500, 3: 78750, 5: 131250, 10: 210000 }
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

    unitCount.innerHTML = [1, 3, 5, 10]
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
