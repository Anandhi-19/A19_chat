
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { Persona, Language, LanguageType } from '../types';
import { PERSONAS, LANGUAGES, LANGUAGE_TYPES } from '../constants';
import { Dropdown } from './Dropdown';
import { Logo } from './Logo';
import { BackArrowIcon } from './icons';

interface WelcomeScreenProps {
  onStartChat: (persona: Persona, character: string, language: Language, languageType: LanguageType) => void;
  initialState: {
    persona: Persona | null;
    character: string;
    language: Language | null;
    languageType: LanguageType | null;
  };
  onGoBack: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartChat,
  initialState,
  onGoBack,
}) => {
  const [persona, setPersona] = useState<Persona | null>(initialState.persona ?? PERSONAS[0]);
  const [character, setCharacter] = useState<string>(initialState.character);
  const [language, setLanguage] = useState<Language | null>(initialState.language ?? LANGUAGES[0]);
  const [languageType, setLanguageType] = useState<LanguageType | null>(initialState.languageType ?? 'native');

  const resetSettings = useCallback(() => {
    setPersona(PERSONAS[0]);
    setCharacter('');
    setLanguage(LANGUAGES[0]);
    setLanguageType('native');
  }, []);

  useEffect(() => {
    if (initialState.persona) setPersona(initialState.persona);
    if (initialState.character) setCharacter(initialState.character);
    if (initialState.language) setLanguage(initialState.language);
    if (initialState.languageType) setLanguageType(initialState.languageType);
  }, [initialState]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (persona && character && language && languageType) {
      onStartChat(persona, character, language, languageType);
    }
  }, [persona, character, language, languageType, onStartChat]);

  const isFormValid = useMemo(() => persona && character.trim() && language && languageType, [persona, character, language, languageType]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm z-20">
        <button onClick={onGoBack} className="p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0">
          <BackArrowIcon />
        </button>
        <div className="flex justify-center items-center gap-4">
          <div className="w-40">
            <Dropdown<Persona>
              label=""
              options={PERSONAS}
              selected={persona}
              onSelect={setPersona}
            />
          </div>
          <div className="w-40">
            <Dropdown<Language>
              label=""
              options={LANGUAGES}
              selected={language}
              onSelect={setLanguage}
            />
          </div>
          <div className="flex bg-black/30 rounded-lg p-1">
            {LANGUAGE_TYPES.map(type => (
                <button
                    key={type.value}
                    type="button"
                    onClick={() => setLanguageType(type.value as LanguageType)}
                    className={`px-3 py-1 rounded-md transition-colors text-sm ${languageType === type.value ? 'bg-brand-accent text-white' : 'hover:bg-white/10'}`}
                >
                    {type.label}
                </button>
            ))}
          </div>
          <button onClick={resetSettings} className="text-sm hover:text-brand-accent transition-colors whitespace-nowrap">
            Reset Settings
          </button>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="w-full max-w-2xl text-center">
        <Logo className="mb-8" />
        <h1 className="text-4xl font-bold text-white mb-4">Bring Your Persona to Life</h1>
        <p className="text-brand-light mb-8">Describe their personality below to begin the conversation.</p>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            placeholder="e.g., A strict mother who values discipline. She wakes up at 6 AM, insists on a clean bed, and forbids wasting time. She believes all rules are for the well-being of everyone..."
            className="w-full p-4 bg-black/30 backdrop-blur-sm border border-brand-accent/50 rounded-lg text-brand-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            rows={5}
          />
          <button
            type="submit"
            disabled={!isFormValid}
            className="mt-8 w-full max-w-xs py-3 px-4 bg-brand-accent text-white font-bold rounded-lg transition-all duration-300 ease-in-out hover:bg-opacity-90 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
          >
            Start Chatting
          </button>
        </form>
      </div>
    </div>
  );
};