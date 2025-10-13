import { Building, MapPin } from 'lucide-react';

interface FloorTabsProps {
  floors: string[];
  activeFloor: string;
  onFloorChange: (floor: string) => void;
}

export default function FloorTabs({ floors, activeFloor, onFloorChange }: FloorTabsProps) {
  return (
    <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-white/40 shadow-lg animate-in fade-in slide-in-from-top duration-500 delay-200">
      {floors.map((floor, index) => (
        <button
          key={floor}
          onClick={() => onFloorChange(floor)}
          className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg animate-in fade-in slide-in-from-top duration-500 ${
            activeFloor === floor
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-500/30 scale-105 border-2 border-white/30'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/70 border border-white/30'
          }`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Building size={16} className={activeFloor === floor ? 'text-white' : 'text-blue-600'} />
          <span>{floor}</span>
        </button>
      ))}
    </div>
  );
}