

import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

const ShopPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const res = await fetch('/api/products');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                
                // Adapta os dados da API para o formato esperado pelo componente Product
                const adaptedProducts: Product[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: `R$ ${p.price.toFixed(2).replace('.', ',')}`,
                    image: `https://picsum.photos/seed/${p.id}/400/400`,
                    seller: p.storeId === 'lojista-1' ? 'Loja Exemplo' : p.storeId,
                }));
                setProducts(adaptedProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

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
            {isLoading ? (
                <p className="text-center text-gray-400">Carregando produtos...</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShopPage;
