import React from 'react';
import { RefreshCw, CheckCircle2, Eye } from 'lucide-react';

export const ImagePreview = ({ imageBase64, onRetake }) => {
  if (!imageBase64) return null;

  return (
    <div className="relative w-full aspect-video md:aspect-[16/10] max-h-[55vh] min-h-[260px] rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl flex items-center justify-center">
      <img
        src={imageBase64}
        alt="Captured frame awaiting visual description"
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 shadow-lg">
        <span className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="w-4 h-4" /> Captured Snapshot Analyzed
        </span>
        <button
          onClick={onRetake}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          aria-label="Discard image and retake picture"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retake Picture
        </button>
      </div>
    </div>
  );
};
