import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Eye,
  X,
  CloudSun,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { DiagnosisResult } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface DiagnosisHistoryViewProps {
  history: DiagnosisResult[];
  onDelete: (id: string) => void;
  onNewDiagnosis: () => void;
}

export const DiagnosisHistoryView: React.FC<DiagnosisHistoryViewProps> = ({
  history,
  onDelete,
  onNewDiagnosis
}) => {
  const { t, language } = useLanguage();
  const isTelugu = language === 'te';
  const [selectedItem, setSelectedItem] = useState<DiagnosisResult | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: '#e8f5ec',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#155e32'
              }}
            >
              <FileText size={22} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {t('diagnosisHistory.title')}
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            {t('diagnosisHistory.subtitle')}
          </p>
        </div>

        <button onClick={onNewDiagnosis} className="btn-primary-pill" style={{ padding: '9px 18px', fontSize: '0.86rem' }}>
          {t('diagnosisHistory.newDiagnosisBtn')}
        </button>
      </div>

      {/* History Items Grid */}
      {history.length === 0 ? (
        <div
          className="agri-card"
          style={{
            padding: '54px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              marginBottom: '14px'
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
            {t('diagnosisHistory.noHistoryTitle')}
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '380px', marginBottom: '20px' }}>
            {t('diagnosisHistory.noHistoryDesc')}
          </p>
          <button onClick={onNewDiagnosis} className="btn-primary-pill">
            {t('diagnosisHistory.diagnoseNowBtn')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {history.map((item) => {
            const diagnosisTitle = item.possible_diagnosis || item.disease || 'Plant Condition';
            const severity = item.severity || 'Moderate';
            const severityColor =
              severity.toLowerCase() === 'severe'
                ? '#b91c1c'
                : severity.toLowerCase() === 'mild'
                  ? '#15803d'
                  : '#b45309';
            const severityBg =
              severity.toLowerCase() === 'severe'
                ? '#fef2f2'
                : severity.toLowerCase() === 'mild'
                  ? '#f0fdf4'
                  : '#fffbeb';

            return (
              <div
                key={item.id}
                className="agri-card"
                onClick={() => setSelectedItem(item)}
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  {/* Top: Crop Name & Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#155e32', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {item.cropName} {item.fieldName ? `• ${item.fieldName}` : ''}
                      </span>
                      <h4 style={{ fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', lineHeight: 1.25 }}>
                        {diagnosisTitle}
                      </h4>
                    </div>

                    <span style={{ fontSize: '0.74rem', color: '#6b7280', fontWeight: 500 }}>
                      {item.date}
                    </span>
                  </div>

                  {/* Confidence & Severity Badges */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {item.confidence != null && item.confidence > 0 ? (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '16px',
                          backgroundColor: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0'
                        }}
                      >
                        AI {t('cropDiagnosis.confidence')}: {item.confidence}%
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: '16px',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        {isTelugu ? 'విశ్వసనీయత అందుబాటులో లేదు' : 'Confidence unavailable'}
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '16px',
                        backgroundColor: severityBg,
                        color: severityColor,
                        border: '1px solid currentColor'
                      }}
                    >
                      {t('cropDiagnosis.severity')}: {severity}
                    </span>
                  </div>

                  {/* Thumbnail & Quick Summary */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {item.imageUrl && (
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          backgroundColor: '#f3f4f6',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={item.imageUrl}
                          alt="Leaf"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-body)', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.recommended_actions?.[0] || item.recommendedTreatment || item.chemical_treatment?.recommendation || (isTelugu ? 'వివరాలను చూడండి' : 'View diagnosis details')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer View & Delete */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '10px',
                    fontSize: '0.76rem'
                  }}
                >
                  <span style={{ color: '#155e32', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={14} /> {t('diagnosisHistory.viewFullReport')}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    <Trash2 size={14} />
                    <span>{t('diagnosisHistory.deleteEntry')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL REPORT MODAL */}
      {selectedItem && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div
            className="agri-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              backgroundColor: '#ffffff',
              borderRadius: '20px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#155e32', textTransform: 'uppercase' }}>
                  {selectedItem.cropName} • {selectedItem.fieldName || (isTelugu ? 'ప్రధాన పొలం' : 'Field Plot')}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {selectedItem.possible_diagnosis || selectedItem.disease}
                </h3>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {selectedItem.confidence != null && selectedItem.confidence > 0 ? (
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#e8f5ec', color: '#155e32' }}>
                      AI {t('cropDiagnosis.confidence')}: {selectedItem.confidence}%
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                      {isTelugu ? 'విశ్వసనీయత అందుబాటులో లేదు' : 'Confidence unavailable'}
                    </span>
                  )}
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#b45309' }}>
                    {t('cropDiagnosis.severity')}: {selectedItem.severity || t('cropDiagnosis.severityModerate')}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: '#6b7280', padding: '2px 6px' }}>
                    {t('common.date')}: {selectedItem.date}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4b5563'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedItem.imageUrl && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', maxHeight: '200px', backgroundColor: '#000000' }}>
                  <img
                    src={selectedItem.imageUrl}
                    alt="Analyzed Leaf"
                    style={{ width: '100%', height: '200px', objectFit: 'contain' }}
                  />
                </div>
              )}

              {/* Symptoms */}
              {selectedItem.symptoms && selectedItem.symptoms.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {t('diagnosisHistory.observedSymptoms')}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                    {selectedItem.symptoms.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Actions */}
              {selectedItem.recommended_actions && selectedItem.recommended_actions.length > 0 && (
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#155e32', marginBottom: '6px' }}>
                    {t('diagnosisHistory.recommendedActions')}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#14532d', lineHeight: 1.5 }}>
                    {selectedItem.recommended_actions.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chemical Treatment */}
              {selectedItem.chemical_treatment && selectedItem.chemical_treatment.recommendation && (
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                    {t('diagnosisHistory.chemicalTreatment')}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.45, margin: 0 }}>
                    {selectedItem.chemical_treatment.recommendation}
                  </p>
                </div>
              )}

              {/* Organic Alternative */}
              {(selectedItem.organic_alternative || selectedItem.organicAlternative) && (
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#fefce8', border: '1px solid #fef08a' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#854d0e', marginBottom: '4px' }}>
                    {t('diagnosisHistory.organicAlternative')}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#713f12', lineHeight: 1.45, margin: 0 }}>
                    {selectedItem.organic_alternative || selectedItem.organicAlternative}
                  </p>
                </div>
              )}

              {/* Weather Consideration */}
              {selectedItem.weather_consideration && (
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CloudSun size={15} color="#0284c7" /> {t('diagnosisHistory.weatherConsideration')}
                  </h4>
                  <p style={{ fontSize: '0.81rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                    {selectedItem.weather_consideration}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="btn-primary-pill"
                style={{ padding: '8px 20px', fontSize: '0.84rem' }}
              >
                {t('diagnosisHistory.closeReport')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
