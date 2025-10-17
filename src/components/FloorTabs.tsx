import { Building, MapPin } from 'lucide-react';

interface FloorTabsProps {
  floors: string[];
  activeFloor: string;
  onFloorChange: (floor: string) => void;
}

export default function FloorTabs({ floors, activeFloor, onFloorChange }: FloorTabsProps) {
  return (
    <div className="flex items-center space-x-3 glass rounded-3xl p-3 animate-in fade-in slide-in-from-top duration-500 delay-200">
      {floors.map((floor, index) => (
        <button
          key={floor}
          onClick={() => onFloorChange(floor)}
          className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105 glass-shimmer animate-in fade-in slide-in-from-top duration-500 ${
            activeFloor === floor
              ? 'bg-gradient-to-r from-blue-500/80 to-indigo-600/80 text-white glass-glow scale-105'
              : 'glass-subtle text-white/80 hover:text-white glass-hover'
          }`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Building size={18} className={activeFloor === floor ? 'text-white' : 'text-blue-300'} />
          <span>{floor}</span>
        </button>
      ))}
    </div>
  );
}