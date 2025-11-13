

import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import ImageCarousel from '../components/ImageCarousel';

interface LiveQuizState {
    active: boolean;
    title: string;
    message: string;
}

interface HomePageProps {
  onJoinLiveQuiz: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onJoinLiveQuiz }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [liveQuizState, setLiveQuizState] = useState<LiveQuizState>({ active: false, title: '', message: ''});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        const adaptedProducts: Product[] = data.slice(0, 4).map((p: any) => ({
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
        setIsLoadingProducts(false);
      }
    };

    const fetchQuizState = async () => {
        try {
            const res = await fetch('/api/quiz-state');
            if(res.ok) {
                const data = await res.json();
                setLiveQuizState(data);
            }
        } catch (error) {
            console.error("Error fetching quiz state:", error);
        }
    };

    fetchProducts();
    fetchQuizState();

    const intervalId = setInterval(fetchQuizState, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);


  const renderQuizBanner = () => (
     <div 
        className="bg-gray-800 rounded-xl p-6 text-center shadow-2xl shadow-brand-purple/20 border-2 border-brand-purple/30 cursor-pointer transition-transform hover:scale-105"
    >
        <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400 animate-pulse">{liveQuizState.title}</h2>
        <p className="text-gray-400 mb-6">{liveQuizState.message}</p>
        <button 
            onClick={onJoinLiveQuiz}
            className="bg-gradient-to-r from-brand-purple to-neon-blue text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition">
            Participar do Quiz
        </button>
    </div>
  );

  return (
    <div className="space-y-12">
      {liveQuizState.active ? renderQuizBanner() : <ImageCarousel />}
      
      <div>
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-light to-neon-blue">Vitrine Principal ✨</h2>
        {isLoadingProducts ? (
          <p className="text-center text-gray-400">Carregando produtos...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;