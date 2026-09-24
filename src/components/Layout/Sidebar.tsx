import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Camera,
  Sprout,
  CloudSun,
  FileText,
  Settings,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuItems = [
    { id: 'Dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'AI Assistant', label: t('nav.aiAssistant'), icon: MessageSquare },
    { id: 'Crop Diagnosis', label: t('nav.cropDiagnosis'), icon: Camera },
    { id: 'My Crops', label: t('nav.myCrops'), icon: Sprout },
    { id: 'Weather & Alerts', label: t('nav.weatherAlerts'), icon: CloudSun },
    { id: 'Diagnosis History', label: t('nav.diagnosisHistory'), icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="sidebar-backdrop"
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-light)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 16px 20px',
          overflowY: 'auto',
          transition: 'transform var(--transition-smooth)'
        }}
        className={`sidebar-nav ${isOpen ? 'sidebar-open' : ''}`}
        aria-label="Sidebar Navigation"
      >
        <div>
          {/* Header Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
              padding: '0 8px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer'
              }}
              onClick={() => {
                setActiveView('Dashboard');
                onClose();
              }}
            >
              {/* Green Leaves Logo Icon */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#e6f4ea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#155e32'
                }}
              >
                <Sprout size={24} />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#155e32',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em'
                  }}
                >
                  AgriAI
                </h1>
                <p style={{ fontSize: '0.74rem', color: '#6f8576', fontWeight: 500 }}>
                  {t('nav.tagline')}
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="mobile-close-btn"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isActive ? '#e8f5ec' : 'transparent',
                    color: isActive ? '#14532d' : '#455a4e',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 700 : 500,
                    position: 'relative',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#f1f6f1';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Left indicator bar for active item */}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '10px',
                        bottom: '10px',
                        width: '4px',
                        borderRadius: '0 4px 4px 0',
                        backgroundColor: '#155e32'
                      }}
                    />
                  )}
                  <Icon
                    size={20}
                    color={isActive ? '#155e32' : '#657d70'}
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Divider line before Settings */}
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--border-light)',
                margin: '14px 10px'
              }}
            />

            {/* Settings button */}
            {(() => {
              const isActive = activeView === 'Settings';
              return (
                <button
                  onClick={() => {
                    setActiveView('Settings');
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isActive ? '#e8f5ec' : 'transparent',
                    color: isActive ? '#14532d' : '#455a4e',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 700 : 500,
                    position: 'relative',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#f1f6f1';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '10px',
                        bottom: '10px',
                        width: '4px',
                        borderRadius: '0 4px 4px 0',
                        backgroundColor: '#155e32'
                      }}
                    />
                  )}
                  <Settings
                    size={20}
                    color={isActive ? '#155e32' : '#657d70'}
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />
                  <span>{t('nav.settings')}</span>
                </button>
              );
            })()}
          </nav>
        </div>

        {/* Bottom Rural Farm Scene Illustration matching reference */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-light)'
          }}
        >
          <div
            style={{
              borderRadius: '16px',
              backgroundColor: '#f1f7f2',
              border: '1px solid #e1ede3',
              padding: '12px 14px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* SVG Rural Farm Landscape */}
            <svg
              viewBox="0 0 200 65"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: 'auto', display: 'block', marginBottom: '8px' }}
            >
              {/* Sky background tint */}
              <rect width="200" height="65" fill="#f1f7f2" />
              {/* Gentle rolling hills */}
              <path
                d="M-10 65 Q40 25 100 45 Q160 65 210 35 L210 65 Z"
                fill="#d8eadc"
              />
              <path
                d="M-10 65 Q60 38 120 52 Q170 65 210 48 L210 65 Z"
                fill="#c6e1cb"
              />
              {/* Farmhouse */}
              <rect x="25" y="42" width="22" height="14" fill="#ffffff" stroke="#9bbba2" strokeWidth="1" />
              <polygon points="23,42 36,32 49,42" fill="#c07865" />
              <rect x="33" y="48" width="6" height="8" fill="#52745a" />
              {/* Trees */}
              <circle cx="95" cy="40" r="9" fill="#4d8c5d" />
              <rect x="94" y="48" width="2" height="8" fill="#5b4636" />
              <circle cx="112" cy="42" r="11" fill="#3a7549" />
              <rect x="111" y="52" width="3" height="6" fill="#5b4636" />
              <circle cx="175" cy="44" r="8" fill="#5a9769" />
              <rect x="174" y="50" width="2" height="7" fill="#5b4636" />
            </svg>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#e2f0e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#155e32',
                  flexShrink: 0
                }}
              >
                <Sprout size={14} />
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#155e32', lineHeight: 1.1 }}>
                  {t('nav.healthyFarms')}
                </p>
                <p style={{ fontSize: '0.7rem', color: '#688071', fontWeight: 500 }}>
                  {t('nav.brighterTomorrows')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
