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
          <option value="Driver Physiognomy Studies">🧠 Driver Physiognomy Studies 车手面相学</option>
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
        Your article will appear on the site shortly.<br>
        文章即将出现在网站上。<br>
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
</script>
