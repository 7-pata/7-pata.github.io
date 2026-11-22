(async () => {
  'use strict';
  await window.PataLibrary.ready;
  const { config, books, format, node } = window.PataLibrary;
  const measurementId = config.analytics?.measurementId;
  const validId = typeof measurementId === 'string' && /^G-[A-Z0-9]{4,20}$/.test(measurementId);
  const consentKey = 'pata-analytics-consent';
  const disableKey = `ga-disable-${measurementId}`;
  const counts = ['page_views', 'download_starts', 'reading_sessions'];
  const bookCounts = ['detail_views', 'download_starts', 'reader_opens', 'reading_sessions', 'completed_sessions'];
  let enabled = false;
  let loaded = false;
  let sectionObserver;
  const allowedBooks = new Set(books.map(book => book.id));

  function preference(value) {
    try {
      if (value !== undefined) localStorage.setItem(consentKey, value);
      return localStorage.getItem(consentKey);
    } catch {
      return null;
    }
  }

  function safeLocation() {
    const url = new URL(location.pathname, location.origin);
    const id = new URLSearchParams(location.search).get('id');
    if (url.pathname.endsWith('/book.html') && allowedBooks.has(id)) url.searchParams.set('id', id);
    return url.href;
  }

  function track(event, fields = {}) {
    if (enabled) window.gtag('event', event, { page_location: safeLocation(), ...fields });
  }

  function enable() {
    if (enabled || !validId || navigator.globalPrivacyControl === true) return;
    enabled = true;
    window[disableKey] = false;
    if (!loaded) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      const script = node('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      window.gtag('js', new Date());
      let referrer = '';
      try {
        const previous = new URL(document.referrer);
        if (['https:', 'http:'].includes(previous.protocol)) referrer = previous.origin;
      } catch {
        // Direct visits have no referrer.
      }
      window.gtag('config', measurementId, {
        send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
        page_location: safeLocation(), page_referrer: referrer,
      });
      document.head.append(script);
      loaded = true;
    }
    track('page_view');
    observeSections();
    const id = new URLSearchParams(location.search).get('id');
    if (location.pathname.endsWith('/book.html') && allowedBooks.has(id)) track('book_detail_view', { book_id: id });
  }

  const seenSections = new Set();
  const preferences = document.querySelector('#analyticsPreferences');
  if (validId && preferences && navigator.globalPrivacyControl !== true) {
    const button = node('button', 'button secondary');
    const message = node('p', '', 'অনুমতি দিলে ব্যবহারসংক্রান্ত সীমিত তথ্য দিয়ে ৭ পাতার পরিসংখ্যান তৈরিতে সাহায্য করতে পারবেন।');
    const refresh = () => { button.textContent = enabled ? 'পরিসংখ্যান সংগ্রহ বন্ধ করুন' : 'পরিসংখ্যান সংগ্রহের অনুমতি দিন'; };
    if (preference() === 'yes') enable();
    button.type = 'button';
    button.addEventListener('click', () => {
      if (enabled) {
        enabled = false;
        window[disableKey] = true;
        sectionObserver?.disconnect();
        preference('no');
      } else {
        preference('yes');
        enable();
      }
      refresh();
    });
    refresh();
    preferences.append(message, button);
    preferences.hidden = false;
  }

  function readCounts(record, keys) {
    return Object.fromEntries(keys.filter(key =>
      Number.isSafeInteger(record?.[key]) && record[key] >= 0).map(key => [key, record[key]]));
  }

  async function fetchStats() {
    if (!config.analytics?.statsUrl) return null;
    try {
      const url = new URL(config.analytics.statsUrl, location.href);
      if (url.origin !== location.origin && url.protocol !== 'https:') return null;
      const response = await fetch(url, {
        credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(7000),
      });
      if (!response.ok) return null;
      const snapshot = await response.json();
      const updatedAt = Date.parse(snapshot.as_of);
      if (snapshot.version !== 1 || !Number.isFinite(updatedAt) || updatedAt > Date.now() + 300000) return null;
      return {
        updatedAt,
        totals: readCounts(snapshot.totals, counts),
        books: new Map(books.map(({ id }) => [id, readCounts(snapshot.books?.[id], bookCounts)])),
      };
    } catch {
      return null;
    }
  }

  const stats = fetchStats();
  const canAnimate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  function renderCount(element, count) {
    if (!element) return;
    element.classList.add('stat-value');
    element.textContent = format(count);
    if (canAnimate && count > 0 && typeof element.animate === 'function') {
      element.animate([{ opacity: .65, transform: 'translateY(3px)' }, { opacity: 1, transform: 'none' }], { duration: 260 });
    }
  }

  renderCount(document.querySelector('#stat-books'), books.length);
  stats.then(snapshot => {
    if (!snapshot) return;
    let hasTotals = false;
    for (const [key, count] of Object.entries(snapshot.totals)) {
      renderCount(document.getElementById(`stat-${key}`), count);
      hasTotals = true;
    }
    const stamp = document.querySelector('#statsUpdated');
    if (stamp && hasTotals) {
      stamp.textContent = `তথ্য হালনাগাদ: ${new Intl.DateTimeFormat('bn-BD', { dateStyle: 'long', timeZone: 'Asia/Dhaka' }).format(snapshot.updatedAt)}`;
      stamp.hidden = false;
    }
  });

  function observeSections() {
    if (!('IntersectionObserver' in window)) return;
    sectionObserver ??= new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!enabled || !entry.isIntersecting || seenSections.has(entry.target.id)) continue;
        seenSections.add(entry.target.id);
        track('section_view', { section_id: entry.target.id });
        sectionObserver.unobserve(entry.target);
      }
    }, { threshold: .25 });
    document.querySelectorAll('main > section[id]').forEach(section => {
      if (!seenSections.has(section.id)) sectionObserver.observe(section);
    });
  }

  function bookMetrics(container, bookId) {
    const labels = { detail_views: 'দেখা হয়েছে', download_starts: 'ডাউনলোডের উদ্যোগ', reader_opens: 'পড়া শুরু হয়েছে' };
    stats.then(snapshot => {
      const data = snapshot?.books.get(bookId);
      for (const [key, label] of Object.entries(labels)) {
        if (data?.[key] !== undefined) container.append(node('li', '', `${label}: ${format(data[key])}`));
      }
      if (container.childElementCount) container.hidden = false;
    });
  }

  window.PataAnalytics = { track, stats, bookMetrics, isEnabled: () => enabled };
})();
