import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: number | undefined;
  unit: string;
  icon: LucideIcon;
  color: 'blue' | 'orange' | 'red' | 'cyan';
  anomaly: boolean;
  previousValue?: number;
  threshold?: number;
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500/20 to-blue-600/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    icon: 'text-blue-400',
    anomaly: 'from-red-500/30 to-orange-500/30 border-red-500/70',
  },
  orange: {
    bg: 'from-orange-500/20 to-orange-600/20',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    icon: 'text-orange-400',
    anomaly: 'from-red-500/30 to-orange-500/30 border-red-500/70',
  },
  red: {
    bg: 'from-red-500/20 to-red-600/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
    icon: 'text-red-400',
    anomaly: 'from-red-500/30 to-orange-500/30 border-red-500/70',
  },
  cyan: {
    bg: 'from-cyan-500/20 to-cyan-600/20',
    border: 'border-cyan-500/50',
    text: 'text-cyan-400',
    icon: 'text-cyan-400',
    anomaly: 'from-red-500/30 to-orange-500/30 border-red-500/70',
  },
};

export default function SensorCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  anomaly,
  previousValue,
  threshold,
}: SensorCardProps) {
  const colors = colorClasses[color];
  const displayValue = value !== undefined ? value.toFixed(1) : '--';
  
  const getTrend = () => {
    if (value === undefined || previousValue === undefined) return null;
    const diff = value - previousValue;
    if (Math.abs(diff) < 0.1) return '→';
    return diff > 0 ? '↗' : '↘';
  };
  
  const getTrendColor = () => {
    if (value === undefined || previousValue === undefined) return 'text-gray-500';
    const diff = value - previousValue;
    if (Math.abs(diff) < 0.1) return 'text-gray-400';
    return diff > 0 ? 'text-red-400' : 'text-green-400';
  };
  
  const getProgressPercentage = () => {
    if (value === undefined || threshold === undefined) return 0;
    return Math.min((value / threshold) * 100, 100);
  };

  return (
    <div
      className={`bg-gradient-to-br ${
        anomaly ? colors.anomaly : colors.bg
      } backdrop-blur rounded-xl p-6 shadow-lg border ${
        anomaly ? 'border-red-500/70 animate-pulse' : colors.border
      } transition-all duration-300 hover:scale-105 transform`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-300 font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          {getTrend() && (
            <span className={`text-sm font-bold ${getTrendColor()}`}>
              {getTrend()}
            </span>
          )}
          <Icon className={anomaly ? 'text-red-400' : colors.icon} size={24} />
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-4xl font-bold ${anomaly ? 'text-red-300' : colors.text}`}>
          {displayValue}
        </span>
        {unit && <span className="text-gray-400 text-lg">{unit}</span>}
      </div>
      {threshold && (
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              anomaly ? 'bg-red-500' : colors.text.replace('text-', 'bg-')
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      )}
    </div>
  );
}
