import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { draft } = req.body;
  if (!draft) {
    return res.status(400).json({ error: 'Draft idea/topic is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set.' });
  }

  try {
    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert YouTube script writer. Write a catchy, highly engaging script based on the draft/topic below.
The script should be between 1 and 3 minutes long (approx 150-450 words).

STYLE REQUIREMENTS:
- Use all very simple, conversational words (how people actually speak).
- Avoid fancy jargon.
- Start with a strong, curiosity-driven HOOK.
- End with a clear CALL TO ACTION.

DRAFT/TOPIC:
${draft}

OUTPUT FORMAT (JSON):
{
  "paragraph": "The script in one paragraph.",
  "clips": ["clip 1", "clip 2", ...]
}
    `.trim();

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const data = JSON.parse(result.response.text());
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Vercel API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate script.' });
  }
}
