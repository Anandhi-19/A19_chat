export type Persona = 'Friend' | 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Brother' | 'Sister' | 'Grandfather' | 'Grandmother' | 'Husband' | 'Wife' | 'Uncle' | 'Cousin' | 'Aunt';

export type Language = 'Urdu' | 'Gujarati' | 'Tamil' | 'Telugu' | 'Marathi' | 'Hindi';

export type LanguageType = 'native' | 'transliterated';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatSession {
  id: string;
  persona: Persona;
  character: string;
  language: Language;
  languageType: LanguageType;
  chatHistory: ChatMessage[];
  timestamp: number;
}
