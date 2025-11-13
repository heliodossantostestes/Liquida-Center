import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizWinner, LiveQuestion } from '../../types';
import { ArrowLeft, BrainCircuit, Loader, Trophy, PlusCircle, Trash2, Play, Square, Video, Power, Clock } from 'lucide-react';

interface QuizManagementPanelProps {
    onBack: () => void;
    liveStreamUrl: string;
    setLiveStreamUrl: (id: string) => void;
}

const mockWinners: QuizWinner[] = [
    { id: 'user-5', name: 'Maria_Gamer', winDate: '11/11/2025', prizeAmount: 50.00 },
    { id: 'user-8', name: 'Julia_M', winDate: '10/11/2025', prizeAmount: 25.00 },
];

const initialNewQuestionState: Omit<QuizQuestion, 'id' | 'status'> = {
    question: '', options: ['', ''], correctAnswerIndex: 0, difficulty: 'Fácil'
};

interface VoteResults { percentages: [number, number]; }

const QuizManagementPanel: React.FC<QuizManagementPanelProps> = ({ onBack, liveStreamUrl, setLiveStreamUrl }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [newQuestion, setNewQuestion] = useState(initialNewQuestionState);
    const [isLiveActive, setIsLiveActive] = useState(false);
    const [isUpdatingLiveState, setIsUpdatingLiveState] = useState(false);
    const [activeLiveQuestion, setActiveLiveQuestion] = useState<LiveQuestion | null>(null);
    const [liveVoteResults, setLiveVoteResults] = useState<VoteResults | null>(null);
    const [timeLeftForActiveQuestion, setTimeLeftForActiveQuestion] = useState<number | null>(null);


    useEffect(() => {
        let pollInterval: number | undefined;
        const pollAdminData = async () => {
             try {
                const [resQuiz, resQuestion] = await Promise.all([
                    fetch('/api/quiz-state'),
                    fetch('/api/live-question')
                ]);
                if (resQuiz.ok) setIsLiveActive((await resQuiz.json()).active);
                if (resQuestion.ok) {
                    const qData: LiveQuestion = await resQuestion.json();
                    setActiveLiveQuestion(qData.active ? qData : null);

                    if (qData.active && qData.id) {
                        const voteRes = await fetch(`/api/live-vote?questionId=${qData.id}`);
                        if (voteRes.ok) setLiveVoteResults(await voteRes.json());
                    } else {
                        setLiveVoteResults(null);
                    }
                }
            } catch (err) { console.error("Admin polling failed", err); }
        };
        
        pollAdminData();
        pollInterval = window.setInterval(pollAdminData, 2000);
        return () => clearInterval(pollInterval);
    }, []);

    useEffect(() => {
        let timerInterval: number | undefined;
        if (activeLiveQuestion?.status === 'running' && activeLiveQuestion.startedAt) {
            timerInterval = window.setInterval(() => {
                const startTime = new Date(activeLiveQuestion.startedAt!).getTime();
                const elapsedTime = (Date.now() - startTime) / 1000;
                const remaining = Math.max(0, 15 - elapsedTime);
                setTimeLeftForActiveQuestion(Math.round(remaining));
            }, 500);
        } else {
            setTimeLeftForActiveQuestion(null);
        }
        return () => clearInterval(timerInterval);
    }, [activeLiveQuestion]);


    const handleToggleLiveStream = async () => {
        setIsUpdatingLiveState(true);
        const newState = !isLiveActive;
        try {
            await fetch('/api/quiz-state', {
                method: 'POST',
                body: JSON.stringify({ active: newState, title: newState ? 'QUIZI AO VIVO AGORA!' : '', message: newState ? 'Clique aqui para participar e concorrer a prêmios!' : '' })
            });
            setIsLiveActive(newState);
        } catch (err) { alert('Falha ao atualizar o estado da live.'); } 
        finally { setIsUpdatingLiveState(false); }
    };

    const handleBroadcastQuestion = async (question: QuizQuestion) => {
        if (activeLiveQuestion?.active) {
            alert('Uma pergunta já está ativa. Limpe-a da live antes de iniciar outra.');
            return;
        }
        const questionToBroadcast: LiveQuestion = { 
            active: true, 
            id: question.id, 
            question: question.question, 
            optionA: question.options[0], 
            optionB: question.options[1], 
            correctAnswerIndex: question.correctAnswerIndex, 
            difficulty: question.difficulty, 
            status: 'running', 
            startedAt: new Date().toISOString() 
        };
        try {
            await fetch('/api/live-question', { method: 'POST', body: JSON.stringify(questionToBroadcast) });
            setActiveLiveQuestion(questionToBroadcast);
        } catch (err) { alert("Erro ao iniciar pergunta na live."); }
    };

    const handleClearLiveQuestion = async () => {
        const clearState: LiveQuestion = { active: false, id: null, question: '', optionA: '', optionB: '', difficulty: null, status: 'idle', startedAt: null, correctAnswerIndex: null };
        try {
            await fetch('/api/live-question', { method: 'POST', body: JSON.stringify(clearState) });
            setActiveLiveQuestion(null);
        } catch (err) { alert("Erro ao limpar pergunta da live."); }
    };
    
    const handleAddQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (newQuestion.question && newQuestion.options[0] && newQuestion.options[1]) {
            setQuestions([...questions, { ...newQuestion, id: crypto.randomUUID(), status: 'pending' }]);
            setNewQuestion(initialNewQuestionState);
        } else {
            alert("Por favor, preencha todos os campos da pergunta.");
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
                            <div key={q.id} className={`p-3 rounded-md border-l-4 ${activeLiveQuestion?.id === q.id ? 'bg-brand-purple/20 border-brand-purple-light' : 'bg-gray-800 border-brand-purple'}`}>
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-semibold text-gray-200 flex-grow pr-2">{index + 1}. {q.question}</p>
                                    <button onClick={() => handleDeleteQuestion(q.id)} className="ml-2 text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                                </div>
                                <div className="text-xs mt-2 space-y-1">
                                    <p className={q.correctAnswerIndex === 0 ? 'text-green-400 font-bold' : 'text-gray-400'}>A) {q.options[0]}</p>
                                    <p className={q.correctAnswerIndex === 1 ? 'text-green-400 font-bold' : 'text-gray-400'}>B) {q.options[1]}</p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-gray-700/50">
                                    {activeLiveQuestion?.id === q.id ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {timeLeftForActiveQuestion !== null && timeLeftForActiveQuestion > 0 ? (
                                                    <div className="text-sm font-bold animate-pulse text-yellow-400 flex items-center"><Clock size={14} className="mr-2"/> AO VIVO: {timeLeftForActiveQuestion}s</div>
                                                ) : (
                                                    <div className="text-xs font-bold">
                                                        <p>Resultados Finais:</p>
                                                        <p>A: {liveVoteResults?.percentages[0] ?? 0}% | B: {liveVoteResults?.percentages[1] ?? 0}%</p>
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={handleClearLiveQuestion} className="flex items-center text-sm px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors font-semibold"><Square size={16} className="mr-2"/> Limpar da Live</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleBroadcastQuestion(q)} className="w-full flex items-center justify-center text-sm px-3 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors font-semibold disabled:bg-gray-500" disabled={!!activeLiveQuestion?.active}>
                                            <Play size={16} className="mr-2"/> Iniciar na Live
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-700">
                <h4 className="text-xl font-bold text-gray-200">🏆 Hall da Fama do Quizi</h4>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                    <ul className="space-y-2">
                        {mockWinners.map((winner) => (
                             <li key={winner.id + winner.winDate} className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                                <div className="flex items-center">
                                    <img src={`https://i.pravatar.cc/40?u=${winner.id}`} alt={winner.name} className="w-8 h-8 rounded-full mr-3" />
                                    <div>
                                        <span className="font-semibold text-white block">{winner.name}</span>
                                        <span className="text-xs text-gray-400">{winner.winDate}</span>
                                    </div>
                                </div>
                                <span className="font-bold text-lg text-yellow-400">
                                    R$ {winner.prizeAmount.toFixed(2).replace('.', ',')}
                                </span>
                             </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default QuizManagementPanel;