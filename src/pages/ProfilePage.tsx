import React, { useState, useEffect } from 'react';
import { User, LogIn, Edit, Store, PackagePlus, BarChart2, Shield, PlayCircle, Users } from 'lucide-react';
import { UserProfile, QuizQuestion, UserRole } from '../types';
import QuizManagementPanel from './admin/QuizManagementPanel';

// Props Interfaces for sub-components
interface AuthFormProps {
  setCurrentUser: (user: UserProfile | null) => void;
  setShowLogin: (show: boolean) => void;
}

interface ProfilePageProps {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  setLiveQuizQuestions: (questions: QuizQuestion[]) => void;
  setActiveLiveQuestion: (question: QuizQuestion | null) => void;
  liveStreamUrl: string;
  setLiveStreamUrl: (id: string) => void;
  isLiveStreamActive: boolean;
  setIsLiveStreamActive: (isActive: boolean) => void;
}

interface ProfileViewProps extends ProfilePageProps {
  adminView: 'main' | 'quiz';
  setAdminView: (view: 'main' | 'quiz') => void;
}

interface AdminDashboardProps {
  setAdminView: (view: 'main' | 'quiz') => void;
}


// Sub-components are now standalone constants
const LoginForm: React.FC<AuthFormProps> = ({ setCurrentUser, setShowLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = () => {
    if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
    } else {
        localStorage.removeItem('rememberedEmail');
    }

    if (email.toLowerCase() === 'heliosilviosantos@gmail.com' && password === 'helio123') {
      setCurrentUser({ id: 'admin-01', name: 'Hélio Santos', email: email, role: 'admin' });
      return;
    }
    if (email && password) {
      const mockRole = email.includes('merchant') ? 'merchant' : 'user';
      setCurrentUser({ id: 'user-01', name: 'Fulano de Tal', email: email, role: mockRole });
    } else {
      alert("Por favor, preencha email e senha.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-gray-800 rounded-xl shadow-lg shadow-brand-purple/20 space-y-6">
      <h2 className="text-3xl font-bold text-center text-brand-purple-light">Acessar Conta</h2>
      <form className="space-y-4" onSubmit={(e) => {e.preventDefault(); handleLogin();}}>
        <div>
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-brand-purple-light focus:border-brand-purple-light" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Senha</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-brand-purple-light focus:border-brand-purple-light" 
          />
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <input 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    className="h-4 w-4 text-brand-purple-light focus:ring-brand-purple-dark border-gray-600 rounded bg-gray-700" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                    Lembrar meu e-mail
                </label>
            </div>
        </div>
        <button type="submit" className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300">
          Entrar
        </button>
      </form>
      <p className="text-center text-sm text-gray-400">Não tem uma conta? <button onClick={() => setShowLogin(false)} className="font-medium text-brand-purple-light hover:underline">Cadastre-se</button></p>
    </div>
  );
};

const RegistrationForm: React.FC<AuthFormProps> = ({ setCurrentUser, setShowLogin }) => {
  const [role, setRole] = useState<UserRole>('user');

   const handleRegister = () => {
      setCurrentUser({ id: 'new-user-01', name: 'Novo Usuário', email: 'novo@email.com', role: role });
   };

  return (
   <div className="w-full max-w-md mx-auto p-8 bg-gray-800 rounded-xl shadow-lg shadow-brand-purple/20 space-y-6">
    <h2 className="text-3xl font-bold text-center text-brand-purple-light">Criar Conta</h2>
    <form className="space-y-4">
      <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Conta</label>
          <div className="flex justify-around items-center p-1 bg-gray-700 rounded-lg">
              <button type="button" onClick={() => setRole('user')} className={`w-full py-2 rounded-md transition-colors text-sm font-bold ${role === 'user' ? 'bg-brand-purple text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Usuário</button>
              <button type="button" onClick={() => setRole('merchant')} className={`w-full py-2 rounded-md transition-colors text-sm font-bold ${role === 'merchant' ? 'bg-brand-purple text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Comerciante</button>
          </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Nome Completo</label>
        <input type="text" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-brand-purple-light focus:border-brand-purple-light" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Email</label>
        <input type="email" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-brand-purple-light focus:border-brand-purple-light" />
      </div>
       {role === 'user' ? (
          <div>
            <label className="block text-sm font-medium text-gray-300">CPF (será sua chave PIX)</label>
            <input type="text" placeholder="000.000.000-00" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-brand-purple-light focus:border-brand-purple-light" />
            <p className="text-xs text-gray-500 mt-1">Seu CPF precisa ser o mesmo da sua chave PIX para receber prêmios.</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300">CNPJ</label>
            <input type="text" placeholder="00.000.000/0000-00" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-brand-purple-light focus:border-brand-purple-light" />
          </div>
        )}
      <div>
        <label className="block text-sm font-medium text-gray-300">Senha</label>
        <input type="password" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-brand-purple-light focus:border-brand-purple-light" />
      </div>
      <button type="button" onClick={handleRegister} className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300">
        Criar Conta
      </button>
    </form>
    <p className="text-center text-sm text-gray-400">Já tem uma conta? <button onClick={() => setShowLogin(true)} className="font-medium text-brand-purple-light hover:underline">Acesse</button></p>
  </div>
  )
};

const MerchantDashboard = () => (
  <div className="p-8 bg-gray-800 rounded-xl shadow-lg shadow-brand-purple/20">
    <h3 className="text-2xl font-bold mb-6 flex items-center"><Store className="mr-3 text-brand-purple-light"/> Painel do Comerciante</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg hover:bg-brand-purple-dark transition group">
          <PackagePlus size={40} className="mb-2 text-brand-purple-light group-hover:text-white" />
          <span className="font-semibold">Cadastrar Produto</span>
      </button>
      <button className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg hover:bg-brand-purple-dark transition group">
          <BarChart2 size={40} className="mb-2 text-brand-purple-light group-hover:text-white" />
          <span className="font-semibold">Ver Desempenho</span>
      </button>
      <button className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg hover:bg-brand-purple-dark transition group">
          <Edit size={40} className="mb-2 text-brand-purple-light group-hover:text-white" />
          <span className="font-semibold">Editar Loja</span>
      </button>
    </div>
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setAdminView }) => (
  <div className="p-8 bg-gray-800 rounded-xl shadow-lg shadow-neon-blue/20">
    <h3 className="text-2xl font-bold mb-6 flex items-center"><Shield className="mr-3 text-neon-blue"/> Painel do Administrador</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button onClick={() => setAdminView('quiz')} className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg hover:bg-neon-blue transition group">
          <PlayCircle size={40} className="mb-2 text-neon-blue group-hover:text-white" />
          <span className="font-semibold">Gerenciar Quizi</span>
      </button>
      <button className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg hover:bg-neon-blue transition group">
          <BarChart2 size={40} className="mb-2 text-neon-blue group-hover:text-white" />
          <span className="font-semibold">Ver Estatísticas</span>
      </button>
      <button className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg hover:bg-neon-blue transition group">
          <Users size={40} className="mb-2 text-neon-blue group-hover:text-white" />
          <span className="font-semibold">Gerenciar Usuários</span>
      </button>
    </div>
  </div>
);

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, setCurrentUser, setLiveQuizQuestions, setActiveLiveQuestion, adminView, setAdminView, ...liveProps }) => (
  <div className="space-y-8">
    <div className="flex flex-col items-center space-y-4 p-8 bg-gray-800 rounded-xl shadow-lg shadow-brand-purple/20">
      <div className="relative">
        <img src={`https://i.pravatar.cc/128?u=${currentUser?.id}`} alt="User" className="w-32 h-32 rounded-full border-4 border-brand-purple-light" />
        <button className="absolute bottom-0 right-0 bg-brand-purple-light p-2 rounded-full text-white">
          <Edit size={16} />
        </button>
      </div>
      <h2 className="text-3xl font-bold">{currentUser?.name}</h2>
      <p className="text-gray-400">{currentUser?.email}</p>
      <button onClick={() => { setCurrentUser(null); setAdminView('main'); }} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
        Sair
      </button>
    </div>

    {currentUser?.role === 'merchant' && <MerchantDashboard />}
    {currentUser?.role === 'admin' && adminView === 'main' && <AdminDashboard setAdminView={setAdminView} />}
    {currentUser?.role === 'admin' && adminView === 'quiz' && <QuizManagementPanel onBack={() => setAdminView('main')} onSaveQuiz={setLiveQuizQuestions} setActiveQuestion={setActiveLiveQuestion} {...liveProps} />}
  </div>
);

// Main Component
const ProfilePage: React.FC<ProfilePageProps> = (props) => {
  const { currentUser, setCurrentUser } = props;
  const [showLogin, setShowLogin] = useState(true);
  const [adminView, setAdminView] = useState<'main' | 'quiz'>('main');

  if (!currentUser) {
    return (
      <div className="container mx-auto">
        {showLogin ? 
          <LoginForm setCurrentUser={setCurrentUser} setShowLogin={setShowLogin} /> : 
          <RegistrationForm setCurrentUser={setCurrentUser} setShowLogin={setShowLogin} />
        }
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <ProfileView 
        {...props}
        adminView={adminView}
        setAdminView={setAdminView}
      />
    </div>
  );
};

export default ProfilePage;