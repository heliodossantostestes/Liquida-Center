
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserProfile, ChatMessage, LiveQuestion } from '../types';
import { Clock, CheckCircle, XCircle, Users, Heart, Send, Loader } from 'lucide-react';
import QuizChat from './QuizChat';

interface QuiziGameProps {
    currentUser: UserProfile | null;
    onLoginRequest: () => void;
    onLeaveLiveQuiz: () => void;
    liveStreamUrl: string;
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

const QuiziGame: React.FC<QuiziGameProps> = ({ currentUser, onLoginRequest, onLeaveLiveQuiz, liveStreamUrl }) => {
    const [liveQuestion, setLiveQuestion] = useState<LiveQuestion | null>(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [answerPercentages, setAnswerPercentages] = useState<[number, number] | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [animatedHearts, setAnimatedHearts] = useState<AnimatedHeart[]>([]);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [isEligibleForPrize, setIsEligibleForPrize] = useState(true);
    const [liveStats, setLiveStats] = useState<LiveStats>({ viewers: 0, likes: 0 });

    const prevQuestionId = useRef<string | null>(null);
    const timerRef = useRef<number | undefined>(undefined);
    const pollIntervalRef = useRef<number | undefined>(undefined);

    const processedUrl = useMemo(() => {
        if (!liveStreamUrl) return '';
        try {
            const url = new URL(liveStreamUrl);
            url.searchParams.set('autoplay', 'true');
            url.searchParams.set('cleanish', 'true');
            url.searchParams.delete('mute');
            return url.toString();
        } catch (e) {
            return liveStreamUrl;
        }
    }, [liveStreamUrl]);

    // Polling effect for all live data
    useEffect(() => {
        const pollData = async () => {
            try {
                // Fetch live question
                const questionRes = await fetch('/api/live-question');
                if (questionRes.ok) {
                    const questionData = await questionRes.json();
                    setLiveQuestion(questionData.active ? questionData : null);
                }
                // Fetch chat messages
                const chatRes = await fetch('/api/live-chat');
                if (chatRes.ok) setChatMessages(await chatRes.json());

                // Fetch live stats
                const statsRes = await fetch('/api/live-stats');
                if (statsRes.ok) setLiveStats(await statsRes.json());

            } catch (err) {
                console.error("Polling error:", err);
            }
        };

        pollData(); // Initial fetch
        pollIntervalRef.current = window.setInterval(pollData, 2000); // Poll every 2 seconds

        return () => clearInterval(pollIntervalRef.current);
    }, []);

    const handleAnswerClick = (index: number) => {
        if (selectedAnswer !== null || !liveQuestion || timeLeft === 0) return;
        setSelectedAnswer(index);
        // This is a mock; real logic would be server-side
        // if (index !== liveQuestion.correctAnswerIndex) {
        //     setIsEligibleForPrize(false);
        // }
    };

    const handleExitGame = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLeaveLiveQuiz();
    };
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        if (!currentUser) {
            onLoginRequest();
            return;
        }
        try {
            const res = await fetch('/api/live-chat', {
                method: 'POST',
                body: JSON.stringify({
                    userName: currentUser.displayName || currentUser.name,
                    role: currentUser.role,
                    text: newMessage.trim(),
                }),
            });
            if (res.ok) {
                const newMsg = await res.json();
                setChatMessages(prev => [...prev, newMsg]);
                setNewMessage('');
            } else {
                alert('Erro ao enviar mensagem.');
            }
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const handleLikeClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        try {
            const res = await fetch('/api/live-stats', { method: 'POST', body: JSON.stringify({ action: 'like' }) });
            if (res.ok) setLiveStats(await res.json());
        } catch (err) {
            console.error("Failed to like:", err);
        }

        const rect = e.currentTarget.getBoundingClientRect();
        setAnimatedHearts(prev => [...prev, { id: Date.now(), x: rect.left, y: rect.top, size: 24 }]);
        setTimeout(() => setAnimatedHearts(prev => prev.slice(1)), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
            {isVideoLoading && <div className="absolute inset-0 flex items-center justify-center bg-black z-20"><Loader className="animate-spin text-brand-purple-light h-16 w-16" /></div>}
            <iframe className={`absolute top-0 left-0 w-full h-full transition-opacity ${!isVideoLoading ? 'opacity-100' : 'opacity-0'}`} src={processedUrl} title="Live Stream" frameBorder="0" allow="autoplay; camera; microphone; fullscreen" allowFullScreen onLoad={() => setIsVideoLoading(false)}></iframe>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50 pointer-events-none z-10"></div>
            
            <header className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-20">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm p-2 rounded-full">
                        <img src="https://i.pravatar.cc/48?u=helio-santos-admin" alt="Apresentador" className="w-12 h-12 rounded-full border-2 border-brand-purple-light" />
                        <div>
                            <h3 className="font-bold text-white text-md leading-tight">Hélio Santos</h3>
                            <p className="text-gray-300 text-xs leading-tight">Apresentador</p>
                            <div className="mt-1"><span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">AO VIVO</span></div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm p-2 rounded-full"><Users className="h-5 w-5 text-gray-300" /><span className="font-bold text-white text-sm">{liveStats.viewers}</span></div>
                        <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm p-2 rounded-full"><Heart className="h-5 w-5 text-red-500" /><span className="font-bold text-white text-sm">{liveStats.likes.toLocaleString('pt-BR')}</span></div>
                        <button onClick={handleExitGame} className="bg-black/30 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-full hover:bg-red-600 transition-colors">Sair</button>
                    </div>
                </div>
            </header>

            {animatedHearts.map(h => <div key={h.id} className="absolute text-red-500 animate-float-up pointer-events-none z-50" style={{ left: h.x, top: h.y, fontSize: h.size }}><Heart fill="currentColor" /></div>)}
            
            <div className="absolute bottom-24 left-2 w-3/4 max-w-sm h-1/3 z-20"><div className="h-full w-full pointer-events-auto"><QuizChat messages={chatMessages} /></div></div>

            <div className="absolute bottom-4 left-0 right-0 px-4 z-30" style={{ pointerEvents: liveQuestion ? 'none' : 'auto', opacity: liveQuestion ? 0.5 : 1 }}>
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={currentUser ? "Digite sua mensagem..." : "Faça login para conversar"} disabled={!currentUser} className="w-full bg-black/50 backdrop-blur-sm border border-gray-600 rounded-full py-3 px-5 focus:ring-2 focus:ring-brand-purple-light outline-none disabled:opacity-50" />
                    <button type="submit" className="bg-brand-purple p-3 rounded-full text-white hover:bg-brand-purple-dark transition-colors flex-shrink-0"><Send size={20} /></button>
                </form>
            </div>
            
            <button onClick={handleLikeClick} className="absolute bottom-24 right-4 z-30 p-4 bg-black/30 backdrop-blur-sm rounded-full text-red-500 hover:bg-black/50 transition-colors"><Heart size={32} fill="currentColor" /></button>

            {liveQuestion && (
                 <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-end p-4 z-40">
                    <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl mb-20">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Pergunta da Rodada</h3>
                            <div className="flex items-center bg-black/30 px-3 py-1 rounded-full text-lg font-bold"><Clock size={18} className="mr-2"/><span>15</span></div>
                        </div>
                        <p className="text-xl font-semibold mb-6 text-center">{liveQuestion.question}</p>
                        <div className="space-y-4">
                            <button onClick={() => handleAnswerClick(0)} className="w-full text-left p-4 rounded-lg font-bold text-lg transition bg-gray-700 hover:bg-brand-purple-dark"><span>{liveQuestion.optionA}</span></button>
                            <button onClick={() => handleAnswerClick(1)} className="w-full text-left p-4 rounded-lg font-bold text-lg transition bg-gray-700 hover:bg-brand-purple-dark"><span>{liveQuestion.optionB}</span></button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default QuiziGame;
