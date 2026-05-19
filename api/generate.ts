import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateYouTubeScript } from '../src/services/ai.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { draft } = req.body;
  if (!draft) {
    return res.status(400).json({ error: 'Draft idea/topic is required.' });
  }

  try {
    const data = await generateYouTubeScript(draft);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Vercel API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate script.' });
  }
}
