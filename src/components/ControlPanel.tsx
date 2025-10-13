import { useState } from 'react';
import { User } from '../types';
import { Settings, Bell, Download, Users, AlertTriangle, Phone, FileText, Map, Mic, Search, Bot, Building } from 'lucide-react';

interface ControlPanelProps {
  user: User;
  onEmergencyToggle: () => void;
  emergencyMode: boolean;
  onShowVoice: () => void;
  onShowSearch: () => void;
  onShowAI: () => void;
  mqttConnected?: boolean;
  floors?: string[];
  activeFloor?: string;
  onFloorChange?: (floor: string) => void;
  onExport?: () => void;
  onShowAlerts?: () => void;
  onShowUsers?: () => void;
  onShowSettings?: () => void;
}

export default function ControlPanel({ user, onEmergencyToggle, emergencyMode, onShowVoice, onShowSearch, onShowAI, mqttConnected = false, floors = [], activeFloor = '', onFloorChange, onExport, onShowAlerts, onShowUsers, onShowSettings }: ControlPanelProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Control Panel</h3>
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-2 backdrop-blur-sm ${
            mqttConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${mqttConnected ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' : 'bg-red-400'}`}></div>
            <span>{mqttConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
            user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
            user.role === 'supervisor' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
            'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            {user.role.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Emergency Controls */}
      {(user.role === 'admin' || user.role === 'supervisor') && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-red-300 font-semibold">Emergency Mode</span>
            <button
              onClick={onEmergencyToggle}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                emergencyMode 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-lg shadow-red-500/30 scale-105' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20'
              }`}
            >
              {emergencyMode ? '🚨 ACTIVE' : 'ACTIVATE'}
            </button>
          </div>
        </div>
      )}

      {/* Floor Navigation */}
      {floors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-gray-300 text-sm font-semibold mb-4 flex items-center">
            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mr-2"></div>
            Floor Navigation
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {floors.map((floor) => (
              <button
                key={floor}
                onClick={() => onFloorChange?.(floor)}
                className={`flex items-center justify-center space-x-2 p-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  activeFloor === floor
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/20'
                }`}
              >
                <Building className="h-4 w-4" />
                <span>{floor.replace('Floor ', 'F')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Features */}
      <div className="mb-6">
        <h4 className="text-gray-300 text-sm font-semibold mb-4 flex items-center">
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mr-2"></div>
          AI Assistant
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onShowVoice}
            className="group flex flex-col items-center p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-2xl transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40 hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-2 group-hover:shadow-lg group-hover:shadow-blue-500/30">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="text-blue-300 text-xs font-medium">Voice</span>
          </button>
          <button
            onClick={onShowSearch}
            className="group flex flex-col items-center p-4 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-2xl transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40 hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-2 group-hover:shadow-lg group-hover:shadow-emerald-500/30">
              <Search className="h-5 w-5 text-white" />
            </div>
            <span className="text-emerald-300 text-xs font-medium">Search</span>
          </button>
          <button
            onClick={onShowAI}
            className="group flex flex-col items-center p-4 bg-purple-500/10 hover:bg-purple-500/20 rounded-2xl transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-2 group-hover:shadow-lg group-hover:shadow-purple-500/30">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-purple-300 text-xs font-medium">Chat</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 border border-white/10 hover:border-white/20"
        >
          <span className="text-gray-300 text-sm font-semibold">Quick Actions</span>
          <div className={`w-6 h-6 rounded-full bg-white/10 flex items-center justify-center transform transition-transform duration-300 ${showQuickActions ? 'rotate-180' : ''}`}>
            <span className="text-gray-400 text-xs">▼</span>
          </div>
        </button>
        
        {showQuickActions && (
          <div className="mt-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
            <button 
              onClick={onExport}
              className="group flex items-center space-x-3 p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl text-xs text-blue-300 transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40 hover:scale-105"
            >
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30">
                <Download className="h-4 w-4" />
              </div>
              <span className="font-medium">Export</span>
            </button>
            <button 
              onClick={onShowAlerts}
              className="group flex items-center space-x-3 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-xs text-emerald-300 transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40 hover:scale-105"
            >
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30">
                <Bell className="h-4 w-4" />
              </div>
              <span className="font-medium">Alerts</span>
            </button>
            {user.role === 'admin' && (
              <>
                <button 
                  onClick={onShowUsers}
                  className="group flex items-center space-x-3 p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl text-xs text-purple-300 transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 hover:scale-105"
                >
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Users</span>
                </button>
                <button 
                  onClick={onShowSettings}
                  className="group flex items-center space-x-3 p-3 bg-orange-500/10 hover:bg-orange-500/20 rounded-xl text-xs text-orange-300 transition-all duration-300 border border-orange-500/20 hover:border-orange-500/40 hover:scale-105"
                >
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30">
                    <Settings className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Settings</span>
                </button>
              </>
            )}
            <button className="group flex items-center space-x-3 p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-xs text-red-300 transition-all duration-300 border border-red-500/20 hover:border-red-500/40">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30">
                <FileText className="h-4 w-4" />
              </div>
              <span className="font-medium">Report</span>
            </button>
            <button className="group flex items-center space-x-3 p-3 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl text-xs text-cyan-300 transition-all duration-300 border border-cyan-500/20 hover:border-cyan-500/40">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30">
                <Map className="h-4 w-4" />
              </div>
              <span className="font-medium">Map</span>
            </button>
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
        <h4 className="text-gray-300 text-sm font-semibold mb-4 flex items-center">
          <Phone className="h-4 w-4 mr-2 text-red-400" />
          Emergency Contacts
        </h4>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <span className="text-gray-300 font-medium">Fire Dept:</span>
            <span className="text-red-400 font-bold font-mono bg-red-500/20 px-2 py-1 rounded">911</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <span className="text-gray-300 font-medium">Security:</span>
            <span className="text-yellow-400 font-bold font-mono bg-yellow-500/20 px-2 py-1 rounded">5555</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <span className="text-gray-300 font-medium">Medical:</span>
            <span className="text-emerald-400 font-bold font-mono bg-emerald-500/20 px-2 py-1 rounded">911</span>
          </div>
        </div>
      </div>
    </div>
  );
}