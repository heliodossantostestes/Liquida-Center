

import React from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

const allProducts: Product[] = [
    { id: 1, name: 'Pizza Artesanal', price: 'R$ 45,90', image: 'https://picsum.photos/seed/pizza/400/400', seller: 'Pizzaria do Zé', promotion: '20% OFF' },
    { id: 2, name: 'Corte de Cabelo', price: 'R$ 30,00', image: 'https://picsum.photos/seed/haircut/400/400', seller: 'Barbearia Estilo' },
    { id: 3, name: 'Bolo de Chocolate', price: 'R$ 55,00', image: 'https://picsum.photos/seed/cake/400/400', seller: 'Dona Benta Bolos' },
    { id: 4, name: 'Manutenção PC', price: 'Sob Consulta', image: 'https://picsum.photos/seed/tech/400/400', seller: 'PC Rápido' },
    { id: 5, name: 'Açaí 500ml', price: 'R$ 18,00', image: 'https://picsum.photos/seed/acai/400/400', seller: 'Açaí do Point' },
    { id: 6, name: 'Manicure e Pedicure', price: 'R$ 50,00', image: 'https://picsum.photos/seed/nails/400/400', seller: 'Unhas de Fada' },
    { id: 7, name: 'Hamburger Gourmet', price: 'R$ 35,00', image: 'https://picsum.photos/seed/burger/400/400', seller: 'Burger House', promotion: 'Leve Refri' },
    { id: 8, name: 'Aula de Violão', price: 'R$ 80/h', image: 'https://picsum.photos/seed/guitar/400/400', seller: 'Mestre das Cordas' },
];

const ShopPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-4xl font-black mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-light to-neon-blue">Explore o Comércio Local</h1>
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="O que você procura hoje?"
                    className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-purple-light focus:border-brand-purple-light outline-none transition"
                />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {allProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ShopPage;