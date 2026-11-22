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

  const books = config.books.map(book => ({
    ...book,
    category: categories.get(book.categoryId)?.title || book.category,
    pdf: book.status === 'upcoming' || book.status === 'draft' ? '' : pdfPath(book.pdf),
    searchable: normalize([book.title, book.author, categories.get(book.categoryId)?.title,
      book.category, book.subcategory, book.summary, ...(book.tags || [])].join(' ')),
  })).filter(book => book.status !== 'draft');

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

  function bookActions(container, book, available) {
    container.replaceChildren();
    if (!available) {
      container.append(node('span', 'book-status', 'শীঘ্রই আসছে'));
      return;
    }
    const read = node('a', 'button primary', 'অনলাইনে পড়ুন');
    read.href = `${detail(book.id)}&mode=read#reader`;
    const download = node('a', 'button secondary', 'পিডিএফ ডাউনলোড করুন');
    download.href = book.pdf;
    if (download.origin === location.origin) download.download = '';
    download.addEventListener('click', () => window.PataAnalytics?.track('pdf_download_start', { book_id: book.id }));
    container.append(read, download);
  }

  window.PataLibrary = { config, categories, books, normalize, format, detail, node, pdfAvailable, bookActions };
})();
