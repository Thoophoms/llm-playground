import { GoogleGenAI } from '@google/genai';


export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { message } = req.body ?? {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Missing "message" string in body.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const r = await ai.models.generateContent({
      model: 'gemini-2.5-flash',           // or 'gemini-2.5-pro'
      contents: [{ role: 'user', parts: [{ text: message }]}],
    });

    // New SDK exposes a .text convenience getter:
    const text = r.text ?? "Sorry, I couldn't generate a response.";
    return res.status(200).json({ message: text });
  } catch (err) {
    console.error('Serverless /api/chat error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
}