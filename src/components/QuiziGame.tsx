import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QuizQuestion, UserProfile } from '../types';
import { Clock, CheckCircle, XCircle, Users, Heart, Send, Loader } from 'lucide-react';
import QuizChat from './QuizChat';

interface QuiziGameProps {
    activeQuestion: QuizQuestion | null;
    totalQuestions: number;
    currentUser: UserProfile | null;
    onLoginRequest: () => void;
    onLeaveLiveQuiz: () => void;
    liveStreamUrl: string;
}

interface ChatMessage {
    user: string;
    message: string;
}

interface AnimatedHeart {
    id: number;
    x: number;
    y: number;
    size: number;
}

interface LiveStats {
    viewers: number;
    likes: number;
}

const QuiziGame: React.FC<QuiziGameProps> = ({ activeQuestion, totalQuestions, currentUser, onLoginRequest, onLeaveLiveQuiz, liveStreamUrl }) => {
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [answerPercentages, setAnswerPercentages] = useState<[number, number] | null>(null);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [animatedHearts, setAnimatedHearts] = useState<AnimatedHeart[]>([]);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [isEligibleForPrize, setIsEligibleForPrize] = useState(true);
    const [liveStats, setLiveStats] = useState<LiveStats>({ viewers: 0, likes: 0 });

    const prevQuestionId = useRef<string | null>(null);
    const timerRef = useRef<number | undefined>(undefined);
    const statsIntervalRef = useRef<number | undefined>(undefined);

    const processedUrl = useMemo(() => {
        if (!liveStreamUrl) return '';
        try {
            const url = new URL(liveStreamUrl);
            url.searchParams.set('autoplay', 'true');
            url.searchParams.set('cleanish', 'true');
            url.searchParams.delete('mute');
            return url.toString();
        } catch (e) {
            console.error("Invalid Live Stream URL:", e);
            return liveStreamUrl;
        }
    }, [liveStreamUrl]);

    const updateLiveStats = async (action: 'get' | 'like' ) => {
        try {
            if (action === 'get') {
                const res = await fetch('/api/live-stats');
                if (res.ok) {
                    const data = await res.json();
                    setLiveStats(data);
                }
            } else { // like
                 const res = await fetch('/api/live-stats', {
                    method: 'POST',
                    body: JSON.stringify({ action }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setLiveStats(data);
                }
            }
        } catch (err) {
            console.error(`Failed to ${action} live stats`, err);
        }
    };
    
    // This effect handles polling for stats
    useEffect(() => {
        // Poll for stats updates
        statsIntervalRef.current = window.setInterval(() => updateLiveStats('get'), 3000);

        // Cleanup on component unmount
        return () => {
            clearInterval(statsIntervalRef.current);
        };
    }, []);

    const displayResults = () => {
        if (!activeQuestion) return;
        setShowResults(true);
        const correctVotePercentage = Math.floor(Math.random() * 41) + 50;
        const incorrectVotePercentage = 100 - correctVotePercentage;
        const percentages: [number, number] = [0, 0];
        percentages[activeQuestion.correctAnswerIndex] = correctVotePercentage;
        percentages[1 - activeQuestion.correctAnswerIndex] = incorrectVotePercentage;
        setAnswerPercentages(percentages);
    };

    useEffect(() => {
        if (activeQuestion && activeQuestion.id !== prevQuestionId.current) {
            prevQuestionId.current = activeQuestion.id;
            setShowResults(false);
            setSelectedAnswer(null);
            setAnswerPercentages(null);
            setTimeLeft(15);
            setQuestionsAnswered(prev => prev + 1);
        }
    }, [activeQuestion]);

    useEffect(() => {
        if (activeQuestion && !showResults && timeLeft > 0) {
            timerRef.current = window.setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (activeQuestion && !showResults && timeLeft === 0) {
            window.clearTimeout(timerRef.current);
            if (selectedAnswer === null) setIsEligibleForPrize(false);
            displayResults();
        }
        return () => window.clearTimeout(timerRef.current);
    }, [activeQuestion, showResults, timeLeft, selectedAnswer]);
    
    const handleAnswerClick = (index: number) => {
        if (selectedAnswer !== null || !activeQuestion || timeLeft === 0) return;
        setSelectedAnswer(index);
        if (index !== activeQuestion.correctAnswerIndex) {
            setIsEligibleForPrize(false);
        }
    };
    
    const handleExitGame = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLeaveLiveQuiz();
    };
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && currentUser) {
            setChatMessages(prev => [...prev, { user: currentUser.name, message: newMessage }]);
            setNewMessage('');
        } else if (!currentUser) {
            onLoginRequest();
        }
    };

    const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        updateLiveStats('like'); // Update likes on the server
        const rect = e.currentTarget.getBoundingClientRect();
        const newHeart: AnimatedHeart = {
            id: Date.now() + Math.random(),
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            size: Math.random() * 20 + 20,
        };
        setAnimatedHearts(prev => [...prev, newHeart]);
        setTimeout(() => setAnimatedHearts(prev => prev.filter(h => h.id !== newHeart.id)), 2000);
    };

    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`.replace('.0','');
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`.replace('.0','');
      return num.toLocaleString('pt-BR');
    };

    const getButtonClass = (index: number) => {
        if (showResults && activeQuestion) {
            const isCorrect = index === activeQuestion.correctAnswerIndex;
            if (isCorrect) return "bg-green-600";
            if (index === selectedAnswer && !isCorrect) return "bg-red-600";
            return "bg-gray-700 opacity-60";
        }
        if (selectedAnswer === index) return "bg-brand-purple ring-2 ring-white";
        return "bg-gray-700 hover:bg-brand-purple-dark";
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
            
            {isVideoLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
                    <Loader className="animate-spin text-brand-purple-light h-16 w-16" />
                    <p className="mt-4 text-lg">Carregando a live...</p>
                </div>
            )}

            <iframe
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${!isVideoLoading ? 'opacity-100' : 'opacity-0'}`}
                src={processedUrl}
                title="Live Stream"
                frameBorder="0"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-autoplay"
                allow="autoplay; camera; microphone; fullscreen; picture-in-picture; display-capture"
                allowFullScreen
                onLoad={() => setIsVideoLoading(false)}
            ></iframe>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none z-10"></div>

            <header className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-20" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm p-2 rounded-full">
                        <img src="https://i.pravatar.cc/48?u=admin-01" alt="Apresentador" className="w-12 h-12 rounded-full border-2 border-brand-purple-light" />
                        <div>
                            <h3 className="font-bold text-white text-md leading-tight">Hélio Santos</h3>
                            <p className="text-gray-300 text-xs leading-tight">Apresentador</p>
                            <div className="mt-1">
                                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">AO VIVO</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm p-2 rounded-full">
                            <Users className="h-5 w-5 text-gray-300" />
                            <span className="font-bold text-white text-sm">{formatNumber(liveStats.viewers)}</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm p-2 rounded-full">
                            <Heart className="h-5 w-5 text-red-500" />
                            <span className="font-bold text-white text-sm">{liveStats.likes.toLocaleString('pt-BR')}</span>
                        </div>
                        <button onClick={handleExitGame} className="bg-black/30 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-full hover:bg-red-600 transition-colors">
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            {animatedHearts.map(heart => (
                <div key={heart.id} className="absolute text-red-500 animate-float-up pointer-events-none z-50" style={{ left: heart.x, top: heart.y, fontSize: heart.size }}>
                    <Heart fill="currentColor" />
                </div>
            ))}
            
            <div className="absolute bottom-24 left-2 w-3/4 max-w-sm h-1/3 z-20" onClick={e => e.stopPropagation()}>
                 <div className="h-full w-full pointer-events-auto">
                    <QuizChat messages={chatMessages} />
                 </div>
            </div>

             <div className="absolute bottom-4 left-0 right-0 px-4 z-30" onClick={e => e.stopPropagation()} style={{ pointerEvents: activeQuestion ? 'none' : 'auto', opacity: activeQuestion ? 0.5 : 1 }}>
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={currentUser ? "Digite sua mensagem..." : "Faça login para conversar"}
                        disabled={!currentUser}
                        className="w-full bg-black/50 backdrop-blur-sm border border-gray-600 rounded-full py-3 px-5 focus:ring-2 focus:ring-brand-purple-light outline-none disabled:opacity-50"
                    />
                    <button type="submit" className="bg-brand-purple p-3 rounded-full text-white hover:bg-brand-purple-dark transition-colors flex-shrink-0">
                        <Send size={20} />
                    </button>
                </form>
            </div>
            
            <button
                onClick={handleLikeClick}
                className="absolute bottom-24 right-4 z-30 p-4 bg-black/30 backdrop-blur-sm rounded-full text-red-500 hover:bg-black/50 transition-colors transform active:scale-90"
                aria-label="Curtir a live"
            >
                <Heart size={32} fill="currentColor" />
            </button>

            {activeQuestion && (
                 <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-end p-4 z-40" onClick={e => e.stopPropagation()}>
                    <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl shadow-brand-purple/30 border border-brand-purple/20 mb-20">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Pergunta {questionsAnswered} de {totalQuestions}</h3>
                            <div className="flex items-center bg-black/30 px-3 py-1 rounded-full text-lg font-bold">
                                <Clock size={18} className="mr-2"/>
                                <span>{timeLeft}</span>
                            </div>
                        </div>

                        {!isEligibleForPrize && (
                            <div className="text-center text-yellow-400 bg-black/30 p-2 rounded-md text-sm font-semibold mb-4 border border-yellow-500/50">
                                Você não está mais concorrendo ao prêmio, mas continue jogando!
                            </div>
                        )}

                        <p className="text-xl font-semibold mb-6 text-center">{activeQuestion.question}</p>
                        <div className="space-y-4">
                            {activeQuestion.options.map((option, index) => (
                                <button 
                                    key={index}
                                    onClick={() => handleAnswerClick(index)}
                                    disabled={selectedAnswer !== null || timeLeft === 0}
                                    className={`w-full text-left p-4 rounded-lg font-bold text-lg transition-all duration-300 transform flex items-center justify-between ${getButtonClass(index)} ${selectedAnswer === null && timeLeft > 0 ? 'hover:scale-105' : 'cursor-not-allowed'}`}
                                >
                                    <div className="flex items-center">
                                      <span>{option}</span>
                                      {showResults && (index === activeQuestion.correctAnswerIndex ? <CheckCircle className="ml-3 text-white"/> : (selectedAnswer === index && <XCircle className="ml-3 text-white"/>))}
                                    </div>
                                    {showResults && answerPercentages && (
                                        <span className="text-base font-bold text-white/80">{answerPercentages[index]}%</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default QuiziGame;