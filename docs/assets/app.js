const isPostPage = window.location.pathname.endsWith('post.html');
const isProfilePage = window.location.pathname.endsWith('profile.html');
const postListContainer = document.getElementById('post-list');
const markdownContainer = document.getElementById('markdown-content');
const profileMarkdownContainer = document.getElementById('profile-markdown');
const postMeta = document.getElementById('post-meta');
const searchInput = document.getElementById('site-search');
const themeToggle = document.getElementById('theme-toggle');
const siteHeader = document.querySelector('.site-header');
const THEME_STORAGE_KEY = 'preferred-theme';
const THEME_ORDER = ['light', 'dark', 'eye'];
const ALLOWED_THEMES = new Set(THEME_ORDER);
const THEME_META = {
  light: { icon: '☀', label: '日间模式' },
  dark: { icon: '☾', label: '夜间模式' },
  eye: { icon: '👁', label: '护眼模式' }
};

let allPosts = [];
let currentTheme = 'light';
let currentSeriesFilter = 'all';

function applyTheme(theme) {
  currentTheme = ALLOWED_THEMES.has(theme) ? theme : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (!themeToggle) return;
  const meta = THEME_META[currentTheme];
  themeToggle.textContent = meta.icon;
  themeToggle.setAttribute('aria-label', `${meta.label}，点击切换`);
  themeToggle.setAttribute('title', `${meta.label}，点击切换`);
}

function setupThemeSwitcher() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  applyTheme(ALLOWED_THEMES.has(storedTheme) ? storedTheme : 'light');
  if (!themeToggle) return;
  themeToggle.addEventListener('click', () => {
    const currentIndex = THEME_ORDER.indexOf(currentTheme);
    const nextTheme = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  });
}

function setupAutoHideHeader() {
  if (!siteHeader) return;
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY <= 8) {
      siteHeader.classList.remove('is-hidden');
      lastScrollY = currentScrollY;
      return;
    }

    if (currentScrollY > lastScrollY + 4) {
      siteHeader.classList.add('is-hidden');
    } else if (currentScrollY < lastScrollY - 4) {
      siteHeader.classList.remove('is-hidden');
    }
    lastScrollY = currentScrollY;
  }, { passive: true });
}

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
  const basePosts = currentSeriesFilter !== 'all'
    ? allPosts.filter(post => post.series === currentSeriesFilter)
    : allPosts;

  if (!query) {
    displayPostCards(basePosts);
    return;
  }
  const filtered = basePosts.filter(post => {
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
      const existing = seriesMap.get(post.series);
      if (existing) {
        existing.count += 1;
      } else {
        seriesMap.set(post.series, { count: 1, firstSlug: post.slug });
      }
    }
  });
  if (!seriesMap.size) {
    seriesEl.innerHTML = '<p>当前没有系列信息，可在 <code>notes/posts.json</code> 中为文章添加 series 字段。</p>';
    return;
  }
  seriesEl.innerHTML = Array.from(seriesMap.entries()).map(([name, info]) => {
    const jumpLink = `index.html?series=${encodeURIComponent(name)}#series`;
    return `
      <article class="series-card">
        <h3><a href="${jumpLink}">${name}</a></h3>
        <p>该系列共 ${info.count} 篇文章</p>
      </article>
    `;
  }).join('');
}

function setupSeriesFilter(posts) {
  const filterContainer = document.getElementById('series-filter');
  if (!filterContainer) return;

  const seriesSet = new Set();
  posts.forEach(post => {
    if (post.series) {
      seriesSet.add(post.series);
    }
  });

  const buttons = [];
  // 关键修复：根据 currentSeriesFilter 动态设置激活状态
  buttons.push(`<button class="filter-btn ${currentSeriesFilter === 'all' ? 'filter-btn-active' : ''}" data-series="all">全部</button>`);
  //const buttons = ['<button class="filter-btn filter-btn-active" data-series="all">全部</button>'];
  Array.from(seriesSet).sort().forEach(series => {
    buttons.push(`<button class="filter-btn" data-series="${series}">${series}</button>`);
  });

  filterContainer.innerHTML = buttons.join('');

  filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const series = btn.getAttribute('data-series');
      currentSeriesFilter = series;

      // 更新按钮状态
      filterContainer.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('filter-btn-active');
      });
      btn.classList.add('filter-btn-active');

      // 更新显示标题
      const introTitle = document.querySelector('.intro h2');
      if (introTitle) {
        introTitle.textContent = series === 'all' ? '文章列表' : `文章列表（${series}）`;
      }

      // 过滤并显示文章
      filterPosts(searchInput?.value || '');
    });
  });
}

function setupSearch() {
  if (!searchInput) return;
  searchInput.addEventListener('input', () => {
    filterPosts(searchInput.value);
  });
}

function fixMarkdownImages(container, baseDir) {
  if (!container) return;
  container.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (!src) return;
    img.setAttribute('src', normalizeImageSrc(src, baseDir));
  });
}

async function renderPostList() {
  try {
    const data = await loadJSON('notes/posts.json');
    allPosts = data.posts || [];
    // const urlSeries = getQueryParam('series');
    currentSeriesFilter = 'all';
    
    // currentSeriesFilter = getQueryParam('series') || 'all';

    // 生成系列过滤按钮
    setupSeriesFilter(allPosts);

    // 根据当前过滤条件显示文章
    const initialPosts = currentSeriesFilter !== 'all'
      ? allPosts.filter(post => post.series === currentSeriesFilter)
      : allPosts;
    displayPostCards(initialPosts);

    // const introTitle = document.querySelector('.intro h2');
    // if (introTitle && currentSeriesFilter !== 'all') {
    //   introTitle.textContent = `文章列表（${currentSeriesFilter}）`;
    // }
    // 关键修复：初始化时同步标题
    // const introTitle = document.querySelector('.intro h2');
    // if (introTitle) {
    //   introTitle.textContent = currentSeriesFilter === 'all' 
    //     ? '文章列表' 
    //     : `文章列表（${currentSeriesFilter}）`;
    // }

    // 标题恢复为默认
    const introTitle = document.querySelector('.intro h2');
    if (introTitle) {
      introTitle.textContent = '文章列表';
    }


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
    fixMarkdownImages(markdownContainer, baseDir);
    buildTOC();
    postMeta.innerHTML = `
      <p>${post.date || ''}</p>
      <p><a href="index.html" class="back-to-list-button">返回文章列表</a></p>
    `;
    document.title = `${post.title} · 我的 Markdown 博客`;
  } catch (err) {
    markdownContainer.innerHTML = `<p>加载文章失败：${err.message}</p><p><a href="index.html">返回首页</a></p>`;
    console.error(err);
  }
}

async function renderProfilePage() {
  if (!profileMarkdownContainer) return;
  const filePath = 'notes/profile.md';
  try {
    const md = await fetch(filePath);
    if (!md.ok) throw new Error('个人中心 Markdown 加载失败');
    const text = await md.text();
    profileMarkdownContainer.innerHTML = marked.parse(text);
    fixMarkdownImages(profileMarkdownContainer, 'notes/');
    document.title = '个人中心 · Leo Blog';
  } catch (err) {
    profileMarkdownContainer.innerHTML = `<p>加载个人中心失败：${err.message}</p><p><a href="index.html">返回首页</a></p>`;
    console.error(err);
  }
}

if (isPostPage) {
  setupAutoHideHeader();
  setupThemeSwitcher();
  renderMarkdownPost();
} else if (isProfilePage) {
  setupAutoHideHeader();
  setupThemeSwitcher();
  renderProfilePage();
} else {
  setupAutoHideHeader();
  setupThemeSwitcher();
  renderPostList();
  setupSearch();
}


document.addEventListener('DOMContentLoaded', function () {
  let isScrollingToc = false;

  // 页面加载时执行一次
  scrollTocToActive();

  // 监听页面滚动
  window.addEventListener('scroll', function () {
    if (isScrollingToc) return; // 避免目录滚动触发页面滚动死循环
    scrollTocToActive();
  });

  function scrollTocToActive() {
    const activeItem = document.querySelector('.toc-nav a.active');
    const tocContainer = document.querySelector('.toc-section');

    if (!activeItem || !tocContainer) return;

    // 锁定，防止循环触发
    isScrollingToc = true;

    // 计算目录内部滚动（只滚目录，不滚页面）
    const itemTop = activeItem.offsetTop;
    const containerHeight = tocContainer.clientHeight;
    const itemHeight = activeItem.offsetHeight;

    // 让当前项居中显示在目录里
    tocContainer.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);

    // 解锁
    setTimeout(() => {
      isScrollingToc = false;
    }, 100);
  }
});


