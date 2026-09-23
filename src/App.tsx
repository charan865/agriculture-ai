import { useState, useEffect } from 'react';
import { Layout } from './components/Layout/Layout';
import { HeroSection } from './components/Dashboard/HeroSection';
import { WeatherCard } from './components/Dashboard/WeatherCard';
import { CropSection } from './components/Dashboard/CropSection';
import { QuickTips } from './components/Dashboard/QuickTips';
import { BottomSection } from './components/Dashboard/BottomSection';
import { AddCropModal } from './components/Dashboard/AddCropModal';
import { ManualLocationModal } from './components/Dashboard/ManualLocationModal';

// Dedicated Views
import { AIAssistantView } from './components/Views/AIAssistantView';
import { CropDiagnosisView } from './components/Views/CropDiagnosisView';
import { MyCropsView } from './components/Views/MyCropsView';
import { WeatherAlertsView } from './components/Views/WeatherAlertsView';
import { DiagnosisHistoryView } from './components/Views/DiagnosisHistoryView';
import { SettingsView } from './components/Views/SettingsView';
import { SplashScreen } from './components/SplashScreen';

// Types & Services
import { Crop, WeatherData, QuickTip, DiagnosisResult, LocationInfo } from './types';
import { cropService } from './services/cropService';
import { weatherService } from './services/weatherService';
import { locationService } from './services/locationService';
import { aiService, quickTipsData } from './services/aiService';
import { diagnosisService } from './services/diagnosisService';
import { useLanguage } from './context/LanguageContext';

export function App() {
  const { language } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState('Dashboard');
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('Detecting Location...');

  // Weather States - No hardcoded demo values!
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [showManualLocationModal, setShowManualLocationModal] = useState(false);

  const [crops, setCrops] = useState<Crop[]>([]);
  const [quickTips, setQuickTips] = useState<QuickTip[]>(quickTipsData);
  const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisResult[]>([]);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [searchParam, setSearchParam] = useState('');

  // 1. Initial Geolocation Request & Weather Fetching
  useEffect(() => {
    // Fetch user crops, diagnosis history & tips
    cropService.getCrops().then(setCrops);
    diagnosisService.getDiagnosisHistory().then(setDiagnosisHistory);
    aiService.getQuickTips(language).then(setQuickTips);

    // Actively take location permission from the user
    let unsubPermission: (() => void) | undefined;

    const initializeLocationAndWeather = async () => {
      setLoadingWeather(true);
      setWeatherError(null);

      // Listen for permission changes in real-time (e.g. user toggles Allow in browser address bar)
      unsubPermission = locationService.listenPermissionChange((status) => {
        if (status === 'granted') {
          handleRequestLocation();
        } else if (status === 'denied') {
          setLocationPermissionDenied(true);
          setSelectedLocation('Location Access Needed');
          setWeather(null);
          setLoadingWeather(false);
        }
      });

      // Request browser geolocation permission
      try {
        const gpsLoc = await locationService.getCurrentLocation();
        setCurrentLocation(gpsLoc);
        setSelectedLocation(gpsLoc.displayName);
        setLocationPermissionDenied(false);

        const liveWeather = await weatherService.getCurrentWeather(
          gpsLoc.latitude,
          gpsLoc.longitude,
          gpsLoc.displayName
        );
        setWeather(liveWeather);
      } catch (err: any) {
        console.warn('Geolocation detection status:', err);
        if (err?.code === 'PERMISSION_DENIED') {
          setLocationPermissionDenied(true);
          setSelectedLocation('Location Access Needed');
          setWeather(null);
        } else {
          // If position unavailable or timeout, check if user had previously selected a location
          const cached = locationService.getCachedLocation();
          if (cached) {
            setCurrentLocation(cached);
            setSelectedLocation(cached.displayName);
            try {
              const cachedWeather = await weatherService.getCurrentWeather(
                cached.latitude,
                cached.longitude,
                cached.displayName
              );
              setWeather(cachedWeather);
            } catch {
              setWeatherError(err?.message || 'Unable to retrieve location weather.');
            }
          } else {
            setWeatherError(err?.message || 'Unable to detect location. Please select manually.');
          }
        }
      } finally {
        setLoadingWeather(false);
      }
    };

    initializeLocationAndWeather();

    return () => {
      if (unsubPermission) unsubPermission();
    };
  }, []);

  // 2. Periodic Weather Refresh (every 15 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentLocation) {
        weatherService
          .getCurrentWeather(currentLocation.latitude, currentLocation.longitude, currentLocation.displayName)
          .then((updated) => setWeather(updated))
          .catch((err) => console.warn('Periodic weather update failed:', err));
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentLocation]);

  useEffect(() => {
    aiService.getQuickTips(language).then(setQuickTips);
  }, [language]);

  // Request GPS Location Trigger (from "Enable Location" button or TopBar)
  const handleRequestLocation = async () => {
    setLoadingWeather(true);
    setWeatherError(null);
    setLocationPermissionDenied(false);

    try {
      const gpsLoc = await locationService.getCurrentLocation();
      setCurrentLocation(gpsLoc);
      setSelectedLocation(gpsLoc.displayName);
      const data = await weatherService.getCurrentWeather(
        gpsLoc.latitude,
        gpsLoc.longitude,
        gpsLoc.displayName
      );
      setWeather(data);
    } catch (err: any) {
      if (err?.code === 'PERMISSION_DENIED') {
        setLocationPermissionDenied(true);
        setSelectedLocation('Location Access Needed');
        setWeather(null);
      } else {
        setWeatherError(err?.message || 'Failed to detect location.');
      }
    } finally {
      setLoadingWeather(false);
    }
  };


  // Handle Location Change from Dropdown or Search
  const handleLocationChange = async (newLoc: string, info?: LocationInfo) => {
    setSelectedLocation(newLoc);
    setLoadingWeather(true);
    setWeatherError(null);
    setLocationPermissionDenied(false);

    try {
      if (info) {
        locationService.saveLocation(info);
        setCurrentLocation(info);
        const data = await weatherService.getCurrentWeather(
          info.latitude,
          info.longitude,
          info.displayName
        );
        setWeather(data);
      } else {
        const data = await weatherService.getWeatherData(newLoc);
        setWeather(data);
        if (data.latitude != null && data.longitude != null) {
          const locInfo: LocationInfo = {
            latitude: data.latitude,
            longitude: data.longitude,
            displayName: data.location,
            source: 'manual'
          };
          locationService.saveLocation(locInfo);
          setCurrentLocation(locInfo);
        }
      }
    } catch {
      setWeatherError('Failed to load weather for selected location.');
    } finally {
      setLoadingWeather(false);
    }
  };

  // Add new crop handler
  const handleAddCrop = async (cropData: Omit<Crop, 'id'>) => {
    const newCrop = await cropService.addCrop(cropData);
    setCrops((prev) => [newCrop, ...prev]);
  };

  // Delete crop handler
  const handleDeleteCrop = async (id: string) => {
    const updated = await cropService.removeCrop(id);
    setCrops(updated);
  };

  // Demo crops loader
  const handleLoadDemoCrops = async () => {
    const demo = await cropService.loadDemoCrops();
    setCrops(demo);
    setActiveView('Dashboard');
  };

  // Clear crops to re-test empty state
  const handleClearCrops = async () => {
    const empty = await cropService.clearCrops();
    setCrops(empty);
    setActiveView('Dashboard');
  };

  // Delete diagnosis history
  const handleDeleteDiagnosis = async (id: string) => {
    const updated = await diagnosisService.deleteDiagnosis(id);
    setDiagnosisHistory(updated);
  };

  const refreshDiagnosisHistory = async () => {
    const updated = await diagnosisService.getDiagnosisHistory();
    setDiagnosisHistory(updated);
  };

  // Handle Search Input from TopBar
  const handleSearchSubmit = (query: string) => {
    setSearchParam(query);
    setActiveView('AI Assistant');
  };

  // Fallback representation for Weather Alerts View if weather is still loading
  const effectiveWeather: WeatherData = weather || {
    temp: 26,
    condition: 'Partly Cloudy',
    weatherCode: 2,
    humidity: 60,
    windSpeed: 12,
    rainChance: 20,
    location: selectedLocation,
    dateStr: 'Today',
    alertTitle: 'No major weather alerts',
    alertSubtitle: 'Conditions look good for farming operations.'
  };

  // Render Current Selected View
  const renderContent = () => {
    switch (activeView) {
      case 'AI Assistant':
        return (
          <AIAssistantView
            userCrops={crops}
            weather={weather}
            initialQuery={searchParam}
          />
        );

      case 'Crop Diagnosis':
        return (
          <CropDiagnosisView
            userCrops={crops}
            weather={weather}
            onDiagnosisSaved={refreshDiagnosisHistory}
            onAddCrop={() => setShowAddCropModal(true)}
            onNavigateToHistory={() => setActiveView('Diagnosis History')}
          />
        );

      case 'My Crops':
        return (
          <MyCropsView
            crops={crops}
            onAddCrop={() => setShowAddCropModal(true)}
            onDeleteCrop={handleDeleteCrop}
          />
        );

      case 'Weather & Alerts':
        return <WeatherAlertsView currentWeather={effectiveWeather} />;

      case 'Diagnosis History':
        return (
          <DiagnosisHistoryView
            history={diagnosisHistory}
            onDelete={handleDeleteDiagnosis}
            onNewDiagnosis={() => setActiveView('Crop Diagnosis')}
          />
        );

      case 'Settings':
        return (
          <SettingsView
            onLoadDemoCrops={handleLoadDemoCrops}
            onClearCrops={handleClearCrops}
            cropsCount={crops.length}
          />
        );

      case 'Dashboard':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Top Grid: Hero Section & Weather Panel */}
            <div className="dashboard-top-grid">
              <HeroSection
                onAskAI={() => setActiveView('AI Assistant')}
                onDiagnose={() => setActiveView('Crop Diagnosis')}
              />
              <WeatherCard
                weather={weather}
                loading={loadingWeather}
                error={weatherError}
                permissionDenied={locationPermissionDenied}
                onRequestLocation={handleRequestLocation}
                onSelectManualLocation={() => setShowManualLocationModal(true)}
                onViewWeatherDetails={() => setActiveView('Weather & Alerts')}
              />
            </div>

            {/* Bottom Grid: Crop Section & Right Column Cards */}
            <div className="dashboard-bottom-grid">
              {/* Left Column: Crop Section (Empty State or My Crops) */}
              <CropSection
                crops={crops}
                weather={weather || undefined}
                onAddCrop={() => setShowAddCropModal(true)}
                onDeleteCrop={handleDeleteCrop}
                onConsultAI={(prompt) => {
                  setSearchParam(prompt);
                  setActiveView('AI Assistant');
                }}
              />

              {/* Right Column: Quick Tips & Inspirational Quote */}
              <div className="right-cards-column">
                <QuickTips tips={quickTips} />
                <BottomSection />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          minDurationMs={2750}
          isAppReady={true}
        />
      )}

      <Layout
        activeView={activeView}
        setActiveView={setActiveView}
        activeLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        onRequestGPSLocation={handleRequestLocation}
        onSearchSubmit={handleSearchSubmit}
      >
        {renderContent()}
      </Layout>

      {/* Add Crop Modal */}
      <AddCropModal
        isOpen={showAddCropModal}
        onClose={() => setShowAddCropModal(false)}
        onSave={handleAddCrop}
      />

      {/* Manual Location Selection Modal */}
      <ManualLocationModal
        isOpen={showManualLocationModal}
        onClose={() => setShowManualLocationModal(false)}
        onSelect={(locInfo) => handleLocationChange(locInfo.displayName, locInfo)}
        currentLocationName={selectedLocation}
      />
    </>
  );
}

export default App;

