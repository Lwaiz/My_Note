const isPostPage = window.location.pathname.endsWith('post.html');
const postListContainer = document.getElementById('post-list');
const markdownContainer = document.getElementById('markdown-content');
const postMeta = document.getElementById('post-meta');
const searchInput = document.getElementById('site-search');

let allPosts = [];

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`加载失败：${path}`);
  return res.json();
}

function buildPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.innerHTML = `
    <h2><a href="post.html?post=${encodeURIComponent(post.slug)}">${post.title}</a></h2>
    <p>${post.description || '暂无描述'}</p>
    <p class="post-meta">${post.date || ''}</p>
  `;
  return card;
}

function displayPostCards(posts) {
  postListContainer.innerHTML = '';
  if (!posts.length) {
    postListContainer.innerHTML = '<p>未找到匹配的文章，请更改搜索关键词。</p>';
    return;
  }
  posts.forEach(post => postListContainer.appendChild(buildPostCard(post)));
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function normalizeImageSrc(src, baseDir) {
  if (!src) return src;
  if (/^(https?:|\/|data:|#)/.test(src)) return src;
  const cleaned = src.replace(/^\.\//, '');
  return baseDir + cleaned;
}

function filterPosts(query) {
  query = query.trim().toLowerCase();
  if (!query) {
    displayPostCards(allPosts);
    return;
  }
  const filtered = allPosts.filter(post => {
    const subject = `${post.title} ${post.description || ''}`.toLowerCase();
    return subject.includes(query);
  });
  displayPostCards(filtered);
}

function populateArchive(posts) {
  const archiveEl = document.getElementById('archive-list');
  if (!archiveEl) return;
  const years = {};
  posts.forEach(post => {
    const year = post.date ? post.date.slice(0, 4) : '其他';
    years[year] = years[year] || [];
    years[year].push(post);
  });
  archiveEl.innerHTML = Object.keys(years).sort((a, b) => b.localeCompare(a)).map(year => {
    const items = years[year].map(post => `<li><a href="post.html?post=${encodeURIComponent(post.slug)}">${post.title}</a></li>`).join('');
    return `<div class="archive-year"><strong>${year}</strong><ul>${items}</ul></div>`;
  }).join('');
}

function populateCategories(posts) {
  const categoryEl = document.getElementById('categories-list');
  if (!categoryEl) return;
  const categories = new Map();
  posts.forEach(post => {
    const category = post.category || '未分类';
    categories.set(category, (categories.get(category) || 0) + 1);
  });
  categoryEl.innerHTML = Array.from(categories.entries()).map(([name, count]) => {
    return `<a href="#" class="category-pill">${name} (${count})</a>`;
  }).join('');
}

function populateSeries(posts) {
  const seriesEl = document.getElementById('series-list');
  if (!seriesEl) return;
  const seriesMap = new Map();
  posts.forEach(post => {
    if (post.series) {
      seriesMap.set(post.series, (seriesMap.get(post.series) || 0) + 1);
    }
  });
  if (!seriesMap.size) {
    seriesEl.innerHTML = '<p>当前没有系列信息，可在 <code>notes/posts.json</code> 中为文章添加 series 字段。</p>';
    return;
  }
  seriesEl.innerHTML = Array.from(seriesMap.entries()).map(([name, count]) => {
    return `<a href="#" class="series-pill">${name} (${count} 篇)</a>`;
  }).join('');
}

function setupSearch() {
  if (!searchInput) return;
  searchInput.addEventListener('input', () => {
    filterPosts(searchInput.value);
  });
}

function fixMarkdownImages(baseDir) {
  markdownContainer.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (!src) return;
    img.setAttribute('src', normalizeImageSrc(src, baseDir));
  });
}

async function renderPostList() {
  try {
    const data = await loadJSON('notes/posts.json');
    allPosts = data.posts || [];
    displayPostCards(allPosts);
    populateArchive(allPosts);
    populateCategories(allPosts);
    populateSeries(allPosts);
  } catch (err) {
    postListContainer.innerHTML = `<p>无法加载文章列表，请检查 <code>docs/notes/posts.json</code> 是否存在。</p>`;
    console.error(err);
  }
}

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildTOC() {
  const headings = markdownContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const toc = document.getElementById('post-toc');
  if (!headings.length || !toc) {
    return;
  }

  const usedIds = new Map();
  const list = document.createElement('ul');

  headings.forEach((heading) => {
    const level = Number(heading.tagName.slice(1));
    let id = heading.id || slugify(heading.textContent || '');
    if (!id) {
      id = `heading-${Math.random().toString(36).slice(2, 10)}`;
    }
    if (usedIds.has(id)) {
      const count = usedIds.get(id) + 1;
      usedIds.set(id, count);
      id = `${id}-${count}`;
    } else {
      usedIds.set(id, 1);
    }

    heading.id = id;

    const item = document.createElement('li');
    item.style.marginLeft = `${(level - 1) * 12}px`;
    item.innerHTML = `<a href="#${id}">${heading.textContent}</a>`;
    list.appendChild(item);
  });

  toc.innerHTML = '';
  toc.appendChild(list);
  
  // 滚动监听
  observeHeadings(headings);
}

function observeHeadings(headings) {
  const options = {
    root: null,
    rootMargin: '-100px 0px -66% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = document.querySelector(`#post-toc a[href="#${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        document.querySelectorAll('#post-toc a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, options);

  headings.forEach(heading => observer.observe(heading));
}

async function renderMarkdownPost() {
  const slug = getQueryParam('post');
  if (!slug) {
    markdownContainer.innerHTML = '<p>未指定文章，请返回 <a href="index.html">首页</a>。</p>';
    return;
  }

  try {
    const data = await loadJSON('notes/posts.json');
    const post = data.posts.find(item => item.slug === slug);
    if (!post) throw new Error('文章未找到');

    const filePath = `notes/${encodeURIComponent(slug)}.md`;
    const baseDir = filePath.substring(0, filePath.lastIndexOf('/') + 1);
    const md = await fetch(filePath);
    if (!md.ok) throw new Error('Markdown 文件加载失败');
    const text = await md.text();
    markdownContainer.innerHTML = marked.parse(text);
    fixMarkdownImages(baseDir);
    buildTOC();
    postMeta.innerHTML = `<p>${post.date || ''}</p><p><a href="index.html">返回文章列表</a></p>`;
    document.title = `${post.title} · 我的 Markdown 博客`;
  } catch (err) {
    markdownContainer.innerHTML = `<p>加载文章失败：${err.message}</p><p><a href="index.html">返回首页</a></p>`;
    console.error(err);
  }
}

if (isPostPage) {
  renderMarkdownPost();
} else {
  renderPostList();
  setupSearch();
}
