
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, Persona } from '../types';
import { BackArrowIcon, SendIcon } from './icons';

interface ChatScreenProps {
  persona: Persona;
  character: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onGoBack: () => void;
}

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${
          isUser
            ? 'bg-brand-user text-white rounded-br-none'
            : 'bg-brand-model text-white rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

const LoadingIndicator: React.FC = () => (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md bg-brand-model text-white rounded-bl-none">
        <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
);


export const ChatScreen: React.FC<ChatScreenProps> = ({
  persona,
  character,
  messages,
  onSendMessage,
  isLoading,
  onGoBack,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const handleSend = useCallback(() => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  }, [input, isLoading, onSendMessage]);
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };


  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center p-4 bg-black/20 backdrop-blur-sm shadow-md z-10 shrink-0">
        <button onClick={onGoBack} className="p-2 mr-4 rounded-full hover:bg-white/10 transition-colors">
          <BackArrowIcon />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">{persona}</h1>
          <p className="text-sm text-brand-light truncate max-w-xs md:max-w-md">{character}</p>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
            {messages.map((msg, index) => (
                <ChatBubble key={index} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && <LoadingIndicator />}
            <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 bg-black/20 backdrop-blur-sm shrink-0">
        <div className="max-w-4xl mx-auto flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-black/40 border border-brand-accent/50 rounded-lg text-brand-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="ml-4 p-3 bg-brand-accent rounded-full text-white transition-all duration-200 ease-in-out hover:bg-opacity-90 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            <SendIcon />
          </button>
        </div>
      </footer>
    </div>
  );
};
