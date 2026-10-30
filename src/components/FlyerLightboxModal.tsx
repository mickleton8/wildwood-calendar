import React from 'react';
import { FileImage, X } from 'lucide-react';

interface FlyerLightboxModalProps {
  imageUrl: string | null;
  title: string;
  venueName: string;
  onClose: () => void;
}

export const FlyerLightboxModal: React.FC<FlyerLightboxModalProps> = ({
  imageUrl,
  title,
  venueName,
  onClose,
}) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-xl w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileImage className="h-4 w-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">{venueName} — Source Flyer</h3>
              <p className="text-xs text-slate-400">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-center overflow-hidden rounded-xl bg-slate-950 p-2">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[75vh] w-auto rounded-lg object-contain"
          />
        </div>
      </div>
    </div>
  );
};
