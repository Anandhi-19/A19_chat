import React from 'react';
import type { Persona, Language, LanguageType } from '../types';
import { PERSONAS, LANGUAGES, LANGUAGE_TYPES } from '../constants';
import { Dropdown } from './Dropdown';

interface WelcomeScreenProps {
  onStartChat: () => void;
  onReset: () => void;
  persona: Persona | null;
  character: string;
  language: Language | null;
  languageType: LanguageType | null;
  onPersonaChange: (p: Persona) => void;
  onCharacterChange: (c: string) => void;
  onLanguageChange: (l: Language) => void;
  onLanguageTypeChange: (lt: LanguageType) => void;
  error: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
    onStartChat, 
    onReset,
    persona,
    character,
    language,
    languageType,
    onPersonaChange,
    onCharacterChange,
    onLanguageChange,
    onLanguageTypeChange,
    error,
}) => {

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <header className="p-4 bg-black/20 backdrop-blur-sm border-b border-white/10 shadow-md">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-1">
              <Dropdown<Persona>
                options={PERSONAS}
                selected={persona}
                onSelect={onPersonaChange}
                placeholder="Select a Persona"
              />
            </div>
            <div className="md:col-span-1">
              <Dropdown<Language>
                options={LANGUAGES}
                selected={language}
                onSelect={onLanguageChange}
                placeholder="Select a Language"
              />
            </div>
            <div className="md:col-span-1 flex space-x-2">
              {LANGUAGE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onLanguageTypeChange(type.value as LanguageType)}
                  className={`flex-1 p-2 text-sm rounded-lg transition-colors ${
                    languageType === type.value
                      ? 'bg-brand-accent text-white font-semibold ring-2 ring-white/30'
                      : 'bg-black/20 text-brand-light hover:bg-white/20'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="md:col-span-1 flex justify-end">
                <button
                    onClick={onReset}
                    className="w-full md:w-auto px-4 py-2 text-sm text-brand-light bg-black/20 rounded-lg hover:bg-white/20"
                >
                    Reset Settings
                </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg p-8 space-y-8 text-center">
          <div>
             <img src="https://a19-chat-gpt-s6ta.vercel.app/assets/AS2-DRoAo1zP.png" alt="Company Logo" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Bring Your Persona to Life</h1>
            <p className="mt-2 text-brand-light">Describe their personality below to begin the conversation.</p>
          </div>
          
          <div>
            <textarea
              id="character"
              value={character}
              onChange={(e) => onCharacterChange(e.target.value)}
              placeholder="e.g., A cheerful and optimistic friend who loves to tell jokes."
              className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-brand-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none text-center"
              rows={4}
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
              onClick={onStartChat}
              className="w-full p-4 text-lg font-bold text-white bg-brand-accent rounded-lg transition-transform transform hover:scale-105 duration-300 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none"
              disabled={!persona || !character.trim() || !language || !languageType}
          >
              Start Chatting
          </button>
        </div>
      </main>
    </div>
  );
};