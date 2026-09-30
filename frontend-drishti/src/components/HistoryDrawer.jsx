import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Volume2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Banknote, 
  Eye, 
  Search, 
  Calendar 
} from 'lucide-react';
import { scanApi } from '../services/api';
import { speechService } from '../services/speechService';
import { useAccessibility } from '../context/AccessibilityContext';

export const HistoryDrawer = ({ isOpen, onClose, onSelectScan }) => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState('all');
  const { announce } = useAccessibility();

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      announce('Scan history opened.');
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await scanApi.getScans(40);
      if (res.success) {
        setScans(res.data);
      }
    } catch (err) {
      console.warn('Failed to load scan history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await scanApi.deleteScan(id);
      setScans(prev => prev.filter(s => s.id !== id));
      announce('Scan deleted.');
    } catch (err) {
      console.warn('Delete error:', err);
    }
  };

  const handleSpeak = (text, e) => {
    e.stopPropagation();
    speechService.speak(text);
  };

  if (!isOpen) return null;

  const filteredScans = filterMode === 'all' 
    ? scans 
    : scans.filter(s => s.mode === filterMode);

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label="Past Scan History"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end"
    >
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col p-6 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Visual Scan History</h2>
              <p className="text-xs text-slate-400">{scans.length} scans saved in Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close scan history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar">
          {['all', 'general', 'text', 'currency', 'hazard', 'object'].map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterMode === m
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Scans List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-2" />
              Loading your scans from cloud...
            </div>
          ) : filteredScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 text-xs p-6">
              <Eye className="w-8 h-8 mb-2 opacity-50" />
              No scans recorded for this filter yet. Capture a scene to populate your history!
            </div>
          ) : (
            filteredScans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => {
                  if (onSelectScan) onSelectScan(scan);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {scan.mode}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleSpeak(scan.summary, e)}
                      className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                      title="Read Aloud"
                      aria-label="Speak scan summary aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(scan.id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Scan"
                      aria-label="Delete this scan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-200 line-clamp-2 font-medium">
                  {scan.summary}
                </p>

                {scan.image_url && (
                  <img
                    src={scan.image_url}
                    alt="Scan thumbnail"
                    className="w-full h-24 object-cover rounded-xl border border-slate-800/80 mt-1"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
