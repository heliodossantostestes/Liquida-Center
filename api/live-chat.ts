// api/live-chat.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ChatMessage, UserRole } from '../../src/types';

// Estado em memória para as mensagens do chat
const messages: ChatMessage[] = [];

// Limpa mensagens periodicamente para não sobrecarregar em dev
setInterval(() => {
    if(messages.length > 100) {
        messages.splice(0, messages.length - 50); // Mantém as últimas 50
    }
}, 1000 * 60 * 5); // Verifica a cada 5 minutos

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(messages);
  }

  if (req.method === 'POST') {
    try {
      const { userName, role, text } = JSON.parse(req.body);

      if (!userName || !role || !text) {
        return res.status(400).json({ error: 'Missing fields in message body' });
      }

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userName: String(userName),
        role: role as UserRole,
        text: String(text).slice(0, 280), // Limita o tamanho da mensagem
        createdAt: new Date().toISOString(),
      };

      messages.push(newMessage);
      
      return res.status(201).json(newMessage);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
