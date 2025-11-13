import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import VideosPage from './pages/VideosPage';
import ProfilePage from './pages/ProfilePage';
import { Page, UserProfile, QuizQuestion } from './types';
import { ShoppingBag, Clapperboard, User, Home, Shield } from 'lucide-react';

const initialMockQuestions: QuizQuestion[] = [
    { id: 'q1', question: "Os abacates crescem em árvores ou arbustos?", options: ["Árvores", "Arbustos"], correctAnswerIndex: 0, difficulty: 'Fácil' },
    { id: 'q2', question: "Qual a capital do Brasil?", options: ["Brasília", "São Paulo"], correctAnswerIndex: 0, difficulty: 'Fácil' },
    { id: 'q3', question: "Qual o maior planeta do sistema solar?", options: ["Terra", "Júpiter"], correctAnswerIndex: 1, difficulty: 'Intermediário' },
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [liveQuizQuestions, setLiveQuizQuestions] = useState<QuizQuestion[]>(initialMockQuestions);
  const [activeLiveQuestion, setActiveLiveQuestion] = useState<QuizQuestion | null>(null);
  const [liveStreamUrl, setLiveStreamUrl] = useState<string>('https://vdo.ninja/?scene=0&room=CELULARESESTUDIOPHS&sas&autoplay&mute'); // Added &autoplay&mute for best autoplay reliability
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);


  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage currentUser={currentUser} openProfilePage={() => setCurrentPage('profile')} setIsQuizActive={setIsQuizActive} liveQuizQuestions={liveQuizQuestions} activeLiveQuestion={activeLiveQuestion} isLiveStreamActive={isLiveStreamActive} liveStreamUrl={liveStreamUrl} />;
      case 'shop':
        return <ShopPage />;
      case 'videos':
        return <VideosPage />;
      case 'profile':
        return <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} setLiveQuizQuestions={setLiveQuizQuestions} setActiveLiveQuestion={setActiveLiveQuestion} liveStreamUrl={liveStreamUrl} setLiveStreamUrl={setLiveStreamUrl} isLiveStreamActive={isLiveStreamActive} setIsLiveStreamActive={setIsLiveStreamActive} />;
      default:
        return <HomePage currentUser={currentUser} openProfilePage={() => setCurrentPage('profile')} setIsQuizActive={setIsQuizActive} liveQuizQuestions={liveQuizQuestions} activeLiveQuestion={activeLiveQuestion} isLiveStreamActive={isLiveStreamActive} liveStreamUrl={liveStreamUrl} />;
    }
  };

  const navItems = useMemo(() => {
    const baseItems = [
      { id: 'home', label: 'Início', icon: Home },
      { id: 'shop', label: 'Comprar', icon: ShoppingBag },
      { id: 'videos', label: 'Vídeos', icon: Clapperboard },
      { id: 'profile', label: 'Perfil', icon: User },
    ] as const;

    if (currentUser?.role === 'admin') {
      // FIX: Add `as const` to ensure literal types for IDs, matching the `Page` type.
      return [
        { id: 'home', label: 'Início', icon: Home },
        { id: 'videos', label: 'Vídeos', icon: Clapperboard },
        { id: 'profile', label: 'Admin', icon: Shield },
      ] as const;
    }
    
    // In the future, merchants could have a different set of items
    // if (currentUser?.role === 'merchant') { ... }

    return baseItems;
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header 
        currentUser={currentUser} 
        onNavigate={(page) => setCurrentPage(page)}
      />
      <main className="flex-grow container mx-auto px-4 py-8 pb-24">
        {renderPage()}
      </main>
      {!isQuizActive && <BottomNav items={navItems} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
    </div>
  );
};

export default App;
