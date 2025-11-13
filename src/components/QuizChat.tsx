
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface QuizChatProps {
    messages: ChatMessage[];
}

const roleColors: Record<string, string> = {
    admin: 'text-red-500',
    merchant: 'text-yellow-400',
    user: 'text-brand-purple-light',
};

const QuizChat: React.FC<QuizChatProps> = ({ messages }) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="h-full w-full flex flex-col overflow-y-scroll scrollbar-hide">
            <div className="flex-grow"></div>
            <div className="flex flex-col items-start justify-end space-y-2 p-2">
                {messages.map((msg) => (
                    <div key={msg.id} className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2 max-w-[90%] break-words">
                        <span className={`${roleColors[msg.role] || 'text-brand-purple-light'} font-bold text-sm mr-2`}>
                            {msg.userName}
                            {msg.role !== 'user' && <span className="text-xs opacity-70 ml-1">({msg.role})</span>}
                        </span>
                        <span className="text-white text-sm">{msg.text}</span>
                    </div>
                ))}
            </div>
            <div ref={chatEndRef} />
        </div>
    );
};

export default QuizChat;