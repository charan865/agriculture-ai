import React, { useState } from 'react';
import { Sprout, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { Card } from '../Common/Card';
import { SmartRecommendation } from '../../types';
import { aiService } from '../../services/aiService';
import { useLanguage } from '../../context/LanguageContext';

interface RecommendationCardProps {
  recommendation: SmartRecommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const { language } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [detailsText, setDetailsText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenDetails = async () => {
    setShowDetails(true);
    setLoading(true);
    try {
      const response = await aiService.askAgriAI(
        `Details for ${recommendation.title} in ${recommendation.fieldName || 'field'}`,
        [],
        undefined,
        language
      );
      setDetailsText(typeof response === 'object' ? response.reply : response);
    } catch {
      setDetailsText('Unable to retrieve recommendation details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (recommendation.iconType) {
      case 'pest':
        return (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldAlert size={22} color="var(--critical)" />
          </div>
        );
      case 'nitrogen':
      default:
        return (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#e8f5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sprout size={22} color="var(--primary)" />
          </div>
        );
    }
  };

  const getSeverityBadge = () => {
    const isWarning = recommendation.severity === 'warning';
    return (
      <span style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: '10px',
        backgroundColor: isWarning ? 'var(--warning-bg)' : 'var(--primary-light)',
        color: isWarning ? 'var(--warning-text)' : 'var(--primary)',
        textTransform: 'uppercase'
      }}>
        {recommendation.severity}
      </span>
    );
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px',
          borderRadius: '16px',
          border: '1.5px solid var(--border-color)',
          backgroundColor: '#ffffff',
          transition: 'all var(--transition-normal)',
          alignItems: 'flex-start'
        }}
        className="recommendation-item"
      >
        {getIcon()}
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {recommendation.title}
            </h4>
            {getSeverityBadge()}
          </div>
          
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {recommendation.description}
          </p>

          <button
            onClick={handleOpenDetails}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              background: 'none',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '6px',
              padding: '2px 0',
              width: 'fit-content',
              transition: 'gap var(--transition-fast)'
            }}
            className="detail-btn-hover"
          >
            View Details <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Details Dialog Modal */}
      {showDetails && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 34, 22, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <Card style={{ maxWidth: '460px', width: '100%', position: 'relative', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setShowDetails(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              {getIcon()}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{recommendation.title} Diagnosis</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 Field: {recommendation.fieldName || 'Global'}</span>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-main)',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              color: 'var(--text-main)',
              marginBottom: '16px',
              minHeight: '80px'
            }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '20px 0', color: 'var(--text-muted)' }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid var(--text-light)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Loading action steps...</span>
                </div>
              ) : (
                <p>{detailsText}</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '18px',
                  border: 'none',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Acknowledge Alert
              </button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

// Container widget that wraps multiple recommendation items
interface RecommendationsWidgetProps {
  recommendations: SmartRecommendation[];
}

export const RecommendationsWidget: React.FC<RecommendationsWidgetProps> = ({ recommendations }) => {
  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Smart Recommendations
        </h3>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          padding: '2px 8px',
          borderRadius: '20px'
        }}>
          AI
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
        {recommendations.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
            No recommendations at this time.
          </div>
        ) : (
          recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))
        )}
      </div>
    </Card>
  );
};
