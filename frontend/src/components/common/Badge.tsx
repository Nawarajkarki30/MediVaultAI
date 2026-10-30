import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'brand' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  className = '',
  icon,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-xs px-3 py-1 rounded-full font-semibold',
  };

  const variantClasses = {
    // Green badge matching "Explained" in wireframe
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
    // Blue badge
    brand: 'bg-brand-50 text-brand-700 border border-brand-200/80',
    // Neutral grey badge
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    // Light info badge
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
