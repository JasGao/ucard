import { NextApiRequest, NextApiResponse } from 'next';

const API_KEYS = process.env.RAPIDAPI_KEYS ? process.env.RAPIDAPI_KEYS.split(',') : [];
const AUDIO_API_KEYS = process.env.RAPIDAPI_AUDIO_KEYS ? process.env.RAPIDAPI_AUDIO_KEYS.split(',') : [];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, videoId, lang } = req.body;
  if (!type || !videoId) {
    return res.status(400).json({ error: 'Missing type or videoId' });
  }

  try {
    if (type === 'transcript') {
      // Try each API key for transcript
      let lastError = null;
      for (let i = 0; i < API_KEYS.length; i++) {
        try {
          const response = await fetch(`https://youtube-transcriptor.p.rapidapi.com/transcript?video_id=${videoId}&lang=${lang || 'en'}`,
            {
              method: 'GET',
              headers: {
                'x-rapidapi-host': 'youtube-transcriptor.p.rapidapi.com',
                'x-rapidapi-key': API_KEYS[i],
              },
            }
          );
          if (response.status === 429) continue;
          if (!response.ok) throw new Error(await response.text());
          const data = await response.json();
          return res.status(200).json(data);
        } catch (err) {
          lastError = err;
          if (!err.message.includes('429')) break;
        }
      }
      throw lastError || new Error('All API keys exhausted or invalid.');
    } else if (type === 'audio') {
      // Try each API key for audio download
      let lastError = null;
      for (let i = 0; i < AUDIO_API_KEYS.length; i++) {
        try {
          const RAPIDAPI_AUDIO_URL = 'https://youtube-video-fast-downloader-24-7.p.rapidapi.com/download_audio';
          const url = `${RAPIDAPI_AUDIO_URL}/${videoId}?quality=251`;
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'x-rapidapi-key': AUDIO_API_KEYS[i],
              'x-rapidapi-host': 'youtube-video-fast-downloader-24-7.p.rapidapi.com',
            },
          });
          if (response.status === 429) continue;
          if (!response.ok) throw new Error(await response.text());
          const data = await response.json();
          return res.status(200).json(data);
        } catch (err) {
          lastError = err;
          if (!err.message.includes('429')) break;
        }
      }
      throw lastError || new Error('All audio API keys exhausted or invalid.');
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
} 