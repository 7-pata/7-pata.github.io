(async () => {
  'use strict';
  const { ready, books, categories, normalize, format, detail, node, coverArt, bookActions, catalogUnavailable } = window.PataLibrary;
  await ready;

  const get = id => document.getElementById(id);
  const search = get('search');
  const filters = get('filters');
  const grid = get('grid');
  const published = books.filter(book => book.pdf);
  let active = '';

  for (const [id, label] of [['', 'সব'], ...[...categories.values()].map(category => [category.id, category.title])]) {
    const button = node('button', 'chip', label);
    button.type = 'button';
    button.dataset.category = id;
    button.setAttribute('aria-pressed', String(id === active));
    filters.append(button);
  }

  function card(book) {
    const article = node('article', 'card');
    const cover = node('a', 'cover');
    cover.href = detail(book.id);
    cover.setAttribute('aria-label', `${book.title} বইয়ের প্রচ্ছদ`);
    if (/^#[0-9a-f]{6}$/i.test(book.color || '')) cover.style.setProperty('--c', book.color);
    cover.append(coverArt(book));

    const body = node('div', 'details');
    const title = node('h3', '', book.title);
    const meta = node('div', 'meta');
    if (Number.isInteger(book.pages) && book.pages > 0) meta.append(node('span', '', `${format(book.pages)} পৃষ্ঠা`));
    meta.append(node('span', '', 'বিনামূল্যে'));
    const actions = node('div', 'actions');
    bookActions(actions, book, undefined, true);
    body.append(node('div', 'category', book.category), title, node('p', '', book.summary), meta, actions);
    article.append(cover, body);
    return article;
  }

  function draw() {
    const terms = normalize(search.value).split(/\s+/).filter(Boolean);
    const matches = published.filter(book => (!active || book.categoryId === active) &&
      terms.every(term => book.searchable.includes(term)));
    grid.replaceChildren(...matches.map(card));
    get('empty').hidden = matches.length > 0 || catalogUnavailable();
    get('count').textContent = `(${format(matches.length)}টি)`;
  }

  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    active = button.dataset.category;
    for (const filter of filters.children) filter.setAttribute('aria-pressed', String(filter === button));
    draw();
  });
  search.addEventListener('input', draw);
  get('catalogError').hidden = !catalogUnavailable();
  draw();
})();
