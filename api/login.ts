// api/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'merchant' | 'user';
};

// Usuários de teste (NÃO é produção, é só pra validar fluxo)
const USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Administrador',
    email: 'admin@liquidacenter.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'lojista-1',
    name: 'Loja Exemplo',
    email: 'lojista@liquidacenter.com',
    password: 'loja123',
    role: 'merchant',
  },
  {
    id: 'user-1',
    name: 'Usuário Teste',
    email: 'usuario@liquidacenter.com',
    password: 'user123',
    role: 'user',
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = JSON.parse(req.body || '{}');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const user = USERS.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Retorna só dados públicos (nada de senha)
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}