import { GoogleGenAI } from '@google/genai';

export async function generateYouTubeScript(draft: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenAI({ apiKey }) as any;
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
  });

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

OUTPUT FORMAT (JSON ONLY):
{
  "paragraph": "The full script in one long paragraph, no breaks.",
  "clips": [
    "Segment 1 content (approx 8 seconds of speech)",
    "Segment 2 content (approx 8 seconds of speech)",
    ...
  ]
}
  `.trim();

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    }
  });
  const response = await result.response;
  const text = response.text();
  
  if (!text) {
    throw new Error('No response from AI model');
  }

  return JSON.parse(text);
}
