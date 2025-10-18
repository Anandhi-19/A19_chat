import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './icons';

interface DropdownProps<T extends string> {
  options: readonly T[];
  selected: T | null;
  onSelect: (value: T) => void;
  placeholder: string;
}

export const Dropdown = <T extends string>({
  options,
  selected,
  onSelect,
  placeholder,
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: T) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/20 text-left text-white p-3 rounded-lg flex justify-between items-center border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-accent"
      >
        <span className="truncate">{selected || placeholder}</span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul className="absolute z-20 w-full mt-2 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <li
              key={option}
              onMouseDown={(e) => {
                e.preventDefault(); // This is the fix: prevent default browser action on mousedown
                handleSelect(option);
              }}
              className="px-4 py-2 text-white hover:bg-brand-accent cursor-pointer"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};