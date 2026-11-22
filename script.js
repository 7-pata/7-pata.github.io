(() => {
  'use strict';

  const { config, categories, books, normalize, node: element, detail, pdfAvailable, bookActions } = window.PataLibrary;
  const analytics = window.PataAnalytics;
  const select = selector => document.querySelector(selector);
  const grid = select('#bookGrid');
  const search = select('#search');
  const filter = select('#categoryFilter');
  const subcategory = select('#subcategoryFilter');
  const categoryGrid = select('#categoryGrid');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktopPointer = matchMedia('(min-width: 64rem) and (hover: hover) and (pointer: fine)');

  const icons = {
    book: 'M12 6c-3-2-6-2-9-1v13c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1v13',
    music: 'M10 17V6l10-2v10M10 17a3 2 0 1 1-6 0 3 2 0 1 1 6 0m10-3a3 2 0 1 1-6 0 3 2 0 1 1 6 0',
    compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4-14-2 6-6 2 2-6 6-2Z',
    brain: 'M12 5a3 3 0 0 0-6 0 4 4 0 0 0-2 7 4 4 0 0 0 2 6 3 3 0 0 0 6 1V5a3 3 0 0 1 6 0 4 4 0 0 1 2 7 4 4 0 0 1-2 6 3 3 0 0 1-6 1M6 10c3 0 3 3 3 4m9-4c-3 0-3 3-3 4',
    case: 'M3 10h18v10H3zM3 10V7h18v3M9 7V4h6v3m-3 3v4',
    chip: 'M6 6h12v12H6zM9 9h6v6H9zM9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3',
    atom: 'M22 12a10 4 0 1 0-20 0 10 4 0 1 0 20 0m-5 8.7A10 4 60 1 0 7 3.3a10 4 60 1 0 10 17.4m-10 0A10 4-60 1 0 17 3.3a10 4-60 1 0-10 17.4',
  };

  for (const { id, title, icon, accent, summary } of categories.values()) {
    filter.add(new Option(title, id));
    const item = element('li');
    const button = element('button', 'segment-card');
    button.type = 'button';
    button.dataset.category = id;
    button.dataset.accent = accent;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-controls', 'bookGrid');
    const symbol = element('span', 'segment-icon');
    symbol.setAttribute('aria-hidden', 'true');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', icons[icon] || icons.book);
    svg.append(path);
    symbol.append(svg);
    button.append(symbol, element('strong', '', title), element('small', '', summary));
    item.append(button);
    categoryGrid.append(item);
  }

  function bookLink(book) {
    const link = element('a', '', book.title);
    link.href = detail(book.id);
    return link;
  }

  function bookCard(book, index) {
    const card = element('article', 'book-card');
    card.style.setProperty('--book-delay', `${Math.min(index, 5) * 45}ms`);
    const cover = element('a', 'book-cover');
    cover.href = detail(book.id);
    const image = element('img');
    image.src = book.cover || 'assets/default-cover.svg';
    image.alt = `${book.title} বইয়ের প্রচ্ছদ`;
    image.width = 500;
    image.height = 708;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => { image.src = 'assets/default-cover.svg'; }, { once: true });
    cover.append(image);
    const body = element('div', 'book-body');
    const title = element('h3');
    title.append(bookLink(book));
    const meta = [book.category, book.subcategory].filter(Boolean).join(' · ');
    const metrics = element('ul', 'book-metrics');
    metrics.hidden = true;
    analytics.bookMetrics(metrics, book.id);
    const actions = element('div', 'book-actions');
    if (book.pdf) {
      actions.append(element('span', 'book-status', 'পিডিএফ যাচাই হচ্ছে'));
      pdfAvailable(book).then(available => bookActions(actions, book, available));
    } else {
      bookActions(actions, book, false);
    }
    body.append(element('span', 'book-meta', meta), title, element('p', '', book.summary), metrics, actions);
    card.append(cover, body);
    return card;
  }

  const reveal = 'IntersectionObserver' in window ? new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  }, { threshold: .18 }) : null;
  document.querySelectorAll('.section-head, .about-layout, .steps').forEach((node) => reveal?.observe(node));

  function drawBooks() {
    const terms = normalize(search.value).split(/\s+/).filter(Boolean);
    const matches = books.filter((book) =>
      (!filter.value || book.categoryId === filter.value) &&
      (!subcategory.value || book.subcategory === subcategory.value) && terms.every((term) => book.searchable.includes(term)));
    for (const card of grid.children) reveal?.unobserve(card);
    const cards = matches.map(bookCard);
    grid.replaceChildren(...cards);
    for (const card of cards) reveal?.observe(card);
    select('#noBooks').hidden = matches.length > 0;
    select('#count').textContent = `${matches.length.toLocaleString('bn-BD')}টি বই`;
    for (const button of categoryGrid.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.category === filter.value));
    }
  }

  search.addEventListener('input', drawBooks);
  function updateSubcategories() {
    const topics = categories.get(filter.value)?.subcategories || [];
    subcategory.replaceChildren(new Option('সব উপবিষয়', ''), ...topics.map(topic => new Option(topic, topic)));
    subcategory.disabled = topics.length === 0;
  }
  filter.addEventListener('change', () => {
    updateSubcategories();
    drawBooks();
  });
  subcategory.addEventListener('change', drawBooks);
  categoryGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    search.value = '';
    filter.value = button.dataset.category;
    updateSubcategories();
    drawBooks();
    filter.focus({ preventScroll: true });
    select('#books').scrollIntoView();
  });
  select('#resetSearch').addEventListener('click', () => {
    search.value = '';
    filter.value = '';
    updateSubcategories();
    drawBooks();
    search.focus();
  });
  drawBooks();

  const featured = books.filter(book => book.featured);
  select('#featuredGrid').append(...featured.map(bookCard));
  select('#featuredEmpty').hidden = featured.length > 0;
  for (const card of select('#featuredGrid').children) reveal?.observe(card);

  function populateList(selector, emptySelector, items) {
    const list = select(selector);
    for (const { book, text } of items) {
      const li = element('li');
      li.append(bookLink(book), element('span', '', text));
      list.append(li);
    }
    select(emptySelector).hidden = items.length > 0;
  }
  const dateFormat = new Intl.DateTimeFormat('bn-BD', { dateStyle: 'medium', timeZone: 'Asia/Dhaka' });
  const dated = books.filter(book => book.pdf && /^\d{4}-\d{2}-\d{2}$/.test(book.publicationDate) &&
    Number.isFinite(Date.parse(book.publicationDate)) && Date.parse(book.publicationDate) <= Date.now());
  dated.sort((a, b) => b.publicationDate.localeCompare(a.publicationDate));
  Promise.all(dated.map(async book => await pdfAvailable(book) ? book : null)).then(results => {
    populateList('#recentBooks', '#recentEmpty', results.filter(Boolean).slice(0, 5).map(book => ({
      book, text: dateFormat.format(new Date(book.publicationDate)),
    })));
  });
  analytics.stats.then(snapshot => {
    if (!snapshot) return;
    const ranked = books.map(book => ({ book, sessions: snapshot.books.get(book.id)?.reading_sessions }))
      .filter(row => row.sessions > 0).sort((a, b) => b.sessions - a.sessions);
    populateList('#popularBooks', '#popularEmpty', ranked.slice(0, 5).map(({ book, sessions }) => ({
      book, text: `${sessions.toLocaleString('bn-BD')}টি পড়ার সেশন`,
    })));
  });

  const toast = select('#toast');
  let toastTimer;
  function notify(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      toast.textContent = '';
    }, 3000);
  }

  async function copy(number, display) {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(number);
        return true;
      } catch {
        // Some browsers reject clipboard permissions but allow copying a selection.
      }
    }
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(display);
    selection.removeAllRanges();
    selection.addRange(range);
    try {
      if (document.execCommand('copy')) {
        selection.removeAllRanges();
        return true;
      }
    } catch {
      // Leave the visible number selected for manual copying.
    }
    return false;
  }

  for (const [method, name] of [['bkash', 'বিকাশ'], ['nagad', 'নগদ'], ['rocket', 'রকেট']]) {
    const display = select(`#number-${method}`);
    const button = select(`[data-method="${method}"]`);
    const number = String(config.payments?.[method] ?? display.textContent).trim();
    if (!/^01\d{9}$/.test(number)) {
      display.textContent = 'নম্বর শীঘ্রই যুক্ত হবে';
      display.classList.add('unavailable');
      continue;
    }
    display.textContent = number;
    display.dir = 'ltr';
    button.hidden = false;
    let buttonTimer;
    button.addEventListener('click', async () => {
      if (!(await copy(number, display))) {
        notify('নম্বরটি নির্বাচন করা হয়েছে। আপনার ডিভাইসের কপি অপশন ব্যবহার করুন।');
        return;
      }
      notify(`${name} নম্বর কপি হয়েছে!`);
      clearTimeout(buttonTimer);
      button.classList.add('copy-success');
      button.textContent = 'কপি হয়েছে ✓';
      buttonTimer = setTimeout(() => {
        button.classList.remove('copy-success');
        button.textContent = 'নম্বর কপি করুন';
      }, 1800);
    });
  }

  const facebook = select('#facebook');
  if (/^https:\/\/(www\.)?facebook\.com\//i.test(config.facebook || '')) {
    facebook.href = config.facebook;
    facebook.hidden = false;
  }
  const year = new Date().getFullYear();
  select('#year').textContent = year.toLocaleString('bn-BD', { useGrouping: false });

  const menu = select('.menu');
  const nav = select('#nav');
  const mobile = matchMedia('(max-width: 55rem)');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    nav.inert = mobile.matches && !open;
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? 'মেনু বন্ধ করুন' : 'মেনু';
  }
  select('.topbar').classList.add('menu-ready');
  menu.hidden = false;
  setMenu(false);
  mobile.addEventListener('change', () => setMenu(false));
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || !mobile.matches) return;
    setMenu(false);
    const target = document.getElementById(link.hash.slice(1));
    target?.setAttribute('tabindex', '-1');
    target?.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !nav.classList.contains('open')) return;
    setMenu(false);
    menu.focus();
  });

  function pointerEffect(container, target, prefix, amount, unit) {
    const reset = () => {
      target.style.removeProperty(`--${prefix}-x`);
      target.style.removeProperty(`--${prefix}-y`);
    };
    container.addEventListener('pointermove', (event) => {
      if (!desktopPointer.matches || motion.matches || event.pointerType !== 'mouse') return;
      const bounds = container.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      target.style.setProperty(`--${prefix}-x`, `${(prefix === 'tilt' ? -y : x) * amount}${unit}`);
      target.style.setProperty(`--${prefix}-y`, `${(prefix === 'tilt' ? x : y) * amount}${unit}`);
    });
    container.addEventListener('pointerleave', reset);
  }
  pointerEffect(select('.hero-art'), select('.art-scene'), 'drift', 18, 'px');
  for (const container of [grid, select('#featuredGrid'), categoryGrid]) {
    container.addEventListener('pointerover', event => {
      const card = event.target.closest('.book-card, .segment-card');
      if (!card || card.dataset.tiltReady || !desktopPointer.matches || motion.matches) return;
      pointerEffect(card, card, 'tilt', 7, 'deg');
      card.dataset.tiltReady = 'true';
    });
  }
})();
