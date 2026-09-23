import React, { useState } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { QuickTip } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface QuickTipsProps {
  tips: QuickTip[];
}

export const QuickTips: React.FC<QuickTipsProps> = ({ tips }) => {
  const { t, language } = useLanguage();
  const isTelugu = language === 'te';
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!tips || tips.length === 0) return null;

  const currentTip = tips[currentIndex] || tips[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? tips.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === tips.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="agri-card"
      style={{
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        {/* Header: Lightbulb icon, Title & Carousel Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706'
              }}
            >
              <Lightbulb size={16} />
            </div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {t('dashboard.quickTips')}
            </h4>
          </div>

          {/* Carousel numbers & navigation arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>
              {currentIndex + 1}/{tips.length}
            </span>
            <button
              onClick={handlePrev}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
              aria-label="Previous tip"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNext}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
              aria-label="Next tip"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Tip Body: Left Image & Right Text */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          {/* Soil Seedling Thumbnail */}
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '14px',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)'
            }}
          >
            <img
              src={currentTip.imageUrl}
              alt="Tip thumbnail"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Tip content */}
          <div style={{ flex: 1 }}>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#14281d', lineHeight: 1.25, marginBottom: '4px' }}>
              {currentTip.title}
            </h5>
            <p style={{ fontSize: '0.76rem', color: '#52695a', lineHeight: 1.35, marginBottom: '8px' }}>
              {currentTip.description}
            </p>
            <button
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#155e32',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <span>{isTelugu ? 'మరింత తెలుసుకోండి' : (currentTip.linkText || 'Learn More')}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Dots matching reference */}
      <div style={{ display: 'flex', gap: '5px', marginTop: '14px' }}>
        {tips.map((_, idx) => (
          <span
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: idx === currentIndex ? '16px' : '6px',
              height: '6px',
              borderRadius: '3px',
              backgroundColor: idx === currentIndex ? '#155e32' : '#d8e0d9',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          />
        ))}
      </div>
    </div>
  );
};
