import React from 'react';
import { Eye, BookOpen, Banknote, AlertTriangle, Search } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { soundService } from '../services/soundService';

export const MODES = [
  {
    id: 'general',
    label: 'General Scene',
    subLabel: 'People & Objects',
    icon: Eye,
    color: 'from-blue-600 to-indigo-600',
    description: 'Counts people & itemizes laptop, bottle, charger, layout',
    voiceHint: 'Say "General" or "Describe"'
  },
  {
    id: 'text',
    label: 'Read Text',
    subLabel: 'Medicine & Books',
    icon: BookOpen,
    color: 'from-emerald-600 to-teal-600',
    description: 'Reads medicines, signs, books, and labels verbatim',
    voiceHint: 'Say "Read text" or "Medicine"'
  },
  {
    id: 'currency',
    label: 'Currency',
    subLabel: 'Notes & Coins',
    icon: Banknote,
    color: 'from-amber-600 to-yellow-600',
    description: 'Identifies ₹1, ₹2, ₹5, ₹10, ₹20, ₹50, ₹100, ₹200, ₹500',
    voiceHint: 'Say "Currency" or "Money"'
  },
  {
    id: 'hazard',
    label: 'Safety Alert',
    subLabel: 'Danger & Stairs',
    icon: AlertTriangle,
    color: 'from-rose-600 to-red-600',
    description: 'Beeps with red screen: stairs, drops, trips, obstacles',
    voiceHint: 'Say "Safety alert" or "Hazard"'
  },
  {
    id: 'object',
    label: 'Find Object',
    subLabel: 'Clock Position',
    icon: Search,
    color: 'from-purple-600 to-pink-600',
    description: 'Locates keys, phone, cup at 10 o\'clock with distance',
    voiceHint: 'Say "Find phone" or "Find keys"'
  },
];

export const CameraControls = ({
  activeMode,
  onSelectMode,
  customPrompt,
  onChangeCustomPrompt,
}) => {
  const { announce } = useAccessibility();

  const handleModeClick = (modeId, modeLabel) => {
    onSelectMode(modeId);
    if (modeId !== 'hazard') {
      soundService.stopSafetyBeep();
      soundService.playModeSwitch();
    }
    announce(`Switched to ${modeLabel} mode.`, true);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Mode Buttons Grid */}
      <div 
        role="radiogroup" 
        aria-label="Vision Analysis Mode"
        className="grid grid-cols-2 sm:grid-cols-5 gap-2"
      >
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;

          return (
            <button
              key={mode.id}
              role="radio"
              aria-checked={isActive}
              onClick={() => handleModeClick(mode.id, mode.label)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center group cursor-pointer ${
                isActive
                  ? mode.id === 'hazard'
                    ? 'bg-rose-950/80 border-rose-500 shadow-lg shadow-rose-500/40 ring-4 ring-rose-500/50'
                    : 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              {isActive && (
                <span className={`absolute -top-1.5 px-2 py-0.2 rounded-full text-[9px] font-black text-white uppercase tracking-wider shadow ${
                  mode.id === 'hazard' ? 'bg-rose-600 animate-pulse' : 'bg-indigo-600'
                }`}>
                  Active
                </span>
              )}

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-br text-white ' + mode.color
                    : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span className={`text-xs font-black leading-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>
                {mode.label}
              </span>
              <span className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
                {mode.subLabel}
              </span>
              <span className="text-[9px] text-indigo-400/90 font-mono hidden md:block mt-1">
                {mode.voiceHint}
              </span>
            </button>
          );
        })}
      </div>

      {/* Target input for Object Finder */}
      {activeMode === 'object' && (
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-purple-950/40 border border-purple-500/40 shadow-inner">
          <Search className="w-4 h-4 text-purple-400 ml-2" />
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => onChangeCustomPrompt(e.target.value)}
            placeholder="Type or speak the object to locate (e.g. 'keys', 'phone', 'cup', 'water bottle')"
            className="w-full bg-transparent text-xs text-white placeholder-purple-300/60 focus:outline-none py-1.5 font-medium"
            aria-label="Object name to locate with clock directions"
          />
        </div>
      )}
    </div>
  );
};
