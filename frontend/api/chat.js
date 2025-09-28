// frontend/api/chat.js  (Vercel Serverless Function - CommonJS)
const { GoogleGenAI } = require('@google/genai');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const body = req.body || {};
    const message = body.message;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Missing "message" string in body.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ message: 'Server misconfigured.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const r = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // or 'gemini-2.5-pro'
      contents: [{ role: 'user', parts: [{ text: message }]}],
    });

    // New SDK exposes .text as a convenience:
    const text = r.text || 'No response.';
    return res.status(200).json({ message: text });
  } catch (err) {
    console.error('Serverless /api/chat error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};