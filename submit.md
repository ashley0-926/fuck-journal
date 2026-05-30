---
layout: default
title: Submit Article 投稿
---

<div class="page-content submit-page">
  <h1>Submit an Article 投稿</h1>

  <div class="submit-intro">
    <p>Fill out the form below to submit directly, or use <a href="https://github.com/ashley0-926/fuck-journal/issues/new" target="_blank">GitHub Issues</a>.<br>直接在下方填写提交，或通过 GitHub Issues 提交。</p>
  </div>

  <div id="submit-form-container">
    <form id="article-form" class="article-form">
      <div class="form-group">
        <label for="form-title">Title 标题 *</label>
        <input type="text" id="form-title" name="title" required
          placeholder="e.g. The DRS Train: A Longitudinal Study of Followability">
      </div>

      <div class="form-group">
        <label for="form-authors">Authors 作者 *</label>
        <input type="text" id="form-authors" name="authors" required
          placeholder="e.g. Juan Sheig, Max Power">
      </div>

      <div class="form-group">
        <label for="form-category">Category 栏目 *</label>
        <select id="form-category" name="category" required>
          <option value="">— Select a category 选择栏目 —</option>
          <option value="Technical Bullshit">⚙️ Technical Bullshit 技术扯淡</option>
          <option value="Mysticism in Motorsport">🔮 Mysticism in Motorsport 赛车玄学</option>
          <option value="Driver Psychology & Style Analysis">🧠 Driver Psychology & Style 车手人格与风格</option>
          <option value="Paddock Psychology Analysis">🎭 Paddock Psychology 围场心理学</option>
          <option value="Paddock Fanfiction Studies">💕 Paddock Fanfiction 围场同人研究</option>
          <option value="Ferrari Strategy Catastrophe Archive">🏳️ Ferrari Strategy Archive 法拉利策略灾难</option>
        </select>
      </div>

      <div class="form-group">
        <label for="form-abstract">Abstract 摘要 *</label>
        <textarea id="form-abstract" name="abstract" rows="4" required
          placeholder="A brief summary of your groundbreaking research. Make it sound academic."></textarea>
      </div>

      <div class="form-group">
        <label for="form-body">Body 正文 *</label>
        <textarea id="form-body" name="body" rows="12" required
          placeholder="## Introduction&#10;&#10;## Methodology&#10;&#10;## Results&#10;&#10;## Discussion&#10;&#10;## Conclusion"></textarea>
        <p class="form-hint">Supports Markdown 支持 Markdown 格式</p>
      </div>

      <div class="form-group">
        <label for="form-references">References 参考文献</label>
        <textarea id="form-references" name="references" rows="4"
          placeholder="1. F.U.C.K. J. (2026). The foundational text.&#10;2. Some guy on Reddit (2025). ..."></textarea>
      </div>

      <div class="form-submit-row">
        <button type="submit" class="btn btn-large" id="form-submit-btn">
          Submit Article 提交论文 →
        </button>
      </div>

      <div id="form-status" class="form-status" style="display:none;"></div>
    </form>
  </div>

  <hr class="section-divider">

  <div class="edit-section">
    <h2>Need to Correct? 需要修改？</h2>
    <p>Submitted to the wrong category? Made a typo in your groundbreaking research?<br>
    投错栏目了？或者论文里有个错别字？</p>
    <p><strong>Find your Issue Number:</strong> After submitting, your article number is shown in the success message above. You can also find it at the end of your GitHub issue URL (e.g., <code>https://github.com/ashley0-926/fuck-journal/issues/<strong>42</strong></code>).<br>
    <strong>查找你的 Issue 编号：</strong>提交成功后会在上方显示文章编号，也可以在 GitHub Issue 链接末尾找到。</p>

    <form id="edit-form" class="article-form edit-form">
      <div class="form-group">
        <label for="edit-issue-number">Issue Number 文章编号 *</label>
        <input type="number" id="edit-issue-number" name="issueNumber" required min="1"
          placeholder="e.g. 42">
      </div>

      <div class="form-group">
        <label for="edit-title">Title 标题</label>
        <input type="text" id="edit-title" name="title"
          placeholder="Leave blank to keep unchanged">
      </div>

      <div class="form-group">
        <label for="edit-authors">Authors 作者</label>
        <input type="text" id="edit-authors" name="authors"
          placeholder="Leave blank to keep unchanged">
      </div>

      <div class="form-group">
        <label for="edit-category">Category 栏目</label>
        <select id="edit-category" name="category">
          <option value="">— Keep unchanged 保持不变 —</option>
          <option value="Technical Bullshit">⚙️ Technical Bullshit 技术扯淡</option>
          <option value="Mysticism in Motorsport">🔮 Mysticism in Motorsport 赛车玄学</option>
          <option value="Driver Psychology & Style Analysis">🧠 Driver Psychology & Style 车手人格与风格</option>
          <option value="Paddock Psychology Analysis">🎭 Paddock Psychology 围场心理学</option>
          <option value="Paddock Fanfiction Studies">💕 Paddock Fanfiction 围场同人研究</option>
          <option value="Ferrari Strategy Catastrophe Archive">🏳️ Ferrari Strategy Archive 法拉利策略灾难</option>
        </select>
      </div>

      <div class="form-group">
        <label for="edit-abstract">Abstract 摘要</label>
        <textarea id="edit-abstract" name="abstract" rows="4"
          placeholder="Leave blank to keep unchanged"></textarea>
      </div>

      <div class="form-group">
        <label for="edit-body">Body 正文</label>
        <textarea id="edit-body" name="body" rows="12"
          placeholder="Leave blank to keep unchanged"></textarea>
      </div>

      <div class="form-group">
        <label for="edit-references">References 参考文献</label>
        <textarea id="edit-references" name="references" rows="4"
          placeholder="Leave blank to keep unchanged"></textarea>
      </div>

      <div class="form-submit-row">
        <button type="submit" class="btn btn-large" id="edit-submit-btn">
          Update Article 更新论文 →
        </button>
      </div>

      <div id="edit-status" class="form-status" style="display:none;"></div>
    </form>
  </div>

  <div class="submit-guidelines">
    <h2>Submission Guidelines 投稿指南</h2>
    <div class="guidelines-grid">
      <div class="guideline">
        <h4>✅ DO 可以</h4>
        <ul>
          <li>Use academic language excessively / 过度使用学术语言</li>
          <li>Include fake statistics (be creative) / 编造数据（要有创意）</li>
          <li>Cite "F.U.C.K. J. 2026" as a reference / 引用"F.U.C.K. J. 2026"作为参考文献</li>
          <li>Be funny / 搞笑</li>
        </ul>
      </div>
      <div class="guideline">
        <h4>❌ DON'T 不可以</h4>
        <ul>
          <li>Be genuinely offensive (keep it silly) / 真正冒犯他人（保持沙雕）</li>
          <li>Submit actual serious analysis (wrong journal) / 提交真正的严肃分析（投错期刊了）</li>
          <li>Use AI-generated slop — write your own slop / 用AI生成垃圾——请自己写垃圾</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<script>
document.getElementById('article-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const btn = document.getElementById('form-submit-btn');
  const status = document.getElementById('form-status');
  const formData = {
    title: document.getElementById('form-title').value.trim(),
    authors: document.getElementById('form-authors').value.trim(),
    category: document.getElementById('form-category').value,
    abstract: document.getElementById('form-abstract').value.trim(),
    body: document.getElementById('form-body').value.trim(),
    references: document.getElementById('form-references').value.trim()
  };

  btn.disabled = true;
  btn.textContent = 'Submitting... 提交中...';
  status.style.display = 'none';

  try {
    const resp = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await resp.json();

    if (resp.ok && data.success) {
      status.className = 'form-status form-success';
      status.innerHTML = `
        <strong>✓ Article submitted! 论文提交成功！</strong><br>
        <strong>Issue #${data.number}</strong> — Save this number if you need to edit later.<br>
        请保存此编号，后续如需修改可使用。<br>
        Your article will appear on the site shortly. 文章即将出现在网站上。<br>
        <a href="${data.url}" target="_blank">View on GitHub 在GitHub查看 →</a>
      `;
      document.getElementById('article-form').reset();
    } else {
      status.className = 'form-status form-error';
      status.innerHTML = `<strong>✗ Error 错误:</strong> ${data.error || 'Unknown error'}`;
    }
  } catch (err) {
    status.className = 'form-status form-error';
    status.innerHTML = `<strong>✗ Network error 网络错误:</strong> ${err.message}`;
  }

  status.style.display = 'block';
  btn.disabled = false;
  btn.textContent = 'Submit Article 提交论文 →';
});

document.getElementById('edit-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const btn = document.getElementById('edit-submit-btn');
  const status = document.getElementById('edit-status');
  const formData = {
    issueNumber: parseInt(document.getElementById('edit-issue-number').value.trim()),
    title: document.getElementById('edit-title').value.trim() || undefined,
    authors: document.getElementById('edit-authors').value.trim() || undefined,
    category: document.getElementById('edit-category').value || undefined,
    abstract: document.getElementById('edit-abstract').value.trim() || undefined,
    body: document.getElementById('edit-body').value.trim() || undefined,
    references: document.getElementById('edit-references').value.trim() || undefined
  };

  btn.disabled = true;
  btn.textContent = 'Updating... 更新中...';
  status.style.display = 'none';

  try {
    const resp = await fetch('/api/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await resp.json();

    if (resp.ok && data.success) {
      status.className = 'form-status form-success';
      status.innerHTML = `
        <strong>✓ Article updated! 文章更新成功！</strong><br>
        <a href="${data.url}" target="_blank">View on GitHub 在GitHub查看 →</a>
      `;
      document.getElementById('edit-form').reset();
    } else {
      status.className = 'form-status form-error';
      status.innerHTML = `<strong>✗ Error 错误:</strong> ${data.error || 'Unknown error'}${data.detail ? ': ' + data.detail : ''}`;
    }
  } catch (err) {
    status.className = 'form-status form-error';
    status.innerHTML = `<strong>✗ Network error 网络错误:</strong> ${err.message}`;
  }

  status.style.display = 'block';
  btn.disabled = false;
  btn.textContent = 'Update Article 更新论文 →';
});
</script>
