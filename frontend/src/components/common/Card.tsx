import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-brand-border/80 shadow-subtle ${
        hoverable
          ? 'transition-all duration-200 hover:shadow-card-hover hover:border-brand-200 hover:-translate-y-0.5'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
