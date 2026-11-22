(() => {
  'use strict';
  const config = window.SEVENUP;
  const categories = new Map(config.categories.map(category => [category.id, category]));
  const normalize = value => String(value ?? '').normalize('NFC').toLocaleLowerCase('bn').trim();
  const format = value => value.toLocaleString('bn-BD');
  const detail = id => `book.html?id=${encodeURIComponent(id)}`;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function pdfPath(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value.trim(), location.href);
      const pathname = decodeURIComponent(url.pathname);
      if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.origin === location.origin)) return '';
      if (url.username || url.password || !pathname.toLowerCase().endsWith('.pdf')) return '';
      return url.href;
    } catch {
      return '';
    }
  }

  const books = [];
  function register(entries) {
    for (const book of entries) {
      if (book.status === 'draft' || !book.id || books.some(item => item.id === book.id)) continue;
      const category = categories.get(book.categoryId)?.title || book.category;
      books.push({
        ...book, category,
        pdf: book.status === 'upcoming' || book.published === false ? '' : pdfPath(book.pdf),
        searchable: normalize([book.title, book.author, category, book.category,
          book.subcategory, book.summary, ...(book.tags || [])].join(' ')),
      });
    }
  }

  let catalogUnavailable = false;
  const ready = fetch('books.json', { cache: 'no-cache' }).then(async response => {
    if (!response.ok) throw new Error('Catalog request failed');
    const entries = await response.json();
    if (!Array.isArray(entries)) throw new Error('Catalog must be an array');
    register(entries);
  }).catch(() => {
    catalogUnavailable = true;
  }).then(() => register(config.books));

  function coverArt(book) {
    if (book.cover || !book.color) {
      const image = node('img');
      image.src = book.cover || 'assets/default-cover.svg';
      image.alt = `${book.title} বইয়ের প্রচ্ছদ`;
      image.width = 500;
      image.height = 708;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => { image.src = 'assets/default-cover.svg'; }, { once: true });
      return image;
    }
    const cover = node('span', 'catalog-cover');
    if (/^#[0-9a-f]{6}$/i.test(book.color)) cover.style.setProperty('--cover-color', book.color);
    cover.setAttribute('aria-hidden', 'true');
    cover.append(node('small', '', '৭ পাতা'), node('span', 'cover-symbol', book.symbol),
      node('strong', '', book.title), node('small', '', book.author));
    return cover;
  }

  const availability = new Map();
  function pdfAvailable(book) {
    if (!book.pdf) return Promise.resolve(false);
    if (!availability.has(book.pdf)) {
      async function check(method, headers = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          return await fetch(book.pdf, { method, headers, credentials: 'omit', signal: controller.signal });
        } finally {
          clearTimeout(timeout);
        }
      }
      const exists = response => response.ok && /application\/(?:pdf|octet-stream)/i.test(response.headers.get('content-type') || '');
      const request = check('HEAD').then(async response => {
        if (![405, 501].includes(response.status)) return exists(response);
        const partial = await check('GET', { Range: 'bytes=0-15' });
        partial.body?.cancel().catch(() => {});
        return exists(partial);
      }).catch(() => false);
      availability.set(book.pdf, request);
    }
    return availability.get(book.pdf);
  }

  function bookActions(container, book, available, showDetails = false) {
    if (available === undefined && book.pdf) {
      container.append(node('span', 'book-status', 'পিডিএফ যাচাই হচ্ছে'));
      pdfAvailable(book).then(exists => bookActions(container, book, exists, showDetails));
      return;
    }
    container.replaceChildren();
    if (!available) {
      container.append(node('span', 'book-status', 'শীঘ্রই আসছে'));
    } else {
      const read = node('a', 'button primary', 'অনলাইনে পড়ুন');
      read.href = `${detail(book.id)}&mode=read#reader`;
      const download = node('a', 'button secondary', 'PDF ডাউনলোড');
      download.href = book.pdf;
      if (download.origin === location.origin) download.download = '';
      download.addEventListener('click', () => window.PataAnalytics?.track('pdf_download_start', { book_id: book.id }));
      container.append(read, download);
    }
    if (showDetails) {
      const link = node('a', 'button secondary', 'বিস্তারিত দেখুন');
      link.href = detail(book.id);
      container.append(link);
    }
  }

  window.PataLibrary = { config, categories, books, normalize, format, detail, node, pdfAvailable, bookActions, ready, coverArt, catalogUnavailable: () => catalogUnavailable };
})();
