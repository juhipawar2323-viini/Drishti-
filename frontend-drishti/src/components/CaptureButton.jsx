import React, { useEffect } from 'react';
import { Camera, Sparkles, Loader2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { soundService } from '../services/soundService';

export const CaptureButton = ({ onCapture, isAnalyzing, disabled }) => {
  const { announce, triggerHaptic } = useAccessibility();

  const handleTrigger = () => {
    if (disabled || isAnalyzing) return;
    soundService.playShutter();
    triggerHaptic([60, 40, 60]);
    announce('Capturing image. Processing visual analysis.');
    onCapture();
  };

  // Keyboard shortcut listener: Spacebar or Enter captures when not focused on an input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleTrigger();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnalyzing, disabled]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-2">
      <button
        onClick={handleTrigger}
        disabled={disabled || isAnalyzing}
        className={`relative group flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 transition-all duration-300 transform active:scale-95 shadow-2xl cursor-pointer ${
          isAnalyzing
            ? 'bg-indigo-900/60 border-indigo-400/50 cursor-not-allowed'
            : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 border-white/90 hover:scale-105 shadow-indigo-600/50 hover:shadow-indigo-500/70 ring-4 ring-indigo-400/30'
        }`}
        aria-label="Capture Image and Analyze Scene. You can also press Spacebar."
        title="Capture & Analyze (Shortcut: Spacebar)"
      >
        {/* Pulsing Outer Rings */}
        {!isAnalyzing && (
          <div className="absolute inset-0 rounded-full border-2 border-indigo-300 opacity-60 animate-ping pointer-events-none" />
        )}

        <div className="flex flex-col items-center justify-center text-white">
          {isAnalyzing ? (
            <Loader2 className="w-10 h-10 animate-spin text-white" />
          ) : (
            <>
              <Camera className="w-10 h-10 sm:w-11 sm:h-11 transition-transform group-hover:scale-110" />
              <span className="text-[11px] font-extrabold tracking-wider uppercase mt-0.5">
                Scan
              </span>
            </>
          )}
        </div>
      </button>

      <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        Tap or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">Space</kbd>
      </span>
    </div>
  );
};
