// api/user-profile.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simula um "banco de dados" de perfis em memória.
const userProfiles: Record<string, { displayName?: string; avatarUrl?: string }> = {
    'admin-1': { displayName: 'Hélio Santos', avatarUrl: 'https://i.pravatar.cc/128?u=helio-santos-admin' },
    'lojista-1': { displayName: 'Loja da Maria' },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  if (req.method === 'GET') {
    const profile = userProfiles[userId] || {};
    return res.status(200).json(profile);
  }

  if (req.method === 'POST') {
    try {
      const { displayName, avatarUrl } = JSON.parse(req.body);
      
      // Validação simples
      if (typeof displayName !== 'string' || typeof avatarUrl !== 'string') {
        return res.status(400).json({ error: 'Invalid profile data.' });
      }

      userProfiles[userId] = {
        displayName: displayName.trim(),
        avatarUrl: avatarUrl.trim(),
      };

      return res.status(200).json(userProfiles[userId]);

    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON body.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}