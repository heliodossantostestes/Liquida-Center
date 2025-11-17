// api/live-stats.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Estado em memória para estatísticas da live
let liveStats = {
  viewers: 0,
  likes: 0,
};

// Limpa as estatísticas periodicamente para evitar números inflados em ambiente de desenvolvimento
// Em produção, isso seria gerenciado por eventos de início/fim de live.
setInterval(() => {
    liveStats = { viewers: 0, likes: 0 };
}, 1000 * 60 * 60 * 2); // Reseta a cada 2 horas

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(liveStats);
  }

  if (req.method === 'POST') {
    try {
        const { action } = req.body;

        switch (action) {
            case 'join':
                liveStats.viewers = Math.max(0, liveStats.viewers + 1);
                break;
            case 'leave':
                liveStats.viewers = Math.max(0, liveStats.viewers - 1);
                break;
            case 'like':
                liveStats.likes += 1;
                break;
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
        
        return res.status(200).json(liveStats);

    } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
