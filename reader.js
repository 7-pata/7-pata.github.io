const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/';
const get = id => document.getElementById(id);
const format = number => number.toLocaleString('bn-BD', { useGrouping: false });
const minZoom = .75;
const maxZoom = 2.5;

export async function openReader(book) {
  const status = get('readerStatus');
  const panel = get('reader');
  const viewport = get('readerViewport');
  const pageElement = get('pdfPage');
  const canvas = get('pdfCanvas');
  const textLayer = get('pdfText');
  const pageInput = get('pageNumber');
  const storageKey = `pata-reader:${book.id}:${new URL(book.pdf).pathname}`;
  const analytics = window.PataAnalytics;
  let zoom = 1;
  let pageNumber = 1;
  let renderVersion = 0;
  let paintTask;
  let textTask;
  let renderedPage;
  let viewedPageTimer;
  let sessionTracked = false;
  let completionTracked = false;
  const visitedPages = new Set();
  const pdfjs = await import(`${PDFJS}legacy/build/pdf.mjs`);
  pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS}legacy/build/pdf.worker.mjs`;
  const task = pdfjs.getDocument({
    url: book.pdf,
    isEvalSupported: false,
    disableAutoFetch: true,
    disableStream: true,
    cMapUrl: `${PDFJS}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${PDFJS}standard_fonts/`,
    wasmUrl: `${PDFJS}wasm/`,
  });
  task.onProgress = ({ loaded, total }) => {
    if (total > 0 && get('readerTools').hidden) status.textContent = `পিডিএফ লোড হচ্ছে (${format(Math.min(100, Math.round(loaded / total * 100)))}%)…`;
  };
  const pdf = await task.promise;
  if (analytics.isEnabled()) analytics.track('reader_open', { book_id: book.id });
  try {
    const saved = Number(localStorage.getItem(storageKey));
    if (Number.isInteger(saved) && saved > 0 && saved <= pdf.numPages) pageNumber = saved;
  } catch {
    // The reader works when browser storage is unavailable.
  }

  function updateControls() {
    pageInput.value = format(pageNumber);
    get('pageTotal').textContent = ` / ${format(pdf.numPages)}`;
    get('prevPage').disabled = pageNumber <= 1;
    get('nextPage').disabled = pageNumber >= pdf.numPages;
    get('zoomOut').disabled = zoom <= minZoom;
    get('zoomIn').disabled = zoom >= maxZoom;
    const percent = Math.round(pageNumber / pdf.numPages * 100);
    get('readingProgress').value = percent;
    get('progressLabel').textContent = `${format(percent)}%`;
  }

  let pageVisible = false;
  function scheduleReadingEvent() {
    clearTimeout(viewedPageTimer);
    if (!analytics.isEnabled() || document.hidden || !pageVisible || !renderedPage ||
        renderedPage.pageNumber !== pageNumber || visitedPages.has(pageNumber)) return;
    viewedPageTimer = setTimeout(() => {
      if (document.hidden || !pageVisible || !analytics.isEnabled()) return;
      visitedPages.add(pageNumber);
      if (!sessionTracked) {
        sessionTracked = true;
        analytics.track('reading_session', { book_id: book.id });
      }
      const percent = Math.round(visitedPages.size / pdf.numPages * 100);
      analytics.track('reading_progress', { book_id: book.id, progress_percent: percent });
      if (!completionTracked && visitedPages.size >= Math.ceil(pdf.numPages * .8)) {
        completionTracked = true;
        analytics.track('estimated_read_complete', { book_id: book.id });
      }
    }, 5000);
  }

  async function paint() {
    const version = ++renderVersion;
    let painted = false;
    clearTimeout(viewedPageTimer);
    paintTask?.cancel();
    textTask?.cancel();
    try {
      const page = await pdf.getPage(pageNumber);
      if (version !== renderVersion) return;
      if (renderedPage !== page) renderedPage?.cleanup();
      renderedPage = page;
      const base = page.getViewport({ scale: 1 });
      const width = Math.max(200, viewport.clientWidth - 24);
      const scale = Math.min(width / base.width, 1.65) * zoom;
      const scaled = page.getViewport({ scale });
      const pixelRatio = Math.min(devicePixelRatio || 1, 2, Math.sqrt(4000000 / (scaled.width * scaled.height)));
      canvas.width = Math.max(1, Math.floor(scaled.width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(scaled.height * pixelRatio));
      pageElement.style.width = `${scaled.width}px`;
      pageElement.style.height = `${scaled.height}px`;
      pageElement.style.setProperty('--scale-factor', scale);
      pageElement.style.setProperty('--total-scale-factor', scale);
      textLayer.replaceChildren();
      paintTask = page.render({
        canvas, viewport: scaled, transform: [pixelRatio, 0, 0, pixelRatio, 0, 0],
      });
      await paintTask.promise;
      if (version !== renderVersion) return;
      painted = true;
      status.textContent = `পাতা ${format(pageNumber)} / ${format(pdf.numPages)}`;
      try { localStorage.setItem(storageKey, String(pageNumber)); } catch { /* Optional storage. */ }
      scheduleReadingEvent();
      textTask = new pdfjs.TextLayer({ textContentSource: page.streamTextContent(), container: textLayer, viewport: scaled });
      await textTask.render();
    } catch (error) {
      if (version !== renderVersion || error?.name === 'RenderingCancelledException') return;
      if (painted) return;
      status.textContent = 'এই পাতাটি দেখানো যাচ্ছে না। মূল পিডিএফ লিংকটি ব্যবহার করুন।';
    }
  }

  function go(next) {
    if (!Number.isInteger(next) || next < 1 || next > pdf.numPages) {
      status.textContent = `১ থেকে ${format(pdf.numPages)}-এর মধ্যে একটি পাতা লিখুন।`;
      return;
    }
    pageNumber = next;
    viewport.scrollTop = 0;
    viewport.scrollLeft = 0;
    updateControls();
    paint();
  }

  function changeZoom(delta) {
    zoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
    updateControls();
    paint();
  }

  get('readerTools').hidden = false;
  get('progressWrap').hidden = false;
  viewport.hidden = false;
  get('prevPage').addEventListener('click', () => go(pageNumber - 1));
  get('nextPage').addEventListener('click', () => go(pageNumber + 1));
  get('zoomOut').addEventListener('click', () => changeZoom(-.25));
  get('zoomIn').addEventListener('click', () => changeZoom(.25));
  get('pageForm').addEventListener('submit', event => {
    event.preventDefault();
    const raw = pageInput.value.replace(/[০-৯]/g, digit => String(digit.charCodeAt(0) - 0x09e6));
    go(Number(raw));
  });
  viewport.addEventListener('keydown', event => {
    if (event.key === 'PageUp' && pageNumber > 1) { event.preventDefault(); go(pageNumber - 1); }
    if (event.key === 'PageDown' && pageNumber < pdf.numPages) { event.preventDefault(); go(pageNumber + 1); }
  });
  if (panel.requestFullscreen && document.fullscreenEnabled) {
    const fullscreen = get('fullscreen');
    fullscreen.hidden = false;
    fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await panel.requestFullscreen();
      } catch {
        status.textContent = 'এই ব্রাউজারে পুরো পর্দায় পড়া যাচ্ছে না।';
      }
    });
    document.addEventListener('fullscreenchange', () => {
      fullscreen.textContent = document.fullscreenElement ? 'পুরো পর্দা বন্ধ করুন' : 'পুরো পর্দা';
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      pageVisible = entry.isIntersecting;
      scheduleReadingEvent();
    }, { threshold: .15 });
    observer.observe(viewport);
    document.addEventListener('visibilitychange', scheduleReadingEvent);
  }
  if ('ResizeObserver' in window) {
    let lastWidth = viewport.clientWidth;
    const resize = new ResizeObserver(() => {
      if (lastWidth === viewport.clientWidth) return;
      lastWidth = viewport.clientWidth;
      paint();
    });
    resize.observe(viewport);
  }
  updateControls();
  await paint();
}
