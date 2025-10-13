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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
      {/* Professional Status Bar */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
              <Wifi className="h-6 w-6 text-emerald-600" />
              <span className="text-emerald-700 font-black tracking-wide text-lg">LIVE</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-slate-600" />
              <span className="text-slate-800 font-mono text-xl font-bold">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-slate-800 font-bold">{user.name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-6 py-3 rounded-xl text-sm font-black shadow-xl hover:scale-105 transition-all duration-300 ${
              emergencyMode 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-red-500/40' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/40'
            }`}>
              {emergencyMode ? '🚨 EMERGENCY MODE' : '✅ SYSTEM NORMAL'}
            </div>
          </div>
        </div>
      </div>

      {/* Professional Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-100">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-red-700">{criticalCount}</div>
              <div className="text-red-600 text-sm font-bold">Critical</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-200">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-amber-700">{warningCount}</div>
              <div className="text-amber-600 text-sm font-bold">Warning</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-300">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-emerald-700">{normalCount}</div>
              <div className="text-emerald-600 text-sm font-bold">Normal</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-400">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Wind className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-blue-700">{avgGas}</div>
              <div className="text-blue-600 text-sm font-bold">Avg Gas</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-500">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Thermometer className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-orange-700">{avgTemp}°C</div>
              <div className="text-orange-600 text-sm font-bold">Avg Temp</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-600">
          <div className="flex items-center justify-between">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Droplets className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-cyan-700">{avgHumidity}%</div>
              <div className="text-cyan-600 text-sm font-bold">Avg Humidity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Sensor Grid */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 to-blue-50/30 rounded-2xl"></div>
        <h3 className="text-slate-800 font-black text-2xl mb-8 flex items-center relative z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <span>Live Sensors - {activeFloor}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {floorSensors.map((sensor, index) => (
            <div key={sensor.id} className={`border rounded-2xl p-6 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl animate-in fade-in slide-in-from-bottom duration-700 ${
              sensor.status === 'critical' 
                ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200/50 shadow-red-500/20' :
              sensor.status === 'warning' 
                ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/50 shadow-amber-500/20' :
                'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200/50 shadow-slate-500/20'
            }`} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-slate-800 font-black text-xl">{sensor.nodeId}</span>
                <div className={`w-5 h-5 rounded-full animate-pulse shadow-lg ${
                  sensor.status === 'critical' ? 'bg-red-500 shadow-red-500/50' :
                  sensor.status === 'warning' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                }`}></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-white/40 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <Wind className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-slate-700 font-bold">Gas</span>
                  </div>
                  <span className="text-blue-700 font-black font-mono text-lg">{Math.round(sensor.gas)}ppm</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-white/40 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                      <Thermometer className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-slate-700 font-bold">Temp</span>
                  </div>
                  <span className="text-orange-700 font-black font-mono text-lg">{Math.round(sensor.temperature)}°C</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-white/40 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                      <Droplets className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-slate-700 font-bold">Humidity</span>
                  </div>
                  <span className="text-cyan-700 font-black font-mono text-lg">{Math.round(sensor.humidity)}%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-white/40 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-slate-700 font-bold">Flame</span>
                  </div>
                  <span className="text-red-700 font-black font-mono text-lg">{sensor.flame}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200/50 text-sm text-slate-600">
                <div className="flex justify-between font-semibold">
                  <span>Zone: <span className="text-blue-600 font-bold">{sensor.zone}</span></span>
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