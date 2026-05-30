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

  const { title, authors, category, abstract, body, references } = req.body;

  if (!title || !authors || !category || !abstract || !body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validCategories = [
    'Technical Bullshit',
    'Mysticism in Motorsport',
    'Driver Psychology & Style Analysis',
    'Paddock Psychology Analysis',
    'Paddock Fanfiction Studies',
    'Ferrari Strategy Catastrophe Archive'
  ];

  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const issueBody = `## Authors\n${authors}\n\n## Abstract\n${abstract}\n\n## Body\n${body}\n\n## References\n${references || 'None provided.'}`;

  try {
    const response = await fetch('https://api.github.com/repos/ashley0-926/fuck-journal/issues', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'fuck-journal'
      },
      body: JSON.stringify({
        title: `[Paper]: ${title}`,
        body: issueBody,
        labels: [category, 'submission']
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GitHub API error:', data);
      return res.status(500).json({
        error: 'Failed to create article. GitHub API error.',
        detail: data.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Article submitted successfully!',
      url: data.html_url,
      number: data.number
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
