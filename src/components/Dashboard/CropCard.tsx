import React from 'react';
import { Sprout, Trash2 } from 'lucide-react';
import { Crop } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface CropCardProps {
  crop: Crop;
  onDelete?: (id: string) => void;
}

export const CropCard: React.FC<CropCardProps> = ({ crop, onDelete }) => {
  const { t, language } = useLanguage();
  const isTelugu = language === 'te';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Healthy':
        return {
          bg: '#ecfdf5',
          text: '#047857',
          border: '#a7f3d0',
          label: isTelugu ? 'ఆరోగ్యంగా ఉంది' : 'Healthy'
        };
      case 'At Risk':
        return {
          bg: '#fffbeb',
          text: '#b45309',
          border: '#fde68a',
          label: isTelugu ? 'శ్రద్ధ అవసరం' : 'At Risk'
        };
      case 'Critical':
      default:
        return {
          bg: '#fef2f2',
          text: '#b91c1c',
          border: '#fecaca',
          label: isTelugu ? 'తీవ్ర సమస్య' : 'Critical'
        };
    }
  };

  const badgeStyle = getStatusBadge(crop.status);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        border: '1px solid var(--border-light)',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all var(--transition-fast)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        position: 'relative'
      }}
      className="crop-card-item"
    >
      <div>
        {/* Top: Name & Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#eaf6ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#155e32'
              }}
            >
              <Sprout size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {crop.name}
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {crop.fieldName || (isTelugu ? 'ప్రధాన పొలం' : 'Main Plot')}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: badgeStyle.bg,
              color: badgeStyle.text,
              border: `1px solid ${badgeStyle.border}`
            }}
          >
            {badgeStyle.label}
          </span>
        </div>

        {/* Details: Acreage, Growth stage, Health */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '8px 0',
            borderTop: '1px solid var(--border-light)',
            borderBottom: '1px solid var(--border-light)',
            fontSize: '0.78rem',
            margin: '8px 0'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>{isTelugu ? 'విస్తీర్ణం: ' : 'Area: '}</span>
            <strong style={{ color: 'var(--text-main)' }}>{crop.area} {t('common.acres')}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>{isTelugu ? 'దశ: ' : 'Stage: '}</span>
            <strong style={{ color: 'var(--text-main)' }}>{crop.growthStage}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>{isTelugu ? 'నీటిపారుదల: ' : 'Irrigation: '}</span>
            <strong style={{ color: 'var(--text-main)' }}>{crop.irrigationMethod}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>{isTelugu ? 'నేల: ' : 'Soil: '}</span>
            <strong style={{ color: 'var(--text-main)' }}>{crop.soilType}</strong>
          </div>
        </div>
      </div>

      {/* Footer: Health Progress Bar & Delete */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
        <div style={{ flex: 1, marginRight: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '3px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{isTelugu ? 'మొక్క బలం' : 'Vigor Score'}</span>
            <strong style={{ color: badgeStyle.text }}>{crop.health}%</strong>
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: '#eef2ed', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${crop.health}%`,
                height: '100%',
                backgroundColor: badgeStyle.text,
                borderRadius: '3px'
              }}
            />
          </div>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(crop.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              transition: 'color var(--transition-fast)'
            }}
            title={isTelugu ? 'పంటను తొలగించండి' : 'Remove crop'}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
