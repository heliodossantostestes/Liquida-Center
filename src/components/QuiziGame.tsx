import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QuizQuestion, UserProfile } from '../types';
import { PlayCircle, Clock, CheckCircle, XCircle, Users, Heart, Send, Loader } from 'lucide-react';
import QuizChat from './QuizChat';

interface QuiziGameProps {
    activeQuestion: QuizQuestion | null;
    totalQuestions: number;
    currentUser: UserProfile | null;
    onLoginRequest: () => void;
    setIsQuizActive: (isActive: boolean) => void;
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
const initialMockMessages: ChatMessage[] = [
    { user: 'AnaGamer', message: 'Ebaaa, começou!' },
    { user: 'Carlos_Vendas', message: 'Boa sorte a todos!' },
    { user: 'MariCliente', message: 'Essa eu sei!' },
    { user: 'LojaDoZe', message: 'Vamos ver quem ganha hoje hehe' },
    { user: 'Julia_M', message: 'Acho que é a primeira opção' },
    { user: 'Rodrigo', message: 'Não, certeza que é a segunda' },
    { user: 'LojaDaMaria', message: 'Que legal essa live! Adorei a ideia.' },
    { user: 'Pedro_Dev', message: 'Qual a tecnologia por trás disso?' },
    { user: 'FastFood_DaCidade', message: 'Aproveitem a live e peçam um lanche com 10% de desconto!' },
];


const QuiziGame: React.FC<QuiziGameProps> = ({ activeQuestion, totalQuestions, currentUser, onLoginRequest, setIsQuizActive, liveStreamUrl }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [answerPercentages, setAnswerPercentages] = useState<[number, number] | null>(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMockMessages);
    const [newMessage, setNewMessage] = useState('');
    const [animatedHearts, setAnimatedHearts] = useState<AnimatedHeart[]>([]);
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [effectiveUrl, setEffectiveUrl] = useState('');
    const [likeCount, setLikeCount] = useState(2600000);
    const [isEligibleForPrize, setIsEligibleForPrize] = useState(true);
    const prevQuestionId = useRef<string | null>(null);

    const timerRef = useRef<number | undefined>(undefined);
    
    const processedUrl = useMemo(() => {
        if (!liveStreamUrl) return '';

        try {
            if (liveStreamUrl.includes("youtube.com/watch?v=")) {
                const videoId = liveStreamUrl.split('v=')[1].split('&')[0];
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&controls=0&showinfo=0&modestbranding=1`;
            }
            if (liveStreamUrl.includes("youtu.be/")) {
                const videoId = liveStreamUrl.split('youtu.be/')[1].split('?')[0];
                return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&controls=0&showinfo=0&modestbranding=1`;
            }
            if (liveStreamUrl.includes("vdo.ninja")) {
                const url = new URL(liveStreamUrl);
                url.searchParams.delete('mute'); 
                if (!url.searchParams.has('autoplay')) {
                    url.searchParams.set('autoplay', 'true');
                }
                if (!url.searchParams.has('cleanish')) {
                    url.searchParams.set('cleanish', 'true');
                }
                return url.toString();
            }
        } catch (e) {
            console.error("Could not process URL:", e);
            return liveStreamUrl;
        }

        return liveStreamUrl;
    }, [liveStreamUrl]);
    
    const displayResults = () => {
      if (!activeQuestion) return;
      setShowResults(true);

      // Generate mock percentages for demonstration
      const correctVotePercentage = Math.floor(Math.random() * 41) + 50; // 50% to 90%
      const incorrectVotePercentage = 100 - correctVotePercentage;
      
      const percentages: [number, number] = [0, 0];
      percentages[activeQuestion.correctAnswerIndex] = correctVotePercentage;
      percentages[1 - activeQuestion.correctAnswerIndex] = incorrectVotePercentage;
      
      setAnswerPercentages(percentages);
    };

    useEffect(() => {
        if (isFullScreen) {
            setIsVideoPlaying(true);
            setIsVideoLoading(true);
            setEffectiveUrl(processedUrl);
        }
    }, [isFullScreen, processedUrl]);

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
            if (selectedAnswer === null) {
                setIsEligibleForPrize(false);
            }
            displayResults();
        }
        return () => window.clearTimeout(timerRef.current);
    }, [activeQuestion, showResults, timeLeft, selectedAnswer]);
    
    const handleAnswerClick = (index: number) => {
        if (selectedAnswer !== null || !activeQuestion || timeLeft === 0) return;
        
        setSelectedAnswer(index);

        if (index !== activeQuestion.correctAnswerIndex) {
            setIsEligibleForPrize(false);
        } else {
            setCorrectAnswers(prev => prev + 1);
        }
    };
    
    const handleEnterGame = () => {
        if (currentUser) {
            setIsFullScreen(true);
            setIsQuizActive(true);
        } else {
            alert("Você precisa fazer login para participar do Quizi!");
            onLoginRequest();
        }
    };

    const handleExitGame = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFullScreen(false);
        setIsQuizActive(false);
        setIsGameOver(false);
        setCorrectAnswers(0);
        setQuestionsAnswered(0);
        setIsVideoPlaying(false);
        setEffectiveUrl('');
        setIsEligibleForPrize(true);
    };
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && currentUser) {
            setChatMessages(prev => [...prev, { user: currentUser.name, message: newMessage }]);
            setNewMessage('');
        }
    };

    const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setLikeCount(prev => prev + 1);

        const rect = e.currentTarget.getBoundingClientRect();
        const newHeart: AnimatedHeart = {
            id: Date.now() + Math.random(),
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            size: Math.random() * 20 + 20,
        };
        setAnimatedHearts(prev => [...prev, newHeart]);
        setTimeout(() => {
            setAnimatedHearts(prev => prev.filter(h => h.id !== newHeart.id));
        }, 2000);
    };

    const formatLikes = (num: number) => {
        return num.toLocaleString('pt-BR');
    };

    const getButtonClass = (index: number) => {
        if (showResults && activeQuestion) { // After timer ends and results are shown
            const isCorrect = index === activeQuestion.correctAnswerIndex;
            const isSelected = index === selectedAnswer;
            if (isCorrect) return "bg-green-600";
            if (isSelected && !isCorrect) return "bg-red-600";
            return "bg-gray-700 opacity-60";
        }
        
        if (selectedAnswer === index) { // Highlight the selected answer before results
            return "bg-brand-purple ring-2 ring-white";
        }
        
        return "bg-gray-700 hover:bg-brand-purple-dark";
    };

    if (!isFullScreen) {
        return (
            <div 
                className="bg-gray-800 rounded-xl p-6 text-center shadow-2xl shadow-brand-purple/20 border-2 border-brand-purple/30 cursor-pointer transition-transform hover:scale-105"
            >
                <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400 animate-pulse">QUIZI AO VIVO AGORA!</h2>
                <p className="text-gray-400 mb-6">Clique aqui para participar e concorrer a prêmios!</p>
                <button 
                    onClick={handleEnterGame}
                    className="bg-gradient-to-r from-brand-purple to-neon-blue text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition">
                    Participar do Quiz
                </button>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
            
            {isVideoPlaying && isVideoLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
                    <Loader className="animate-spin text-brand-purple-light h-16 w-16" />
                    <p className="mt-4 text-lg">Carregando a live...</p>
                </div>
            )}

            <iframe
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${isVideoPlaying && !isVideoLoading ? 'opacity-100' : 'opacity-0'}`}
                src={effectiveUrl}
                title="Live Stream"
                frameBorder="0"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-autoplay"
                allow="autoplay; camera; microphone; fullscreen; picture-in-picture; display-capture"
                allowFullScreen
                onLoad={() => {
                    if (effectiveUrl) {
                        setIsVideoLoading(false);
                    }
                }}
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
                            <span className="font-bold text-white text-sm">81.6K</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm p-2 rounded-full">
                            <Heart className="h-5 w-5 text-red-500" />
                            <span className="font-bold text-white text-sm">{formatLikes(likeCount)}</span>
                        </div>
                        <button onClick={handleExitGame} className="bg-black/30 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-full hover:bg-red-600 transition-colors">
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            {animatedHearts.map(heart => (
                <div
                    key={heart.id}
                    className="absolute text-red-500 animate-float-up pointer-events-none z-50"
                    style={{ left: heart.x, top: heart.y, fontSize: heart.size }}
                >
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
                        placeholder="Digite sua mensagem..."
                        className="w-full bg-black/50 backdrop-blur-sm border border-gray-600 rounded-full py-3 px-5 focus:ring-2 focus:ring-brand-purple-light outline-none"
                    />
                    <button type="submit" className="bg-brand-purple p-3 rounded-full text-white hover:bg-brand-purple-dark transition-colors flex-shrink-0">
                        <Send size={20} />
                    </button>
                </form>
            </div>
            
            {isVideoPlaying && (
                <button
                    onClick={handleLikeClick}
                    className="absolute bottom-24 right-4 z-30 p-4 bg-black/30 backdrop-blur-sm rounded-full text-red-500 hover:bg-black/50 transition-colors transform active:scale-90"
                    aria-label="Curtir a live"
                >
                    <Heart size={32} fill="currentColor" />
                </button>
            )}

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
                                      {showResults && (
                                        index === activeQuestion.correctAnswerIndex ? <CheckCircle className="ml-3 text-white"/> : (selectedAnswer === index && <XCircle className="ml-3 text-white"/>)
                                      )}
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