(() => {
  const labelFor = (section) => {
    const heading = section.querySelector('h2, h1, h3');
    return heading ? heading.textContent.trim().replace(/\s+/g, ' ') : '';
  };

  document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('main');
    if (!main) return;

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
  });
})();
