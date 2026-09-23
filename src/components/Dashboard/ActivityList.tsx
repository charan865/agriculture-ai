import React from 'react';
import { CheckCircle2, CloudRain, Sparkles, AlertTriangle, Eye, ArrowRight } from 'lucide-react';
import { Card } from '../Common/Card';
import { ActivityLog } from '../../types';

interface ActivityListProps {
  logs: ActivityLog[];
}

export const ActivityList: React.FC<ActivityListProps> = ({ logs }) => {
  const getLogIcon = (type: string, _status?: string) => {
    let color = 'var(--primary)';
    let bg = 'var(--primary-light)';
    let Icon = CheckCircle2;

    switch (type) {
      case 'weather':
        Icon = CloudRain;
        color = '#3498db';
        bg = '#ebf5fb';
        break;
      case 'recommendation':
        Icon = Sparkles;
        color = '#9b59b6';
        bg = '#f4ecf7';
        break;
      case 'pest':
        Icon = AlertTriangle;
        color = 'var(--critical)';
        bg = 'var(--critical-bg)';
        break;
      case 'scan':
      default:
        Icon = Eye;
        color = 'var(--success-text)';
        bg = 'var(--success-bg)';
        break;
    }

    return (
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={18} color={color} />
      </div>
    );
  };

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Recent Activity
          </h3>
          <button style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            border: '1.5px solid var(--border-color)',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            padding: '4px 12px',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}>
            View All
          </button>
        </div>

        {/* Activity feed list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              {getLogIcon(log.type, log.status)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2
                }}>
                  {log.title}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {log.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          border: 'none',
          background: 'none',
          color: 'var(--primary)',
          fontSize: '0.825rem',
          fontWeight: 600,
          cursor: 'pointer',
          padding: '4px 0',
          width: 'fit-content',
          marginTop: '20px',
          transition: 'gap var(--transition-fast)'
        }}
        className="weather-link-hover"
      >
        View Logs History <ArrowRight size={14} />
      </button>
    </Card>
  );
};
