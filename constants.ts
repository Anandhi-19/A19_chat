import type { Persona, Language } from './types';

export const PERSONAS: Persona[] = [
  'Friend',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Grandfather',
  'Grandmother',
  'Husband',
  'Wife',
  'Uncle',
  'Cousin',
  'Aunt'
];

export const LANGUAGES: Language[] = [
  'Urdu',
  'Gujarati',
  'Tamil',
  'Telugu',
  'Marathi',
  'Hindi'
  'Kannada'
];

export const LANGUAGE_TYPES = [
    { value: 'native', label: 'Native Script' },
    { value: 'transliterated', label: 'English Letters' }
];
