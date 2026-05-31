const REACTION_LABELS = {
  'academic_titan': { emoji: '🏆', label: '学术泰斗', labelEn: 'Academic Titan' },
  'groundbreaking': { emoji: '💥', label: '突破性研究', labelEn: 'Groundbreaking' },
  'mind_blown': { emoji: '🤯', label: '我已无语', labelEn: 'Mind Blown' },
  'ferrari_strategy': { emoji: '🏳️', label: '策略灾难', labelEn: 'Ferrari Strategy' },
  'based': { emoji: '🗿', label: '中肯', labelEn: 'Based' },
  'paddock_drama': { emoji: '🎭', label: '围场好戏', labelEn: 'Paddock Drama' }
};

const REACTION_PREFIX = '__REACTION__:';

function parseComments(comments) {
  const regular = [];
  const reactions = {};

  for (const key of Object.keys(REACTION_LABELS)) {
    reactions[key] = 0;
  }

  for (const c of comments) {
    const body = c.body || '';
    if (body.startsWith(REACTION_PREFIX)) {
      const type = body.replace(REACTION_PREFIX, '').trim();
      if (REACTION_LABELS[type]) {
        reactions[type] = (reactions[type] || 0) + 1;
      }
    } else {
      regular.push({
        id: c.id,
        user: c.user?.login || 'Anonymous',
        avatar: c.user?.avatar_url || '',
        body: c.body,
        created_at: c.created_at,
        html_url: c.html_url
      });
    }
  }

  return { comments: regular, reactions };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { issue } = req.query;

  if (!issue) return res.status(400).json({ error: 'Missing issue number' });

  try {
    if (req.method === 'POST') {
      const { type, author, body } = req.body;

      let commentBody = '';
      if (type && REACTION_LABELS[type]) {
        commentBody = `${REACTION_PREFIX}${type}`;
      } else if (body) {
        commentBody = body;
      } else {
        return res.status(400).json({ error: 'Missing body or reaction type' });
      }

      const resp = await fetch(
        `https://api.github.com/repos/ashley0-926/fuck-journal/issues/${issue}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'fuck-journal'
          },
          body: JSON.stringify({ body: commentBody })
        }
      );

      const data = await resp.json();
      if (!resp.ok) {
        return res.status(500).json({ error: 'Failed to create comment', detail: data.message });
      }

      const allComments = await fetchAllComments(issue);
      const parsed = parseComments(allComments);

      return res.status(200).json({
        success: true,
        comment: data,
        reactions: parsed.reactions,
        totalReactions: Object.values(parsed.reactions).reduce((a, b) => a + b, 0)
      });
    }

    if (req.method === 'GET') {
      const allComments = await fetchAllComments(issue);
      const parsed = parseComments(allComments);

      return res.status(200).json({
        comments: parsed.comments,
        reactions: parsed.reactions,
        totalReactions: Object.values(parsed.reactions).reduce((a, b) => a + b, 0)
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

async function fetchAllComments(issue) {
  let page = 1;
  let all = [];

  while (true) {
    const resp = await fetch(
      `https://api.github.com/repos/ashley0-926/fuck-journal/issues/${issue}/comments?per_page=100&page=${page}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'fuck-journal'
        }
      }
    );
    const data = await resp.json();
    if (!resp.ok || !Array.isArray(data) || data.length === 0) break;
    all = all.concat(data);
    page++;
  }

  return all;
}
