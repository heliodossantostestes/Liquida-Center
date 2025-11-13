
export type Page = 'home' | 'shop' | 'videos' | 'profile';

export interface Product {
  id: string;
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
  name: string; // nome base (ex: "Usuário Teste")
  email: string;
  role: UserRole;
  displayName?: string; // nome de exibição escolhido
  avatarUrl?: string;   // URL da foto de perfil
}

export interface QuizWinner {
  id: string;
  name: string;
  winDate: string;
  prizeAmount: number;
}

export interface ChatMessage {
  id: string;
  userName: string;
  role: UserRole;
  text: string;
  createdAt: string;
}

export interface LiveQuestion {
    active: boolean;
    id: string | null;
    question: string;
    optionA: string;
    optionB: string;
    correctAnswerIndex: 0 | 1 | null;
    difficulty: 'Fácil' | 'Intermediário' | 'Difícil' | null;
    status: 'idle' | 'running' | 'ended';
    startedAt: string | null;
}