import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showLink = true }) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon: Heart/Medical cross emblem inside vibrant blue rounded badge */}
      <div
        className={`${iconSizeClasses[size]} bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 transition-transform duration-200 hover:scale-105`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Medical cross with curved subtle heart silhouette */}
          <path
            d="M10.5 4a1.5 1.5 0 0 1 3 0v4.5H18a1.5 1.5 0 0 1 0 3h-4.5V16a1.5 1.5 0 0 1-3 0v-4.5H6a1.5 1.5 0 0 1 0-3h4.5V4z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Wordmark: MediVault AI */}
      <span className={`font-bold tracking-tight text-brand-navy ${textSizeClasses[size]}`}>
        MediVault <span className="text-brand-500 font-extrabold">AI</span>
      </span>
    </div>
  );

  if (showLink) {
    return (
      <Link
        to="/"
        className="focus-visible:outline-brand-500 rounded-lg inline-block"
        aria-label="MediVault AI Homepage"
      >
        {content}
      </Link>
    );
  }

  return content;
};
