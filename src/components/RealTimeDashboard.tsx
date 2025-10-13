import { useState, useEffect } from 'react';
import { SensorData, User } from '../types';
import { Activity, AlertTriangle, Thermometer, Droplets, Flame, Wind, Zap, Users, Clock, Wifi } from 'lucide-react';

interface RealTimeDashboardProps {
  user: User;
  sensors: SensorData[];
  activeFloor: string;
  emergencyMode: boolean;
}

export default function RealTimeDashboard({ user, sensors, activeFloor, emergencyMode }: RealTimeDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const floorSensors = sensors.filter(s => s.floor === activeFloor);
  const criticalCount = floorSensors.filter(s => s.status === 'critical').length;
  const warningCount = floorSensors.filter(s => s.status === 'warning').length;
  const normalCount = floorSensors.filter(s => s.status === 'normal').length;

  const avgGas = floorSensors.length > 0 ? Math.round(floorSensors.reduce((sum, s) => sum + s.gas, 0) / floorSensors.length) : 0;
  const avgTemp = floorSensors.length > 0 ? Math.round(floorSensors.reduce((sum, s) => sum + s.temperature, 0) / floorSensors.length) : 0;
  const avgHumidity = floorSensors.length > 0 ? Math.round(floorSensors.reduce((sum, s) => sum + s.humidity, 0) / floorSensors.length) : 0;

  return (
    <div className="space-y-4">
      {/* Real-time Status Bar */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <Wifi className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-bold tracking-wide">LIVE</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-cyan-300 font-mono text-lg">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 font-medium">{user.name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
              emergencyMode 
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white animate-pulse shadow-red-500/25' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-500/25'
            }`}>
              {emergencyMode ? '🚨 EMERGENCY' : '✅ NORMAL'}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-red-900/80 to-red-800/60 backdrop-blur-sm border border-red-600/30 rounded-xl p-4 shadow-lg hover:shadow-red-500/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-red-300">{criticalCount}</div>
              <div className="text-red-400 text-sm font-medium">Critical</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-900/80 to-yellow-800/60 backdrop-blur-sm border border-amber-600/30 rounded-xl p-4 shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-amber-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-300">{warningCount}</div>
              <div className="text-amber-400 text-sm font-medium">Warning</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-900/80 to-green-800/60 backdrop-blur-sm border border-emerald-600/30 rounded-xl p-4 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Activity className="h-7 w-7 text-emerald-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-300">{normalCount}</div>
              <div className="text-emerald-400 text-sm font-medium">Normal</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/80 to-indigo-800/60 backdrop-blur-sm border border-blue-600/30 rounded-xl p-4 shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Wind className="h-7 w-7 text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-300">{avgGas}</div>
              <div className="text-blue-400 text-sm font-medium">Avg Gas</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-900/80 to-red-800/60 backdrop-blur-sm border border-orange-600/30 rounded-xl p-4 shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Thermometer className="h-7 w-7 text-orange-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-300">{avgTemp}°C</div>
              <div className="text-orange-400 text-sm font-medium">Avg Temp</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-900/80 to-teal-800/60 backdrop-blur-sm border border-cyan-600/30 rounded-xl p-4 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Droplets className="h-7 w-7 text-cyan-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-300">{avgHumidity}%</div>
              <div className="text-cyan-400 text-sm font-medium">Avg Humidity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Sensor Grid */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl"></div>
        <h3 className="text-slate-100 font-bold mb-6 flex items-center relative z-10">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center mr-3">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
            Live Sensors - {activeFloor}
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
          {floorSensors.map(sensor => (
            <div key={sensor.id} className={`border rounded-xl p-5 transition-all duration-300 backdrop-blur-sm hover:scale-105 ${
              sensor.status === 'critical' 
                ? 'bg-gradient-to-br from-red-900/80 to-red-800/60 border-red-500/50 shadow-lg shadow-red-500/25' :
              sensor.status === 'warning' 
                ? 'bg-gradient-to-br from-amber-900/80 to-yellow-800/60 border-amber-500/50 shadow-lg shadow-amber-500/25' :
                'bg-gradient-to-br from-slate-800/80 to-slate-700/60 border-slate-600/50 shadow-lg hover:shadow-slate-500/20'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-bold text-lg">{sensor.nodeId}</span>
                <div className={`w-4 h-4 rounded-full animate-pulse shadow-lg ${
                  sensor.status === 'critical' ? 'bg-red-400 shadow-red-400/50' :
                  sensor.status === 'warning' ? 'bg-amber-400 shadow-amber-400/50' : 'bg-emerald-400 shadow-emerald-400/50'
                }`}></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Wind className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">Gas</span>
                  </div>
                  <span className="text-blue-300 font-bold font-mono">{Math.round(sensor.gas)}ppm</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Thermometer className="h-4 w-4 text-orange-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">Temp</span>
                  </div>
                  <span className="text-orange-300 font-bold font-mono">{Math.round(sensor.temperature)}°C</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Droplets className="h-4 w-4 text-cyan-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">Humidity</span>
                  </div>
                  <span className="text-cyan-300 font-bold font-mono">{Math.round(sensor.humidity)}%</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Flame className="h-4 w-4 text-red-400" />
                    </div>
                    <span className="text-slate-300 text-sm font-medium">Flame</span>
                  </div>
                  <span className="text-red-300 font-bold font-mono">{sensor.flame}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-600/30 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Zone: <span className="text-cyan-400 font-medium">{sensor.zone}</span></span>
                  <span className="text-slate-500">{new Date(sensor.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}