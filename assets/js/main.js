(function () {
  'use strict';

  const REPO = window.REPO_CONFIG || {
    owner: 'YOUR_USERNAME',
    name: 'YOUR_REPO_NAME'
  };

  const CATEGORY_LABELS = {
    'Technical Bullshit': 'Technical Bullshit',
    'Mysticism in Motorsport': 'Mysticism in Motorsport',
    'Driver Psychology & Style Analysis': 'Driver Psychology & Style Analysis',
    'Ferrari Strategy Catastrophe Archive': 'Ferrari Strategy Catastrophe Archive',
    'Paddock Psychology Analysis': 'Paddock Psychology Analysis',
    'Paddock Fanfiction Studies': 'Paddock Fanfiction Studies'
  };

  const CATEGORY_COLORS = {
    'Technical Bullshit': '#2563eb',
    'Mysticism in Motorsport': '#7c3aed',
    'Driver Psychology & Style Analysis': '#059669',
    'Ferrari Strategy Catastrophe Archive': '#dc2626',
    'Paddock Psychology Analysis': '#d97706',
    'Paddock Fanfiction Studies': '#ec4899'
  };

  const CATEGORY_SLUGS = {
    'technical-bullshit': 'Technical Bullshit',
    'mysticism-in-motorsport': 'Mysticism in Motorsport',
    'driver-psychology-analysis': 'Driver Psychology & Style Analysis',
    'ferrari-strategy-catastrophe-archive': 'Ferrari Strategy Catastrophe Archive',
    'paddock-psychology-analysis': 'Paddock Psychology Analysis',
    'paddock-fanfiction-studies': 'Paddock Fanfiction Studies'
  };

  const API_PROXY = '/api/issues';
  const GITHUB_ISSUES = `https://github.com/${REPO.owner}/${REPO.name}/issues`;

  // === Utility ===
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function parseIssueBody(body) {
    const sections = {};
    const sectionRegex = /## (.+?)\n([\s\S]*?)(?=\n## |$)/g;
    let match;
    while ((match = sectionRegex.exec(body)) !== null) {
      sections[match[1].trim()] = match[2].trim();
    }
    return sections;
  }

  function getIssueNumber(url) {
    return url.match(/\/issues\/(\d+)/)?.[1] || null;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderMarkdown(md) {
    if (!md) return '';
    let html = md;

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const langClass = lang ? ` class="language-${escapeHtml(lang)}"` : '';
      const escaped = escapeHtml(code.trim());
      return `<pre><code${langClass}>${escaped}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

    // Bold & italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Unordered lists
    html = html.replace(/^[\s]*[-*]\s(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^[\s]*\d+\.\s(.+)$/gm, (_, content) => `<li>${content}</li>`);

    // Headers (h2, h3)
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

    // Horizontal rules
    html = html.replace(/^---+$/gm, '<hr>');

    // Paragraphs (double newlines)
    const blocks = html.split(/\n\n+/);
    const wrapped = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<')) return block;
      return `<p>${block}</p>`;
    }).join('\n');

    // Single line breaks within paragraphs
    return wrapped.replace(/<p>([^<]+)\n([^<]+)<\/p>/g, '<p>$1<br>$2</p>');
  }

  // === Fetch Issues ===
  async function fetchIssues(category, page = 1, perPage = 50) {
    let url = `${API_PROXY}?state=open&per_page=${perPage}&page=${page}`;

    if (category && CATEGORY_LABELS[category]) {
      url += `&labels=${encodeURIComponent(category)}`;
    }

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`API error: ${resp.status}`);
      const json = await resp.json();
      return json.data || [];
    } catch (err) {
      console.error('Failed to fetch issues:', err);
      return [];
    }
  }

  async function fetchIssue(number) {
    const url = `${API_PROXY}?number=${number}`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`API error: ${resp.status}`);
      const json = await resp.json();
      return json.data || null;
    } catch (err) {
      console.error('Failed to fetch issue:', err);
      return null;
    }
  }

  // === Render Functions ===
  function renderCard(issue) {
    const sections = parseIssueBody(issue.body || '');
    const category = issue.labels.find(l => CATEGORY_LABELS[l.name])?.name || 'Uncategorized';
    const issueNum = issue.number;

    const card = document.createElement('div');
    card.className = 'article-card';

    const meta = document.createElement('div');
    meta.className = 'article-card-meta';
    meta.innerHTML = `
      <span class="article-card-category" style="background: ${CATEGORY_COLORS[category] || '#888'}20; color: ${CATEGORY_COLORS[category] || '#888'}">${escapeHtml(category)}</span>
      <span class="article-card-date">${formatDate(issue.created_at)}</span>
    `;
    card.appendChild(meta);

    const title = document.createElement('h2');
    title.className = 'article-card-title';
    title.innerHTML = `<a href="${GITHUB_ISSUES}/${issueNum}" target="_blank" rel="noopener">${escapeHtml(issue.title)}</a>`;
    card.appendChild(title);

    const authors = document.createElement('div');
    authors.className = 'article-card-authors';
    const authorText = sections['Authors'] || issue.user?.login || 'Anonymous';
    authors.textContent = `By ${authorText}`;
    card.appendChild(authors);

    if (sections['Abstract']) {
      const abs = document.createElement('p');
      abs.className = 'article-card-abstract';
      abs.textContent = sections['Abstract'].substring(0, 250) + (sections['Abstract'].length > 250 ? '...' : '');
      card.appendChild(abs);
    }

    const footer = document.createElement('div');
    footer.className = 'article-card-footer';
    footer.innerHTML = `<a href="${GITHUB_ISSUES}/${issueNum}" target="_blank" rel="noopener" class="article-card-link">Read full paper →</a>`;
    card.appendChild(footer);

    return card;
  }

  function renderListItem(issue) {
    const sections = parseIssueBody(issue.body || '');
    const category = issue.labels.find(l => CATEGORY_LABELS[l.name])?.name || 'Uncategorized';
    const issueNum = issue.number;

    const item = document.createElement('div');
    item.className = 'article-list-item';

    const main = document.createElement('div');
    main.className = 'article-list-main';
    main.innerHTML = `
      <div class="article-list-title"><a href="${GITHUB_ISSUES}/${issueNum}" target="_blank" rel="noopener">${escapeHtml(issue.title)}</a></div>
      <div class="article-list-authors">By ${escapeHtml(sections['Authors'] || issue.user?.login || 'Anonymous')} — ${escapeHtml(category)}</div>
    `;
    item.appendChild(main);

    const date = document.createElement('div');
    date.className = 'article-list-date';
    date.textContent = formatDate(issue.created_at);
    item.appendChild(date);

    return item;
  }

  function renderArticle(issue) {
    const sections = parseIssueBody(issue.body || '');
    const category = issue.labels.find(l => CATEGORY_LABELS[l.name])?.name || 'Uncategorized';
    const issueNum = issue.number;

    const article = document.querySelector('.journal-article');
    if (!article) return;

    article.dataset.issueId = issueNum;

    // Meta
    article.querySelector('.article-category').textContent = category;
    article.querySelector('.article-date').textContent = formatDate(issue.created_at);

    // Title
    article.querySelector('.article-title').textContent = issue.title;

    // Authors
    article.querySelector('.article-authors').textContent = `By ${sections['Authors'] || issue.user?.login || 'Anonymous'}`;

    // Content
    const contentDiv = article.querySelector('.article-content');
    if (sections['Body']) {
      contentDiv.innerHTML = renderMarkdown(sections['Body']);
    } else if (sections['Content']) {
      contentDiv.innerHTML = renderMarkdown(sections['Content']);
    } else {
      contentDiv.innerHTML = renderMarkdown(issue.body || '');
    }

    // References
    const refsDiv = article.querySelector('.references-content');
    if (sections['References']) {
      refsDiv.innerHTML = renderMarkdown(sections['References']);
    } else {
      const parent = refsDiv.parentElement;
      if (parent) parent.style.display = 'none';
    }

    // Set page title
    document.title = `${issue.title} — F.U.C.K. Journal`;

    // Load comments
    loadComments(issueNum);
  }

  // === Comments (utteranc.es) ===
  function loadComments(issueNum) {
    const container = document.getElementById('comments-container');
    if (!container) return;

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', `${REPO.owner}/${REPO.name}`);
    script.setAttribute('issue-number', issueNum.toString());
    script.setAttribute('theme', 'github-light');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    container.appendChild(script);
  }

  // === Update Stats ===
  function updateStats(issues) {
    const totalEl = document.getElementById('stat-articles');
    if (totalEl) totalEl.textContent = issues.length;

    const authors = new Set();
    issues.forEach(issue => {
      const sections = parseIssueBody(issue.body || '');
      const author = sections['Authors'] || issue.user?.login;
      if (author) {
        author.split(/[,;&/]/).forEach(a => {
          const name = a.trim();
          if (name) authors.add(name);
        });
      }
    });

    const authorsEl = document.getElementById('stat-authors');
    if (authorsEl) authorsEl.textContent = authors.size;

    const citationsEl = document.getElementById('stat-citations');
    if (citationsEl) citationsEl.textContent = Math.floor(issues.length * 2.7);
  }

  // === Init Functions ===
  async function initHome() {
    const grid = document.getElementById('articles-grid');
    const loading = document.getElementById('articles-loading');
    if (!grid) return;

    const issues = await fetchIssues(null, 1, 50);
    if (loading) loading.style.display = 'none';

    if (!issues || issues.length === 0) {
      grid.innerHTML = `
        <div class="no-articles">
          <span class="no-articles-icon">📝</span>
          <h3>No articles yet / 还没有文章</h3>
          <p>Be the first to submit groundbreaking F1 research! / 快来投递第一篇突破性F1研究！</p>
          <a href="/submit" class="btn">Submit 投稿</a>
        </div>
      `;
      return;
    }

    updateStats(issues);

    // Exclude issue template/pinned issues
    const articles = issues.filter(i =>
      !i.title.toLowerCase().includes('[template]') &&
      !i.pinned
    );

    articles.slice(0, 12).forEach(issue => {
      grid.appendChild(renderCard(issue));
    });
  }

  async function initCategory() {
    const list = document.getElementById('articles-list');
    const loading = document.getElementById('articles-loading');
    if (!list) return;

    const filter = window.categoryFilter;
    if (!filter) {
      if (loading) loading.style.display = 'none';
      list.innerHTML = '<div class="error-state"><p>No category filter specified / 未指定栏目。</p></div>';
      return;
    }

    const issues = await fetchIssues(filter, 1, 50);
    if (loading) loading.style.display = 'none';

    if (!issues || issues.length === 0) {
      list.innerHTML = `
        <div class="no-articles">
          <span class="no-articles-icon">🔍</span>
          <h3>Nothing here yet / 这里还没有文章</h3>
          <p>No papers in "${escapeHtml(filter)}" yet. Submit one! / 还没有论文，快来投稿！</p>
          <a href="/submit" class="btn">Submit 投稿</a>
        </div>
      `;
      return;
    }

    issues.forEach(issue => {
      list.appendChild(renderListItem(issue));
    });
  }

  async function initArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    let issueNum = urlParams.get('issue');
    const loading = document.getElementById('articles-loading');

    if (!issueNum) {
      if (loading) loading.style.display = 'none';
      const el = document.querySelector('.journal-article');
      if (el) el.innerHTML = `<div class="error-state"><p>No article specified / 未指定文章。 <a href="${window.location.origin}/">Back to journal 返回首页</a></p></div>`;
      return;
    }

    if (loading) loading.style.display = 'block';

    const issue = await fetchIssue(issueNum);
    if (loading) loading.style.display = 'none';

    if (!issue) {
      const el = document.querySelector('.journal-article');
      if (el) el.innerHTML = `<div class="error-state"><p>Article not found / 未找到文章。 <a href="${window.location.origin}/">Back to journal 返回首页</a></p></div>`;
      return;
    }

    renderArticle(issue);
  }

  // === Boot ===
  document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;

    if (path === '/' || path === '/index.html') {
      initHome();
    } else if (path.startsWith('/categories/') || path.startsWith('/category/')) {
      initCategory();
    } else if (path.startsWith('/article') || path.startsWith('/paper')) {
      initArticle();
    } else if (path.startsWith('/submit') || path.startsWith('/submit.html')) {
      updateSubmitLink();
    }
  });

  function updateSubmitLink() {
    const templateUrl = `https://github.com/${REPO.owner}/${REPO.name}/issues/new?template=article-submission.yml`;
    document.querySelectorAll('#submit-link, #submit-cta-btn').forEach(el => {
      if (el && el.tagName === 'A') el.href = templateUrl;
    });
  }

})();
