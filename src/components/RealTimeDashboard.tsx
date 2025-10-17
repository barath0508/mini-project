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
    <div className="space-y-8">
      {/* Glassmorphic Status Bar */}
      <div className="glass-strong rounded-3xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-top duration-700">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse glass-glow"></div>
              <Wifi className="h-6 w-6 text-green-300" />
              <span className="text-green-300 font-bold tracking-wide text-xl">LIVE</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-blue-300" />
              <span className="glass-text font-mono text-xl font-bold">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-purple-300" />
              <span className="glass-text font-bold text-xl">{user.name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-6 py-3 rounded-2xl text-lg font-bold glass-button transition-all duration-300 ${
              emergencyMode 
                ? 'bg-gradient-to-r from-red-500/80 to-red-600/80 text-white animate-pulse glass-glow' 
                : 'bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white'
            }`}>
              {emergencyMode ? '🚨 EMERGENCY' : '✅ NORMAL'}
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphic Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="glass rounded-3xl p-6 glass-hover transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-100">
          <div className="flex items-center justify-between">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500/30 to-red-600/30 rounded-2xl flex items-center justify-center glass-glow">
              <AlertTriangle className="h-9 w-9 text-red-300" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-red-200">{criticalCount}</div>
              <div className="text-red-300 text-lg font-bold">Critical</div>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-3xl p-6 glass-hover transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-200">
          <div className="flex items-center justify-between">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/30 to-amber-600/30 rounded-2xl flex items-center justify-center glass-glow">
              <AlertTriangle className="h-9 w-9 text-amber-300" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-amber-200">{warningCount}</div>
              <div className="text-amber-300 text-lg font-bold">Warning</div>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-3xl p-6 glass-hover transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-300">
          <div className="flex items-center justify-between">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 rounded-2xl flex items-center justify-center glass-glow">
              <Activity className="h-9 w-9 text-emerald-300" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-emerald-200">{normalCount}</div>
              <div className="text-emerald-300 text-lg font-bold">Normal</div>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-3xl p-6 glass-hover transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-400">
          <div className="flex items-center justify-between">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-2xl flex items-center justify-center glass-glow">
              <Wind className="h-9 w-9 text-blue-300" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-blue-200">{avgGas}</div>
              <div className="text-blue-300 text-lg font-bold">Avg Gas</div>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-3xl p-6 glass-hover transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-500">
          <div className="flex items-center justify-between">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500/30 to-orange-600/30 rounded-2xl flex items-center justify-center glass-glow">
              <Thermometer className="h-9 w-9 text-orange-300" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-orange-200">{avgTemp}°C</div>
              <div className="text-orange-300 text-lg font-bold">Avg Temp</div>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-3xl p-6 glass-hover transition-all duration-300 animate-in fade-in slide-in-from-left duration-700 delay-600">
          <div className="flex items-center justify-between">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 rounded-2xl flex items-center justify-center glass-glow">
              <Droplets className="h-9 w-9 text-cyan-300" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-cyan-200">{avgHumidity}%</div>
              <div className="text-cyan-300 text-lg font-bold">Avg Humidity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphic Sensor Grid */}
      <div className="glass-strong rounded-3xl p-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <h3 className="glass-text font-black text-3xl mb-8 flex items-center relative z-10">
          <div className="w-12 h-12 glass-gradient-blue rounded-2xl flex items-center justify-center mr-5 glass-glow">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Live Sensors - {activeFloor}
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {floorSensors.map((sensor, index) => (
            <div key={sensor.id} className={`glass rounded-3xl p-6 transition-all duration-300 glass-hover animate-in fade-in slide-in-from-bottom duration-700 ${
              sensor.status === 'critical' 
                ? 'glass-glow border-red-400/30' :
              sensor.status === 'warning' 
                ? 'glass-glow border-amber-400/30' :
                'border-emerald-400/30'
            }`} style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-6">
                <span className="glass-text font-black text-xl">{sensor.nodeId}</span>
                <div className={`w-5 h-5 rounded-full animate-pulse glass-glow ${
                  sensor.status === 'critical' ? 'bg-red-400' :
                  sensor.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                }`}></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 glass-subtle rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-xl flex items-center justify-center">
                      <Wind className="h-5 w-5 text-blue-300" />
                    </div>
                    <span className="glass-text font-bold">Gas</span>
                  </div>
                  <span className="text-blue-200 font-black font-mono text-lg">{Math.round(sensor.gas)}ppm</span>
                </div>
                
                <div className="flex items-center justify-between p-4 glass-subtle rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500/30 to-orange-600/30 rounded-xl flex items-center justify-center">
                      <Thermometer className="h-5 w-5 text-orange-300" />
                    </div>
                    <span className="glass-text font-bold">Temp</span>
                  </div>
                  <span className="text-orange-200 font-black font-mono text-lg">{Math.round(sensor.temperature)}°C</span>
                </div>
                
                <div className="flex items-center justify-between p-4 glass-subtle rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 rounded-xl flex items-center justify-center">
                      <Droplets className="h-5 w-5 text-cyan-300" />
                    </div>
                    <span className="glass-text font-bold">Humidity</span>
                  </div>
                  <span className="text-cyan-200 font-black font-mono text-lg">{Math.round(sensor.humidity)}%</span>
                </div>
                
                <div className="flex items-center justify-between p-4 glass-subtle rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500/30 to-red-600/30 rounded-xl flex items-center justify-center">
                      <Flame className="h-5 w-5 text-red-300" />
                    </div>
                    <span className="glass-text font-bold">Flame</span>
                  </div>
                  <span className="text-red-200 font-black font-mono text-lg">{sensor.flame}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 text-sm">
                <div className="flex justify-between glass-text">
                  <span>Zone: <span className="text-cyan-300 font-bold">{sensor.zone}</span></span>
                  <span className="text-white/60">{new Date(sensor.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}