import React from 'react';
import { X, Mic, Volume2, Sparkles, Command } from 'lucide-react';
import { speechService } from '../services/speechService';

export const VoiceCommandsModal = ({ isOpen, onClose, isListening, onToggleVoice }) => {
  if (!isOpen) return null;

  const commands = [
    { voice: '"Capture" or "Scan" or "Take picture"', action: 'Instantly captures camera frame and starts AI visual analysis' },
    { voice: '"Describe scene"', action: 'Switches to General Scene Description mode' },
    { voice: '"Read text" or "Document"', action: 'Switches to Text & OCR Reader mode' },
    { voice: '"Currency" or "Money"', action: 'Switches to Banknote & Coin Identification mode' },
    { voice: '"Hazard" or "Danger"', action: 'Switches to Safety & Obstacle Alert mode' },
    { voice: '"Find [item]" (e.g. "Find phone")', action: 'Locates target object using clock-face directions' },
    { voice: '"Repeat" or "Again"', action: 'Repeats the last spoken auditory description' },
    { voice: '"Stop" or "Silence"', action: 'Immediately mutes audio and stops speech synthesis' },
  ];

  const handleReadGuide = () => {
    speechService.speak(
      "Drishti Voice Navigation Guide. You can say: Capture to scan the current view. Describe scene to switch to general mode. Read text to read signs or books. Currency to identify money. Hazard to check for obstacles. Repeat to hear the last description again. Or Stop to silence audio."
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice Commands Guide"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Hands-Free Voice Commands</h2>
            <p className="text-xs text-slate-400">Speak naturally to control Drishti without touching the screen</p>
          </div>
        </div>

        {/* Read aloud guide button */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleReadGuide}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors"
          >
            <Volume2 className="w-4 h-4" /> Listen to Audio Guide
          </button>
          <button
            onClick={onToggleVoice}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isListening
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Mic className="w-4 h-4" />
            {isListening ? 'Voice Listener is Active' : 'Start Voice Listener'}
          </button>
        </div>

        {/* Commands List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {commands.map((cmd, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-200 font-mono">{cmd.voice}</span>
              </div>
              <p className="text-xs text-slate-400 pl-5">{cmd.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
