// components/FinancialTags.tsx
'use client';
import { useState } from 'react';

const tags = [
  {
    id: 'digital',
    label: 'Digital Currency',
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="currentColor"/>
      </svg>
    ),
    activeClass: 'bg-gradient-to-r from-purple-600 to-blue-500 text-white',
    inactiveClass: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  },
  {
    id: 'forex',
    label: 'Foreign Exchange',
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15.5 12.5H13.5V16.5H10.5V12.5H8.5L12 8L15.5 12.5Z" fill="currentColor"/>
      </svg>
    ),
    activeClass: 'bg-gradient-to-r from-purple-600 to-blue-500 text-white',
    inactiveClass: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  },
  {
    id: 'metal',
    label: 'Precious Metal',
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L5 12L12 22L19 12L12 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
    activeClass: 'bg-gradient-to-r from-purple-600 to-blue-500 text-white',
    inactiveClass: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  },
  {
    id: 'forex1',
    label: 'Forex',
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15.5 12.5H13.5V16.5H10.5V12.5H8.5L12 8L15.5 12.5Z" fill="currentColor"/>
      </svg>
    ),
    activeClass: 'bg-gradient-to-r from-purple-600 to-blue-500 text-white',
    inactiveClass: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  },
  {
    id: 'top',
    label: 'Top',
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
      </svg>
    ),
    activeClass: 'bg-gradient-to-r from-purple-600 to-blue-500 text-white',
    inactiveClass: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  }
];

interface FinancialTagsProps {
  onFilterChange: (filter: string) => void;
}

const FinancialTags = ({ onFilterChange }: FinancialTagsProps) => {
  const [activeTag, setActiveTag] = useState('digital');

  const handleTagClick = (tagId: string) => {
    setActiveTag(tagId);
    onFilterChange(tagId);
  };

  return (
    <div className="flex gap-2">
      {tags.map(tag => (
        <div
          key={tag.id}
          onClick={() => handleTagClick(tag.id)}
          className={`flex items-center px-3 py-1 rounded-xl text-xs font-medium cursor-pointer transition-all duration-300
            ${activeTag === tag.id ? tag.activeClass : tag.inactiveClass}
            ${activeTag === tag.id ? 'w-auto' : 'w-8 justify-center'}
          `}
        >
          <span className="flex items-center">
            {tag.icon}
            {activeTag === tag.id && <span className="ml-1">{tag.label}</span>}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FinancialTags;