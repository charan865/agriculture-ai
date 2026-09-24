import React from 'react';
import { Sprout, Plus } from 'lucide-react';
import { Crop } from '../../types';
import { CropCard } from '../Dashboard/CropCard';
import { EmptyCropState } from '../Dashboard/EmptyCropState';
import { useLanguage } from '../../context/LanguageContext';

interface MyCropsViewProps {
  crops: Crop[];
  onAddCrop: () => void;
  onDeleteCrop: (id: string) => void;
}

export const MyCropsView: React.FC<MyCropsViewProps> = ({
  crops,
  onAddCrop,
  onDeleteCrop
}) => {
  const { t, language } = useLanguage();
  const isTelugu = language === 'te';

  if (crops.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <Sprout size={20} />
          </div>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {t('myCrops.title')}
          </h2>
        </div>
        <EmptyCropState onAddCrop={onAddCrop} />
      </div>
    );
  }

  const totalAcres = crops.reduce((sum, c) => sum + c.area, 0).toFixed(1);
  const healthyCount = crops.filter((c) => c.status === 'Healthy').length;
  const atRiskCount = crops.filter((c) => c.status === 'At Risk').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
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
              <Sprout size={20} />
            </div>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {t('myCrops.title')}
            </h2>
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            {t('myCrops.subtitle')}
          </p>
        </div>

        <button onClick={onAddCrop} className="btn-primary-pill">
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('myCrops.addNewCrop')}</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="stats-row">
        <div className="agri-card" style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('myCrops.totalAcres')}</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#155e32', marginTop: '2px' }}>
            {totalAcres} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t('common.acres')}</span>
          </p>
        </div>

        <div className="agri-card" style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('myCrops.healthyCount')}</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
            {healthyCount} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{isTelugu ? 'మడులు' : 'plots'}</span>
          </p>
        </div>

        <div className="agri-card" style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('myCrops.atRiskCount')}</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: atRiskCount > 0 ? '#b45309' : '#155e32', marginTop: '2px' }}>
            {atRiskCount} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{isTelugu ? 'మడులు' : 'plots'}</span>
          </p>
        </div>
      </div>

      {/* Grid of Crop Cards */}
      <div
        className="crop-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: '20px'
        }}
      >
        {crops.map((crop) => (
          <CropCard key={crop.id} crop={crop} onDelete={onDeleteCrop} />
        ))}
      </div>
    </div>
  );
};
