(async () => {
  'use strict';
  await window.PataLibrary.ready;
  const { config, books, detail, format, pdfAvailable, bookActions, coverArt, catalogUnavailable } = window.PataLibrary;
  const analytics = window.PataAnalytics;
  const get = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const book = books.find(item => item.id === params.get('id'));
  if (!book) {
    get(catalogUnavailable() ? 'catalogError' : 'bookNotFound').hidden = false;
    document.title = 'বইটি পাওয়া যায়নি — ৭ পাতা';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex';
    document.head.append(robots);
    return;
  }

  const url = new URL(detail(book.id), config.siteUrl);
  const canonical = document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = url.href;
  document.head.append(canonical);
  document.title = `${book.title} — ৭ পাতা`;
  document.querySelector('meta[name="description"]').content = book.summary;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content = book.summary;
  get('detailCover').append(coverArt(book));

  get('detailCategory').textContent = [book.category, book.subcategory].filter(Boolean).join(' · ');
  get('detailTitle').textContent = book.title;
  get('detailSummary').textContent = book.summary;
  const date = new Date(book.publicationDate);
  const metaParts = [book.author || config.author];
  if (Number.isInteger(book.pages) && book.pages > 0) metaParts.push(`${format(book.pages)} পৃষ্ঠা`);
  if (Number.isInteger(book.readingMinutes) && book.readingMinutes > 0) metaParts.push(`আনুমানিক ${format(book.readingMinutes)} মিনিট`);
  get('detailMeta').textContent = metaParts.filter(Boolean).join(' · ');
  get('bookDetail').hidden = false;
  analytics.bookMetrics(get('detailMetrics'), book.id);

  const facebook = new URL('https://www.facebook.com/sharer/sharer.php');
  facebook.searchParams.set('u', url.href);
  get('shareFacebook').href = facebook.href;
  get('copyLink').addEventListener('click', async () => {
    const field = get('shareUrl');
    try {
      await navigator.clipboard.writeText(url.href);
      field.hidden = true;
      get('shareMessage').textContent = 'বইয়ের লিংক কপি হয়েছে!';
    } catch {
      field.value = url.href;
      field.hidden = false;
      field.focus();
      field.select();
      get('shareMessage').textContent = 'লিংকটি নির্বাচন করা হয়েছে। আপনার ডিভাইসের কপি অপশন ব্যবহার করুন।';
    }
  });

  const actions = get('detailActions');
  if (book.pdf) actions.textContent = 'পিডিএফ যাচাই হচ্ছে';
  const reading = params.get('mode') === 'read';
  const readerElement = get('reader');
  if (reading) {
    readerElement.hidden = false;
    get('readerStatus').textContent = 'পাঠক প্রস্তুত হচ্ছে…';
    get('closeReader').href = detail(book.id);
    if (location.hash === '#reader') readerElement.scrollIntoView();
  }

  pdfAvailable(book).then(async available => {
    bookActions(actions, book, available);
    if (available && reading) actions.querySelector('a')?.remove();
    if (available && Number.isFinite(date.valueOf())) {
      const dateLabel = new Intl.DateTimeFormat('bn-BD', { dateStyle: 'long', timeZone: 'Asia/Dhaka' }).format(date);
      get('detailMeta').textContent += ` · প্রকাশিত ${dateLabel}`;
    }
    if (available) {
      const schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Book', name: book.title, url: url.href,
        inLanguage: 'bn', description: book.summary, author: { '@type': 'Person', name: book.author || config.author },
        datePublished: Number.isFinite(date.valueOf()) ? book.publicationDate : undefined,
      });
      document.head.append(schema);
    }
    if (!reading) return;
    if (!available) {
      get('readerStatus').textContent = 'এই বইয়ের পিডিএফ এখনো পাওয়া যাচ্ছে না।';
      return;
    }
    get('openPdf').href = book.pdf;
    get('readerFallback').hidden = false;
    try {
      const { openReader } = await import('./reader.js?v=v2');
      await openReader(book);
    } catch {
      get('readerStatus').textContent = 'পাঠক চালু করা যায়নি। মূল পিডিএফ লিংকটি ব্যবহার করুন।';
    }
  });
})();
