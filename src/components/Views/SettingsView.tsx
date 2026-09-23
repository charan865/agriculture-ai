import React from 'react';
import { Settings, User, RefreshCw, Trash2, CheckCircle2, Shield, Globe, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SettingsViewProps {
  onLoadDemoCrops: () => void;
  onClearCrops: () => void;
  cropsCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onLoadDemoCrops,
  onClearCrops,
  cropsCount
}) => {
  const { t, language, setLanguage, languages } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '840px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#e8f5ec',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#155e32'
            }}
          >
            <Settings size={20} />
          </div>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {t('settings.title')}
          </h2>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Language Preferences Card (Requested Section 2) */}
      <div className="agri-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="#155e32" />
          <span>{t('settings.language')}</span>
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {t('settings.languageDesc')}
        </p>

        {/* Language Options Box matching spec */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '380px',
            backgroundColor: '#f9fbf9',
            padding: '12px',
            borderRadius: '14px',
            border: '1px solid var(--border-light)'
          }}
        >
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid #155e32' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? '#e8f5ec' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
              >
                <div>
                  <div style={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.92rem', color: isSelected ? '#155e32' : 'var(--text-main)' }}>
                    {lang.nativeLabel}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: isSelected ? '#166534' : 'var(--text-muted)' }}>
                    {lang.label}
                  </div>
                </div>
                {isSelected && <Check size={18} color="#155e32" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Section */}
      <div className="agri-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="#155e32" />
          <span>{t('settings.farmerProfile')}</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              {t('settings.fullName')}
            </label>
            <input
              type="text"
              defaultValue="Charan Teja"
              style={{
                width: '100%',
                height: '40px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-subtle)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              {t('settings.classification')}
            </label>
            <input
              type="text"
              disabled
              value={t('settings.classificationValue')}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-subtle)',
                backgroundColor: '#f8faf8',
                fontSize: '0.85rem',
                color: '#52695a'
              }}
            />
          </div>
        </div>
      </div>

      {/* Demo State Testing Controls */}
      <div className="agri-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={18} color="#155e32" />
          <span>{t('settings.demoControls')}</span>
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          {t('settings.demoDesc', { count: cropsCount })}
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={onLoadDemoCrops}
            className="btn-primary-pill"
            style={{ padding: '10px 20px', fontSize: '0.86rem' }}
          >
            <CheckCircle2 size={16} />
            <span>{t('settings.loadDemoCrops')}</span>
          </button>

          <button
            onClick={onClearCrops}
            className="btn-secondary-pill"
            style={{ padding: '10px 20px', fontSize: '0.86rem', borderColor: '#fca5a5', color: '#b91c1c' }}
          >
            <Trash2 size={16} />
            <span>{t('settings.clearAllCrops')}</span>
          </button>
        </div>
      </div>

      {/* App Info Card */}
      <div className="agri-card" style={{ padding: '20px 24px', backgroundColor: '#f9fbf8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} color="#155e32" />
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#155e32' }}>{t('settings.appInfo')}</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t('settings.appDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
