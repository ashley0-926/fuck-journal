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

  const REACTION_TYPES = [
    { id: 'academic_titan', emoji: '🏆', label: '学术泰斗', labelEn: 'Academic Titan' },
    { id: 'groundbreaking', emoji: '💥', label: '突破性研究', labelEn: 'Groundbreaking' },
    { id: 'mind_blown', emoji: '🤯', label: '我已无语', labelEn: 'Mind Blown' },
    { id: 'ferrari_strategy', emoji: '🏳️', label: '策略灾难', labelEn: 'Ferrari Strategy' },
    { id: 'based', emoji: '🗿', label: '中肯', labelEn: 'Based' },
    { id: 'paddock_drama', emoji: '🎭', label: '围场好戏', labelEn: 'Paddock Drama' }
  ];

  const API_PROXY = '/api/issues';
  const GITHUB_ISSUES = `https://github.com/${REPO.owner}/${REPO.name}/issues`;

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
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderMarkdown(md) {
    if (!md) return '';
    let html = md;

    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const langClass = lang ? ` class="language-${escapeHtml(lang)}"` : '';
      const escaped = escapeHtml(code.trim());
      return `<pre><code${langClass}>${escaped}</code></pre>`;
    });

    html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    html = html.replace(/^[\s]*[-*]\s(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    html = html.replace(/^[\s]*\d+\.\s(.+)$/gm, (_, content) => `<li>${content}</li>`);

    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

    html = html.replace(/^---+$/gm, '<hr>');

    const blocks = html.split(/\n\n+/);
    const wrapped = blocks.map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<')) return block;
      return `<p>${block}</p>`;
    }).join('\n');

    return wrapped.replace(/<p>([^<]+)\n([^<]+)<\/p>/g, '<p>$1<br>$2</p>');
  }

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

  async function fetchViews(issueNum) {
    try {
      const resp = await fetch(`/api/views?issue=${issueNum}`);
      if (!resp.ok) return 0;
      const json = await resp.json();
      return json.views || 0;
    } catch {
      return 0;
    }
  }

  async function recordView(issueNum) {
    try {
      await fetch(`/api/views?issue=${issueNum}`, { method: 'POST' });
    } catch {}
  }

  async function fetchCommentsAndReactions(issueNum) {
    try {
      const resp = await fetch(`/api/comments?issue=${issueNum}`);
      if (!resp.ok) return { comments: [], reactions: {}, totalReactions: 0 };
      return await resp.json();
    } catch {
      return { comments: [], reactions: {}, totalReactions: 0 };
    }
  }

  async function submitReaction(issueNum, type) {
    try {
      const resp = await fetch(`/api/comments?issue=${issueNum}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      if (!resp.ok) throw new Error('Failed');
      return await resp.json();
    } catch (err) {
      console.error('Reaction failed:', err);
      return null;
    }
  }

  async function submitComment(issueNum, author, body) {
    try {
      const resp = await fetch(`/api/comments?issue=${issueNum}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: `**${author}** says:\n\n${body}` })
      });
      if (!resp.ok) throw new Error('Failed');
      return await resp.json();
    } catch (err) {
      console.error('Comment failed:', err);
      return null;
    }
  }

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
    title.innerHTML = `<a href="/paper/?issue=${issueNum}">${escapeHtml(issue.title)}</a>`;
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
    footer.innerHTML = `<a href="/paper/?issue=${issueNum}" class="article-card-link">Read full paper →</a>`;
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
      <div class="article-list-title"><a href="/paper/?issue=${issueNum}">${escapeHtml(issue.title)}</a></div>
      <div class="article-list-authors">By ${escapeHtml(sections['Authors'] || issue.user?.login || 'Anonymous')} — ${escapeHtml(category)}</div>
    `;
    item.appendChild(main);

    const date = document.createElement('div');
    date.className = 'article-list-date';
    date.textContent = formatDate(issue.created_at);
    item.appendChild(date);

    return item;
  }

  async function renderArticle(issue) {
    const sections = parseIssueBody(issue.body || '');
    const category = issue.labels.find(l => CATEGORY_LABELS[l.name])?.name || 'Uncategorized';
    const issueNum = issue.number;

    const article = document.querySelector('.journal-article');
    if (!article) return;

    article.dataset.issueId = issueNum;

    article.querySelector('.article-category').textContent = category;
    article.querySelector('.article-category').style.color = CATEGORY_COLORS[category] || '#888';
    article.querySelector('.article-date').textContent = formatDate(issue.created_at);
    article.querySelector('.article-title').textContent = issue.title;
    article.querySelector('.article-authors').textContent = `By ${sections['Authors'] || issue.user?.login || 'Anonymous'}`;

    const consentBanner = document.getElementById('article-consent-banner');
    if (consentBanner) {
      const hasConsent = issue.labels?.some(l => l.name === 'consent-share');
      consentBanner.style.display = hasConsent ? 'flex' : 'none';
    }

    const abstractDiv = article.querySelector('.abstract-content');
    if (abstractDiv) {
      if (sections['Abstract']) {
        abstractDiv.innerHTML = renderMarkdown(sections['Abstract']);
      } else {
        const parent = abstractDiv.parentElement;
        if (parent) parent.style.display = 'none';
      }
    }

    const contentDiv = article.querySelector('.article-content');
    if (sections['Body']) {
      contentDiv.innerHTML = renderMarkdown(sections['Body']);
    } else if (sections['Content']) {
      contentDiv.innerHTML = renderMarkdown(sections['Content']);
    } else {
      contentDiv.innerHTML = renderMarkdown(issue.body || '');
    }

    const refsDiv = article.querySelector('.references-content');
    if (sections['References']) {
      refsDiv.innerHTML = renderMarkdown(sections['References']);
    } else {
      const parent = refsDiv.parentElement;
      if (parent) parent.style.display = 'none';
    }

    document.title = `${issue.title} — F.U.C.K. Journal`;

    recordView(issueNum);

    fetchViews(issueNum).then(views => {
      const viewsEl = document.getElementById('article-views');
      if (viewsEl) {
        viewsEl.innerHTML = `👁️ ${views} views 阅读`;
      }
    });

    const cr = await fetchCommentsAndReactions(issueNum);
    renderReactions(cr);
    renderComments(cr.comments);
  }

  function renderReactions(cr) {
    const bar = document.getElementById('reactions-bar');
    if (!bar) return;

    const reactions = cr.reactions || {};
    const total = cr.totalReactions || 0;

    bar.innerHTML = '';

    REACTION_TYPES.forEach(rt => {
      const count = reactions[rt.id] || 0;
      const btn = document.createElement('button');
      btn.className = 'reaction-btn';
      btn.title = `${rt.labelEn} ${rt.label}`;
      btn.innerHTML = `<span class="reaction-emoji">${rt.emoji}</span><span class="reaction-label">${rt.label}</span><span class="reaction-count">${count}</span>`;

      btn.addEventListener('click', async () => {
        const issueNum = document.querySelector('.journal-article')?.dataset.issueId;
        if (!issueNum) return;
        const result = await submitReaction(issueNum, rt.id);
        if (result && result.reactions) {
          renderReactions(result);
        }
      });

      bar.appendChild(btn);
    });

    const totalEl = document.createElement('div');
    totalEl.className = 'reaction-total';
    totalEl.textContent = `${total} reactions 评价`;
    bar.appendChild(totalEl);
  }

  function renderComments(comments) {
    const list = document.getElementById('comments-list');
    if (!list) return;

    if (!comments || comments.length === 0) {
      list.innerHTML = '<div class="comments-empty"><p>No peer reviews yet. Be the first!<br>还没有同行评议，来做第一个！</p></div>';
      return;
    }

    list.innerHTML = comments.map(c => `
      <div class="comment-item">
        <div class="comment-header">
          <span class="comment-author">${escapeHtml(c.user)}</span>
          <span class="comment-date">${formatDate(c.created_at)}</span>
        </div>
        <div class="comment-body">${renderMarkdown(c.body)}</div>
      </div>
    `).join('');
  }

  function renderPopular(cardHtml) {
    const grid = document.getElementById('popular-grid');
    const loading = document.getElementById('popular-loading');
    if (!grid) return;

    if (loading) loading.style.display = 'none';

    if (!cardHtml || cardHtml.length === 0) {
      grid.innerHTML = '<div class="no-articles"><p>No popular articles yet. 还没有热门文章。</p></div>';
      return;
    }

    const container = document.createElement('div');
    container.className = 'articles-grid';
    container.innerHTML = cardHtml.join('');
    grid.innerHTML = '';
    grid.appendChild(container);
  }

  async function updateStats(issues) {
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

    const articles = issues.filter(i =>
      !i.title.toLowerCase().includes('[template]') &&
      !i.pinned
    );

    articles.slice(0, 12).forEach(issue => {
      grid.appendChild(renderCard(issue));
    });

    loadPopular(articles);
  }

  async function loadPopular(articles) {
    try {
      const limited = articles.slice(0, 20);
      const withReactions = await Promise.all(
        limited.map(async (issue) => {
          const cr = await fetchCommentsAndReactions(issue.number);
          return { issue, totalReactions: cr.totalReactions || 0 };
        })
      );

      withReactions.sort((a, b) => b.totalReactions - a.totalReactions);
      const top = withReactions.slice(0, 6).filter(item => item.totalReactions > 0);

      if (top.length === 0) {
        renderPopular(null);
        return;
      }

      const html = top.map(item => {
        const cat = item.issue.labels.find(l => CATEGORY_LABELS[l.name])?.name || 'Uncategorized';
        const sections = parseIssueBody(item.issue.body || '');
        const color = CATEGORY_COLORS[cat] || '#888';
        return `
          <div class="article-card popular-card">
            <div class="article-card-meta">
              <span class="article-card-category" style="background: ${color}20; color: ${color}">${escapeHtml(cat)}</span>
              <span class="popular-badge">🏆 #${item.totalReactions}</span>
            </div>
            <h2 class="article-card-title"><a href="/paper/?issue=${item.issue.number}">${escapeHtml(item.issue.title)}</a></h2>
            <div class="article-card-authors">By ${escapeHtml(sections['Authors'] || item.issue.user?.login || 'Anonymous')}</div>
            <div class="article-card-footer">
              <a href="/paper/?issue=${item.issue.number}" class="article-card-link">Read 阅读 →</a>
            </div>
          </div>
        `;
      });

      renderPopular(html);
    } catch (err) {
      console.error('Failed to load popular:', err);
      renderPopular(null);
    }
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

    await renderArticle(issue);
    setupCommentForm(issueNum);
  }

  function setupCommentForm(issueNum) {
    const btn = document.getElementById('comment-submit');
    const authorInput = document.getElementById('comment-author');
    const bodyInput = document.getElementById('comment-body');
    const status = document.getElementById('comment-status');

    if (!btn || !bodyInput) return;

    btn.addEventListener('click', async () => {
      const author = authorInput?.value.trim() || 'Anonymous';
      const body = bodyInput.value.trim();

      if (!body) {
        status.className = 'form-status form-error';
        status.innerHTML = '<strong>✗</strong> Please write a comment. 请填写评论。';
        status.style.display = 'block';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Submitting... 提交中...';
      status.style.display = 'none';

      const result = await submitComment(issueNum, author, body);

      if (result && result.success) {
        status.className = 'form-status form-success';
        status.innerHTML = '<strong>✓</strong> Comment submitted! 评论提交成功！';
        status.style.display = 'block';
        bodyInput.value = '';
        const cr = await fetchCommentsAndReactions(issueNum);
        renderComments(cr.comments);
      } else {
        status.className = 'form-status form-error';
        status.innerHTML = '<strong>✗</strong> Failed to submit. 提交失败。';
        status.style.display = 'block';
      }

      btn.disabled = false;
      btn.textContent = 'Submit Review 提交评议';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;

    if (path === '/' || path === '/index.html') {
      initHome();
    } else if (path.startsWith('/categories/') || path.startsWith('/category/')) {
      initCategory();
    } else if (path.startsWith('/paper') || path.startsWith('/article')) {
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
