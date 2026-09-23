import React, { useState, useEffect } from 'react';
import { Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './SplashScreen.css';

interface SplashScreenProps {
  /** Optional callback fired when the splash animation completes and fades out */
  onComplete?: () => void;
  /** Minimum duration in milliseconds to display the animation (default: 2500ms) */
  minDurationMs?: number;
  /** Whether the underlying app is ready (default: true) */
  isAppReady?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDurationMs = 2500,
  isAppReady = true
}) => {
  const { t } = useLanguage();
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const effectiveDuration = mediaQuery.matches ? 1300 : minDurationMs;

    const timer = setTimeout(() => {
      setIsAnimationDone(true);
    }, effectiveDuration);

    return () => clearTimeout(timer);
  }, [minDurationMs]);

  // When animation timeline has elapsed AND the app is initialized, begin graceful exit transition
  useEffect(() => {
    if (isAnimationDone && isAppReady && !isExiting) {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 320); // Faster exit transition (320ms) to reveal dashboard promptly

      return () => clearTimeout(exitTimer);
    }
  }, [isAnimationDone, isAppReady, isExiting, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`agri-splash-overlay ${isExiting ? 'exiting' : ''}`}
      role="status"
      aria-label="AgriAI - Your Farming Companion"
      aria-live="polite"
    >
      {/* Soft Ambient Backlight Glow */}
      <div className="agri-splash-glow" aria-hidden="true" />

      <div className="agri-splash-content">
        {/* Animated Stage: Seed -> Sprout -> Growth -> Brand Logo Badge (1.5-2x larger) */}
        <div className="agri-splash-stage" aria-hidden="true">
          <svg
            className="agri-splash-svg"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ground line */}
            <path
              className="agri-ground"
              d="M 16 78 Q 50 74 84 78"
              stroke="#b2cbb5"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Stem (thicker, bolder upward growth) */}
            <path
              className="agri-stem"
              d="M 50 74 C 48 58, 53 44, 50 26"
              stroke="#155e32"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* First Leaf (Left Sprout - broader and clearer) */}
            <path
              className="agri-leaf-first"
              d="M 50 54 C 34 50, 30 36, 40 30 C 48 34, 50 46, 50 54 Z"
              fill="#2e7d32"
            />

            {/* Second Leaf (Right Growth) */}
            <path
              className="agri-leaf-second"
              d="M 50 42 C 66 38, 70 24, 60 18 C 52 22, 50 34, 50 42 Z"
              fill="#1b5e20"
            />

            {/* Top Leaf (Apex Growth) */}
            <path
              className="agri-leaf-top"
              d="M 50 28 C 45 16, 55 16, 50 8 C 46 13, 47 21, 50 28 Z"
              fill="#4caf50"
            />

            {/* Phase 1: Seed (1.5-2x larger and more vivid) */}
            <g className="agri-seed">
              <ellipse
                className="agri-seed-glow"
                cx="50"
                cy="74"
                rx="14"
                ry="10"
                fill="rgba(46, 125, 50, 0.24)"
              />
              <ellipse cx="50" cy="74" rx="10" ry="7.2" fill="#5d4037" />
              <ellipse
                cx="50"
                cy="73"
                rx="7.5"
                ry="4.5"
                fill="#795548"
              />
              <path
                d="M 45 72 Q 50 69 55 72"
                stroke="#d7ccc8"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>
          </svg>

          {/* Phase 4: Brand Logo Badge Morph (replaces plant at 1.8s) */}
          <div className="agri-brand-badge">
            <Sprout size={44} strokeWidth={2.4} />
          </div>
        </div>

        {/* Phase 4 & 5: Brand Typography & Tagline */}
        <div className="agri-splash-brand">
          <h1 className="agri-splash-title">AgriAI</h1>
          <p className="agri-splash-companion">
            {t('splash.companion') || t('common.appTagline') || 'Your Farming Companion'}
          </p>
          <div className="agri-splash-tagline">
            {t('splash.tagline') || 'Smarter Farming. Brighter Tomorrow.'}
          </div>
        </div>
      </div>
    </div>
  );
};
