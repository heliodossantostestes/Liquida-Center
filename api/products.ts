// api/products.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

type Product = {
  id: string;
  storeId: string;
  name: string;
  price: number;
  description: string;
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    storeId: 'lojista-1',
    name: 'Capa de celular neon',
    price: 49.9,
    description: 'Capa resistente com bordas reforçadas.',
  },
  {
    id: 'p2',
    storeId: 'lojista-1',
    name: 'Película 3D',
    price: 29.9,
    description: 'Película de vidro com proteção extra.',
  },
   { id: 'p3', storeId: 'lojista-2', name: 'Bolo de Chocolate', price: 55.00, description: 'Delicioso bolo de chocolate caseiro.' },
   { id: 'p4', storeId: 'lojista-3', name: 'Manutenção PC', price: 150.0, description: 'Limpeza e otimização de performance.' },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Lista todos produtos de teste
    return res.status(200).json(MOCK_PRODUCTS);
  }

  if (req.method === 'POST') {
    // AQUI seria cadastro de produto real
    // Por enquanto, só retorna o que recebeu (pra você testar o fluxo)
    const body = JSON.parse(req.body || '{}');
    console.log('Produto recebido (mock):', body);

    const newProduct: Product = {
        id: `p${MOCK_PRODUCTS.length + 1}`,
        ...body
    };
    MOCK_PRODUCTS.push(newProduct);

    return res.status(201).json({
      message: 'Produto cadastrado (mock). Em produção, salvaria no banco.',
      product: newProduct,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}