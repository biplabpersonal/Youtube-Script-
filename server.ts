import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { generateYouTubeScript } from './src/services/ai.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/generate', async (req, res) => {
    const { draft } = req.body;
    
    if (!draft) {
      return res.status(400).json({ error: 'Draft idea/topic is required.' });
    }

    try {
      const data = await generateYouTubeScript(draft);
      res.json(data);
    } catch (err: any) {
      console.error('Express API Error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate script.' });
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
