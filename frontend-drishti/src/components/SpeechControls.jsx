import React, { useState, useEffect } from 'react';
import { Volume2, Play, Sliders } from 'lucide-react';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export const SpeechControls = () => {
  const { speechRate, setSpeechRate, speechPitch, setSpeechPitch, autoSpeak, setAutoSpeak } = useAccessibility();
  const [voices, setVoices] = useState([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState('');

  useEffect(() => {
    const updateVoices = () => {
      const v = speechService.getVoices();
      setVoices(v);
      if (speechService.selectedVoice) {
        setSelectedVoiceUri(speechService.selectedVoice.voiceURI);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleVoiceChange = (e) => {
    const uri = e.target.value;
    setSelectedVoiceUri(uri);
    speechService.setVoice(uri);
  };

  const handleTestVoice = () => {
    speechService.speak(`Hello! Drishti speech synthesis is configured at ${speechRate}x speed.`);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
          <Sliders className="w-4 h-4 text-indigo-400" /> Speech & Audio Settings
        </span>
        <button
          onClick={handleTestVoice}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          <Play className="w-3 h-3 fill-current" /> Test Voice
        </button>
      </div>

      {/* Voice Selection */}
      {voices.length > 0 && (
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Text-to-Speech Voice</label>
          <select
            value={selectedVoiceUri}
            onChange={handleVoiceChange}
            className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Speech Rate Slider */}
      <div>
        <div className="flex justify-between text-slate-400 mb-1">
          <span>Speaking Rate (Speed)</span>
          <span className="font-mono text-indigo-300 font-semibold">{speechRate.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.6"
          max="2.0"
          step="0.1"
          value={speechRate}
          onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>

      {/* Speech Pitch Slider */}
      <div>
        <div className="flex justify-between text-slate-400 mb-1">
          <span>Voice Pitch</span>
          <span className="font-mono text-indigo-300 font-semibold">{speechPitch.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0.6"
          max="1.5"
          step="0.1"
          value={speechPitch}
          onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>

      {/* Auto-Speak Result Toggle */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-slate-300">Automatically Speak New Scans</span>
        <button
          type="button"
          role="switch"
          aria-checked={autoSpeak}
          onClick={() => setAutoSpeak(!autoSpeak)}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
            autoSpeak ? 'bg-indigo-600' : 'bg-slate-800'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              autoSpeak ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
