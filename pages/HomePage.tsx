import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Product, UserProfile, QuizQuestion } from '../types';
import QuiziGame from '../components/QuiziGame';
import ImageCarousel from '../components/ImageCarousel';

const featuredProducts: Product[] = [
  { id: 1, name: 'Pizza Artesanal', price: 'R$ 45,90', image: 'https://picsum.photos/seed/pizza/400/400', seller: 'Pizzaria do Zé', promotion: '20% OFF' },
  { id: 2, name: 'Corte de Cabelo', price: 'R$ 30,00', image: 'https://picsum.photos/seed/haircut/400/400', seller: 'Barbearia Estilo' },
  { id: 3, name: 'Bolo de Chocolate', price: 'R$ 55,00', image: 'https://picsum.photos/seed/cake/400/400', seller: 'Dona Benta Bolos' },
  { id: 4, name: 'Manutenção PC', price: 'Sob Consulta', image: 'https://picsum.photos/seed/tech/400/400', seller: 'PC Rápido' },
];

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

  return (
    <div className="space-y-12">
      {isLiveStreamActive ? <QuiziGame activeQuestion={activeLiveQuestion} totalQuestions={liveQuizQuestions.length} currentUser={currentUser} onLoginRequest={openProfilePage} setIsQuizActive={setIsQuizActive} liveStreamUrl={liveStreamUrl} /> : <ImageCarousel />}
      
      <div>
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-light to-neon-blue">Vitrine Principal ✨</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;