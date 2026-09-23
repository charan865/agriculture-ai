import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Bell, ChevronDown, Menu, Check, User, Info, LocateFixed, Languages } from 'lucide-react';
import { locationService } from '../../services/locationService';
import { LocationInfo } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface TopBarProps {
  onMenuClick: () => void;
  activeLocation: string;
  onLocationChange: (loc: string, info?: LocationInfo) => void;
  onRequestGPSLocation?: () => void;
  onSearchSubmit?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMenuClick,
  activeLocation,
  onLocationChange,
  onRequestGPSLocation,
  onSearchSubmit
}) => {
  const { t, language, setLanguage, languages } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [previousLocations, setPreviousLocations] = useState<LocationInfo[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (showLocationDropdown) {
      setPreviousLocations(locationService.getRecentLocations());
      setCitySearch('');
      setSearchResults([]);
    }
  }, [showLocationDropdown]);

  const locRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(246, 248, 245, 0.92)',
        backdropFilter: 'blur(10px)',
        zIndex: 99,
        borderBottom: '1px solid var(--border-light)',
        gap: '16px'
      }}
    >
      {/* Mobile Toggle & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, maxWidth: '640px' }}>
        <button
          onClick={onMenuClick}
          style={{
            background: '#ffffff',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: '10px',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '7px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="mobile-sidebar-toggle"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
          <Search
            size={18}
            color="#7a9182"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('topbar.searchPlaceholder')}
            style={{
              width: '100%',
              height: '42px',
              padding: '0 16px 0 42px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              outline: 'none',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-focus)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-glow)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </form>
      </div>

      {/* Right Controls: Language, Location, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Language Selector Pill */}
        <div style={{ position: 'relative' }} ref={langRef}>
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              transition: 'all var(--transition-fast)'
            }}
            title={t('settings.language')}
          >
            <Languages size={15} color="#155e32" />
            <span>{language === 'te' ? 'తెలుగు' : 'English'}</span>
            <ChevronDown size={13} color="#6d8374" />
          </button>

          {showLangDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-modal)',
                width: '180px',
                padding: '8px',
                zIndex: 100,
                animation: 'fadeIn 0.15s ease-out',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {t('settings.language')}
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: language === lang.code ? '#e8f5ec' : 'transparent',
                    color: language === lang.code ? '#14532d' : 'var(--text-main)',
                    fontSize: '0.84rem',
                    fontWeight: language === lang.code ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span>{lang.nativeLabel}</span>
                  {language === lang.code && <Check size={14} color="#155e32" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location Selector Pill */}
        <div style={{ position: 'relative' }} ref={locRef}>
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1.5px solid var(--border-subtle)',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c2d2c4')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            <MapPin size={16} color="#155e32" />
            <span>{activeLocation}</span>
            <ChevronDown size={14} color="#6d8374" />
          </button>

          {/* Location Dropdown */}
          {showLocationDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-modal)',
                width: '260px',
                padding: '10px',
                zIndex: 100,
                animation: 'fadeIn 0.15s ease-out',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* GPS Button */}
              {onRequestGPSLocation && (
                <button
                  onClick={() => {
                    onRequestGPSLocation();
                    setShowLocationDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#e8f5ec',
                    border: '1px solid #bfe2c9',
                    color: '#155e32',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <LocateFixed size={15} color="#155e32" />
                  <span>{t('topbar.useGPS')}</span>
                </button>
              )}

              {/* City Search Input */}
              <div style={{ position: 'relative' }}>
                <Search
                  size={14}
                  color="#7a9182"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  value={citySearch}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setCitySearch(val);
                    if (val.trim().length >= 2) {
                      const results = await locationService.searchCities(val);
                      setSearchResults(results);
                    } else {
                      setSearchResults([]);
                    }
                  }}
                  placeholder={t('topbar.searchCity')}
                  style={{
                    width: '100%',
                    height: '34px',
                    padding: '0 10px 0 30px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* List: Either Search Results or Previous Locations */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ padding: '4px 6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {searchResults.length > 0 ? t('topbar.matchingLocations') : t('topbar.previousLocations')}
                </div>

                {searchResults.length > 0 ? (
                  searchResults.map((locInfo, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onLocationChange(locInfo.displayName, locInfo);
                        setShowLocationDropdown(false);
                        setCitySearch('');
                        setSearchResults([]);
                      }}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf7')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {locInfo.displayName}
                    </button>
                  ))
                ) : previousLocations.length > 0 ? (
                  previousLocations.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onLocationChange(loc.displayName, loc);
                        setShowLocationDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: activeLocation === loc.displayName ? '#e8f5ec' : 'transparent',
                        color: activeLocation === loc.displayName ? '#14532d' : 'var(--text-main)',
                        fontSize: '0.8rem',
                        fontWeight: activeLocation === loc.displayName ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (activeLocation !== loc.displayName) e.currentTarget.style.backgroundColor = '#f7faf7';
                      }}
                      onMouseLeave={(e) => {
                        if (activeLocation !== loc.displayName) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span>{loc.displayName}</span>
                      {activeLocation === loc.displayName && <Check size={14} color="#155e32" />}
                    </button>
                  ))
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 6px', margin: 0 }}>
                    {t('topbar.noLocations')}
                  </p>
                )}
              </div>
            </div>
          )}


        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1.5px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all var(--transition-fast)'
            }}
            aria-label={t('topbar.notifications')}
          >
            <Bell size={18} color="#35493d" />
            {/* Red Alert Dot */}
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '9px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#ef4444'
              }}
            />
          </button>

          {/* Notifications Menu */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '18px',
                boxShadow: 'var(--shadow-modal)',
                width: '310px',
                padding: '16px',
                zIndex: 100,
                animation: 'fadeIn 0.15s ease-out'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{t('topbar.alertsUpdates')}</h4>
                <span style={{ fontSize: '0.72rem', color: '#155e32', fontWeight: 600, cursor: 'pointer' }}>{t('topbar.markRead')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#f1f8f3', border: '1px solid #e1eee4' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#14532d', marginBottom: '2px' }}>
                    {t('topbar.optimalSpraying')}
                  </p>
                  <p style={{ fontSize: '0.74rem', color: '#52695a' }}>
                    {t('topbar.optimalSprayingDesc')}
                  </p>
                </div>
                <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e', marginBottom: '2px' }}>
                    {t('topbar.pestScouting')}
                  </p>
                  <p style={{ fontSize: '0.74rem', color: '#78350f' }}>
                    {t('topbar.pestScoutingDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Farmer Profile Badge */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#ffffff',
              border: '1.5px solid var(--border-subtle)',
              padding: '4px 12px 4px 5px',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {/* Avatar Circle with "CT" */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#d8eadc',
                color: '#155e32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.82rem',
                border: '1px solid #c2dec8'
              }}
            >
              CT
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="profile-text">
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                Charan Teja
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)', lineHeight: 1 }}>
                {t('topbar.farmer')}
              </span>
            </div>
            <ChevronDown size={14} color="#6d8374" />
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-modal)',
                width: '210px',
                padding: '8px',
                zIndex: 100,
                animation: 'fadeIn 0.15s ease-out'
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)', marginBottom: '4px' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Charan Teja</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('topbar.farmerRegistered')}</p>
              </div>
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf7')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <User size={15} color="#52695a" />
                <span>{t('topbar.myProfile')}</span>
              </button>
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7faf7')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Info size={15} color="#52695a" />
                <span>{t('topbar.aboutApp')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
