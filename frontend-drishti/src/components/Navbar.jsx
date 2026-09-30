import React from 'react';
import { 
  Eye, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Clock, 
  Mic, 
  MicOff, 
  Settings, 
  User, 
  LogOut, 
  HelpCircle,
  PhoneCall,
  ShieldAlert
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { speechService } from '../services/speechService';
import { soundService } from '../services/soundService';

export const Navbar = ({
  onOpenHistory,
  onOpenSettings,
  onOpenAuth,
  onOpenVoiceHelp,
  onOpenEmergency,
  isListening,
  onToggleVoice,
}) => {
  const { highContrast, setHighContrast, audioCues, setAudioCues, announce } = useAccessibility();
  const { user, logout } = useAuth();

  const handleToggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    soundService.playModeSwitch();
    announce(`High contrast ${next ? 'enabled' : 'disabled'}`);
  };

  const handleToggleAudio = () => {
    const next = !audioCues;
    setAudioCues(next);
    if (!next) {
      speechService.stop();
      soundService.stopSafetyBeep();
    }
    announce(`Audio cues ${next ? 'enabled' : 'muted'}`);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40">
            <Eye className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                DRISHTI
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI
                </span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Eyes for the Blind</p>
          </div>
        </div>

        {/* Center / Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* 🚨 SOS EMERGENCY BUTTON */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 border border-rose-400/50 animate-pulse transition-all cursor-pointer"
            title="Emergency Contact & SOS Call (or say 'Emergency')"
            aria-label="Emergency SOS button. Click or say Emergency to call help."
          >
            <ShieldAlert className="w-4 h-4 fill-white" />
            <span className="font-mono">SOS</span>
          </button>

          {/* Voice Assistant Mic Button */}
          <button
            onClick={onToggleVoice}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isListening
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-lg shadow-rose-500/30 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Voice Commands (Say 'Capture', 'Describe', 'Read text', 'Hazard', 'Currency', 'Find keys')"
            aria-label={isListening ? 'Voice listening active. Click to pause.' : 'Turn on voice command listener.'}
          >
            {isListening ? <Mic className="w-4 h-4 text-rose-400" /> : <MicOff className="w-4 h-4 text-slate-400" />}
            <span className="hidden md:inline">{isListening ? 'Listening' : 'Voice On'}</span>
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={handleToggleContrast}
            className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle High Contrast Yellow/Black"
            aria-label={`High contrast mode is ${highContrast ? 'on' : 'off'}. Click to toggle.`}
          >
            {highContrast ? <Sun className="w-4 h-4 text-black" /> : <Moon className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleAudio}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            title={audioCues ? 'Mute Speech & Audio' : 'Unmute Speech & Audio'}
            aria-label={audioCues ? 'Sound active. Click to mute.' : 'Sound muted. Click to unmute.'}
          >
            {audioCues ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Scan History"
            aria-label="Open past scans history"
          >
            <Clock className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Voice Help */}
          <button
            onClick={onOpenVoiceHelp}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Voice Commands Guide"
            aria-label="Open voice commands guide"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Settings & AI Keys"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>

          {/* User Auth Profile */}
          {user ? (
            <div className="flex items-center gap-1 pl-1">
              <span className="hidden sm:inline text-xs text-indigo-200 font-semibold px-2 py-1 bg-indigo-950/60 rounded-lg border border-indigo-800/40">
                {user.name.split(' ')[0]}
              </span>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer ml-1"
              aria-label="Sign in"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
