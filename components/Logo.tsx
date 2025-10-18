import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex flex-col items-center ${className}`}>
    <img 
      src="https://a19-chat-gpt-s6ta.vercel.app/assets/AS2-DRoAo1zP.png" 
      alt="Aspyvion Logo" 
      className="w-32 h-auto"
    />
  </div>
);