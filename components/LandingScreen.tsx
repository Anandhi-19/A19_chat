
import React from 'react';
import type { ChatSession } from '../types';
import { Logo } from './Logo';

interface LandingScreenProps {
  onGetStarted: () => void;
  onLoadChat: (sessionId: string) => void;
  onResetHistory: () => void;
  sessions: ChatSession[];
}

const HistoryItem: React.FC<{ session: ChatSession; onLoad: () => void }> = ({ session, onLoad }) => (
    <button
      onClick={onLoad}
      className="w-full text-left p-4 bg-black/30 backdrop-blur-sm rounded-lg mb-2 hover:bg-black/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-white">{session.persona}</h3>
        <span className="text-xs text-brand-light">{new Date(session.timestamp).toLocaleString()}</span>
      </div>
      <p className="text-sm text-brand-light truncate mt-1">{session.character}</p>
      {session.chatHistory.length > 0 && (
         <p className="text-xs text-gray-400 italic mt-2 truncate">
            {session.chatHistory[session.chatHistory.length - 1].content}
         </p>
      )}
    </button>
);


export const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted, onLoadChat, onResetHistory, sessions }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
      <div className="text-center w-full max-w-4xl mx-auto">
        <Logo className="mb-8" />
        <h1 className="text-5xl font-extrabold mb-4">Welcome to Persona Chat AI</h1>
        <p className="text-xl text-brand-light mb-8">
          Craft unique AI personalities and bring your conversations to life. Ready to start?
        </p>
        <button
          onClick={onGetStarted}
          className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Get Started
        </button>
      </div>
      
      {sessions.length > 0 && (
        <div className="w-full max-w-4xl mx-auto mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Chats</h2>
            <button 
                onClick={onResetHistory} 
                className="text-sm text-red-400 hover:text-red-300 transition-colors">
                Clear History
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto pr-2 -mr-2">
            {sessions.map(session => (
              <HistoryItem key={session.id} session={session} onLoad={() => onLoadChat(session.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
