import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  
  // Swiss minimal style: Text only, uppercase often looks cleaner for actions
  const baseStyle = "uppercase font-bold tracking-wider transition-opacity hover:opacity-60 disabled:opacity-20 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
    xl: "text-4xl",
  };

  return (
    <button 
      className={`${baseStyle} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};