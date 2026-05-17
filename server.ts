import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for generating a script
  app.post('/api/generate', async (req, res) => {
    try {
      const { draft } = req.body;
      if (!draft) {
        return res.status(400).json({ error: 'Draft idea/topic is required.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set.' });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are an expert YouTube script writer with years of experience. You are updated with all the latest trends and the script format for short-form content and know how to retain viewers for better engagement. The script should start with a catchy hook line and end with a call to action following the standard and latest scripting format.

TASK:
Write a youtube script based on the following draft/topic. The script length should be more than 1 minute and under 3 minutes (about 150 to 450 words roughly). 
IMPORTANT STYLE: Use all very simple words, things humans normally use in speaking. Want scripts in more simple words written - most commonly used words use only. The hook should be catchy but simple. Revise it to be as conversational and simple as possible.

DRAFT/TOPIC:
${draft}

OUTPUT FORMAT:
Return ONLY a valid JSON object with the following structure (no markdown formatting, no codeblocks):
{
  "paragraph": "The whole script in a single continuous paragraph. No line breaks.",
  "clips": [
    "clip 1 text (about 8 seconds of speaking, roughly 15-25 words)",
    "clip 2 text (about 8 seconds of speaking, roughly 15-25 words)",
    ...
  ]
}
      `.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const responseText = response.text;
      if (!responseText) {
          throw new Error('Empty response from model');
      }

      const data = JSON.parse(responseText);

      res.json(data);
    } catch (error) {
      console.error('Error generating script:', error);
      res.status(500).json({ error: 'Failed to generate script.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
