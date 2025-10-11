import { AlertTriangle } from 'lucide-react';

interface AlertBannerProps {
  message: string;
  prediction: number;
}

export default function AlertBanner({ message, prediction }: AlertBannerProps) {
  return (
    <div className="mb-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/70 rounded-xl p-4 shadow-lg animate-pulse">
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-red-400 flex-shrink-0" size={28} />
        <div className="flex-1">
          <h3 className="text-red-300 font-bold text-lg">{message}</h3>
          <p className="text-red-200/80 text-sm mt-1">
            Prediction confidence: {(prediction * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
