import React from 'react';
import { Card } from '../Common/Card';

interface CropHealthCardProps {
  healthSummary: {
    overallHealth: number;
    healthy: number;
    atRisk: number;
    critical: number;
  };
}

export const CropHealthCard: React.FC<CropHealthCardProps> = ({ healthSummary }) => {
  const { overallHealth, healthy, atRisk, critical } = healthSummary;

  // SVG circular properties
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.9

  // Calculate segment lengths
  const healthyStroke = (healthy / 100) * circumference;
  const atRiskStroke = (atRisk / 100) * circumference;
  const criticalStroke = (critical / 100) * circumference;

  // Offsets (starting from top, so rotate SVG by -90deg)
  const healthyOffset = 0;
  const atRiskOffset = healthyStroke;
  const criticalOffset = healthyStroke + atRiskStroke;

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
        Crop Health Overview
      </h3>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-around',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}>
        {/* SVG Donut Chart */}
        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="var(--border-color)"
              strokeWidth="10"
            />
            {/* Healthy Segment */}
            {healthy > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="var(--success)"
                strokeWidth="10"
                strokeDasharray={`${healthyStroke} ${circumference}`}
                strokeDashoffset={-healthyOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray var(--transition-normal)' }}
              />
            )}
            {/* At Risk Segment */}
            {atRisk > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="var(--warning)"
                strokeWidth="10"
                strokeDasharray={`${atRiskStroke} ${circumference}`}
                strokeDashoffset={-atRiskOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray var(--transition-normal)' }}
              />
            )}
            {/* Critical Segment */}
            {critical > 0 && (
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="var(--critical)"
                strokeWidth="10"
                strokeDasharray={`${criticalStroke} ${circumference}`}
                strokeDashoffset={-criticalOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray var(--transition-normal)' }}
              />
            )}
          </svg>

          {/* Centered overall health label */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <span style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.1
            }}>
              {overallHealth}%
            </span>
            <span style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Overall Health
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'space-between', width: '130px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 500 }}>Healthy</span>
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{healthy}%</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'space-between', width: '130px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }}></span>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 500 }}>At Risk</span>
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{atRisk}%</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'space-between', width: '130px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--critical)' }}></span>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 500 }}>Critical</span>
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{critical}%</span>
          </div>
        </div>
      </div>

      {/* Footer warning/info */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          fontWeight: 500
        }}
      >
        <span style={{ color: 'var(--primary)', fontSize: '1rem' }}>🌱</span>
        <span>
          {overallHealth >= 75
            ? 'Your fields are in good condition. Keep it up!'
            : overallHealth >= 50
            ? 'Some fields require attention. Review notifications.'
            : 'Immediate corrective crop actions recommended!'}
        </span>
      </div>
    </Card>
  );
};
