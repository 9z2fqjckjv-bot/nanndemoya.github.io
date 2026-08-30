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

  document.addEventListener('DOMContentLoaded', () => {
    // Links inside src/_includes/layouts/base.njk are already absolute paths like /index.html,
    // so we don't need normalizeSiteLinks anymore unless there's dynamic content injected.
    
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
