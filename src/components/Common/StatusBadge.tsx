import React from 'react';

interface StatusBadgeProps {
  status: 'Healthy' | 'At Risk' | 'Critical';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md'
}) => {
  const getColors = () => {
    switch (status) {
      case 'Healthy':
        return {
          bg: 'var(--success-bg)',
          text: 'var(--success-text)'
        };
      case 'At Risk':
        return {
          bg: 'var(--warning-bg)',
          text: 'var(--warning-text)'
        };
      case 'Critical':
        return {
          bg: 'var(--critical-bg)',
          text: 'var(--critical-text)'
        };
    }
  };

  const colors = getColors();

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: size === 'sm' ? '4px 10px' : '6px 12px',
    borderRadius: '20px',
    fontSize: size === 'sm' ? '0.75rem' : '0.825rem',
    fontWeight: 600,
    backgroundColor: colors.bg,
    color: colors.text,
    transition: 'all var(--transition-fast)',
  };

  return (
    <span style={badgeStyle}>
      <span style={{ 
        width: '6px', 
        height: '6px', 
        borderRadius: '50%', 
        backgroundColor: colors.text,
        marginRight: '6px',
        display: 'inline-block'
      }}></span>
      {status}
    </span>
  );
};
