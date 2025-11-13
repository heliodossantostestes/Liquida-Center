


import React from 'react';
import { Page } from '../types';
import { LucideProps } from 'lucide-react';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType<LucideProps>;
}

interface BottomNavProps {
  // Fix: Changed items to be a readonly array to support `as const` inference from parent components.
  items: readonly NavItem[];
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ items, currentPage, setCurrentPage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-t border-brand-purple/30 shadow-lg z-50">
      <div className="container mx-auto flex justify-around items-center h-16">
        {items.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center justify-center w-full transition-all duration-300 ease-in-out transform ${isActive ? 'scale-110' : 'scale-100 opacity-70'}`}
            >
              <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-brand-purple-light' : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-brand-purple-light' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-10 h-1 bg-brand-purple-light rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
