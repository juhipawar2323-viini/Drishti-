# 👁️ DRISHTI — Eyes for the Blind
### *AI-Powered Visual Accessibility Assistant for the Visually Impaired*

**Drishti** is a production-style, accessibility-first full-stack application designed to empower blind and visually impaired users to perceive, navigate, and comprehend their surroundings in real-time through intelligent camera vision and natural speech synthesis.

---

## 🚀 Key Features

* **📷 Multimodal Real-Time Camera Vision**:
  - Live video stream using Web Camera API (`getUserMedia`) with rear camera preference (`facingMode: 'environment'`).
  - Radar-line visual scan animation and tactile crosshair target indicators.
  - Device camera switching and torch/flashlight toggle support.
  - Image upload fallback for non-camera environments.

* **🎯 5 Specialized Assistance Modes**:
  1. **🌟 General Scene Description**: Concise summary of surroundings, layout, people, and lighting.
  2. **📖 Text & Document Reader (OCR)**: Reads signs, documents, book pages, medicine labels, and expiry dates verbatim.
  3. **💵 Currency & Denomination Identifier**: Detects banknotes and coins (e.g. INR ₹500, USD $20), counts, and totals.
  4. **⚠️ Hazard & Obstacle Alert**: Prioritizes trip hazards, descending/ascending stairs, curbs, low ceilings, and oncoming obstacles.
  5. **🔍 Object Locator / Finder**: Pinpoints items (keys, glasses, phones, cups) using spatial clock-face coordinates ("at 2 o'clock, 40 cm away").

* **🗣️ High-Quality Auditory Feedback & Speech Synthesis**:
  - Text-to-Speech (TTS) using Web Speech Synthesis API with custom speed (0.6x - 2.0x), pitch, and natural voices.
  - Synthesized Web Audio API tactile audio cues (shutter click, success melodic chimes, error buzzes, mode switches).
  - Hands-free voice commands via Web Speech Recognition API:
    - *"Capture"* / *"Scan"*
    - *"Describe scene"* / *"Read text"* / *"Currency"* / *"Hazard"* / *"Find [object]"*
    - *"Repeat"* / *"Stop"*
  - Haptic vibration feedback (`navigator.vibrate`).

* **♿ Accessible Design & Accessibility Features**:
  - **High-Contrast Theme**: Yellow-on-Black palette optimized for low-vision and photophobia.
  - **Dynamic Typography Scaling**: Default, Large (+20%), and Extra Large (+40%).
  - **Screen Reader Friendly**: Dedicated `aria-live="polite"` and `aria-live="assertive"` announcers.
  - **Tactile Large Capture Button**: Centralized, high-contrast, keyboard-triggered.
  - **Continuous Walking Assist**: Optional hands-free continuous scan every 8 seconds.

* **⌨️ Keyboard Shortcuts**:
  - <kbd>Space</kbd> : Instant Capture & Scan
  - <kbd>1</kbd> to <kbd>5</kbd> : Switch between the 5 Vision Modes
  - <kbd>R</kbd> : Repeat last spoken auditory description
  - <kbd>S</kbd> : Silence / Stop audio speech
  - <kbd>H</kbd> : Toggle Scan History drawer
  - <kbd>V</kbd> : Toggle Voice Command Listener

---

## 🏗️ Architecture & Technology Stack

```
Drishti AI/
├── backend-drishti/             # Express.js MVC Backend (Port 5000)
│   ├── src/
│   │   ├── config/              # Supabase & Environment configs
│   │   ├── controllers/         # authController, scanController, aiController
│   │   ├── middleware/          # authMiddleware, uploadMiddleware, rateLimiter, errorHandler
│   │   ├── models/              # UserModel, ScanModel
│   │   ├── routes/              # authRoutes, scanRoutes, aiRoutes
│   │   ├── services/            # aiService (Provider-independent), storageService
│   │   ├── app.js               # Express application
│   │   └── server.js            # Server entrypoint
│   └── .env                     # Supabase & AI keys configuration
│
└── frontend-drishti/            # Vite + React Frontend (Port 5173)
    ├── src/
    │   ├── components/          # CameraView, CameraControls, CaptureButton, AnalysisResult, etc.
    │   ├── context/             # AuthContext, AccessibilityContext
    │   ├── services/            # api, speechService, soundService, voiceRecognitionService
    │   ├── App.jsx              # Main view orchestrator
    │   ├── index.css            # Accessible styles & High-contrast themes
    │   └── main.jsx
    └── vite.config.js
```

### Backend
* **Runtime**: Node.js v24
* **Framework**: Express.js (MVC Pattern)
* **Database & Storage**: Supabase (PostgreSQL with Row Level Security + Storage Buckets)
* **Security**: Helmet, CORS, JWT authentication, bcryptjs password hashing, express-rate-limit
* **Image Processing**: Multer memory storage (up to 15MB)

### AI Service Layer (`src/services/aiService.js`)
* **Provider-Independent Architecture**:
  - Supports **Google Gemini** (`gemini-2.5-flash`), **OpenAI** (`gpt-4o-mini`, `gpt-4o`), **OpenRouter**, and **Groq**.
  - No provider is hardcoded; configured via `AI_PROVIDER`, `AI_MODEL`, and `AI_API_KEY` in `backend-drishti/.env` or updated at runtime in the app settings modal.
  - Built-in intelligent offline neural fallback mode ensures the application functions smoothly even before an API key is configured.

---

## 🛠️ Getting Started

### 1. Backend Setup
```bash
cd backend-drishti
npm install
npm run dev
# Running on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend-drishti
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🔐 Environment Configuration

In `backend-drishti/.env`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=drishti_super_secure_jwt_secret_accessibility_2026
JWT_EXPIRES_IN=7d

# Supabase
SUPABASE_URL=https://wicascsluggzcvynzvom.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_STORAGE_BUCKET=drishti-scans

# AI Vision Provider (gemini | openai | openrouter | groq)
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
AI_API_KEY=YOUR_GEMINI_API_KEY
```
