

import React, { useState, useEffect } from 'react';
import { User, LogIn, Edit, Store, PackagePlus, BarChart2, Shield, PlayCircle, Users, Loader } from 'lucide-react';
import { UserProfile, QuizQuestion, UserRole } from '../types';
import QuizManagementPanel from './admin/QuizManagementPanel';

// Props Interfaces
interface AuthFormProps {
  setCurrentUser: (user: UserProfile) => void;
  setShowLogin: (show: boolean) => void;
}

interface ProfilePageProps {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  liveStreamUrl: string;
  setLiveStreamUrl: (id: string) => void;
}

// Sub-components
const LoginForm: React.FC<AuthFormProps> = ({ setCurrentUser, setShowLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
        alert("Email e senha são obrigatórios.");
        return;
    }
    setIsLoading(true);
    try {
        const loginRes = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const baseUser = await loginRes.json();
        if (!loginRes.ok) throw new Error(baseUser.error || 'Erro desconhecido');
        
        // Fetch custom profile data
        const profileRes = await fetch(`/api/user-profile?userId=${baseUser.id}`);
        const customProfile = profileRes.ok ? await profileRes.json() : {};

        setCurrentUser({ ...baseUser, ...customProfile });

        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
    } catch (err: any) {
        alert(`Erro ao fazer login: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-gray-800 rounded-xl shadow-lg shadow-brand-purple/20 space-y-6">
      <h2 className="text-3xl font-bold text-center text-brand-purple-light">Acessar Conta</h2>
      <form className="space-y-4" onSubmit={(e) => {e.preventDefault(); handleLogin();}}>
        <div>
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-brand-purple-light focus:border-brand-purple-light" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-3 focus:ring-brand-purple-light focus:border-brand-purple-light" />
        </div>
        <div className="flex items-center"><input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-brand-purple-light focus:ring-brand-purple-dark border-gray-600 rounded bg-gray-700" /><label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">Lembrar meu e-mail</label></div>
        <button type="submit" disabled={isLoading} className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center disabled:bg-gray-600">
          {isLoading ? <Loader className="animate-spin" /> : 'Entrar'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-400">Não tem uma conta? <button onClick={() => setShowLogin(false)} className="font-medium text-brand-purple-light hover:underline">Cadastre-se</button></p>
    </div>
  );
};

const RegistrationForm: React.FC<{setShowLogin: (show: boolean) => void}> = ({ setShowLogin }) => {
  return (
   <div className="w-full max-w-md mx-auto p-8 bg-gray-800 rounded-xl shadow-lg shadow-brand-purple/20 space-y-6">
    <h2 className="text-3xl font-bold text-center text-brand-purple-light">Criar Conta</h2>
    <p className="text-center text-gray-400">O cadastro de novos usuários será habilitado em breve!</p>
    <p className="text-center text-sm text-gray-400">Já tem uma conta? <button onClick={() => setShowLogin(true)} className="font-medium text-brand-purple-light hover:underline">Acesse</button></p>
  </div>
  )
};

const EditProfileForm: React.FC<{ currentUser: UserProfile; onProfileUpdate: (updatedUser: UserProfile) => void; }> = ({ currentUser, onProfileUpdate }) => {
    const [displayName, setDisplayName] = useState(currentUser.displayName || '');
    const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/user-profile', {
                method: 'POST',
                body: JSON.stringify({ userId: currentUser.id, displayName, avatarUrl }),
            });
            if (!res.ok) throw new Error('Falha ao salvar perfil.');
            onProfileUpdate({ ...currentUser, displayName, avatarUrl });
            alert('Perfil atualizado com sucesso!');
        } catch (err: any) {
            alert(`Erro: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="p-6 bg-gray-700 rounded-lg mt-6 space-y-4 border border-brand-purple/50">
            <h4 className="text-lg font-bold">Editar Perfil</h4>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Nome de Exibição" className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 focus:ring-brand-purple"/>
            <input type="text" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="URL da Foto de Perfil" className="w-full bg-gray-800 p-2 rounded-md border border-gray-600"/>
            <button type="submit" disabled={isSaving} className="w-full flex items-center justify-center py-2 px-4 bg-brand-purple hover:bg-brand-purple-dark rounded-md font-bold disabled:bg-gray-500">
                {isSaving ? <Loader className="animate-spin"/> : 'Salvar Alterações'}
            </button>
        </form>
    );
};


const MerchantDashboard: React.FC<{ currentUser: UserProfile }> = ({ currentUser }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    return (
        <div className="p-8 bg-gray-800 rounded-xl shadow-lg shadow-brand-purple/20">
            <h3 className="text-2xl font-bold mb-6 flex items-center"><Store className="mr-3 text-brand-purple-light"/> Painel do Comerciante</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setShowAddForm(!showAddForm)} className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg hover:bg-brand-purple-dark transition group">
                    <PackagePlus size={40} className="mb-2 text-brand-purple-light group-hover:text-white" />
                    <span className="font-semibold">{showAddForm ? 'Fechar Formulário' : 'Cadastrar Produto'}</span>
                </button>
            </div>
        </div>
    );
};

// Main Component
const ProfilePage: React.FC<ProfilePageProps> = (props) => {
  const { currentUser, setCurrentUser } = props;
  const [showLogin, setShowLogin] = useState(true);
  const [adminView, setAdminView] = useState<'main' | 'quiz'>('main');
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  const defaultAvatar = `https://i.pravatar.cc/128?u=${currentUser?.id || 'default'}`;

  if (!currentUser) {
    return (
      <div className="container mx-auto">
        {showLogin ? <LoginForm setCurrentUser={setCurrentUser} setShowLogin={setShowLogin} /> : <RegistrationForm setShowLogin={setShowLogin} />}
      </div>
    );
  }

  if (currentUser.role === 'admin' && adminView === 'quiz') {
      return <QuizManagementPanel onBack={() => setAdminView('main')} {...props} />;
  }
  
  return (
    <div className="container mx-auto space-y-8">
      <div className="flex flex-col items-center space-y-4 p-8 bg-gray-800 rounded-xl shadow-lg shadow-brand-purple/20">
        <div className="relative">
          <img src={currentUser.avatarUrl || defaultAvatar} alt="User Avatar" className="w-32 h-32 rounded-full border-4 border-brand-purple-light" />
        </div>
        <h2 className="text-3xl font-bold">{currentUser.displayName || currentUser.name}</h2>
        <p className="text-gray-400">{currentUser.email}</p>
        <div className="flex space-x-4">
          <button onClick={() => setShowEditProfile(!showEditProfile)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition duration-300 flex items-center">
            <Edit size={16} className="mr-2"/> {showEditProfile ? 'Fechar' : 'Editar Perfil'}
          </button>
          <button onClick={() => { setCurrentUser(null); setAdminView('main'); }} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">Sair</button>
        </div>
      </div>
      
      {showEditProfile && <EditProfileForm currentUser={currentUser} onProfileUpdate={setCurrentUser} />}

      {currentUser.role === 'merchant' && <MerchantDashboard currentUser={currentUser} />}
      {currentUser.role === 'admin' && adminView === 'main' && (
          <div className="p-8 bg-gray-800 rounded-xl shadow-lg shadow-neon-blue/20">
            <h3 className="text-2xl font-bold mb-6 flex items-center"><Shield className="mr-3 text-neon-blue"/> Painel do Administrador</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => setAdminView('quiz')} className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg hover:bg-neon-blue transition group">
                  <PlayCircle size={40} className="mb-2 text-neon-blue group-hover:text-white" />
                  <span className="font-semibold">Gerenciar Quizi</span>
              </button>
            </div>
          </div>
      )}
    </div>
  );
};

export default ProfilePage;