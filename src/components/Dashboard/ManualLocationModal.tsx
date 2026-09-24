import React, { useState, useEffect } from 'react';
import { X, MapPin, Search, Check } from 'lucide-react';
import { LocationInfo } from '../../types';
import { locationService } from '../../services/locationService';
import { useLanguage } from '../../context/LanguageContext';

interface ManualLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: LocationInfo) => void;
  currentLocationName?: string;
}

export const ManualLocationModal: React.FC<ManualLocationModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentLocationName
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [previousLocations, setPreviousLocations] = useState<LocationInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPreviousLocations(locationService.getRecentLocations());
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length >= 2) {
      setLoading(true);
      try {
        const found = await locationService.searchCities(val);
        setResults(found);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setResults([]);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 40, 29, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="agri-card modal-content"
        style={{
          width: '100%',
          maxWidth: 'min(460px, calc(100vw - 24px))',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {t('topbar.selectFarmLocation')}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {t('topbar.localizeWeather')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="#7a9182"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('topbar.searchCity')}
            autoFocus
            style={{
              width: '100%',
              height: '44px',
              padding: '0 16px 0 42px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
          />
        </div>

        {/* Results or Previous Locations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {results.length > 0 ? `${t('topbar.matchingLocations')} (${results.length})` : loading ? t('common.loading') : t('topbar.previousLocations')}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '240px', overflowY: 'auto' }}>
            {results.length > 0 ? (
              results.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelect(loc);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    backgroundColor: '#f9fbf8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9fbf8')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="#155e32" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {loc.displayName}
                    </span>
                  </div>
                </button>
              ))
            ) : previousLocations.length > 0 ? (
              previousLocations.map((loc, idx) => {
                const isSelected = currentLocationName === loc.displayName;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelect(loc);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: isSelected ? '#bfe2c9' : 'transparent',
                      backgroundColor: isSelected ? '#e8f5ec' : '#f9fbf8',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f2';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = isSelected ? '#e8f5ec' : '#f9fbf8';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color={isSelected ? '#155e32' : '#6b7280'} />
                      <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 700 : 500, color: 'var(--text-main)' }}>
                        {loc.displayName}
                      </span>
                    </div>
                    {isSelected && <Check size={16} color="#155e32" />}
                  </button>
                );
              })
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', margin: 0 }}>
                No previous locations found. Type your city name in the search box above.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
