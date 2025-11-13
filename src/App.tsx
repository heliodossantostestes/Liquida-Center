import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import VideosPage from './pages/VideosPage';
import ProfilePage from './pages/ProfilePage';
import { Page, UserProfile } from './types';
import { ShoppingBag, Clapperboard, User, Home, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isInLiveQuiz, setIsInLiveQuiz] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState<string>('https://vdo.ninja/?scene=0&room=CELULARESESTUDIOPHS&sas');

  const handleJoinLiveQuiz = async () => {
    if (!currentUser) {
      setCurrentPage('profile');
      return;
    }
    try {
      await fetch('/api/live-stats', { method: 'POST', body: JSON.stringify({ action: 'join' }) });
      setIsInLiveQuiz(true);
    } catch (err) {
      console.error("Failed to join live stats:", err);
      setIsInLiveQuiz(true); // Still join visually even if stats fail
    }
  };

  const handleLeaveLiveQuiz = async () => {
    try {
      await fetch('/api/live-stats', { method: 'POST', body: JSON.stringify({ action: 'leave' }), keepalive: true });
    } catch (err) {
      console.error("Failed to leave live stats:", err);
    } finally {
      setIsInLiveQuiz(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onJoinLiveQuiz={handleJoinLiveQuiz} />;
      case 'shop':
        return <ShopPage />;
      case 'videos':
        return (
          <VideosPage 
            isInLiveQuiz={false} // Default view is not the quiz
            onLeaveLiveQuiz={handleLeaveLiveQuiz}
            currentUser={currentUser}
            onLoginRequest={() => setCurrentPage('profile')}
            liveStreamUrl={liveStreamUrl}
          />
        );
      case 'profile':
        return <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} liveStreamUrl={liveStreamUrl} setLiveStreamUrl={setLiveStreamUrl} />;
      default:
        return <HomePage onJoinLiveQuiz={handleJoinLiveQuiz} />;
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
      return [
        { id: 'home', label: 'Início', icon: Home },
        { id: 'videos', label: 'Vídeos', icon: Clapperboard },
        { id: 'profile', label: 'Admin', icon: Shield },
      ] as const;
    }

    return baseItems;
  }, [currentUser]);

  if (isInLiveQuiz) {
     return (
        <VideosPage 
            isInLiveQuiz={true} 
            onLeaveLiveQuiz={handleLeaveLiveQuiz}
            currentUser={currentUser}
            onLoginRequest={() => {
              handleLeaveLiveQuiz();
              setCurrentPage('profile');
            }}
            liveStreamUrl={liveStreamUrl}
          />
     );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header 
        currentUser={currentUser} 
        onNavigate={(page) => setCurrentPage(page)}
      />
      <main className="flex-grow container mx-auto px-4 py-8 pb-24">
        {renderPage()}
      </main>
      <BottomNav items={navItems} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;