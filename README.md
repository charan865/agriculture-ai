# 🌱 AgriAI — Your Farming Companion (మీ వ్యవసాయ సహచరుడు)

> **Intelligent Agricultural Platform powered by Google Gemini Multimodal Vision, Precision Agrometeorology, and Native English & Telugu Localization.**

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Multimodal_Vision-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![i18n](https://img.shields.io/badge/i18n-English_%26_Telugu-2e7d32)](https://github.com)

---

## 📖 Overview

**AgriAI** is a modern agronomic decision-support platform designed to empower smallholder and commercial farmers. By combining **Google Gemini Multimodal Vision** with hyper-local weather intelligence and regional language accessibility, AgriAI delivers instant, laboratory-grade plant pathology insights directly in the field.

---

## 🚀 Key Features

### 1. 🔍 Multimodal AI Crop Diagnosis (`/api/diagnoses/analyze`)
- **Visual Leaf Pathology**: Upload leaf, stem, or fruit photos for instant disease diagnosis.
- **Detailed Pathology Profiles**: Detects pathogens (e.g. *Early Blight*, *Powdery Mildew*, *Leaf Curl*) with observed symptoms (concentric rings, chlorotic halos, leaf wilting).
- **Dual Treatment Regimens**:
  - **Chemical Treatments**: Actionable active ingredients (e.g. Mancozeb, Chlorothalonil) with pesticide label safety precautions.
  - **Organic & Bio-Control**: Organic alternatives (Neem oil 1500ppm, *Trichoderma viride*, *Bacillus subtilis*).
- **Weather-Correlated Advice**: Cross-references local ambient temperature and rain probability before recommending spray timing.
- **Healthy Plant Recognition**: Accurately recognizes healthy crops (*"No Obvious Disease Symptoms Detected"*, severity: `None`, chemical needed: `false`) without hallucinating diseases.
- **Non-Plant & Quality Pre-flight Checks**: Rejects corrupt, dark, or indistinct files client-side before sending useless API calls.
- **Curated Fallback Engine**: If Gemini is offline or rate-limited, the system seamlessly transitions to a general crop advisory banner with `confidence: null`—**never fabricating fake visual diagnoses**.
- **SQLite History**: Persists diagnoses to disk with image thumbnails and language tags.

### 2. 🌤️ Precision Weather Intelligence
- **Geolocation Integration**: Browser GPS detection with permission handling and fallback caching.
- **Comprehensive Agrometeorology**: Live temperature, relative humidity, wind speed, precipitation probability, and weather conditions.
- **Foliage Spraying Windows**: Evaluates wind speed and precipitation to alert farmers to optimal foliar application windows.

### 3. 🌐 Complete English & Telugu Localization (i18n)
- **Zero Raw Key Leaks**: 100% of all 200+ UI strings are localized in both **English** and **Telugu (తెలుగు)**.
- **Native Telugu Agronomy**: Crop diseases, chemical dosages, organic practices, and weather advisories are delivered in natural, fluent Telugu.
- **Global State Synchronization**: Topbar and Settings language toggles synchronize instantly and persist in `localStorage`.

### 4. 🌾 Native Animated Startup Splash Screen
- **6-Phase Botanical Animation**:
  $$\text{Seed} \longrightarrow \text{Sprout} \longrightarrow \text{Growth} \longrightarrow \text{AgriAI Logo} \longrightarrow \text{Tagline} \longrightarrow \text{Dashboard}$$
- **CSS-Powered & Lightweight**: Built purely with React 19, CSS keyframes, and vector SVG—zero heavy video or GIF assets.
- **Accessibility**: Full `prefers-reduced-motion` compliance.
- **Responsive**: Centered layout tested across desktop, tablet, and mobile.
- **Zero Artificial Latency**: Runs initialization in parallel and never replays on internal tab navigation.

### 5. 🚜 Farm & Plot Management
- Manage registered crops, acreage, planting dates, growth stages (Vegetative, Flowering, Fruiting, Harvest), soil types, and irrigation methods.
- Built-in demonstration controls for testing empty states and populated crop states.

---

## 🏗️ Architecture & Project Structure

```
agriculture-ai/
├── public/                     # Static assets & test images
│   ├── uploads/                # Persisted leaf photos (.gitkeep)
│   ├── agri_robot.jpg          # Non-plant test asset
│   ├── test_healthy_leaf.jpg   # Verified healthy tomato leaf
│   └── test_diseased_leaf.jpg  # Verified early-blight leaf
├── server/                     # Express & Node.js backend
│   ├── routes/                 # API route controllers
│   │   ├── ai.js               # AI assistant & agronomy chat
│   │   ├── crops.js            # User crop management
│   │   ├── diagnoses.js        # Leaf analysis & SQLite persistence
│   │   ├── farmer.js           # Farmer profile
│   │   └── weather.js          # Agrometeorology service
│   ├── services/
│   │   └── geminiService.js    # Gemini 3.x cascade & curated fallback
│   ├── db.js                   # SQLite database initialization
│   └── index.js                # Server entry point (port 5001)
├── src/                        # React 19 + TypeScript frontend
│   ├── components/
│   │   ├── Common/             # Reusable UI cards, badges, buttons
│   │   ├── Dashboard/          # Hero banner, weather card, quick tips
│   │   ├── Layout/             # Sidebar, topbar, responsive layout
│   │   ├── SplashScreen/       # Native animated startup component
│   │   └── Views/              # Dedicated full-page views:
│   │       ├── AIAssistantView.tsx
│   │       ├── CropDiagnosisView.tsx
│   │       ├── DiagnosisHistoryView.tsx
│   │       ├── MyCropsView.tsx
│   │       ├── SettingsView.tsx
│   │       └── WeatherAlertsView.tsx
│   ├── context/                # LanguageContext (en / te sync)
│   ├── locales/                # Locale dictionaries (en.ts, te.ts)
│   ├── services/               # Frontend API client services
│   ├── types/                  # TypeScript interface definitions
│   ├── App.tsx                 # Root application component
│   ├── index.css               # Design tokens & core typography
│   └── main.tsx                # React DOM mount point
├── tests/                      # Automated validation suites
│   ├── test_pipeline_suite.mjs # 6-phase crop diagnosis test suite
│   └── check_i18n.mjs          # i18n synchronization scanner
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules for node, dist, keys
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite bundler configuration
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Google Gemini API Key**: Obtain a free key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/agriculture-ai.git
cd agriculture-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your API key:
```env
PORT=5001
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Start the Backend API Server
```bash
npm run server
```
*The backend starts at `http://localhost:5001` with SQLite database initialized at `agri_data.sqlite`.*

### 4. Start the Frontend Development Server
In a separate terminal window:
```bash
npm run dev
```
*The web application opens at `http://localhost:5173`.*

---

## 🧪 Testing & Verification

AgriAI includes automated test suites to ensure pipeline integrity and localization completeness:

### 1. Run the Full Crop Diagnosis Test Suite
Verifies image validation (empty, tiny, corrupted, oversized), non-plant detection, real healthy leaves, real diseased leaves, native Telugu responses, and SQLite persistence:
```bash
npm run test:pipeline
```

### 2. Run the Localization & i18n Scanner
Scans the entire codebase to guarantee 0 missing translation keys across English and Telugu:
```bash
npm run test:i18n
```

### 3. Build for Production
Verifies TypeScript type integrity and produces an optimized production bundle:
```bash
npm run build
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/diagnoses/analyze` | Multimodal AI leaf diagnosis with crop and weather context |
| `POST` | `/api/diagnoses` | Saves verified diagnosis to SQLite with image storage |
| `GET` | `/api/diagnoses` | Fetches historical diagnosis logs with thumbnail URLs |
| `DELETE` | `/api/diagnoses/:id` | Deletes a diagnosis record and associated image |
| `GET` | `/api/crops` | Retrieves registered user crops |
| `POST` | `/api/crops` | Registers a new crop plot |
| `DELETE` | `/api/crops/:id` | Deletes a crop plot |
| `POST` | `/api/ai/chat` | Agricultural chatbot with crop & weather context (English/Telugu) |
| `GET` | `/api/weather/current` | Returns live agrometeorology for given latitude & longitude |

---

## 📄 License

This project is licensed under the **MIT License**.
