import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CameraView } from './components/CameraView';
import { CameraControls, MODES } from './components/CameraControls';
import { CaptureButton } from './components/CaptureButton';
import { ImagePreview } from './components/ImagePreview';
import { AnalysisResult } from './components/AnalysisResult';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AuthModal } from './components/AuthModal';
import { VoiceCommandsModal } from './components/VoiceCommandsModal';
import { SettingsModal } from './components/SettingsModal';
import { EmergencyModal } from './components/EmergencyModal';
import { ScreenReaderAnnouncer } from './components/ScreenReaderAnnouncer';
import { scanApi, aiApi } from './services/api';
import { speechService } from './services/speechService';
import { soundService } from './services/soundService';
import { voiceRecognitionService } from './services/voiceRecognitionService';
import { useAccessibility } from './context/AccessibilityContext';
import { AlertCircle, Timer, Key, Check, Sparkles, Loader2, Cpu } from 'lucide-react';

export default function App() {
  const cameraRef = useRef(null);
  const resultRef = useRef(null);

  const [activeMode, setActiveMode] = useState('general');
  const [customPrompt, setCustomPrompt] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Modals state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [voiceHelpOpen, setVoiceHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // Quick API Key state
  const [showApiKeyBar, setShowApiKeyBar] = useState(false);
  const [quickApiKey, setQuickApiKey] = useState('');
  const [apiKeySuccess, setApiKeySuccess] = useState(false);

  // Continuous auto-scan
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const autoScanTimerRef = useRef(null);

  // Voice recognition state
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const { autoSpeak, announce, triggerHaptic } = useAccessibility();

  // Check backend AI status on initial load
  useEffect(() => {
    aiApi.getStatus().then((res) => {
      if (res.success && !res.data.hasKey) {
        setShowApiKeyBar(true);
      }
    }).catch(console.warn);
  }, []);

  // Mode change side-effects (e.g. Safety Alert continuous beep)
  useEffect(() => {
    if (activeMode === 'hazard') {
      soundService.startSafetyBeep();
      announce('Safety alert mode active. Warning beeper enabled with red alert screen.', true);
    } else {
      soundService.stopSafetyBeep();
    }

    return () => {
      soundService.stopSafetyBeep();
    };
  }, [activeMode]);

  // Voice recognition handler setup
  useEffect(() => {
    voiceRecognitionService.onStatusChange = (listening) => {
      setIsVoiceListening(listening);
      if (listening) {
        soundService.playListening();
        announce('Voice assistant is listening for your command.', true);
      }
    };

    voiceRecognitionService.onCommand = (cmd) => {
      triggerHaptic([50, 50]);

      if (cmd.type === 'RETAKE') {
        handleRetake();
      } else if (cmd.type === 'CAPTURE') {
        handleCapture();
      } else if (cmd.type === 'EMERGENCY') {
        setEmergencyOpen(true);
        const contactNum = localStorage.getItem('drishti_emergency_number') || '112';
        speechService.speak(`Emergency mode opened. Universal emergency number is ${contactNum}.`);
      } else if (cmd.type === 'MODE') {
        setActiveMode(cmd.mode);
        if (cmd.prompt) setCustomPrompt(cmd.prompt);
        if (cmd.mode !== 'hazard') {
          soundService.stopSafetyBeep();
          soundService.playModeSwitch();
        }
        announce(`Switched to ${cmd.mode} mode.`, true);
      } else if (cmd.type === 'REPEAT') {
        speechService.repeatLast();
      } else if (cmd.type === 'STOP') {
        speechService.stop();
        soundService.stopSafetyBeep();
        announce('Audio silenced.');
      } else if (cmd.type === 'UNKNOWN') {
        announce(`Heard: "${cmd.phrase}". Say help or describe to navigate.`);
      }
    };

    voiceRecognitionService.onError = (err) => {
      console.warn('Voice recognition error:', err);
    };

    return () => {
      voiceRecognitionService.stop();
    };
  }, [activeMode, customPrompt]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '1') {
        setActiveMode('general');
        announce('Switched to General Scene mode.', true);
      } else if (e.key === '2') {
        setActiveMode('text');
        announce('Switched to Read Text & Medicine mode.', true);
      } else if (e.key === '3') {
        setActiveMode('currency');
        announce('Switched to Indian Rupee Currency mode.', true);
      } else if (e.key === '4') {
        setActiveMode('hazard');
        announce('Switched to Safety Alert & Obstacle mode.', true);
      } else if (e.key === '5') {
        setActiveMode('object');
        announce('Switched to Find Object with Clock Position mode.', true);
      } else if (e.key === 'Escape' || (e.key === 'Backspace' && capturedImage)) {
        handleRetake();
      } else if (e.key.toLowerCase() === 'r') {
        speechService.repeatLast();
      } else if (e.key.toLowerCase() === 's') {
        speechService.stop();
        soundService.stopSafetyBeep();
      } else if (e.key.toLowerCase() === 'h') {
        setHistoryOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'v') {
        handleToggleVoice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [announce]);

  // Walking auto-scan timer
  useEffect(() => {
    if (autoScanEnabled) {
      announce('Continuous walking assistance enabled. Scanning every 8 seconds.', true);
      autoScanTimerRef.current = setInterval(() => {
        handleCapture();
      }, 8000);
    } else {
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current);
        autoScanTimerRef.current = null;
      }
    }

    return () => {
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current);
      }
    };
  }, [autoScanEnabled, activeMode]);

  const handleToggleVoice = () => {
    if (!voiceRecognitionService.isSupported()) {
      announce('Speech recognition is not supported in this browser. Please use keyboard shortcuts or buttons.', true);
      return;
    }
    voiceRecognitionService.toggle();
  };

  // Perform Vision Analysis
  const performAnalysis = async (imageData) => {
    setIsAnalyzing(true);
    setError(null);

    // Scroll to status immediately so user sees live feedback
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    try {
      const response = await scanApi.createScan(
        imageData.blob || imageData.base64,
        activeMode,
        customPrompt
      );

      if (response.success && response.data) {
        setAnalysisResult(response.data);
        soundService.playSuccess();
        triggerHaptic([100, 50, 100]);

        const hasHazards = response.data.hazards && response.data.hazards.length > 0 && response.data.hazards[0] !== 'None detected';
        if (hasHazards) {
          soundService.playHazardAlert();
        }

        if (autoSpeak) {
          const speakText = hasHazards
            ? `Safety Warning: ${response.data.hazards.join('. ')}. ${response.data.summary}`
            : response.data.summary;
          speechService.speak(speakText);
        }

        // Scroll to the result card
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        throw new Error(response.message || 'Analysis failed');
      }
    } catch (err) {
      console.error('Scan error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unable to analyze image. Please try again.';
      setError(errMsg);
      soundService.playError();
      announce(`Error: ${errMsg}`, true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Capture current frame
  const handleCapture = async () => {
    if (isAnalyzing) return;

    if (cameraRef.current) {
      const frame = await cameraRef.current.capture();
      if (frame) {
        setCapturedImage(frame.base64);
        performAnalysis(frame);
      } else {
        announce('Could not capture frame. Ensure camera is active.', true);
      }
    }
  };

  const handleImageUploaded = (data) => {
    setCapturedImage(data.base64);
    performAnalysis(data);
  };

  // 🔄 RETAKE HANDLER (Voice "Retake" or Button Click)
  const handleRetake = () => {
    speechService.stop();
    setCapturedImage(null);
    setAnalysisResult(null);
    setError(null);
    soundService.playModeSwitch();
    triggerHaptic([40, 40]);
    announce('Camera reset. Ready to capture a new picture.', true);
  };

  // Quick 1-click API key save
  const handleSaveQuickKey = async (e) => {
    e.preventDefault();
    if (!quickApiKey.trim()) return;

    try {
      const res = await aiApi.updateConfig({
        provider: 'gemini',
        apiKey: quickApiKey.trim(),
        model: 'gemini-1.5-flash'
      });
      if (res.success) {
        setApiKeySuccess(true);
        setShowApiKeyBar(false);
        announce('Gemini API Key activated for real-time camera vision!', true);
      }
    } catch (err) {
      console.warn('API key save error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <ScreenReaderAnnouncer />

      {/* Top Navbar */}
      <Navbar
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenVoiceHelp={() => setVoiceHelpOpen(true)}
        onOpenEmergency={() => setEmergencyOpen(true)}
        isListening={isVoiceListening}
        onToggleVoice={handleToggleVoice}
      />

      {/* Quick Gemini API Key Banner (If key not configured in .env) */}
      {showApiKeyBar && (
        <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-slate-900 px-4 py-2 border-b border-indigo-500/40 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-white font-medium">
              Connect Google Gemini for live camera object parsing:
            </span>
          </div>
          <form onSubmit={handleSaveQuickKey} className="flex items-center gap-1.5 flex-1 max-w-md">
            <div className="relative flex-1">
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="password"
                value={quickApiKey}
                onChange={(e) => setQuickApiKey(e.target.value)}
                placeholder="Paste Gemini API Key..."
                className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-slate-950/80 border border-indigo-400/50 text-white text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
            >
              Activate
            </button>
            <button
              type="button"
              onClick={() => setShowApiKeyBar(false)}
              className="px-2 py-1 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </form>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-5">
        {/* Mode Selector Strip */}
        <section aria-label="Detection Modes">
          <CameraControls
            activeMode={activeMode}
            onSelectMode={(mode) => setActiveMode(mode)}
            customPrompt={customPrompt}
            onChangeCustomPrompt={setCustomPrompt}
          />
        </section>

        {/* Viewport: Live Camera Feed with Safety Strobe or Frozen Preview */}
        <section aria-label="Visual Feed" className="w-full">
          {capturedImage && analysisResult ? (
            <ImagePreview
              imageBase64={capturedImage}
              onRetake={handleRetake}
            />
          ) : (
            <CameraView
              ref={cameraRef}
              onImageCaptured={handleImageUploaded}
              isAnalyzing={isAnalyzing}
              isSafetyAlertMode={activeMode === 'hazard'}
            />
          )}
        </section>

        {/* Primary Tactile Capture Button & Continuous Walking Assist */}
        <section aria-label="Camera Actions" className="flex flex-col items-center justify-center gap-3">
          <CaptureButton
            onCapture={handleCapture}
            isAnalyzing={isAnalyzing}
            disabled={false}
          />

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs shadow">
            <Timer className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 font-medium">Continuous Walking Assist (Every 8s)</span>
            <button
              type="button"
              role="switch"
              aria-checked={autoScanEnabled}
              onClick={() => setAutoScanEnabled(!autoScanEnabled)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ml-1 ${
                autoScanEnabled ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoScanEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Error notification if any */}
        {error && (
          <div role="alert" className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-between text-rose-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-white font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Live Analyzing Card (Shows directly in view while processing) */}
        {isAnalyzing && (
          <div
            ref={resultRef}
            className="p-6 rounded-3xl bg-slate-900/95 border-2 border-indigo-500/80 shadow-2xl flex flex-col items-center justify-center gap-3 text-center animate-pulse"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center animate-spin">
              <Loader2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white tracking-wide">
              Analyzing General Scene Surroundings...
            </h3>
            <p className="text-xs text-indigo-200 font-medium max-w-md">
              Detecting people count, laptop, water bottle, charger, and spatial layout
            </p>
          </div>
        )}

        {/* Visual Analysis Results (Auto-scrolled into full view) */}
        {analysisResult && (
          <div ref={resultRef}>
            <AnalysisResult
              result={analysisResult}
              onRepeatSpeech={() => speechService.repeatLast()}
              onRetake={handleRetake}
            />
          </div>
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="border-t border-slate-900 py-3 px-6 text-center text-xs text-slate-500 bg-slate-950/70">
        <p>
          Drishti • Voice Commands: <span className="text-slate-300 font-semibold">"Tap to scan"</span>, <span className="text-slate-300 font-semibold">"Retake"</span>, <span className="text-slate-300 font-semibold">"Safety alert"</span>, <span className="text-slate-300 font-semibold">"Find keys"</span>, <span className="text-slate-300 font-semibold">"Read medicine"</span>, <span className="text-slate-300 font-semibold">"Currency"</span>, <span className="text-slate-300 font-semibold">"Emergency"</span>
        </p>
      </footer>

      {/* Modals */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectScan={(scan) => {
          setAnalysisResult(scan);
          if (scan.image_url) setCapturedImage(scan.image_url);
          speechService.speak(scan.summary);
        }}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      <VoiceCommandsModal
        isOpen={voiceHelpOpen}
        onClose={() => setVoiceHelpOpen(false)}
        isListening={isVoiceListening}
        onToggleVoice={handleToggleVoice}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
      />
    </div>
  );
}
