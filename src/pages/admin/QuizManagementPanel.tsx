
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { QuizQuestion, QuizWinner } from '../../types';
import { ArrowLeft, BrainCircuit, Loader, AlertTriangle, Trophy, PlusCircle, Trash2, Play, Square, Video, Power } from 'lucide-react';

interface QuizManagementPanelProps {
    onBack: () => void;
    liveStreamUrl: string;
    setLiveStreamUrl: (id: string) => void;
}

const mockWinners: QuizWinner[] = [
    { id: 'user-5', name: 'Maria_Gamer', winDate: '11/11/2025', prizeAmount: 50.00 },
];

const initialNewQuestionState: Omit<QuizQuestion, 'id' | 'status'> = {
    question: '', options: ['', ''], correctAnswerIndex: 0, difficulty: 'Fácil'
};

const QuizManagementPanel: React.FC<QuizManagementPanelProps> = ({ onBack, liveStreamUrl, setLiveStreamUrl }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newQuestion, setNewQuestion] = useState(initialNewQuestionState);
    const [isLiveActive, setIsLiveActive] = useState(false);
    const [isUpdatingLiveState, setIsUpdatingLiveState] = useState(false);
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                const res = await fetch('/api/quiz-state');
                if (res.ok) setIsLiveActive((await res.json()).active);
            } catch (err) { console.error("Failed to fetch initial quiz state", err); }
        };
        fetchInitialState();
    }, []);

    const handleToggleLiveStream = async () => {
        setIsUpdatingLiveState(true);
        const newState = !isLiveActive;
        try {
            await fetch('/api/quiz-state', {
                method: 'POST',
                body: JSON.stringify({ active: newState, title: newState ? 'QUIZI AO VIVO AGORA!' : '', message: newState ? 'Clique aqui para participar!' : '' })
            });
            setIsLiveActive(newState);
        } catch (err) { alert('Falha ao atualizar o estado da live.'); } 
        finally { setIsUpdatingLiveState(false); }
    };

    const handleBroadcastQuestion = async (question: QuizQuestion) => {
        if (activeQuestionId) {
            alert('Uma pergunta já está ativa. Limpe-a da live antes de iniciar outra.');
            return;
        }
        try {
            const res = await fetch('/api/live-question', {
                method: 'POST',
                body: JSON.stringify({
                    active: true,
                    id: question.id,
                    question: question.question,
                    optionA: question.options[0],
                    optionB: question.options[1],
                    difficulty: question.difficulty,
                    status: 'running',
                    startedAt: new Date().toISOString(),
                })
            });
            if (!res.ok) throw new Error("Failed to broadcast question");
            setActiveQuestionId(question.id);
        } catch (err) {
            console.error(err);
            alert("Erro ao iniciar pergunta na live.");
        }
    };

    const handleClearLiveQuestion = async () => {
        try {
            const res = await fetch('/api/live-question', {
                method: 'POST',
                body: JSON.stringify({ active: false, id: null, question: '', optionA: '', optionB: '', difficulty: null, status: 'idle', startedAt: null })
            });
            if (!res.ok) throw new Error("Failed to clear question");
            setActiveQuestionId(null);
        } catch (err) {
            console.error(err);
            alert("Erro ao limpar pergunta da live.");
        }
    };
    
    const handleAddQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (newQuestion.question && newQuestion.options[0] && newQuestion.options[1]) {
            setQuestions([...questions, { ...newQuestion, id: crypto.randomUUID(), status: 'pending' }]);
            setNewQuestion(initialNewQuestionState);
        }
    };

    const handleDeleteQuestion = (id: string) => setQuestions(questions.filter(q => q.id !== id));
    
    return (
        <div className="p-8 bg-gray-800 rounded-xl shadow-lg shadow-neon-blue/20 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center text-white"><BrainCircuit className="mr-3 text-neon-blue"/> Gerenciamento do Quiz</h3>
                <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-300 hover:text-white transition"><ArrowLeft size={16} className="mr-1" /> Voltar</button>
            </div>
            
            <div className="p-4 bg-gray-900/50 rounded-lg space-y-3">
                 <h4 className="text-xl font-bold text-gray-200 flex items-center"><Video className="mr-2 text-brand-purple-light"/> Configuração da Live</h4>
                 <div>
                    <label className="text-sm font-semibold text-gray-300 block mb-1">URL da Live (VDO.Ninja, etc.)</label>
                    <input type="text" value={liveStreamUrl} onChange={(e) => setLiveStreamUrl(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-brand-purple"/>
                 </div>
                 <button onClick={handleToggleLiveStream} disabled={isUpdatingLiveState} className={`w-full flex items-center justify-center px-4 py-2 text-white font-bold rounded-lg transition ${isLiveActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:bg-gray-500`}>
                    {isUpdatingLiveState ? <Loader size={18} className="animate-spin mr-2"/> : <Power size={18} className="mr-2"/>}
                    {isLiveActive ? 'Finalizar Live na Vitrine' : 'Iniciar Live na Vitrine'}
                 </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-xl font-bold text-gray-200 mb-4">Criador de Perguntas</h4>
                    <form onSubmit={handleAddQuestion} className="p-4 bg-gray-900/50 rounded-lg space-y-3 mb-6">
                        <input type="text" placeholder="Digite a pergunta..." value={newQuestion.question} onChange={e => setNewQuestion({...newQuestion, question: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600"/>
                        <div className="flex items-center space-x-2"><input type="radio" name="correctAnswer" checked={newQuestion.correctAnswerIndex === 0} onChange={() => setNewQuestion({...newQuestion, correctAnswerIndex: 0})} /><input type="text" placeholder="Opção de resposta 1" value={newQuestion.options[0]} onChange={e => setNewQuestion({...newQuestion, options: [e.target.value, newQuestion.options[1]]})} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600"/></div>
                        <div className="flex items-center space-x-2"><input type="radio" name="correctAnswer" checked={newQuestion.correctAnswerIndex === 1} onChange={() => setNewQuestion({...newQuestion, correctAnswerIndex: 1})} /><input type="text" placeholder="Opção de resposta 2" value={newQuestion.options[1]} onChange={e => setNewQuestion({...newQuestion, options: [newQuestion.options[0], e.target.value]})} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600"/></div>
                        <button type="submit" className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"><PlusCircle size={18} className="mr-2"/> Adicionar Pergunta</button>
                    </form>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xl font-bold text-gray-200">Perguntas da Live ({questions.length})</h4>
                    <div className="bg-gray-900/50 p-4 rounded-lg h-96 overflow-y-auto space-y-3">
                        {questions.map((q, index) => (
                            <div key={q.id} className={`p-3 rounded-md border-l-4 ${activeQuestionId === q.id ? 'bg-brand-purple/20 border-brand-purple-light' : 'bg-gray-800 border-brand-purple'}`}>
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-semibold text-gray-200 flex-grow pr-2">{index + 1}. {q.question}</p>
                                    <button onClick={() => handleDeleteQuestion(q.id)} className="ml-2 text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                                </div>
                                <div className="mt-3 pt-2 border-t border-gray-700/50">
                                    {activeQuestionId === q.id ? (
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-bold animate-pulse text-yellow-400 flex items-center"><Loader size={14} className="animate-spin mr-2"/> AO VIVO</div>
                                            <button onClick={handleClearLiveQuestion} className="flex items-center text-sm px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors font-semibold"><Square size={16} className="mr-2"/> Limpar da Live</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleBroadcastQuestion(q)} className="w-full flex items-center justify-center text-sm px-3 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors font-semibold"><Play size={16} className="mr-2"/> Iniciar na Live</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizManagementPanel;
