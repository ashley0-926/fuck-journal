module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { number, labels, page = '1', per_page = '50', state = 'open' } = req.query;

  try {
    let url;

    if (number) {
      url = `https://api.github.com/repos/ashley0-926/fuck-journal/issues/${number}`;
    } else {
      url = `https://api.github.com/repos/ashley0-926/fuck-journal/issues?state=${encodeURIComponent(state)}&per_page=${encodeURIComponent(per_page)}&page=${encodeURIComponent(page)}&sort=created&direction=desc`;
      if (labels) {
        url += `&labels=${encodeURIComponent(labels)}`;
      }
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'fuck-journal'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GitHub API error:', data);
      return res.status(response.status).json({
        error: 'GitHub API error',
        detail: data.message
      });
    }

    const rateLimit = {
      limit: response.headers.get('X-RateLimit-Limit'),
      remaining: response.headers.get('X-RateLimit-Remaining'),
      reset: response.headers.get('X-RateLimit-Reset')
    };

    res.setHeader('X-RateLimit-Limit', rateLimit.limit);
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);

    const result = {
      data: data,
      rateLimit
    };
    if (!number) {
      result.meta = { count: Array.isArray(data) ? data.length : 0 };
    }
    return res.status(200).json(result);

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
