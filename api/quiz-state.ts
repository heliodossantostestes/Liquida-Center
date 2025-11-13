// api/quiz-state.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Estado simples em memória (não persiste entre deploys, ideal para protótipo)
let quizState = {
  active: false,
  title: '',
  message: '',
  updatedAt: new Date().toISOString(),
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(quizState);
  }

  if (req.method === 'POST') {
    try {
      const { active, title, message } = JSON.parse(req.body || '{}');
      
      quizState = {
        active: Boolean(active),
        title: String(title || ''),
        message: String(message || ''),
        updatedAt: new Date().toISOString(),
      };
      
      return res.status(200).json(quizState);
    } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
