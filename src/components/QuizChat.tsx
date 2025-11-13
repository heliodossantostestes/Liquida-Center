import React, { useEffect, useRef } from 'react';

interface ChatMessage {
    user: string;
    message: string;
}

interface QuizChatProps {
    messages: ChatMessage[];
}

const QuizChat: React.FC<QuizChatProps> = ({ messages }) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="h-full w-full flex flex-col overflow-y-scroll scrollbar-hide">
            <div className="flex-grow"></div>
            <div className="flex flex-col items-start justify-end space-y-2 p-2">
                {messages.map((msg, index) => (
                    <div key={index} className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2 max-w-[90%] break-words">
                        <span className="text-brand-purple-light font-bold text-sm mr-2">{msg.user}</span>
                        <span className="text-white text-sm">{msg.message}</span>
                    </div>
                ))}
            </div>
            <div ref={chatEndRef} />
        </div>
    );
};

export default QuizChat;
