module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { issueNumber, title, authors, category, abstract, body, references } = req.body;

  if (!issueNumber) {
    return res.status(400).json({ error: 'Missing issue number' });
  }

  const validCategories = [
    'Technical Bullshit',
    'Mysticism in Motorsport',
    'Driver Psychology & Style Analysis',
    'Paddock Psychology Analysis',
    'Paddock Fanfiction Studies',
    'Ferrari Strategy Catastrophe Archive'
  ];

  const updates = {};
  if (title) {
    updates.title = `[Paper]: ${title}`;
  }
  if (category) {
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    updates.labels = [category, 'submission'];
  }
  if (authors || abstract || body || references) {
    updates.body = [
      `## Authors`,
      authors || '',
      `\n## Abstract`,
      abstract || '',
      `\n## Body`,
      body || '',
      `\n## References`,
      references || 'None provided.'
    ].join('\n');
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    const response = await fetch(`https://api.github.com/repos/ashley0-926/fuck-journal/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'fuck-journal'
      },
      body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GitHub API error:', data);
      return res.status(500).json({
        error: 'Failed to update article. GitHub API error.',
        detail: data.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Article updated successfully! 文章更新成功！',
      url: data.html_url,
      number: data.number
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
