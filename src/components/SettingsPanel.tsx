import { useState } from 'react';
import { Settings, X, Save } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: {
    gas: number;
    flame: number;
    temperature: number;
    humidity: number;
  };
  onSaveThresholds: (thresholds: any) => void;
}

export default function SettingsPanel({ isOpen, onClose, thresholds, onSaveThresholds }: SettingsPanelProps) {
  const [localThresholds, setLocalThresholds] = useState(thresholds);

  const handleSave = () => {
    onSaveThresholds(localThresholds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="text-purple-400" size={24} />
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gas Alert Threshold (ppm)</label>
            <input
              type="number"
              value={localThresholds.gas}
              onChange={(e) => setLocalThresholds({...localThresholds, gas: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Flame Alert Threshold</label>
            <input
              type="number"
              value={localThresholds.flame}
              onChange={(e) => setLocalThresholds({...localThresholds, flame: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Temperature Alert Threshold (°C)</label>
            <input
              type="number"
              value={localThresholds.temperature}
              onChange={(e) => setLocalThresholds({...localThresholds, temperature: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Humidity Alert Threshold (%)</label>
            <input
              type="number"
              value={localThresholds.humidity}
              onChange={(e) => setLocalThresholds({...localThresholds, humidity: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Save size={16} />
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}