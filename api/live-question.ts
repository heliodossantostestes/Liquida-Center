
// api/live-question.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { LiveQuestion } from '../../src/types';

// Estado em memória para a pergunta ativa
let liveQuestion: LiveQuestion = {
  active: false,
  id: null,
  question: '',
  optionA: '',
  optionB: '',
  correctAnswerIndex: null,
  difficulty: null,
  status: 'idle',
  startedAt: null,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(liveQuestion);
  }

  if (req.method === 'POST') {
    try {
      const newQuestionState = JSON.parse(req.body);
      
      // Validação simples
      if (typeof newQuestionState.active !== 'boolean') {
          return res.status(400).json({ error: 'Invalid active status' });
      }

      liveQuestion = {
          active: newQuestionState.active,
          id: newQuestionState.id || null,
          question: newQuestionState.question || '',
          optionA: newQuestionState.optionA || '',
          optionB: newQuestionState.optionB || '',
          correctAnswerIndex: newQuestionState.correctAnswerIndex !== undefined ? newQuestionState.correctAnswerIndex : null,
          difficulty: newQuestionState.difficulty || null,
          status: newQuestionState.status || 'idle',
          startedAt: newQuestionState.startedAt || null,
      };
      
      return res.status(200).json(liveQuestion);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}