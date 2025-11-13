import React, { useState } from 'react';
import { Search, Bell, Coins, Menu, ShoppingCart, MapPin, ChevronDown, User } from 'lucide-react';
import { Page, UserProfile } from '../types';

interface HeaderProps {
    currentUser: UserProfile | null;
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 shadow-lg shadow-brand-purple/10">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-purple-light to-neon-blue">
              Liquida<span className="text-white">Center</span>
            </h1>
          </div>
          <div className="flex-grow max-w-lg mx-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar produtos, marcas e muito mais..."
                className="w-full bg-gray-800 border border-gray-700 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-purple-light outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
                 <div className="flex items-center space-x-1 bg-gray-800 p-2 rounded-full cursor-pointer" onClick={() => onNavigate('profile')}>
                    <User className="h-5 w-5 text-gray-300" />
                    <span className="font-bold text-white text-sm">{currentUser.name}</span>
                 </div>
            ) : (
                <div className="hidden md:flex items-center space-x-4 text-sm">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile');}} className="hover:text-brand-purple-light transition-colors">Crie sua conta</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile');}} className="hover:text-brand-purple-light transition-colors">Entre</a>
                </div>
            )}
            <button className="text-gray-300 hover:text-white transition-colors">
              <ShoppingCart className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="flex justify-between items-center text-sm pb-2">
            <div className="flex items-center space-x-6">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 relative">
                    <Menu className="h-5 w-5"/>
                    <span>Categorias</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    {isMenuOpen && (
                         <div className="absolute top-full mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-2 border border-brand-purple/30">
                            <a href="#" className="block px-4 py-2 hover:bg-brand-purple-dark">Supermercado</a>
                            <a href="#" className="block px-4 py-2 hover:bg-brand-purple-dark">Moda</a>
                            <a href="#" className="block px-4 py-2 hover:bg-brand-purple-dark">Tecnologia</a>
                            <a href="#" className="block px-4 py-2 hover:bg-brand-purple-dark">Casa e Móveis</a>
                         </div>
                    )}
                </button>
                <div className="hidden md:flex items-center space-x-4">
                    <a href="#" className="hover:text-brand-purple-light transition-colors">Ofertas do Dia</a>
                    <a href="#" className="hover:text-brand-purple-light transition-colors">Seja um Parceiro</a>
                </div>
            </div>
             <button className="flex items-center space-x-1 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Informe seu CEP</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
