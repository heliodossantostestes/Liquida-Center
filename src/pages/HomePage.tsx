
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Product, UserProfile, QuizQuestion } from '../types';
import QuiziGame from '../components/QuiziGame';
import ImageCarousel from '../components/ImageCarousel';

interface HomePageProps {
  currentUser: UserProfile | null;
  openProfilePage: () => void;
  setIsQuizActive: (isActive: boolean) => void;
  liveQuizQuestions: QuizQuestion[];
  activeLiveQuestion: QuizQuestion | null;
  isLiveStreamActive: boolean;
  liveStreamUrl: string;
}

const HomePage: React.FC<HomePageProps> = ({ currentUser, openProfilePage, setIsQuizActive, liveQuizQuestions, activeLiveQuestion, isLiveStreamActive, liveStreamUrl }) => {
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
        const adaptedProducts: Product[] = data.slice(0, 4).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: `R$ ${p.price.toFixed(2).replace('.', ',')}`,
            image: `https://picsum.photos/seed/${p.id}/400/400`,
            seller: p.storeId === 'lojista-1' ? 'Loja Exemplo' : p.storeId, // Adapta o nome do vendedor
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
    <div className="space-y-12">
      {isLiveStreamActive ? <QuiziGame activeQuestion={activeLiveQuestion} totalQuestions={liveQuizQuestions.length} currentUser={currentUser} onLoginRequest={openProfilePage} setIsQuizActive={setIsQuizActive} liveStreamUrl={liveStreamUrl} /> : <ImageCarousel />}
      
      <div>
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-light to-neon-blue">Vitrine Principal ✨</h2>
        {isLoading ? (
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
