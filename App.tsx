import React, { useState, useCallback, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { InitialWelcomeScreen } from './components/InitialWelcomeScreen';
import type { ChatMessage, Persona, Language, LanguageType } from './types';
import { getChatResponse } from './services/geminiService';
import { Chat } from '@google/genai';

type View = 'initial' | 'setup' | 'chat';
const STORAGE_KEY = 'persona-chat-settings';

const App: React.FC = () => {
  const [view, setView] = useState<View>('initial');
  
  const [persona, setPersona] = useState<Persona | null>(null);
  const [character, setCharacter] = useState<string>('');
  const [language, setLanguage] = useState<Language | null>(null);
  const [languageType, setLanguageType] = useState<LanguageType | null>(null);
  const [error, setError] = useState<string>('');
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setPersona(parsed.persona || null);
        setCharacter(parsed.character || '');
        setLanguage(parsed.language || null);
        setLanguageType(parsed.languageType || null);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      const settings = { persona, character, language, languageType };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [persona, character, language, languageType]);

  const handleProceedToSetup = useCallback(() => {
    setView('setup');
  }, []);

  const handleStartChat = useCallback(() => {
    if (!persona || !character.trim() || !language || !languageType) {
      setError('Please fill out all fields to start the chat.');
      return;
    }
    
    const langTypeInstruction = languageType === 'native' 
        ? `in its native script (e.g., Devanagari for Hindi).`
        : `transliterated into English letters (e.g., 'Namaste' instead of 'नमस्ते').`;

    const systemInstruction = `You are my ${persona}. Your personality and character traits are: "${character}". From now on, you must act and respond as this character. Your entire response must be in the ${language} language, written ${langTypeInstruction} Do not break character. Keep your responses concise and in character.`;
    
    const newChatSession = getChatResponse(systemInstruction);
    setChatSession(newChatSession);

    setChatHistory([]);
    setError('');
    setView('chat');
  }, [persona, character, language, languageType]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatSession) return;

    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
        const stream = await chatSession.sendMessageStream({ message });
        let modelResponse = '';
        setChatHistory(prev => [...prev, { role: 'model', content: '' }]);

        for await (const chunk of stream) {
            modelResponse += chunk.text;
            setChatHistory(prev => {
                const newHistory = [...prev];
                const lastMessage = newHistory[newHistory.length - 1];
                if (lastMessage && lastMessage.role === 'model') {
                    lastMessage.content = modelResponse;
                }
                return newHistory;
            });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: ChatMessage = { role: 'model', content: 'Sorry, I encountered an error. Please try again.' };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [chatSession]);
  
  const handleGoBack = useCallback(() => {
    setView('setup');
  }, []);

  const handleReset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPersona(null);
    setCharacter('');
    setLanguage(null);
    setLanguageType(null);
    setChatHistory([]);
    setChatSession(null);
    setError('');
    setView('setup');
  }, []);

  // New handlers that update state and clear any existing error messages.
  const handlePersonaChange = (p: Persona) => {
    setPersona(p);
    if (error) setError('');
  };
  const handleCharacterChange = (c: string) => {
    setCharacter(c);
    if (error) setError('');
  };
  const handleLanguageChange = (l: Language) => {
    setLanguage(l);
    if (error) setError('');
  };
  const handleLanguageTypeChange = (lt: LanguageType) => {
    setLanguageType(lt);
    if (error) setError('');
  };

  const renderView = () => {
    switch(view) {
      case 'initial':
        return <InitialWelcomeScreen onStart={handleProceedToSetup} />;
      case 'setup':
        return (
          <WelcomeScreen 
            onStartChat={handleStartChat} 
            onReset={handleReset}
            persona={persona}
            character={character}
            language={language}
            languageType={languageType}
            onPersonaChange={handlePersonaChange}
            onCharacterChange={handleCharacterChange}
            onLanguageChange={handleLanguageChange}
            onLanguageTypeChange={handleLanguageTypeChange}
            error={error}
          />
        );
      case 'chat':
        if (persona) {
          return (
            <ChatScreen
              persona={persona}
              character={character}
              messages={chatHistory}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onGoBack={handleGoBack}
            />
          );
        }
        setView('setup');
        return null;
      default:
        return <InitialWelcomeScreen onStart={handleProceedToSetup} />;
    }
  }

  return (
    <div className="w-screen h-screen bg-transparent text-brand-light font-sans">
      {renderView()}
    </div>
  );
};

export default App;