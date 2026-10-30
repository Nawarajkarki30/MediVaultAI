import React from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...rest
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50 disabled:pointer-events-none select-none min-h-[44px]';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-5 py-2.5 gap-2 font-semibold min-h-[44px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold shadow-sm min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm hover:shadow hover:shadow-brand-500/20',
    secondary:
      'bg-white text-brand-navy border border-brand-200 hover:border-brand-300 hover:bg-brand-50/50 shadow-subtle',
    outline:
      'bg-transparent text-brand-navy border border-slate-300 hover:border-brand-500 hover:text-brand-500',
    ghost: 'bg-transparent text-brand-navy hover:text-brand-500 hover:bg-brand-50/60',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={combinedClasses} disabled={disabled} {...rest}>
      {content}
    </button>
  );
};
