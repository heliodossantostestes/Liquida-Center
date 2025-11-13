export type Page = 'home' | 'shop' | 'videos' | 'profile';

export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  seller: string;
  promotion?: string;
}

export interface Video {
    id: number;
    user: string;
    avatar: string;

    url: string;
    description: string;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: [string, string];
    correctAnswerIndex: 0 | 1;
    difficulty: 'Fácil' | 'Intermediário' | 'Difícil';
    status?: 'pending' | 'live' | 'finished';
}

export type UserRole = 'user' | 'merchant' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface QuizRanking {
  id: string;
  name: string;
  score: number;
  totalQuestions: number;
}

export interface QuizWinner {
  id: string;
  name: string;
  winDate: string;
  prizeAmount: number;
}