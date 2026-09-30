import React, { useState, useEffect } from 'react';
import { X, Sliders, Sun, Volume2, Type, Cpu, Key, Check, Info } from 'lucide-react';
import { SpeechControls } from './SpeechControls';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { aiApi } from '../services/api';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { 
    highContrast, 
    setHighContrast, 
    fontSize, 
    setFontSize, 
    audioCues, 
    setAudioCues,
    announce 
  } = useAccessibility();

  const { user, updateUserPreferences } = useAuth();

  const [aiInfo, setAiInfo] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('gemini');

  useEffect(() => {
    if (isOpen) {
      aiApi.getStatus().then((res) => {
        if (res.success) {
          setAiInfo(res.data);
          setSelectedProvider(res.data.provider || 'gemini');
        }
      }).catch(console.warn);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAIKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    try {
      const res = await aiApi.updateConfig({
        provider: selectedProvider,
        apiKey: apiKeyInput.trim(),
      });
      if (res.success) {
        setKeySaved(true);
        announce('AI credentials updated successfully.');
        setTimeout(() => setKeySaved(false), 3000);
      }
    } catch (err) {
      console.warn('AI config error:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Drishti Preferences and Settings"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Accessibility & System Settings</h2>
            <p className="text-xs text-slate-400">Tailor speech, visuals, and AI engine preferences</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* TTS Controls Component */}
          <SpeechControls />

          {/* Visual Display Adjustments */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" /> Visual Accessibility
            </h3>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">High Contrast Yellow-on-Black</p>
                <p className="text-[11px] text-slate-400">Maximum visibility contrast for low vision</p>
              </div>
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  highContrast ? 'bg-yellow-400' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    highContrast ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
                  }`}
                />
              </button>
            </div>

            {/* Font Size Booster */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-400" /> Typography Scale
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Default' },
                  { id: 'large', label: 'Large (120%)' },
                  { id: 'xl', label: 'X-Large (140%)' }
                ].map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setFontSize(size.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      fontSize === size.id
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Vision Model & Provider Info */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> AI Vision Engine
            </h3>

            {aiInfo && (
              <div className="p-2.5 rounded-xl bg-slate-900 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Current Provider:</span>
                  <span className="font-semibold text-white capitalize">{aiInfo.provider}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Active Model:</span>
                  <span className="font-mono text-indigo-300">{aiInfo.model}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>API Key Configured:</span>
                  <span className={`font-semibold ${aiInfo.hasKey ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {aiInfo.hasKey ? 'Yes (Live Vision)' : 'No (Using Offline Neural Fallback)'}
                  </span>
                </div>
              </div>
            )}

            {/* Runtime API Key input */}
            <form onSubmit={handleSaveAIKey} className="space-y-2 pt-1">
              <label className="block text-[11px] text-slate-400">
                Optional: Supply or update API key at runtime
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="groq">Groq</option>
                </select>
                <div className="relative flex-1">
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Enter API Key..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                >
                  {keySaved ? <Check className="w-4 h-4 text-emerald-300" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
