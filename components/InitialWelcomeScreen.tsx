import React from 'react';

interface InitialWelcomeScreenProps {
  onStart: () => void;
}

export const InitialWelcomeScreen: React.FC<InitialWelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-transparent">
      <div className="text-center space-y-8">
        <img 
          src="https://a19-chat-gpt-s6ta.vercel.app/assets/AS2-DRoAo1zP.png" 
          alt="Company Logo" 
          className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full shadow-2xl border-4 border-brand-accent/50"
        />
        <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Welcome to Persona Chat AI
            </h1>
            <p className="mt-4 text-lg text-brand-light max-w-xl mx-auto">
                Craft unique AI personalities and bring your conversations to life. Ready to start?
            </p>
        </div>
        <button
          onClick={onStart}
          className="px-8 py-4 text-xl font-bold text-white bg-brand-accent rounded-full transition-transform transform hover:scale-105 duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-accent/50"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};