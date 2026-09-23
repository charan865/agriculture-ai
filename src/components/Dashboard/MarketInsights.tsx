import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Card } from '../Common/Card';
import { MarketRate } from '../../types';
import { marketService } from '../../services/marketService';
import { useLanguage } from '../../context/LanguageContext';

export const MarketInsights: React.FC = () => {
  const { language } = useLanguage();
  const isTelugu = language === 'te';
  const [rates, setRates] = useState<MarketRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchRates = async () => {
      const data = await marketService.getMarketRates();
      if (active) {
        setRates(data);
        setLoading(false);
      }
    };
    fetchRates();
    return () => { active = false; };
  }, []);

  // Custom inline SVG rendering for premium crop symbols
  const getCropIcon = (name: string) => {
    const isTomato = name.toLowerCase().includes('tomato');
    const isRice = name.toLowerCase().includes('rice');
    const isCotton = name.toLowerCase().includes('cotton');

    if (isTomato) {
      return (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="19" r="13" fill="#e74c3c" />
          <circle cx="15" cy="16" r="3" fill="#ff7675" opacity="0.3" />
          {/* Leaf / Stem */}
          <path d="M18 6 Q20 3 22 6" stroke="#27ae60" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 6 Q16 4 14 7" stroke="#2d7a4c" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (isRice) {
      return (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="15" fill="#fcf3cf" />
          {/* Paddy grains stalk */}
          <path d="M14 26 Q18 16 23 10" stroke="#d4ac0d" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="23" cy="10" rx="2" ry="4" transform="rotate(30 23 10)" fill="#f1c40f" />
          <ellipse cx="21" cy="13" rx="2" ry="4" transform="rotate(-30 21 13)" fill="#f1c40f" />
          <ellipse cx="19" cy="16" rx="2" ry="4" transform="rotate(20 19 16)" fill="#f1c40f" />
          <ellipse cx="17" cy="19" rx="2" ry="4" transform="rotate(-20 17 19)" fill="#f1c40f" />
        </svg>
      );
    }
    if (isCotton) {
      return (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="15" fill="#f8f9f9" stroke="#eaeded" strokeWidth="1" />
          {/* Fluffy cotton pod */}
          <circle cx="18" cy="15" r="5" fill="#ffffff" stroke="#d5dbdb" strokeWidth="1" />
          <circle cx="14" cy="19" r="5" fill="#ffffff" stroke="#d5dbdb" strokeWidth="1" />
          <circle cx="22" cy="19" r="5" fill="#ffffff" stroke="#d5dbdb" strokeWidth="1" />
          <circle cx="18" cy="21" r="4.5" fill="#ffffff" stroke="#d5dbdb" strokeWidth="1" />
          {/* Sepal brown base */}
          <path d="M12 21 Q18 25 24 21 L18 27 Z" fill="#8d5b4c" />
        </svg>
      );
    }
    return <TrendingUp size={20} color="var(--primary)" />;
  };

  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {isTelugu ? 'మార్కెట్ ధరలు & వివరాలు' : 'Market Insights'}
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
            {isTelugu ? 'అన్నీ చూడండి' : 'View All'}
          </button>
        </div>

        {/* Commodity Lists */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--border-color)' }} className="skeleton" />
                <div style={{ flex: 1, height: '16px', backgroundColor: 'var(--border-color)', borderRadius: '4px' }} className="skeleton" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {rates.map((rate) => {
              const isPositive = rate.change >= 0;
              const displayName = isTelugu
                ? rate.cropName.toLowerCase().includes('tomato') ? 'టమాటా'
                  : rate.cropName.toLowerCase().includes('rice') ? 'వరి (ధాన్యం)'
                  : rate.cropName.toLowerCase().includes('cotton') ? 'పత్తి'
                  : rate.cropName
                : rate.cropName;
              const displayUnit = isTelugu && rate.unit === 'Quintal' ? 'క్వింటాల్' : rate.unit;

              return (
                <div
                  key={rate.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)',
                    transition: 'all var(--transition-fast)'
                  }}
                  className="market-row-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getCropIcon(rate.cropName)}
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                        {displayName}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        ₹{rate.price.toLocaleString()} / {displayUnit}
                      </span>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '2px', 
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: isPositive ? 'var(--success)' : 'var(--critical)'
                  }}>
                    {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {isPositive ? '+' : ''}{rate.change}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
        {isTelugu ? 'మరిన్ని మార్కెట్ వివరాలు' : 'More Market Trends'} <ArrowRight size={14} />
      </button>
    </Card>
  );
};
