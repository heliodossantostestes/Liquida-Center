import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { QuizQuestion, QuizWinner } from '../../types';
import { ArrowLeft, BrainCircuit, Loader, AlertTriangle, Trophy, PlusCircle, Trash2, Play, Square, Check, Video, Power } from 'lucide-react';

interface QuizManagementPanelProps {
    onBack: () => void;
    onSaveQuiz: (questions: QuizQuestion[]) => void;
    setActiveQuestion: (question: QuizQuestion | null) => void;
    liveStreamUrl: string;
    setLiveStreamUrl: (id: string) => void;
}

const mockWinners: QuizWinner[] = [
    { id: 'user-5', name: 'Maria_Gamer', winDate: '11/11/2025', prizeAmount: 50.00 },
    { id: 'user-8', name: 'Julia_M', winDate: '10/11/2025', prizeAmount: 25.00 },
    { id: 'user-2', name: 'Carlos_Vendas', winDate: '10/11/2025', prizeAmount: 25.00 },
    { id: 'user-1', name: 'Ana_Silva', winDate: '08/11/2025', prizeAmount: 50.00 },
];


const initialNewQuestionState: Omit<QuizQuestion, 'id' | 'status'> = {
    question: '',
    options: ['', ''] as [string, string],
    correctAnswerIndex: 0 as 0 | 1,
    difficulty: 'Fácil' as 'Fácil' | 'Intermediário' | 'Difícil'
};

const QuizManagementPanel: React.FC<QuizManagementPanelProps> = ({ onBack, onSaveQuiz, setActiveQuestion, liveStreamUrl, setLiveStreamUrl }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newQuestion, setNewQuestion] = useState(initialNewQuestionState);
    const [questionResults, setQuestionResults] = useState<Record<string, { correct: number, incorrect: number }>>({});
    const [isLiveActive, setIsLiveActive] = useState(false);
    const [isUpdatingLiveState, setIsUpdatingLiveState] = useState(false);

    useEffect(() => {
        onSaveQuiz(questions);
    }, [questions, onSaveQuiz]);

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                const res = await fetch('/api/quiz-state');
                if (res.ok) {
                    const data = await res.json();
                    setIsLiveActive(data.active);
                }
            } catch (err) {
                console.error("Failed to fetch initial quiz state", err);
            }
        };
        fetchInitialState();
    }, []);

    const handleToggleLiveStream = async () => {
        setIsUpdatingLiveState(true);
        const newState = !isLiveActive;
        try {
            const res = await fetch('/api/quiz-state', {
                method: 'POST',
                body: JSON.stringify({
                    active: newState,
                    title: newState ? 'QUIZI AO VIVO AGORA!' : '',
                    message: newState ? 'Clique aqui para participar e concorrer a prêmios!' : ''
                })
            });
            if (res.ok) {
                const data = await res.json();
                setIsLiveActive(data.active);
            } else {
                alert('Falha ao atualizar o estado da live.');
            }
        } catch (err) {
            console.error("Failed to toggle live state", err);
            alert('Erro de conexão ao tentar atualizar o estado da live.');
        } finally {
            setIsUpdatingLiveState(false);
        }
    };


    const handleGenerateQuestions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: "Gere 15 perguntas de conhecimentos gerais com 2 opções de resposta cada. Crie 5 perguntas de nível 'Fácil', 5 de nível 'Intermediário' e 5 de nível 'Difícil'. Para cada pergunta, indique o índice da resposta correta (0 ou 1). Formate a saída como um JSON contendo uma lista de objetos. Cada objeto deve ter as chaves 'question' (string), 'options' (array de 2 strings), 'correctAnswerIndex' (número 0 ou 1), e 'difficulty' (string 'Fácil', 'Intermediário' ou 'Difícil').",
                config: {
                    responseMimeType: "application/json",
                },
            });

            const jsonStr = response.text.trim().replace(/```json|```/g, '');
            const parsedQuestions = JSON.parse(jsonStr).map((q: Omit<QuizQuestion, 'id'>) => ({...q, id: crypto.randomUUID(), status: 'pending' }));
            setQuestions(parsedQuestions);
        } catch (e) {
            console.error(e);
            setError("Falha ao gerar perguntas. Verifique o console para mais detalhes.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (questions.length >= 15) {
            alert("Você já atingiu o limite de 15 perguntas.");
            return;
        }
        if(newQuestion.question && newQuestion.options[0] && newQuestion.options[1]) {
            setQuestions([...questions, { ...newQuestion, id: crypto.randomUUID(), status: 'pending' }]);
            setNewQuestion(initialNewQuestionState);
        } else {
            alert("Por favor, preencha todos os campos da pergunta.");
        }
    };

    const handleDeleteQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };
    
    const handleTriggerQuestion = (question: QuizQuestion) => {
      if (questions.some(q => q.status === 'live')) {
        alert('Uma pergunta já está ativa. Limpe-a da live antes de iniciar outra.');
        return;
      }
      setQuestions(questions.map(q => q.id === question.id ? {...q, status: 'live'} : q));
      setActiveQuestion(question);
    };

    const handleEndQuestion = (question: QuizQuestion) => {
        setQuestions(questions.map(q => q.id === question.id ? {...q, status: 'finished'} : q));
        setActiveQuestion(null);

        // Generate and store mock results for the finished question
        const correct = Math.floor(Math.random() * 50) + 50; // 50-99
        const incorrect = 100 - correct;
        setQuestionResults(prev => ({
            ...prev,
            [question.id]: { correct, incorrect }
        }));
    };

    const getDifficultyClass = (difficulty?: string) => {
        switch (difficulty) {
            case 'Fácil': return 'bg-green-500/20 text-green-400 border-green-500';
            case 'Intermediário': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
            case 'Difícil': return 'bg-red-500/20 text-red-400 border-red-500';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    }

    return (
        <div className="p-8 bg-gray-800 rounded-xl shadow-lg shadow-neon-blue/20 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center text-white"><BrainCircuit className="mr-3 text-neon-blue"/> Gerenciamento do Quiz</h3>
                <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-300 hover:text-white transition">
                    <ArrowLeft size={16} className="mr-1" />
                    Voltar
                </button>
            </div>
            
            <div className="p-4 bg-gray-900/50 rounded-lg space-y-3">
                 <h4 className="text-xl font-bold text-gray-200 flex items-center"><Video className="mr-2 text-brand-purple-light"/> Configuração da Live</h4>
                 <div>
                    <label className="text-sm font-semibold text-gray-300 block mb-1">URL da Live (VDO.Ninja, YouTube, etc.)</label>
                    <input 
                        type="text" 
                        placeholder="Cole o link da sua transmissão" 
                        value={liveStreamUrl}
                        onChange={(e) => setLiveStreamUrl(e.target.value)}
                        className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-brand-purple"
                    />
                 </div>
                 <button 
                    onClick={handleToggleLiveStream}
                    disabled={isUpdatingLiveState}
                    className={`w-full flex items-center justify-center px-4 py-2 text-white font-bold rounded-lg transition ${isLiveActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:bg-gray-500`}
                 >
                    {isUpdatingLiveState ? <Loader size={18} className="animate-spin mr-2"/> : <Power size={18} className="mr-2"/>}
                    {isLiveActive ? 'Finalizar Live na Vitrine' : 'Iniciar Live na Vitrine'}
                 </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-xl font-bold text-gray-200 mb-4">Criador de Perguntas</h4>
                    <form onSubmit={handleAddQuestion} className="p-4 bg-gray-900/50 rounded-lg space-y-3 mb-6">
                        <input type="text" placeholder="Digite a pergunta..." value={newQuestion.question} onChange={e => setNewQuestion({...newQuestion, question: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-brand-purple"/>
                        <div className="flex items-center space-x-2">
                           <input type="radio" name="correctAnswer" checked={newQuestion.correctAnswerIndex === 0} onChange={() => setNewQuestion({...newQuestion, correctAnswerIndex: 0})} />
                           <input type="text" placeholder="Opção de resposta 1" value={newQuestion.options[0]} onChange={e => setNewQuestion({...newQuestion, options: [e.target.value, newQuestion.options[1]]})} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600"/>
                        </div>
                        <div className="flex items-center space-x-2">
                           <input type="radio" name="correctAnswer" checked={newQuestion.correctAnswerIndex === 1} onChange={() => setNewQuestion({...newQuestion, correctAnswerIndex: 1})} />
                           <input type="text" placeholder="Opção de resposta 2" value={newQuestion.options[1]} onChange={e => setNewQuestion({...newQuestion, options: [newQuestion.options[0], e.target.value]})} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600"/>
                        </div>
                        <select value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value as any})} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600">
                            <option>Fácil</option>
                            <option>Intermediário</option>
                            <option>Difícil</option>
                        </select>
                        <button type="submit" disabled={questions.length >= 15} className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"><PlusCircle size={18} className="mr-2"/> Adicionar Pergunta</button>
                    </form>
                    <div className="text-center">
                        <p className="text-gray-400 text-sm mb-2">ou</p>
                         <button onClick={handleGenerateQuestions} disabled={isLoading || questions.length >= 15} className="flex w-full items-center justify-center px-4 py-2 bg-brand-purple hover:bg-brand-purple-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition">
                            {isLoading ? <><Loader size={18} className="animate-spin mr-2"/> Gerando...</> : <><BrainCircuit size={18} className="mr-2"/> Sugerir 15 Perguntas com IA</>}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xl font-bold text-gray-200">Perguntas da Live ({questions.length}/15)</h4>
                    {error && <div className="bg-red-900/50 border border-red-500 text-red-300 text-sm p-3 rounded-md flex items-center"><AlertTriangle size={18} className="mr-2"/> {error}</div>}
                    <div className="bg-gray-900/50 p-4 rounded-lg h-96 overflow-y-auto space-y-3">
                        {questions.length === 0 && !isLoading && <p className="text-center text-gray-400 py-8">Crie perguntas para começar.</p>}
                        {questions.map((q, index) => (
                            <div key={q.id} className={`p-3 rounded-md border-l-4 ${q.status === 'live' ? 'bg-brand-purple/20 border-brand-purple-light' : q.status === 'finished' ? 'bg-gray-800/50 border-gray-600' : 'bg-gray-800 border-brand-purple'}`}>
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-semibold text-gray-200 flex-grow pr-2">{index + 1}. {q.question}</p>
                                    <div className="flex items-center flex-shrink-0">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getDifficultyClass(q.difficulty)}`}>{q.difficulty}</span>
                                        <button onClick={() => handleDeleteQuestion(q.id)} className="ml-2 text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                <div className="text-xs mt-2 space-y-1">
                                    <p className={q.correctAnswerIndex === 0 ? 'text-green-400 font-bold' : 'text-gray-400'}>A) {q.options[0]}</p>
                                    <p className={q.correctAnswerIndex === 1 ? 'text-green-400 font-bold' : 'text-gray-400'}>B) {q.options[1]}</p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-gray-700/50">
                                    {q.status === 'pending' && (
                                        <button onClick={() => handleTriggerQuestion(q)} className="w-full flex items-center justify-center text-sm px-3 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors font-semibold">
                                            <Play size={16} className="mr-2"/> Iniciar na Live
                                        </button>
                                    )}
                                    {q.status === 'live' && (
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-bold animate-pulse text-yellow-400 flex items-center">
                                                <Loader size={14} className="animate-spin mr-2"/>
                                                Votação em andamento...
                                            </div>
                                            <button onClick={() => handleEndQuestion(q)} className="flex items-center text-sm px-3 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors font-semibold">
                                                <Square size={16} className="mr-2"/> Limpar da Live
                                            </button>
                                        </div>
                                    )}
                                    {q.status === 'finished' && (
                                        <div>
                                            {questionResults[q.id] ? (
                                                <div className="text-xs font-bold">
                                                    <p className="text-green-400">Acertos: {questionResults[q.id].correct}%</p>
                                                    <p className="text-red-400">Erros: {questionResults[q.id].incorrect}%</p>
                                                </div>
                                            ) : (
                                                <div className="text-center text-sm font-bold text-gray-500 flex items-center justify-center">
                                                    <Check size={16} className="mr-2"/> Pergunta Finalizada
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-gray-700">
                <h4 className="text-xl font-bold text-gray-200">🏆 Hall da Fama do Quizi</h4>
                <p className="text-xs text-gray-400">Jogadores que acertaram 100% das perguntas em uma live. O prêmio do dia é dividido entre os vencedores. Saldo acumulado pode ser usado como desconto em lojas parceiras.</p>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                    {mockWinners.length > 0 ? (
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
                    ) : (
                         <p className="text-center text-gray-500 py-4">Ainda não há vencedores. Seja o primeiro!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizManagementPanel;
