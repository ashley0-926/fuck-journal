module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { issue } = req.query;

  if (!issue) return res.status(400).json({ error: 'Missing issue number' });

  try {
    if (req.method === 'POST') {
      const viewResp = await fetch(
        `https://api.github.com/repos/ashley0-926/fuck-journal/contents/assets/data/views.json`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'fuck-journal'
          }
        }
      );
      const viewData = await viewResp.json();
      let views = {};
      let sha = null;

      if (viewResp.ok && !viewData.message) {
        const buff = Buffer.from(viewData.content, 'base64');
        views = JSON.parse(buff.toString());
        sha = viewData.sha;
      }

      views[issue] = (views[issue] || 0) + 1;

      const newContent = Buffer.from(JSON.stringify(views, null, 2)).toString('base64');
      const body = { message: `view ${issue}`, content: newContent };
      if (sha) body.sha = sha;

      await fetch(
        `https://api.github.com/repos/ashley0-926/fuck-journal/contents/assets/data/views.json`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'fuck-journal'
          },
          body: JSON.stringify(body)
        }
      );

      return res.status(200).json({ views: views[issue] });
    }

    if (req.method === 'GET') {
      const viewResp = await fetch(
        `https://api.github.com/repos/ashley0-926/fuck-journal/contents/assets/data/views.json`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'fuck-journal'
          }
        }
      );
      const viewData = await viewResp.json();
      let views = {};

      if (viewResp.ok && !viewData.message) {
        const buff = Buffer.from(viewData.content, 'base64');
        views = JSON.parse(buff.toString());
      }

      return res.status(200).json({ views: views[issue] || 0 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
