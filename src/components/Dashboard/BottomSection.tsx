import React from 'react';
import { Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const BottomSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div
      className="agri-card"
      style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Green Plant/Leaf Branch Illustration */}
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: '#ebf6ee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#155e32',
          flexShrink: 0
        }}
      >
        <Sprout size={24} />
      </div>

      {/* Quote & AgriAI Attribution */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: '0.86rem',
            fontWeight: 600,
            color: '#14281d',
            lineHeight: 1.4,
            marginBottom: '4px',
            fontStyle: 'italic'
          }}
        >
          {t('dashboard.quote')}
        </p>
        <p style={{ fontSize: '0.74rem', color: '#155e32', fontWeight: 700, textAlign: 'right' }}>
          {t('dashboard.quoteAuthor')}
        </p>
      </div>
    </div>
  );
};
