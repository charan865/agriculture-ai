import React, { useState } from 'react';
import { X, Sprout, Check } from 'lucide-react';
import { Crop } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (crop: Omit<Crop, 'id'>) => void;
}

const COMMON_CROPS = ['Tomato', 'Rice', 'Cotton', 'Chilli', 'Wheat', 'Maize', 'Soybean', 'Potato', 'Groundnut'];

const CROP_TRANSLATIONS: Record<string, string> = {
  Tomato: 'టమాటా',
  Rice: 'వరి',
  Cotton: 'పత్తి',
  Chilli: 'మిర్చి',
  Wheat: 'గోధుమ',
  Maize: 'మొక్కజొన్న',
  Soybean: 'సోయాబీన్',
  Potato: 'బంగాళాదుంప',
  Groundnut: 'వేరుశనగ'
};

export const AddCropModal: React.FC<AddCropModalProps> = ({ isOpen, onClose, onSave }) => {
  const { t, language } = useLanguage();
  const isTelugu = language === 'te';

  const [cropName, setCropName] = useState('Tomato');
  const [customCrop, setCustomCrop] = useState('');
  const [fieldName, setFieldName] = useState('Main Field');
  const [area, setArea] = useState<number>(2.5);
  const [plantingDate, setPlantingDate] = useState('2026-08-15');
  const [growthStage, setGrowthStage] = useState<Crop['growthStage']>('Vegetative');
  const [irrigationMethod, setIrrigationMethod] = useState<Crop['irrigationMethod']>('Drip');
  const [soilType, setSoilType] = useState<Crop['soilType']>('Red Soil');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customCrop.trim() ? customCrop.trim() : cropName;
    if (!finalName) return;

    onSave({
      name: finalName,
      fieldName: fieldName.trim() || (isTelugu ? 'ప్రధాన పొలం' : 'Main Plot'),
      area: Number(area) || 1,
      plantingDate: plantingDate || '2026-08-15',
      growthStage,
      irrigationMethod,
      soilType,
      health: 90,
      status: 'Healthy'
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
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
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                {t('myCrops.modalTitle')}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t('myCrops.addCropSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f2',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#556d5e'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px' }}>
          {/* Quick Select Popular Crop */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              {t('myCrops.cropNameLabel')}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {COMMON_CROPS.map((crop) => (
                <button
                  type="button"
                  key={crop}
                  onClick={() => {
                    setCropName(crop);
                    setCustomCrop('');
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: cropName === crop && !customCrop ? '#155e32' : 'var(--border-subtle)',
                    backgroundColor: cropName === crop && !customCrop ? '#e8f5ec' : '#ffffff',
                    color: cropName === crop && !customCrop ? '#155e32' : 'var(--text-body)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {isTelugu && CROP_TRANSLATIONS[crop] ? CROP_TRANSLATIONS[crop] : crop}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder={t('myCrops.customCropPlaceholder')}
              value={customCrop}
              onChange={(e) => setCustomCrop(e.target.value)}
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

          {/* Field Name & Acreage */}
          <div className="modal-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('myCrops.fieldNameLabel')}
              </label>
              <input
                type="text"
                required
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder={t('myCrops.fieldNamePlaceholder')}
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
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('myCrops.areaLabel')}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={area}
                onChange={(e) => setArea(parseFloat(e.target.value) || 1)}
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
          </div>

          {/* Planting Date & Growth Stage */}
          <div className="modal-form-grid-even" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('myCrops.plantingDate')}
              </label>
              <input
                type="date"
                required
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
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
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('myCrops.growthStage')}
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Seedling">{t('myCrops.growthStageSeedling')}</option>
                <option value="Vegetative">{t('myCrops.growthStageVegetative')}</option>
                <option value="Flowering">{t('myCrops.growthStageFlowering')}</option>
                <option value="Fruiting">{t('myCrops.growthStageFruiting')}</option>
                <option value="Harvesting">{t('myCrops.growthStageHarvesting')}</option>
              </select>
            </div>
          </div>

          {/* Irrigation & Soil Type */}
          <div className="modal-form-grid-even" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '26px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('myCrops.irrigation')}
              </label>
              <select
                value={irrigationMethod}
                onChange={(e) => setIrrigationMethod(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Drip">{t('myCrops.irrigationDrip')}</option>
                <option value="Sprinkler">{t('myCrops.irrigationSprinkler')}</option>
                <option value="Flood">{t('myCrops.irrigationFlood')}</option>
                <option value="Rainfed">{t('myCrops.irrigationRainfed')}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('myCrops.soilType')}
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Red Soil">{t('myCrops.soilRed')}</option>
                <option value="Black Soil">{t('myCrops.soilBlack')}</option>
                <option value="Alluvial">{t('myCrops.soilAlluvial')}</option>
                <option value="Sandy Loam">{t('myCrops.soilSandy')}</option>
                <option value="Clay">{t('myCrops.soilClay')}</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-pill"
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary-pill"
              style={{ padding: '10px 24px', fontSize: '0.88rem' }}
            >
              <Check size={16} />
              <span>{t('myCrops.submitAddCrop')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
