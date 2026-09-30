import React, { useState, useEffect } from 'react';
import { X, PhoneCall, ShieldAlert, HeartHandshake, Check, AlertCircle } from 'lucide-react';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export const EmergencyModal = ({ isOpen, onClose }) => {
  const { announce, triggerHaptic } = useAccessibility();

  const [contactName, setContactName] = useState(() => {
    return localStorage.getItem('drishti_emergency_name') || 'Emergency Support / Family';
  });
  const [contactNumber, setContactNumber] = useState(() => {
    return localStorage.getItem('drishti_emergency_number') || '112'; // 112 is universal national emergency in India & EU
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      announce(`Emergency Contact dialog. Current emergency number is ${contactNumber}.`);
    }
  }, [isOpen, contactNumber]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('drishti_emergency_name', contactName.trim());
    localStorage.setItem('drishti_emergency_number', contactNumber.trim());
    setIsSaved(true);
    announce(`Emergency contact saved for ${contactName}: ${contactNumber}`, true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCallEmergency = () => {
    triggerHaptic([200, 100, 200, 100, 300]);
    speechService.speak(`Calling emergency contact: ${contactName} at ${contactNumber}.`);
    // Open telephone dialer
    window.location.href = `tel:${contactNumber}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Emergency SOS and Contact"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative shadow-rose-950/50">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close emergency dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SOS Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-rose-300 tracking-wide uppercase">
              Emergency SOS Contact
            </h2>
            <p className="text-xs text-slate-400">One-tap call or voice trigger: Say "Emergency" or "SOS"</p>
          </div>
        </div>

        {/* Direct Call Button */}
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold text-rose-200 uppercase tracking-wider">
            Quick Dial Registered Number
          </span>
          <p className="text-2xl font-mono font-bold text-white tracking-widest">
            {contactNumber}
          </p>
          <span className="text-xs text-rose-300/80">({contactName})</span>

          <button
            onClick={handleCallEmergency}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-rose-600/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            aria-label={`Call emergency number ${contactNumber} immediately`}
          >
            <PhoneCall className="w-5 h-5" /> Call Emergency Now
          </button>
        </div>

        {/* Form to update contact details */}
        <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-rose-400" /> Update Contact Details
          </h3>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Contact Name / Relationship</label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Brother Rahul or Caregiver"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Emergency Phone Number</label>
            <input
              type="tel"
              required
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. 112 or +919876543210"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : null}
            {isSaved ? 'Emergency Contact Saved!' : 'Save Emergency Contact'}
          </button>
        </form>
      </div>
    </div>
  );
};
