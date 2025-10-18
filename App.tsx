
import React, { useState, useCallback, useEffect } from 'react';
import { LandingScreen } from './components/LandingScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatScreen } from './components/ChatScreen';
import type { ChatMessage, Persona, Language, LanguageType, ChatSession } from './types';
import { getChatResponse } from './services/geminiService';
import { Chat, Content, FunctionCall } from '@google/genai';

type View = 'landing' | 'setup' | 'chat';

const HISTORY_STORAGE_KEY = 'persona-chat-history';
const SETTINGS_STORAGE_KEY = 'persona-chat-settings';

interface AppSettings {
  persona: Persona | null;
  character: string;
  language: Language | null;
  languageType: LanguageType | null;
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [settings, setSettings] = useState<AppSettings>({
    persona: null,
    character: '',
    language: null,
    languageType: null,
  });
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setChatSessions(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(chatSessions));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [chatSessions]);
  
  const getSystemInstruction = (persona: Persona, character: string, language: Language, languageType: LanguageType) => {
    const langTypeInstruction = languageType === 'native' 
        ? `in its native script (e.g., Devanari for Hindi).`
        : `transliterated into English letters (e.g., 'Namaste' instead of 'नमस्ते').`;
    return `You are my ${persona}. Your personality and character traits are: "${character}". From now on, you must act and respond as this character. Your entire response must be in the ${language} language, written ${langTypeInstruction} Do not break character. Keep your responses concise and in character. Crucially, do not include any English translations, explanations, or any text within parentheses. Your response should consist purely of the requested language.`;
  };

  const handleStartChat = useCallback((persona: Persona, character:string, language: Language, languageType: LanguageType) => {
    setSettings({ persona, character, language, languageType });
    
    const newSession: ChatSession = {
      id: Date.now().toString(),
      persona,
      character,
      language,
      languageType,
      chatHistory: [],
      timestamp: Date.now(),
    };

    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    
    const systemInstruction = getSystemInstruction(persona, character, language, languageType);
    const newChat = getChatResponse(systemInstruction);
    setChatSession(newChat);

    setView('chat');
  }, []);

  const handleLoadChat = useCallback((sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const systemInstruction = getSystemInstruction(session.persona, session.character, session.language, session.languageType);
    const history: Content[] = session.chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const newChat = getChatResponse(systemInstruction, history);
    setChatSession(newChat);
    setCurrentSessionId(sessionId);
    setView('chat');
  }, [chatSessions]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatSession || !currentSessionId) return;

    const userMessage: ChatMessage = { role: 'user', content: message };
    
    setChatSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, chatHistory: [...s.chatHistory, userMessage], timestamp: Date.now() } 
        : s
    ));
    setIsLoading(true);

    const updateLastMessage = (newContent: string) => {
      setChatSessions(prev => {
          return prev.map(s => {
              if (s.id === currentSessionId) {
                  const newHistory = [...s.chatHistory];
                  const lastMessage = newHistory[newHistory.length - 1];
                  if (lastMessage && lastMessage.role === 'model') {
                      lastMessage.content = newContent;
                  }
                  return { ...s, chatHistory: newHistory };
              }
              return s;
          });
      });
    };

    try {
        const stream = await chatSession.sendMessageStream({ message });
        let modelResponse = '';
        let functionCalls: FunctionCall[] = [];
        
        setChatSessions(prev => prev.map(s => 
            s.id === currentSessionId 
              ? { ...s, chatHistory: [...s.chatHistory, { role: 'model', content: '' }] } 
              : s
        ));
        
        for await (const chunk of stream) {
            if (chunk.text) {
                modelResponse += chunk.text;
                updateLastMessage(modelResponse);
            }
            if (chunk.functionCalls) {
                functionCalls.push(...chunk.functionCalls);
            }
        }

        // FIX: Correctly handle function call responses. The `toolResponses` parameter is invalid.
        // Instead, send a message containing `functionResponse` parts.
        if (functionCalls.length > 0) {
          const toolResponseParts = [];

          for (const fc of functionCalls) {
              if (fc.name === 'getCurrentDateTime') {
                  const result = new Date().toLocaleString();
                  toolResponseParts.push({
                      functionResponse: {
                          name: fc.name,
                          response: { result },
                      }
                  });
              }
          }
          
          if (toolResponseParts.length > 0) {
              const finalStream = await chatSession.sendMessageStream({ message: toolResponseParts });
              for await (const chunk of finalStream) {
                  if (chunk.text) {
                     modelResponse += chunk.text;
                     updateLastMessage(modelResponse);
                  }
              }
          }
        }

    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: ChatMessage = { role: 'model', content: 'Sorry, I encountered an error. Please try again.' };
        setChatSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
              const newHistory = [...s.chatHistory];
              const lastMessage = newHistory[newHistory.length - 1];
              if (lastMessage && lastMessage.role === 'model' && lastMessage.content === '') {
                newHistory[newHistory.length - 1] = errorMessage;
              } else {
                newHistory.push(errorMessage);
              }
              return { ...s, chatHistory: newHistory };
            }
            return s;
        }));
    } finally {
        setIsLoading(false);
    }
  }, [chatSession, currentSessionId]);
  
  const handleGoBack = useCallback(() => {
    setCurrentSessionId(null);
    setView('landing');
  }, []);

  const handleResetHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    setChatSessions([]);
  }, []);
  
  const handleGetStarted = useCallback(() => setView('setup'), []);

  const currentSession = chatSessions.find(s => s.id === currentSessionId);

  const renderView = () => {
    switch(view) {
      case 'landing':
        return <LandingScreen 
          onGetStarted={handleGetStarted}
          onLoadChat={handleLoadChat}
          onResetHistory={handleResetHistory}
          sessions={chatSessions}
        />;
      case 'setup':
        return <WelcomeScreen 
          onStartChat={handleStartChat} 
          initialState={settings}
          onGoBack={() => setView('landing')}
        />;
      case 'chat':
        return currentSession ? (
          <ChatScreen
            persona={currentSession.persona}
            character={currentSession.character}
            messages={currentSession.chatHistory}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onGoBack={handleGoBack}
          />
        ) : null;
      default:
        return null;
    }
  }

  return (
    <div className="w-screen h-screen text-brand-light font-sans">
      {renderView()}
    </div>
  );
};

export default App;
