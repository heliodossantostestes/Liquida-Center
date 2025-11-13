// api/live-vote.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Estrutura para armazenar votos para cada pergunta
// Key: questionId, Value: { votes: [optionA, optionB], voters: Set<userId> }
const votes: Record<string, { votes: [number, number], voters: Set<string> }> = {};

// Limpa os votos antigos para não sobrecarregar em dev
setInterval(() => {
    Object.keys(votes).forEach(key => delete votes[key]);
}, 1000 * 60 * 60 * 2); // Reseta a cada 2 horas

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const questionId = req.query.questionId as string;
    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    const questionVotesData = votes[questionId] || { votes: [0, 0], voters: new Set() };
    const totalVotes = questionVotesData.votes[0] + questionVotesData.votes[1];
    
    let percentages = [0, 0];
    if (totalVotes > 0) {
        percentages = [
            Math.round((questionVotesData.votes[0] / totalVotes) * 100),
            Math.round((questionVotesData.votes[1] / totalVotes) * 100)
        ];
        
        // Ajuste para garantir que a soma seja 100% em caso de arredondamento
        if (percentages[0] + percentages[1] !== 100) {
            if (percentages[0] > percentages[1]) {
                percentages[0] = 100 - percentages[1];
            } else {
                percentages[1] = 100 - percentages[0];
            }
        }
    }

    return res.status(200).json({
      questionId,
      votes: questionVotesData.votes,
      totalVotes,
      percentages,
    });
  }

  if (req.method === 'POST') {
    try {
      const { questionId, userId, voteIndex } = JSON.parse(req.body);

      if (!questionId || !userId || (voteIndex !== 0 && voteIndex !== 1)) {
        return res.status(400).json({ error: 'Missing or invalid fields' });
      }

      if (!votes[questionId]) {
        votes[questionId] = { votes: [0, 0], voters: new Set() };
      }

      if (votes[questionId].voters.has(userId)) {
        return res.status(403).json({ error: 'User has already voted for this question' });
      }

      votes[questionId].votes[voteIndex]++;
      votes[questionId].voters.add(userId);
      
      return res.status(200).json({ success: true, message: 'Vote registered.' });

    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}