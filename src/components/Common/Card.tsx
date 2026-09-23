import React, { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverEffect?: boolean;
  padding?: string;
  className?: string;
  hasBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  padding = '24px',
  className = '',
  hasBorder = false,
  style,
  ...props
}) => {
  const cardStyle = {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02), 0 2px 8px rgba(0, 0, 0, 0.02)',
    padding: padding,
    border: hasBorder ? '1.5px solid var(--border-color)' : 'none',
    transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...style
  };

  return (
    <div
      className={`ui-card ${hoverEffect ? 'ui-card-hover' : ''} ${className}`}
      style={cardStyle}
      {...props}
    >
      {children}
    </div>
  );
};
