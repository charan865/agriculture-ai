import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  iconPosition = 'left',
  children,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: '10px 18px',
    borderRadius: '30px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    width: fullWidth ? '100%' : 'auto',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--secondary)',
          color: 'var(--secondary-text)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-main)',
          border: '1.5px solid var(--border-color)',
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: 'var(--primary)',
          padding: '4px 8px',
          fontSize: '0.875rem',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          boxShadow: '0 4px 10px rgba(46, 125, 50, 0.15)',
        };
    }
  };

  const combinedStyle = { ...baseStyle, ...getVariantStyles() };

  // Inline CSS hover classes are set via className references, or standard inline effects can be managed.
  // We can write class rules in index.css to make it even cleaner, e.g., button-primary, button-secondary
  return (
    <button
      className={`btn-common btn-${variant} ${className}`}
      style={combinedStyle}
      {...props}
    >
      {icon && iconPosition === 'left' && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span style={{ display: 'inline-flex' }}>{icon}</span>}
    </button>
  );
};
