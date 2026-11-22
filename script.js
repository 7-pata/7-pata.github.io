(() => {
  'use strict';

  const config = window.SEVENUP || {};
  const select = (selector) => document.querySelector(selector);
  const grid = select('#bookGrid');
  const search = select('#search');
  const filter = select('#categoryFilter');
  const categoryGrid = select('#categoryGrid');
  const categories = config.categories || [];
  const categoryNames = new Map(categories.map(({ id, title }) => [id, title]));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktopPointer = matchMedia('(min-width: 64rem) and (hover: hover) and (pointer: fine)');

  function pdfPath(value) {
    if (typeof value !== 'string') return '';
    const path = value.trim();
    if (/^https:\/\//i.test(path)) {
      try { return new URL(path).protocol === 'https:' ? path : ''; }
      catch { return ''; }
    }
    if (!/^(?![\/\\.#])[\p{L}\p{M}\p{N}_./ %\-]+\.pdf(?:\?[^#]*)?$/iu.test(path)) return '';
    try {
      const decoded = decodeURIComponent(path.split('?')[0]);
      if (/^[/.#]|(?:^|\/)\.\.(?:\/|$)|[\\?#\u0000-\u001f]/.test(decoded)) return '';
      return path;
    } catch {
      return '';
    }
  }

  const normalize = (value) => value.normalize('NFC').toLocaleLowerCase('bn').trim();
  const books = (config.books || []).map((book) => {
    const categoryId = book.categoryId || categories.find(({ title }) => title === book.category)?.id;
    const category = categoryNames.get(categoryId) || book.category;
    return {
      ...book, categoryId, category, pdf: pdfPath(book.pdf),
      searchable: normalize([book.title, category, book.category, book.summary, ...(book.tags || [])].join(' ')),
    };
  });

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  for (const { id, title, icon, accent, summary } of categories) {
    filter.add(new Option(title, id));
    const item = element('li');
    const button = element('button', 'segment-card');
    button.type = 'button';
    button.dataset.category = id;
    button.dataset.accent = accent;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-controls', 'bookGrid');
    const symbol = element('span', 'segment-icon', icon);
    symbol.setAttribute('aria-hidden', 'true');
    button.append(symbol, element('strong', '', title), element('small', '', summary));
    item.append(button);
    categoryGrid.append(item);
  }

  function bookCard(book, index) {
    const card = element('article', 'book-card');
    card.style.setProperty('--book-delay', `${Math.min(index, 5) * 45}ms`);
    const cover = element('div', 'book-cover');
    const image = element('img');
    image.src = book.cover;
    image.alt = `${book.title} বইয়ের প্রচ্ছদ`;
    image.width = 500;
    image.height = 708;
    image.loading = 'lazy';
    image.decoding = 'async';
    cover.append(image);
    const body = element('div', 'book-body');
    const meta = [book.category, book.pdf && 'প্রকাশিত'].filter(Boolean).join(' · ');
    body.append(element('span', 'book-meta', meta), element('h3', '', book.title), element('p', '', book.summary));
    if (book.pdf) {
      const link = element('a', 'button primary', 'পিডিএফ ডাউনলোড করুন');
      link.href = book.pdf;
      link.setAttribute('aria-label', `${book.title} — পিডিএফ ডাউনলোড করুন`);
      if (link.origin === location.origin) link.download = '';
      body.append(link);
    } else {
      body.append(element('span', 'book-status', 'শীঘ্রই আসছে'));
    }
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
      (!filter.value || book.categoryId === filter.value) && terms.every((term) => book.searchable.includes(term)));
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
  filter.addEventListener('change', drawBooks);
  categoryGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    search.value = '';
    filter.value = button.dataset.category;
    drawBooks();
    filter.focus({ preventScroll: true });
    select('#books').scrollIntoView();
  });
  select('#resetSearch').addEventListener('click', () => {
    search.value = '';
    filter.value = '';
    drawBooks();
    search.focus();
  });
  drawBooks();

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

  for (const [method, name] of [['rocket', 'রকেট'], ['bkash', 'বিকাশ'], ['nagad', 'নগদ']]) {
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
  grid.addEventListener('pointerover', (event) => {
    const card = event.target.closest('.book-card');
    if (!card || card.dataset.tiltReady) return;
    pointerEffect(card, card, 'tilt', 7, 'deg');
    card.dataset.tiltReady = 'true';
  });
})();
