import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to fetch audio' });
    }
    // Set headers to match the source file
    res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline');
    // Stream the file to the client
    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 