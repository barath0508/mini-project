import { useState } from 'react';
import { AlertTriangle, Navigation, Users, Phone } from 'lucide-react';
import { EmergencyPlan } from '../types';

interface EmergencyEvacuationProps {
  isActive: boolean;
  floor: string;
  onBroadcast: (message: string) => void;
}

export default function EmergencyEvacuation({ isActive, floor, onBroadcast }: EmergencyEvacuationProps) {
  const [selectedRoute, setSelectedRoute] = useState<string>('');

  const emergencyPlan: EmergencyPlan = {
    floor,
    exitRoutes: [
      { id: 'exit1', name: 'Main Exit (North)', path: [], capacity: 200 },
      { id: 'exit2', name: 'Emergency Exit (South)', path: [], capacity: 150 },
      { id: 'exit3', name: 'Fire Exit (East)', path: [], capacity: 100 }
    ],
    safeZones: [
      { id: 'safe1', name: 'Assembly Point A', x: 100, y: 50, capacity: 300 },
      { id: 'safe2', name: 'Assembly Point B', x: 500, y: 350, capacity: 200 }
    ]
  };

  const handleEmergencyBroadcast = () => {
    const message = `🚨 EMERGENCY ALERT: Immediate evacuation required for ${floor}. Proceed to nearest exit. Stay calm and follow evacuation procedures.`;
    onBroadcast(message);
  };

  if (!isActive) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Navigation className="mr-2" size={20} />
          Emergency Evacuation Plan
        </h3>
        <p className="text-gray-400">Emergency mode not active</p>
      </div>
    );
  }

  return (
    <div className="bg-red-900 border-2 border-red-500 p-4 rounded-lg animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <AlertTriangle className="mr-2 text-red-400" size={20} />
          🚨 EMERGENCY EVACUATION - {floor}
        </h3>
        <button
          onClick={handleEmergencyBroadcast}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold"
        >
          BROADCAST ALERT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-3 rounded">
          <h4 className="text-white font-medium mb-2 flex items-center">
            <Navigation className="mr-2" size={16} />
            Exit Routes
          </h4>
          {emergencyPlan.exitRoutes.map(route => (
            <div
              key={route.id}
              className={`p-2 mb-2 rounded cursor-pointer ${
                selectedRoute === route.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedRoute(route.id)}
            >
              <div className="text-white font-medium">{route.name}</div>
              <div className="text-gray-300 text-sm">Capacity: {route.capacity} people</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 p-3 rounded">
          <h4 className="text-white font-medium mb-2 flex items-center">
            <Users className="mr-2" size={16} />
            Safe Assembly Points
          </h4>
          {emergencyPlan.safeZones.map(zone => (
            <div key={zone.id} className="p-2 mb-2 bg-green-700 rounded">
              <div className="text-white font-medium">{zone.name}</div>
              <div className="text-gray-200 text-sm">Capacity: {zone.capacity} people</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-yellow-900 p-3 rounded">
        <h4 className="text-yellow-200 font-medium mb-2">Emergency Contacts</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-yellow-200">
            <Phone size={14} className="mr-1" />
            Fire Dept: 911
          </div>
          <div className="flex items-center text-yellow-200">
            <Phone size={14} className="mr-1" />
            Security: 5555
          </div>
          <div className="flex items-center text-yellow-200">
            <Phone size={14} className="mr-1" />
            Medical: 911
          </div>
          <div className="flex items-center text-yellow-200">
            <Phone size={14} className="mr-1" />
            Control Room: 1234
          </div>
        </div>
      </div>
    </div>
  );
}