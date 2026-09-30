import React, { useState } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  Square, 
  Copy, 
  Check, 
  AlertTriangle, 
  Banknote, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Users, 
  Package, 
  Pill, 
  Clock, 
  RefreshCw, 
  Compass,
  ArrowLeft,
  Camera
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export const AnalysisResult = ({ result, onRepeatSpeech, onRetake }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { announce } = useAccessibility();

  if (!result) return null;

  // Safe destructuring with complete default values
  const {
    summary = 'Visual scene analyzed successfully.',
    detailedAnalysis = '',
    hazards = [],
    textContent = '',
    currencyDetails = null,
    peopleCount,
    peopleDetails = [],
    objectsDetected = [],
    isMedicine = false,
    medicineDetails = null,
    targetFound,
    clockPosition = null,
    estimatedDistance = null,
    timeDetected = null,
    confidence = 0.95,
    processingTimeMs = 0,
    provider = 'Drishti Neural Assist',
    mode = 'general',
  } = result;

  // Ensure safe array handling to completely prevent any React render runtime crashes
  const safePeopleDetails = Array.isArray(peopleDetails) ? peopleDetails : [];
  const safeObjects = Array.isArray(objectsDetected) ? objectsDetected : [];
  const safeHazards = Array.isArray(hazards) ? hazards.filter(Boolean) : [];
  const hasHazards = safeHazards.length > 0 && safeHazards[0] !== 'None detected';

  const handleSpeak = (text) => {
    setIsSpeaking(true);
    speechService.speak(text, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStopSpeech = () => {
    speechService.stop();
    setIsSpeaking(false);
  };

  const handleCopyText = (content) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    announce('Text copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoBack = () => {
    if (onRetake) {
      onRetake();
    }
  };

  return (
    <section 
      aria-label="Scene Analysis Results" 
      className="w-full flex flex-col gap-4 animate-in fade-in duration-300 pb-10"
    >
      {/* 🧭 NAVIGATION BANNER: GO BACK TO CAMERA */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/60 shadow-lg">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-md shadow-indigo-600/40 transition-all cursor-pointer transform active:scale-95"
          title="Return to Live Camera Feed (Shortcut: Escape or Backspace, or say 'Go Back')"
          aria-label="Back to live camera feed"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Live Camera</span>
        </button>

        <div className="text-xs text-indigo-200 flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span>Say <span className="font-bold text-white font-mono">"Go Back"</span> or press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px]">Esc</kbd> anytime</span>
        </div>
      </div>

      {/* ⚠️ URGENT HAZARD / SAFETY ALERT BANNER (If detected) */}
      {hasHazards && (
        <div 
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-3xl bg-rose-950/90 border-3 border-rose-500 text-rose-100 flex items-start gap-3 shadow-xl shadow-rose-950/60 animate-pulse"
        >
          <div className="p-2.5 rounded-2xl bg-rose-600 text-white mt-0.5 shadow-md shadow-rose-600/50">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-black text-rose-200 tracking-wide uppercase flex items-center gap-2">
              🚨 Safety Alert & Hazard Warning
            </h2>
            <ul className="mt-1 list-disc list-inside space-y-1 text-sm font-semibold text-white">
              {safeHazards.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Primary Spoken Summary Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400" />

        {/* Top bar with Repeat, Silence, and Retake */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Volume2 className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Auditory Scene Description
              </h2>
              <p className="text-[11px] text-slate-400">Clear spoken narrative for screen reader or speaker</p>
            </div>
          </div>

          {/* Quick Voice & Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSpeak(summary)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/40 transition-all cursor-pointer"
              aria-label="Listen to description again"
              title="Repeat Speech (Shortcut: R)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Repeat
            </button>

            <button
              onClick={handleStopSpeech}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
              aria-label="Silence audio speech"
              title="Stop Speaking (Shortcut: S)"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              onClick={handleGoBack}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              title="Back to Camera (Shortcut: Escape)"
              aria-label="Go back to live camera"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </div>
        </div>

        {/* Large Prominent Spoken Text */}
        <p className="text-lg md:text-xl font-semibold text-slate-100 leading-relaxed bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-inner">
          "{summary}"
        </p>

        {/* 👥 PEOPLE & SURROUNDINGS BREAKDOWN (General Mode) */}
        {(peopleCount !== undefined || safeObjects.length > 0) && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* People Count Badge */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
                  Surrounding People
                </span>
                <p className="text-sm font-extrabold text-white mt-0.5">
                  {peopleCount === 0 ? '0 People Detected' : `${peopleCount} ${peopleCount === 1 ? 'Person' : 'People'} Nearby`}
                </p>
                {safePeopleDetails.length > 0 && (
                  <p className="text-xs text-indigo-200/90 mt-1">{safePeopleDetails.join(', ')}</p>
                )}
              </div>
            </div>

            {/* Objects Inventory */}
            {safeObjects.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wide">
                    Objects Identified
                  </span>
                  <ul className="text-xs text-slate-300 mt-1 space-y-0.5 list-disc list-inside">
                    {safeObjects.map((obj, i) => (
                      <li key={i} className="font-medium text-slate-200">{obj}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🕒 OBJECT FINDER CLOCK POSITION & WATCH TIME CARD */}
        {timeDetected && (
          <div className="mt-4 p-4 rounded-2xl bg-cyan-950/60 border-2 border-cyan-400 flex items-center justify-between shadow-lg shadow-cyan-950/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500 text-black font-bold">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] text-cyan-300 uppercase font-black tracking-wider">
                  Watch / Clock Time Detected
                </span>
                <p className="text-2xl font-black text-white font-mono">
                  {timeDetected}
                </p>
                {clockPosition && (
                  <p className="text-xs text-cyan-200 mt-0.5">
                    Position: <span className="font-bold text-yellow-300">{clockPosition}</span> ({estimatedDistance || 'In view'})
                  </p>
                )}
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold border border-cyan-400">
              Time Verified
            </span>
          </div>
        )}

        {clockPosition && !timeDetected && (
          <div className="mt-4 p-4 rounded-2xl bg-purple-950/50 border border-purple-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-600/40">
                <Compass className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <span className="text-[11px] text-purple-300 uppercase font-bold tracking-wider">
                  Target Object Location
                </span>
                <p className="text-lg font-black text-white">
                  Direction: {clockPosition}
                </p>
                <p className="text-xs text-purple-200 mt-0.5">
                  Estimated Distance: <span className="font-bold text-yellow-300">{estimatedDistance}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                Target Acquired
              </span>
            </div>
          </div>
        )}

        {targetFound === false && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-3 text-amber-200 text-xs">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Clock Position Cannot Find</p>
              <p className="text-amber-300/80">The requested clock or object is not visible in front of the camera.</p>
            </div>
          </div>
        )}

        {/* 💊 MEDICINE OCR / PRESCRIPTION CARD */}
        {medicineDetails && (medicineDetails.name !== 'N/A' || isMedicine) && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
              <Pill className="w-5 h-5" /> Medicine & Prescription Verification
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-900/50">
                <span className="text-slate-400">Medicine Name:</span>
                <p className="font-bold text-white text-sm mt-0.5">{medicineDetails.name}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-900/50">
                <span className="text-slate-400">Dosage Strength:</span>
                <p className="font-bold text-white text-sm mt-0.5">{medicineDetails.dosage}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-900/50">
                <span className="text-slate-400">Expiry Date (EXP):</span>
                <p className="font-bold text-amber-300 text-sm mt-0.5">{medicineDetails.expiryDate}</p>
              </div>
              {medicineDetails.warnings && medicineDetails.warnings !== 'N/A' && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/50">
                  <span className="text-rose-300">Safety Caution:</span>
                  <p className="font-semibold text-rose-200 text-xs mt-0.5">{medicineDetails.warnings}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 💵 CURRENCY IDENTIFICATION CARD (Rupees Coins & Banknotes) */}
        {currencyDetails && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500 text-black shadow-lg shadow-amber-500/30">
                <Banknote className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] text-amber-300 uppercase font-bold tracking-wider">
                  Indian Rupee Identified
                </span>
                <p className="text-2xl font-black text-amber-100">
                  ₹{currencyDetails.denomination || currencyDetails.totalValue} ({currencyDetails.type || 'Banknote'})
                </p>
                {currencyDetails.colorAndMotif && (
                  <p className="text-xs text-amber-300/90 mt-0.5">{currencyDetails.colorAndMotif}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Total Value: <span className="font-bold text-white">₹{currencyDetails.totalValue}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                Confidence: {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* 📖 TEXT EXTRACTED (OCR / Signs / Books) */}
        {textContent && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wide">
                <FileText className="w-4 h-4" /> Extracted Text (OCR)
              </div>
              <button
                onClick={() => handleCopyText(textContent)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
                aria-label="Copy extracted text to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            </div>
            <pre className="text-xs md:text-sm font-mono text-slate-200 whitespace-pre-wrap bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 max-h-48 overflow-y-auto leading-relaxed">
              {textContent}
            </pre>
          </div>
        )}

        {/* Detailed Narrative Section */}
        {detailedAnalysis && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Environmental Narrative & Layout
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
              {detailedAnalysis}
            </p>
          </div>
        )}

        {/* Bottom Prominent Back Button */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
            aria-label="Go back and scan again"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back & Take Another Scan</span>
          </button>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              {provider || 'AI Vision Engine'}
            </span>
            {processingTimeMs > 0 && (
              <span>• Latency: {processingTimeMs}ms</span>
            )}
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
