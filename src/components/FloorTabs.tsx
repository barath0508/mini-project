import { Building, MapPin } from 'lucide-react';

interface FloorTabsProps {
  floors: string[];
  activeFloor: string;
  onFloorChange: (floor: string) => void;
}

export default function FloorTabs({ floors, activeFloor, onFloorChange }: FloorTabsProps) {
  return (
    <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20">
      {floors.map((floor) => (
        <button
          key={floor}
          onClick={() => onFloorChange(floor)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
            activeFloor === floor
              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30 scale-105'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Building size={14} />
          <span>{floor}</span>
        </button>
      ))}
    </div>
  );
}