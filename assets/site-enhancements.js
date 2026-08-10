(() => {
  const searchPages = [
    { title: 'トップページ', path: 'index.html' },
    { title: 'サイトリンク', path: 'site-links.html' },
    { title: '連絡先', path: 'information.html' },
    { title: 'サービス', path: 'service.html' },
    { title: '基本料金・プレミアム料金シミュレーター', path: 'anytime_service_prices.html' },
    { title: '移動代金シミュレーター', path: 'transport_cost_simulator.html' },
    { title: '何でも屋ハウス', path: 'house.html' },
    { title: '何でも屋基金', path: 'NCF.html' },
    { title: 'ポリシー', path: 'policy.html' },
    { title: 'ヘルプ記事', path: 'helps/help-document.html' },
    { title: 'Q&A', path: 'helps/qanda.html' },
    { title: 'サービスの選び方', path: 'helps/articles/service-overview.html' },
    { title: '連絡先とサイトリンク', path: 'helps/articles/contact-site-links.html' },
    { title: '移動代金の確認方法', path: 'helps/articles/transport-cost.html' },
    { title: '料金の確認方法', path: 'helps/articles/pricing.html' },
    { title: '何でも屋ハウスの利用案内', path: 'helps/articles/nanndemoya-house.html' },
    { title: '何でも屋基金の概要', path: 'helps/articles/ncf.html' },
    { title: '規約とポリシー', path: 'helps/articles/policies.html' },
    { title: 'ライフイベント支援', path: 'helps/articles/life-events.html' },
    { title: '何でも屋ハウスの概要', path: 'guide/house/info.html' },
    { title: '何でも屋ハウスに申し込む', path: 'guide/house/apply.html' },
    { title: '何でも屋ハウスのオプション', path: 'guide/house/option.html' },
    { title: '何でも屋ハウスの利用特典', path: 'guide/house/privilege.html' },
    { title: '何でも屋ハウスの利用契約更新方法', path: 'guide/house/update.html' },
    { title: '広告基金', path: 'guide/N.C.F~Nanndemoya_Crowd_Funding/advertisement.html' },
    { title: '事業拠点・職住一体型シェルター開設基金', path: 'guide/N.C.F~Nanndemoya_Crowd_Funding/base-shelter-fund.html' },
    { title: '資本基金', path: 'guide/N.C.F~Nanndemoya_Crowd_Funding/capital.html' },
    { title: '電動三輪車基金', path: 'guide/N.C.F~Nanndemoya_Crowd_Funding/electric-tricycle.html' },
    { title: '何でも屋ハウス基金', path: 'guide/N.C.F~Nanndemoya_Crowd_Funding/Handyman-House.html' },
    { title: 'ライフイベント支援基金', path: 'guide/N.C.F~Nanndemoya_Crowd_Funding/Life-Event-Support.html' },
    { title: '日常生活費及び事業費基金', path: 'guide/N.C.F~Nanndemoya_Crowd_Funding/living-business-costs.html' },
    { title: 'PC基金', path: 'guide/N.C.F~Nanndemoya_Crowd_Funding/PC.html' },
    { title: 'PC基金の参加特典', path: 'guide/N.C.F~Nanndemoya_Crowd_Funding/PC_Fund_Participation_Benefits.html' },
    { title: 'スマートフォン基金', path: 'guide/N.C.F~Nanndemoya_Crowd_Funding/Smartphone.html' },
    { title: 'スポンサー枠について', path: 'guide/N.C.F~Nanndemoya_Crowd_Funding/Sponsor.html' },
    { title: 'MacStudioShere’s', path: 'guide/service/digital-service/MacStudioSheres.html' },
    { title: 'ライフイベント支援とは', path: 'guide/service/Life-Events/info.html' },
    { title: 'ライフイベント支援の贈与対象要件', path: 'guide/service/Life-Events/rule.html' },
    { title: 'アシスタントサービス', path: 'guide/service/main/assistant-service.html' },
    { title: 'ビジネスアシスタントサービス', path: 'guide/service/main/business-assistant-service.html' },
    { title: 'フリーサービス', path: 'guide/service/main/free-service.html' },
    { title: '子ども向けサービス', path: 'guide/service/main/kids-service.html' },
    { title: 'シニアサービス', path: 'guide/service/main/senior-service.html' },
    { title: '特定商取引法に基づく表記', path: 'guide/policy/Act-on-Specified-Commercial-Transactions.html' },
    { title: 'プライバシーポリシー', path: 'guide/policy/privacy-policy.html' },
    { title: '利用規約', path: 'guide/policy/terms-of-service.html' },
    { title: 'ページテンプレート', path: 'templete.html' }
  ];

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

  const normalizeText = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();

  const extractPageText = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script, style, noscript, iframe').forEach((node) => node.remove());
    return normalizeText(doc.body ? doc.body.textContent : doc.documentElement.textContent);
  };

  const pageCache = new Map();

  const loadSearchPage = async (page) => {
    if (pageCache.has(page.path)) return pageCache.get(page.path);

    const url = rootHref(page.path);
    const promise = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${page.path}`);
        return response.text();
      })
      .then((html) => ({
        ...page,
        href: url,
        text: extractPageText(html)
      }))
      .catch(() => ({
        ...page,
        href: url,
        text: normalizeText(page.title)
      }));

    pageCache.set(page.path, promise);
    return promise;
  };

  const searchSite = async (query) => {
    const terms = normalizeText(query).split(' ').filter(Boolean);
    if (!terms.length) return [];

    const pages = await Promise.all(searchPages.map(loadSearchPage));
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
        link.href = match.href;
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

  document.addEventListener('DOMContentLoaded', () => {
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

      if (!document.getElementById('site-search')) {
        const searchPanel = createSearchPanel();
        const reference = main.querySelector('.page-nav');
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
