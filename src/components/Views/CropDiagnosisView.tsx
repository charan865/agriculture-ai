import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Loader2,
  Sprout,
  Plus,
  RefreshCw,
  X,
  CloudSun,
  AlertCircle,
  FileText,
  BookmarkCheck,
  Check,
  ArrowRight,
  HelpCircle,
  Calendar,
  Layers,
  Droplets
} from 'lucide-react';
import { diagnosisService } from '../../services/diagnosisService';
import { DiagnosisResult, Crop, WeatherData, CropDiagnosisContext } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface CropDiagnosisViewProps {
  userCrops: Crop[];
  weather?: WeatherData | null;
  onDiagnosisSaved: () => void;
  onAddCrop?: () => void;
  onNavigateToHistory?: () => void;
}

export const CropDiagnosisView: React.FC<CropDiagnosisViewProps> = ({
  userCrops,
  weather,
  onDiagnosisSaved,
  onAddCrop,
  onNavigateToHistory
}) => {
  const { t, language } = useLanguage();
  const isTelugu = language === 'te';

  const PROGRESS_MESSAGES = [
    t('cropDiagnosis.analyzing'),
    t('cropDiagnosis.examiningSymptoms'),
    t('cropDiagnosis.preparingRecommendations')
  ];

  // Crop selection states
  const hasUserCrops = userCrops && userCrops.length > 0;
  const [selectedCropId, setSelectedCropId] = useState<string>(hasUserCrops ? userCrops[0].id : '');
  const [isManualMode, setIsManualMode] = useState<boolean>(!hasUserCrops);
  const [manualCropName, setManualCropName] = useState<string>('');
  const [manualFieldName, setManualFieldName] = useState<string>('');

  // Sync selectedCropId if userCrops change
  useEffect(() => {
    if (hasUserCrops && (!selectedCropId || !userCrops.some((c) => c.id === selectedCropId))) {
      setSelectedCropId(userCrops[0].id);
      setIsManualMode(false);
    }
  }, [userCrops]);

  // Image & Upload states
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis & Result states
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Cycle progress status messages smoothly while analyzing
  useEffect(() => {
    if (!analyzing) return;
    const interval = setInterval(() => {
      setProgressIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [analyzing, PROGRESS_MESSAGES.length]);

  // Derive active crop context object
  const getActiveCropContext = (): CropDiagnosisContext | null => {
    if (!isManualMode && selectedCropId) {
      const crop = userCrops.find((c) => c.id === selectedCropId);
      if (crop) {
        return {
          cropId: crop.id,
          cropName: crop.name,
          fieldName: crop.fieldName,
          plantingDate: crop.plantingDate,
          growthStage: crop.growthStage,
          soilType: crop.soilType,
          irrigationMethod: crop.irrigationMethod,
          location: weather?.location || 'Farm'
        };
      }
    }
    if (isManualMode && manualCropName.trim()) {
      return {
        cropName: manualCropName.trim(),
        fieldName: manualFieldName.trim() || 'Manual Entry Plot',
        growthStage: 'Vegetative',
        location: weather?.location || 'Farm'
      };
    }
    return null;
  };

  const activeCrop = getActiveCropContext();
  const canRunDiagnosis = !!activeCrop && !!previewImage && !analyzing;

  // File validation & processing
  const validateAndProcessFile = (file: File) => {
    setUploadError(null);
    if (!file || file.size === 0) {
      setUploadError(isTelugu ? 'ఎంచుకున్న ఫైల్ ఖాళీగా ఉంది. దయచేసి సరైన ఫోటోను ఎంచుకోండి.' : 'The selected file is empty. Please select a valid photo.');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError(isTelugu ? 'మద్దతు లేని ఫైల్ ఫార్మాట్. దయచేసి JPG, PNG లేదా WEBP ఫోటోను అప్‌లోడ్ చేయండి.' : 'Unsupported file format. Please upload a JPG, PNG, or WEBP photo.');
      return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError(isTelugu ? 'ఫోటో 10MB పరిమితిని మించిపోయింది. దయచేసి చిన్న చిత్రాన్ని అప్‌లోడ్ చేయండి.' : 'Photo exceeds 10MB limit. Please upload a smaller image.');
      return;
    }
    if (file.size < 500) {
      setUploadError(isTelugu ? 'అప్‌లోడ్ చేసిన చిత్రం చాలా చిన్నదిగా లేదా పాడైపోయినట్లుగా ఉంది. దయచేసి స్పష్టమైన ఫోటోను ఎంచుకోండి.' : 'The uploaded image appears empty or corrupt. Please select a valid photo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      // Pre-flight image dimension check
      const img = new Image();
      img.onload = () => {
        if (img.width < 64 || img.height < 64) {
          setUploadError(isTelugu ? 'అప్‌లోడ్ చేసిన ఫోటో చాలా చిన్నదిగా ఉంది. దయచేసి ఆకు స్పష్టంగా కనిపించే ఫోటోను అప్‌లోడ్ చేయండి.' : 'Photo resolution is too small. Please upload a clearer photo of the affected leaf.');
          return;
        }

        // Pre-flight image quality check: darkness and extreme blur
        try {
          const canvas = document.createElement('canvas');
          const sampleW = 64;
          const sampleH = 64;
          canvas.width = sampleW;
          canvas.height = sampleH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, sampleW, sampleH);
            const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
            const data = imgData.data;
            let totalLum = 0;
            const lums: number[] = [];
            for (let i = 0; i < data.length; i += 4) {
              const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
              totalLum += lum;
              lums.push(lum);
            }
            const avgLum = totalLum / lums.length;
            if (avgLum < 12) {
              setUploadError(isTelugu ? 'చిత్రం చాలా చీకటిగా ఉంది. దయచేసి వెలుతురులో పంట ఆకు ఫోటో తీసి అప్‌లోడ్ చేయండి.' : 'The uploaded photo is too dark. Please upload a clearer photo of the affected leaf taken in good lighting.');
              return;
            }
            // Check variance across pixels for solid/blank/extreme blur
            let variance = 0;
            for (const lum of lums) {
              variance += Math.pow(lum - avgLum, 2);
            }
            const stdDev = Math.sqrt(variance / lums.length);
            if (stdDev < 3.5) {
              setUploadError(isTelugu ? 'చిత్రం స్పష్టంగా లేదు లేదా ఒకే రంగుతో ఉంది. దయచేసి పంట ఆకు స్పష్టంగా కనిపించే ఫోటోను అప్‌లోడ్ చేయండి.' : 'The uploaded photo appears indistinct or blurry. Please upload a clearer photo of the affected leaf.');
              return;
            }
          }
        } catch {
          // If canvas read fails (e.g. security sandbox), continue gracefully
        }

        setPreviewImage(resultStr);
        setDiagnosis(null);
        setAnalysisError(null);
        setSavedSuccess(false);
      };
      img.onerror = () => {
        setUploadError(isTelugu ? 'చిత్రాన్ని చదవడం సాధ్యం కాలేదు. దయచేసి మరొక ఫోటోను ప్రయత్నించండి.' : 'Could not decode image data. Please try another photo.');
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!analyzing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (analyzing) return;
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setUploadError(null);
    setDiagnosis(null);
    setAnalysisError(null);
    setSavedSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Run AI Diagnosis
  const handleRunDiagnosis = async () => {
    if (!activeCrop || !previewImage || analyzing) return;
    setAnalyzing(true);
    setAnalysisError(null);
    setDiagnosis(null);
    setSavedSuccess(false);
    setProgressIndex(0);

    try {
      const result = await diagnosisService.analyzeCropImage(activeCrop, previewImage, weather, language);
      setDiagnosis(result);
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      const msg = err?.message && typeof err.message === 'string' && !err.message.includes('fetch') && !err.message.includes('Failed to')
        ? err.message
        : t('cropDiagnosis.errorAnalyzing');
      setAnalysisError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  // Save Diagnosis
  const handleSaveDiagnosis = async () => {
    if (!diagnosis || saving) return;
    setSaving(true);
    try {
      await diagnosisService.saveDiagnosis(diagnosis);
      setSavedSuccess(true);
      onDiagnosisSaved();
    } catch (err) {
      console.error('Save failed:', err);
      alert(t('cropDiagnosis.errorAnalyzing'));
    } finally {
      setSaving(false);
    }
  };

  // Reset to diagnose another leaf
  const handleResetWorkflow = () => {
    setDiagnosis(null);
    setPreviewImage(null);
    setUploadError(null);
    setAnalysisError(null);
    setSavedSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
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
            <Camera size={22} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {t('cropDiagnosis.title')}
          </h2>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          {t('cropDiagnosis.subtitle')}
        </p>
      </div>

      {/* Main Two-Column Layout (Responsive) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.25fr)', gap: '24px' }} className="diagnosis-grid">
        
        {/* LEFT COLUMN: Diagnosis Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 1: CROP SELECTION */}
          <div className="agri-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    backgroundColor: '#e8f5ec',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#155e32',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  1
                </div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {t('cropDiagnosis.selectCrop')}
                </h3>
              </div>

              {/* Secondary Option: Enter Crop Manually Toggle */}
              {hasUserCrops && (
                <button
                  type="button"
                  onClick={() => setIsManualMode(!isManualMode)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#155e32',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '2px 4px'
                  }}
                >
                  {isManualMode ? `← ${t('cropDiagnosis.selectFromMyCrops')}` : t('cropDiagnosis.enterCropManually')}
                </button>
              )}
            </div>

            {/* Condition A: User has crops and is in Primary "Select from My Crops" mode */}
            {hasUserCrops && !isManualMode && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {t('cropDiagnosis.selectFromMyCrops')}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedCropId}
                    onChange={(e) => {
                      setSelectedCropId(e.target.value);
                      setDiagnosis(null);
                    }}
                    disabled={analyzing}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 14px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border-subtle)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none'
                    }}
                  >
                    {userCrops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.fieldName}
                      </option>
                    ))}
                  </select>
                  <div
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    ▼
                  </div>
                </div>

                {/* Selected Crop Context Details */}
                {activeCrop && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#f7faf8',
                      border: '1px solid #e2ebe4',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      fontSize: '0.76rem'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t('myCrops.fieldName')}: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{activeCrop.fieldName}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t('myCrops.growthStage')}: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{activeCrop.growthStage || 'Vegetative'}</strong>
                    </div>
                    {activeCrop.soilType && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>{t('myCrops.soilType')}: </span>
                        <strong style={{ color: 'var(--text-main)' }}>{activeCrop.soilType}</strong>
                      </div>
                    )}
                    {activeCrop.irrigationMethod && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>{t('myCrops.irrigationMethod')}: </span>
                        <strong style={{ color: 'var(--text-main)' }}>{activeCrop.irrigationMethod}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Condition B: Fallback "Enter Crop Manually" */}
            {isManualMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {t('myCrops.cropName')}
                  </label>
                  <input
                    type="text"
                    value={manualCropName}
                    onChange={(e) => {
                      setManualCropName(e.target.value);
                      setDiagnosis(null);
                    }}
                    placeholder={isTelugu ? 'ఉదాహరణ: టమాటా, పత్తి, మిరప, వరి...' : 'e.g., Tomato, Cotton, Sugarcane, Potato...'}
                    disabled={analyzing}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border-subtle)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {t('myCrops.fieldName')} ({isTelugu ? 'ఐచ్ఛికం' : 'Optional'})
                  </label>
                  <input
                    type="text"
                    value={manualFieldName}
                    onChange={(e) => setManualFieldName(e.target.value)}
                    placeholder={isTelugu ? 'ఉదాహరణ: ఉత్తర చేను, మడి 2' : 'e.g., North Field, Greenhouse 2'}
                    disabled={analyzing}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      borderRadius: '12px',
                      border: '1.5px solid var(--border-subtle)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Condition C: No crops added yet */}
            {!hasUserCrops && !isManualMode && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#f8faf9',
                  border: '1px dashed #c9d8ce',
                  textAlign: 'center'
                }}
              >
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  {t('myCrops.noCropsYet')}
                </p>
                {onAddCrop && (
                  <button
                    type="button"
                    onClick={onAddCrop}
                    className="btn-primary-pill"
                    style={{ padding: '8px 16px', fontSize: '0.82rem', margin: '0 auto 8px auto' }}
                  >
                    <Plus size={15} />
                    <span>+ {t('myCrops.addYourFirstCrop')}</span>
                  </button>
                )}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsManualMode(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#155e32',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {t('cropDiagnosis.enterCropManually')}
                  </button>
                </div>
              </div>
            )}

            {/* Helpful tip about clear photo replacing sample buttons */}
            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4b6354', fontSize: '0.76rem', lineHeight: 1.4 }}>
              <span style={{ fontSize: '0.85rem' }}>💡</span>
              <span>
                <strong>{t('cropDiagnosis.photoTips')}:</strong> {isTelugu ? 'ఖచ్చితమైన విశ్లేషణ కోసం తెగులు సోకిన భాగాన్ని స్పష్టంగా చూపించే ఫోటోను అప్లోడ్ చేయండి.' : 'Upload a clear photo showing the affected part of the plant for better analysis.'}
              </span>
            </div>
          </div>

          {/* SECTION 2: PHOTO UPLOAD */}
          <div className="agri-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '8px',
                  backgroundColor: '#e8f5ec',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#155e32',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {t('cropDiagnosis.uploadCropPhoto')}
              </h3>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileInputChange}
              disabled={analyzing}
              style={{ display: 'none' }}
            />

            {/* Dropzone Area or Preview */}
            {!previewImage ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !analyzing && fileInputRef.current?.click()}
                style={{
                  border: isDragging ? '2px dashed #155e32' : '2px dashed #b8cebf',
                  borderRadius: '16px',
                  backgroundColor: isDragging ? '#eef7f1' : '#f9fbf9',
                  padding: '28px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#e6f4ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#155e32',
                    marginBottom: '10px'
                  }}
                >
                  <Upload size={22} />
                </div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  📷 {t('cropDiagnosis.uploadCropPhoto')}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px', marginBottom: '14px', lineHeight: 1.3 }}>
                  {t('cropDiagnosis.dragDrop')}
                </p>
                <button
                  type="button"
                  className="btn-primary-pill"
                  style={{ padding: '7px 18px', fontSize: '0.82rem', pointerEvents: 'none' }}
                >
                  {t('cropDiagnosis.uploadPhoto')}
                </button>
                <p style={{ fontSize: '0.72rem', color: '#88988e', marginTop: '10px' }}>
                  JPG, PNG, WEBP • Max 10 MB
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1.5px solid var(--border-subtle)',
                    backgroundColor: '#000000',
                    maxHeight: '230px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={previewImage}
                    alt="Uploaded Crop Leaf Preview"
                    style={{ width: '100%', height: '220px', objectFit: 'contain' }}
                  />
                  {!analyzing && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      title="Remove or Replace Photo"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {!analyzing && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.76rem', color: '#155e32', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} /> {t('cropDiagnosis.imageReady')}
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {t('cropDiagnosis.replacePhoto')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Validation Error Message */}
            {uploadError && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#991b1b',
                  fontSize: '0.78rem'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Compact Photo Tips */}
            <div
              style={{
                marginTop: '14px',
                padding: '10px 12px',
                borderRadius: '10px',
                backgroundColor: '#f6f9f7',
                border: '1px solid #e7efe9'
              }}
            >
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>📸</span>
                <span>{t('cropDiagnosis.photoTips')}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                <li>{isTelugu ? 'మంచి వెలుతురులో ఫోటో తీయండి, అస్పష్టమైన చిత్రాలను నివారించండి' : 'Use good lighting and avoid blurry images'}</li>
                <li>{isTelugu ? 'సమస్య ఉన్న భాగాన్ని స్పష్టంగా ఫోకస్‌లో ఉంచండి' : 'Keep the affected area in sharp focus'}</li>
                <li>{isTelugu ? 'సాధ్యమైతే ఆరోగ్యకరమైన భాగాన్ని కూడా కలిపి ఫోటో తీయండి' : 'If possible, capture both affected and healthy parts'}</li>
              </ul>
            </div>
          </div>

          {/* SECTION 4: RUN AI DIAGNOSIS CTA BUTTON */}
          <div>
            <button
              type="button"
              onClick={handleRunDiagnosis}
              disabled={!canRunDiagnosis}
              className="btn-primary-pill"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                fontSize: '0.96rem',
                fontWeight: 700,
                opacity: canRunDiagnosis ? 1 : 0.55,
                cursor: canRunDiagnosis ? 'pointer' : 'not-allowed',
                boxShadow: canRunDiagnosis ? '0 4px 12px rgba(21, 94, 50, 0.22)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {analyzing ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  <span>{PROGRESS_MESSAGES[progressIndex]}</span>
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  <span>{t('cropDiagnosis.runDiagnosis')}</span>
                </>
              )}
            </button>

            {/* Helper status below CTA button */}
            {!previewImage && !analyzing && (
              <p style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {t('cropDiagnosis.selectCropFirst')}
              </p>
            )}

            {analysisError && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  color: '#991b1b',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{analysisError}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunDiagnosis}
                  style={{
                    backgroundColor: '#991b1b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  {t('common.retry')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Initial 3-Step State OR Polished Diagnosis Result */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* STATE 1: INITIAL COMPACT 3-STEP STATE (No diagnosis yet) */}
          {!diagnosis && !analyzing && (
            <div
              className="agri-card"
              style={{
                padding: '36px 28px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#eaf5ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#155e32',
                  marginBottom: '16px'
                }}
              >
                <Sparkles size={26} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                {t('cropDiagnosis.rightInitialTitle')}
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '340px', marginBottom: '28px' }}>
                {t('cropDiagnosis.rightInitialSubtitle')}
              </p>

              {/* Simple 3-step visual workflow */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  maxWidth: '320px'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#f8faf8',
                    border: '1px solid #e5ede7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left'
                  }}
                >
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#e8f5ec',
                      color: '#155e32',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}
                  >
                    1
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', display: 'block' }}>{t('cropDiagnosis.flowStep1Title')}</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{t('cropDiagnosis.flowStep1Desc')}</span>
                  </div>
                </div>

                <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>↓</div>

                <div
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#f8faf8',
                    border: '1px solid #e5ede7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left'
                  }}
                >
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#e8f5ec',
                      color: '#155e32',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}
                  >
                    2
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', display: 'block' }}>{t('cropDiagnosis.flowStep2Title')}</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{t('cropDiagnosis.flowStep2Desc')}</span>
                  </div>
                </div>

                <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>↓</div>

                <div
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: '#f8faf8',
                    border: '1px solid #e5ede7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left'
                  }}
                >
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#e8f5ec',
                      color: '#155e32',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}
                  >
                    3
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', display: 'block' }}>{t('cropDiagnosis.flowStep3Title')}</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{t('cropDiagnosis.flowStep3Desc')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: LOADING ANALYSIS STATE */}
          {analyzing && (
            <div
              className="agri-card"
              style={{
                padding: '48px 24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#e8f5ec',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#155e32',
                  marginBottom: '20px'
                }}
              >
                <Loader2 size={32} className="animate-spin" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                {t('cropDiagnosis.analyzingCrop')}
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#155e32', fontWeight: 600, marginBottom: '6px' }}>
                {PROGRESS_MESSAGES[progressIndex]}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
                {t('cropDiagnosis.analyzingWait')}
              </p>
            </div>
          )}

          {/* STATE 3: POLISHED DIAGNOSIS RESULT */}
          {diagnosis && !analyzing && (
            <div className="agri-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Header Badges & Disclaimer */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '16px',
                        backgroundColor: '#e8f5ec',
                        color: '#155e32',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase'
                      }}
                    >
                      {t('cropDiagnosis.title')}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      • {diagnosis.cropName} ({diagnosis.fieldName || t('common.field')})
                    </span>
                  </div>

                  {diagnosis.aiModel && (
                    <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>
                      Model: {diagnosis.aiModel}
                    </span>
                  )}
                </div>

                {/* Clear AI Disclaimer Notice */}
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#fefce8',
                    border: '1px solid #fef08a',
                    fontSize: '0.74rem',
                    color: '#713f12',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>{t('cropDiagnosis.disclaimer').split(':')[0]}:</strong> {t('cropDiagnosis.disclaimer').split(':')[1] || t('cropDiagnosis.disclaimer')}
                  </span>
                </div>

                {/* Explicit Fallback Engine Notice Banner */}
                {(diagnosis.diagnosisSource === 'curated_fallback' || diagnosis.isFallback) && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#fffbeb',
                      border: '1.5px solid #fde68a',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <AlertTriangle size={18} style={{ color: '#b45309', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ fontSize: '0.84rem', color: '#92400e', display: 'block', marginBottom: '2px' }}>
                        {isTelugu ? '⚠️ దృశ్య AI విశ్లేషణ తాత్కాలికంగా అందుబాటులో లేదు' : '⚠️ Visual AI analysis unavailable'}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: '#78350f', lineHeight: 1.4 }}>
                        {isTelugu
                          ? 'మీ పంట మరియు వాతావరణ సమాచారం ఆధారంగా సాధారణ వ్యవసాయ సలహా అందించబడుతోంది.'
                          : 'General agronomy guidance is being provided based on your crop information.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Key Metrics */}
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.2 }}>
                  {diagnosis.possible_diagnosis}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {diagnosis.confidence != null && diagnosis.confidence > 0 ? (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '14px',
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                    >
                      AI {t('cropDiagnosis.confidence')}: {diagnosis.confidence}%
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '14px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        border: '1px solid #e5e7eb',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}
                    >
                      {isTelugu ? 'విశ్వసనీయత అందుబాటులో లేదు' : 'Confidence unavailable'}
                    </span>
                  )}

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '14px',
                      backgroundColor:
                        diagnosis.severity?.toLowerCase() === 'severe'
                          ? '#fef2f2'
                          : diagnosis.severity?.toLowerCase() === 'none'
                            ? '#f0fdf4'
                            : diagnosis.severity?.toLowerCase() === 'mild'
                              ? '#f0fdf4'
                              : '#fffbeb',
                      color:
                        diagnosis.severity?.toLowerCase() === 'severe'
                          ? '#b91c1c'
                          : diagnosis.severity?.toLowerCase() === 'none'
                            ? '#15803d'
                            : diagnosis.severity?.toLowerCase() === 'mild'
                              ? '#15803d'
                              : '#b45309',
                      border: '1px solid',
                      borderColor:
                        diagnosis.severity?.toLowerCase() === 'severe'
                          ? '#fecaca'
                          : diagnosis.severity?.toLowerCase() === 'none'
                            ? '#bbf7d0'
                            : diagnosis.severity?.toLowerCase() === 'mild'
                              ? '#bbf7d0'
                              : '#fde68a',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}
                  >
                    {t('cropDiagnosis.severity')}: {diagnosis.severity || t('cropDiagnosis.severityModerate')}
                  </span>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '14px',
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                  >
                    {t('common.date')}: {diagnosis.date}
                  </span>
                </div>

                {diagnosis.confidence != null && diagnosis.confidence > 0 && (
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0 }}>
                    {isTelugu
                      ? 'ఇది AI-ఆధారిత అంచనా. లక్షణాలు కొనసాగితే స్థానిక వ్యవసాయ నిపుణులతో ధృవీకరించుకోండి.'
                      : 'This is an AI-assisted assessment and should be verified with local agricultural guidance if symptoms persist.'}
                  </p>
                )}
              </div>

              {/* Symptoms */}
              {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {t('cropDiagnosis.observedSymptoms')}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#2c3e32', lineHeight: 1.5 }}>
                    {diagnosis.symptoms.map((symptom, idx) => (
                      <li key={idx}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Actions */}
              {diagnosis.recommended_actions && diagnosis.recommended_actions.length > 0 && (
                <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#155e32', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> {t('cropDiagnosis.recommendedActions')}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#14532d', lineHeight: 1.5 }}>
                    {diagnosis.recommended_actions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chemical Treatment (Only if needed or present) */}
              {diagnosis.chemical_treatment && (diagnosis.chemical_treatment.needed || diagnosis.chemical_treatment.recommendation) && (
                <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                    {t('cropDiagnosis.chemicalTreatment')}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#1e3a8a', lineHeight: 1.45, marginBottom: diagnosis.chemical_treatment.application_notes ? '4px' : 0 }}>
                    {diagnosis.chemical_treatment.recommendation}
                  </p>
                  {diagnosis.chemical_treatment.application_notes && (
                    <p style={{ fontSize: '0.76rem', color: '#3b82f6', fontStyle: 'italic', margin: 0 }}>
                      Note: {diagnosis.chemical_treatment.application_notes}
                    </p>
                  )}
                </div>
              )}

              {/* Organic Alternative */}
              {diagnosis.organic_alternative && (
                <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#fefce8', border: '1px solid #fef08a' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#854d0e', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={15} /> {t('cropDiagnosis.organicAlternative')}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#713f12', lineHeight: 1.45, margin: 0 }}>
                    {diagnosis.organic_alternative}
                  </p>
                </div>
              )}

              {/* Prevention */}
              {diagnosis.prevention && diagnosis.prevention.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {t('cropDiagnosis.futurePrevention')}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                    {diagnosis.prevention.map((prev, idx) => (
                      <li key={idx}>{prev}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weather Consideration (Real-time weather integration) */}
              <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CloudSun size={16} color="#0284c7" /> {t('cropDiagnosis.weatherConsideration')}
                </h4>
                <p style={{ fontSize: '0.81rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                  {diagnosis.weather_consideration || 'Weather data unavailable. Recommendations are based on crop and image analysis.'}
                </p>
              </div>

              {/* Follow-up Note */}
              {diagnosis.follow_up && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                  <strong>{t('cropDiagnosis.followUp')}:</strong> {diagnosis.follow_up}
                </p>
              )}

              {/* Action Buttons: Save & New Diagnosis */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleSaveDiagnosis}
                  disabled={saving || savedSuccess}
                  className="btn-primary-pill"
                  style={{
                    flex: '1',
                    minWidth: '180px',
                    justifyContent: 'center',
                    padding: '11px 18px',
                    fontSize: '0.88rem',
                    backgroundColor: savedSuccess ? '#15803d' : '#155e32'
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t('cropDiagnosis.savingToHistory')}</span>
                    </>
                  ) : savedSuccess ? (
                    <>
                      <Check size={16} />
                      <span>{t('cropDiagnosis.savedToHistory')}</span>
                    </>
                  ) : (
                    <>
                      <BookmarkCheck size={16} />
                      <span>{t('cropDiagnosis.saveDiagnosis')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetWorkflow}
                  style={{
                    padding: '11px 18px',
                    borderRadius: '24px',
                    border: '1.5px solid var(--border-subtle)',
                    backgroundColor: '#ffffff',
                    color: 'var(--text-body)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={15} />
                  <span>{t('cropDiagnosis.diagnoseAnother')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
