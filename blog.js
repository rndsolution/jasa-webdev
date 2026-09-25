let allArticles = [];
let activeCategory = 'Semua';

async function fetchArticles() {
  const res = await fetch('/api/articles');
  if (!res.ok) return [];
  return await res.json();
}

function skeletonCards(n) {
  return Array(n).fill(0).map(() => `
    <div class="bg-surface border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div class="w-full h-48 bg-white/5"></div>
      <div class="p-6 space-y-3">
        <div class="h-3 w-20 bg-white/10 rounded"></div>
        <div class="h-4 w-3/4 bg-white/10 rounded"></div>
        <div class="h-3 w-full bg-white/10 rounded"></div>
      </div>
    </div>
  `).join('');
}

function renderFilters() {
  const filterContainer = document.getElementById('categoryFilters');
  if (!filterContainer) return;

  const categories = ['Semua', ...new Set(allArticles.map(a => a.kategori).filter(Boolean))];

  filterContainer.innerHTML = categories.map(cat => `
    <button type="button" data-cat="${cat}"
      class="cat-btn px-4 py-1.5 rounded-full text-xs font-mono border transition-colors ${cat === activeCategory ? 'border-accent text-accent bg-accent/10' : 'border-white/10 text-muted hover:border-accent/40'}">
      ${cat}
    </button>
  `).join('');

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderFilters();
      renderCards();
    });
  });
}

function renderCards() {
  const container = document.getElementById('articleList');
  if (!container) return;

  const filtered = activeCategory === 'Semua'
    ? allArticles
    : allArticles.filter(a => a.kategori === activeCategory);

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada artikel di kategori ini.</p>';
    return;
  }

  container.innerHTML = filtered.map(a => `
    <a href="/artikel.html?slug=${a.slug}" class="group bg-surface border border-white/10 rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-300">
      ${a.thumbnail ? `<img src="${a.thumbnail}" alt="${a.title || 'Artikel'}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500">` : ''}
      <div class="p-6">
        <div class="flex items-center gap-2 mb-2">
          ${a.kategori ? `<span class="text-accent font-mono text-xs">${a.kategori}</span>` : ''}
        </div>
        <p class="text-muted text-xs font-mono mb-2">${a.date ? new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
        <h3 class="font-bold mb-2">${a.title || 'Tanpa judul'}</h3>
        <p class="text-muted text-sm">${a.excerpt || ''}</p>
      </div>
    </a>
  `).join('');
}

async function renderList() {
  const container = document.getElementById('articleList');
  if (!container) return;

  container.innerHTML = skeletonCards(3);
  allArticles = await fetchArticles();
  renderFilters();
  renderCards();
}

function injectSchema(data, slug) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.title || '',
    "description": data.excerpt || '',
    "image": data.thumbnail || 'https://rndsolution.id/assets/og-image.jpg',
    "datePublished": data.date || '',
    "author": { "@type": "Organization", "name": "RND Solution" },
    "publisher": { "@type": "Organization", "name": "RND Solution" },
    "mainEntityOfPage": `https://rndsolution.id/artikel.html?slug=${slug}`
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

async function renderDetail() {
  const container = document.getElementById('articleContent');
  if (!container) return;

  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) {
    container.innerHTML = '<p class="text-muted">Artikel tidak ditemukan.</p>';
    return;
  }

  container.innerHTML = `
    <div class="animate-pulse space-y-4">
      <div class="h-3 w-32 bg-white/10 rounded"></div>
      <div class="h-10 w-3/4 bg-white/10 rounded"></div>
      <div class="h-64 w-full bg-white/5 rounded-2xl"></div>
      <div class="h-3 w-full bg-white/10 rounded"></div>
      <div class="h-3 w-5/6 bg-white/10 rounded"></div>
    </div>
  `;

  const res = await fetch(`/api/articles/${slug}`);
  if (!res.ok) {
    container.innerHTML = '<p class="text-muted">Artikel tidak ditemukan.</p>';
    return;
  }

  const data = await res.json();
  const body = data.body || '';

  document.getElementById('pageTitle').textContent = `${data.title || 'Artikel'} — RND Solution`;

  const seoDesc = data.meta_description || data.excerpt || '';
  const descEl = document.getElementById('metaDescription');
  if (descEl) descEl.setAttribute('content', seoDesc);

  const pageUrl = `https://rndsolution.id/artikel.html?slug=${slug}`;
  const img = data.thumbnail || 'https://rndsolution.id/assets/og-image.jpg';
  const fullTitle = `${data.title || 'Artikel'} — RND Solution`;

  const canonicalEl = document.getElementById('canonicalLink');
  if (canonicalEl) canonicalEl.setAttribute('href', pageUrl);

  const ogUrlEl = document.getElementById('ogUrl');
  if (ogUrlEl) ogUrlEl.setAttribute('content', pageUrl);

  const ogTitleEl = document.getElementById('ogTitle');
  if (ogTitleEl) ogTitleEl.setAttribute('content', fullTitle);

  const ogDescEl = document.getElementById('ogDescription');
  if (ogDescEl) ogDescEl.setAttribute('content', seoDesc);

  const ogImageEl = document.getElementById('ogImage');
  if (ogImageEl) ogImageEl.setAttribute('content', img);

  const twitterTitleEl = document.getElementById('twitterTitle');
  if (twitterTitleEl) twitterTitleEl.setAttribute('content', fullTitle);

  const twitterDescEl = document.getElementById('twitterDescription');
  if (twitterDescEl) twitterDescEl.setAttribute('content', seoDesc);

  container.innerHTML = `
    <div class="flex items-center gap-3 mb-3">
      ${data.kategori ? `<span class="text-accent font-mono text-xs bg-accent/10 px-3 py-1 rounded-full">${data.kategori}</span>` : ''}
      <p class="text-muted font-mono text-xs">${data.date ? new Date(data.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
    </div>
    <h1 class="text-3xl md:text-5xl font-extrabold mb-8">${data.title || ''}</h1>
    ${data.thumbnail ? `<img src="${data.thumbnail}" alt="${data.title || 'Artikel'}" class="w-full rounded-2xl mb-10 border border-white/10">` : ''}
    <div class="prose prose-invert max-w-none text-muted leading-relaxed">
      ${DOMPurify.sanitize(marked.parse(body))}
    </div>
  `;

  injectSchema(data, slug);
}

renderList();
renderDetail();
