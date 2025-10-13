import { useEffect, useRef, useState } from 'react';
import { SensorData } from '../types';
import { TrendingUp, AlertTriangle, Activity, Thermometer, Droplets, Wind, Flame, Zap, Eye, RotateCcw } from 'lucide-react';

interface HeatmapProps {
  sensors: SensorData[];
  floor: string;
}

export default function Heatmap({ sensors, floor }: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [hoverSensor, setHoverSensor] = useState<SensorData | null>(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [viewMode, setViewMode] = useState<'risk' | 'temperature' | 'gas' | 'humidity'>('risk');

  useEffect(() => {
    const animate = () => {
      setAnimationFrame(prev => prev + 1);
    };
    const interval = setInterval(animate, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw modern factory layout with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw zones with modern styling
    const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
    zones.forEach((zone, i) => {
      const x = (i % 2) * (canvas.width / 2);
      const y = Math.floor(i / 2) * (canvas.height / 2);
      const w = canvas.width / 2;
      const h = canvas.height / 2;

      // Zone background
      ctx.fillStyle = 'rgba(51, 65, 85, 0.3)';
      ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
      
      // Zone border with glow effect
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
      ctx.setLineDash([]);
      
      // Zone label with modern styling
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText(zone, x + 15, y + 30);
      
      // Zone status indicator
      const zoneRisk = getZoneRiskLevel(sensors.filter(s => s.floor === floor && s.zone === zone));
      ctx.fillStyle = zoneRisk > 70 ? '#ef4444' : zoneRisk > 40 ? '#f59e0b' : '#10b981';
      ctx.beginPath();
      ctx.arc(x + w - 25, y + 25, 8, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw enhanced heatmap with different view modes
    sensors.filter(s => s.floor === floor).forEach(sensor => {
      let value, maxValue, colors;
      
      switch (viewMode) {
        case 'temperature':
          value = sensor.temperature;
          maxValue = 50;
          colors = ['rgba(59, 130, 246, 0.6)', 'rgba(239, 68, 68, 0.6)'];
          break;
        case 'gas':
          value = sensor.gas;
          maxValue = 100;
          colors = ['rgba(34, 197, 94, 0.6)', 'rgba(239, 68, 68, 0.6)'];
          break;
        case 'humidity':
          value = sensor.humidity;
          maxValue = 100;
          colors = ['rgba(34, 197, 94, 0.6)', 'rgba(59, 130, 246, 0.6)'];
          break;
        default:
          value = calculateRiskLevel(sensor);
          maxValue = 100;
          colors = ['rgba(34, 197, 94, 0.6)', 'rgba(239, 68, 68, 0.6)'];
      }
      
      const intensity = Math.min(value / maxValue, 0.8);
      const pulseEffect = 1 + Math.sin(animationFrame * 0.1) * 0.1;
      
      // Create animated gradient
      const outerGradient = ctx.createRadialGradient(
        sensor.x, sensor.y, 0,
        sensor.x, sensor.y, 80 * pulseEffect
      );
      
      const startColor = intensity > 0.7 ? colors[1] : intensity > 0.4 ? 'rgba(251, 146, 60, 0.6)' : colors[0];
      outerGradient.addColorStop(0, startColor.replace('0.6', String(intensity * 0.6)));
      outerGradient.addColorStop(0.5, startColor.replace('0.6', String(intensity * 0.3)));
      outerGradient.addColorStop(1, startColor.replace('0.6', '0'));

      ctx.fillStyle = outerGradient;
      ctx.fillRect(sensor.x - 80, sensor.y - 80, 160, 160);

      // Draw sensor with enhanced styling and animations
      const isSelected = selectedSensor?.id === sensor.id;
      const isHovered = hoverSensor?.id === sensor.id;
      const riskLevel = calculateRiskLevel(sensor);
      
      // Animated sensor glow effect
      if (isSelected || isHovered) {
        const glowSize = 25 + Math.sin(animationFrame * 0.2) * 5;
        const glowGradient = ctx.createRadialGradient(
          sensor.x, sensor.y, 0,
          sensor.x, sensor.y, glowSize
        );
        glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(sensor.x - glowSize, sensor.y - glowSize, glowSize * 2, glowSize * 2);
      }
      
      // Sensor body with status-based colors
      const sensorSize = (isSelected || isHovered ? 12 : 10) + (sensor.status === 'critical' ? Math.sin(animationFrame * 0.3) * 2 : 0);
      ctx.fillStyle = riskLevel > 70 ? '#dc2626' : riskLevel > 40 ? '#d97706' : '#059669';
      ctx.beginPath();
      ctx.arc(sensor.x, sensor.y, sensorSize, 0, 2 * Math.PI);
      ctx.fill();
      
      // Sensor border with glow
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = ctx.fillStyle as string;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Status indicator dot
      if (sensor.status === 'critical') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sensor.x, sensor.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Sensor ID label with background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(sensor.x - 15, sensor.y - 25, 30, 12);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sensor.nodeId, sensor.x, sensor.y - 16);
      ctx.textAlign = 'start';
    });
  }, [sensors, floor, selectedSensor, hoverSensor, animationFrame, viewMode]);

  const calculateRiskLevel = (sensor: SensorData): number => {
    let risk = 0;
    if (sensor.gas > 80) risk += 35;
    if (sensor.flame > 0) risk += 40;
    if (sensor.temperature > 40) risk += 20;
    if (sensor.humidity > 90) risk += 5;
    return Math.min(risk, 100);
  };

  const getZoneRiskLevel = (zoneSensors: SensorData[]): number => {
    if (zoneSensors.length === 0) return 0;
    return zoneSensors.reduce((sum, s) => sum + calculateRiskLevel(s), 0) / zoneSensors.length;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    const clickedSensor = sensors.filter(s => s.floor === floor).find(sensor => {
      const distance = Math.sqrt((x - sensor.x) ** 2 + (y - sensor.y) ** 2);
      return distance <= 15;
    });
    
    setSelectedSensor(clickedSensor || null);
  };

  const handleCanvasHover = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    const hoveredSensor = sensors.filter(s => s.floor === floor).find(sensor => {
      const distance = Math.sqrt((x - sensor.x) ** 2 + (y - sensor.y) ** 2);
      return distance <= 15;
    });
    
    setHoverSensor(hoveredSensor || null);
  };

  const floorSensors = sensors.filter(s => s.floor === floor);
  const avgRisk = floorSensors.length > 0 
    ? floorSensors.reduce((sum, s) => sum + calculateRiskLevel(s), 0) / floorSensors.length 
    : 0;

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-slate-100 font-bold text-lg">
              DHEEMA Risk Analysis - {floor}
            </h3>
            <p className="text-slate-400 text-sm">
              {viewMode === 'risk' ? `Average Risk: ${Math.round(avgRisk)}%` :
               viewMode === 'temperature' ? `Avg Temp: ${Math.round(floorSensors.reduce((sum, s) => sum + s.temperature, 0) / floorSensors.length || 0)}°C` :
               viewMode === 'gas' ? `Avg Gas: ${Math.round(floorSensors.reduce((sum, s) => sum + s.gas, 0) / floorSensors.length || 0)}ppm` :
               `Avg Humidity: ${Math.round(floorSensors.reduce((sum, s) => sum + s.humidity, 0) / floorSensors.length || 0)}%`}
            </p>
          </div>
        </div>
        
        {/* View Mode Selector */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-slate-600/30">
            {[{key: 'risk', icon: AlertTriangle, label: 'Risk'}, 
              {key: 'temperature', icon: Thermometer, label: 'Temp'}, 
              {key: 'gas', icon: Wind, label: 'Gas'}, 
              {key: 'humidity', icon: Droplets, label: 'Humidity'}].map(({key, icon: Icon, label}) => (
              <button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  viewMode === key 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          
          {/* Legend */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-600/30">
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse"></div>
                <span className="text-red-300 font-medium">High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50"></div>
                <span className="text-amber-300 font-medium">Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
                <span className="text-emerald-300 font-medium">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas and Sensor Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Heatmap Canvas */}
        <div className="lg:col-span-2">
          <div className="relative bg-slate-800/30 rounded-xl p-4 border border-slate-600/30">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-80 rounded-lg cursor-pointer"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasHover}
              onMouseLeave={() => setHoverSensor(null)}
            />
            <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <Eye className="h-3 w-3" />
                <span>Click sensors • Live updates every 2s</span>
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <Zap className="h-3 w-3 text-cyan-400" />
                <span>DHEEMA Analysis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Details Panel */}
        <div className="space-y-4">
          {selectedSensor ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-slate-100 font-bold">{selectedSensor.nodeId}</h4>
                <div className={`w-3 h-3 rounded-full ${
                  calculateRiskLevel(selectedSensor) > 70 ? 'bg-red-500' :
                  calculateRiskLevel(selectedSensor) > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                } animate-pulse`}></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Wind className="h-4 w-4 text-blue-400" />
                    <span className="text-slate-300 text-sm">Gas</span>
                  </div>
                  <span className="text-blue-300 font-mono">{Math.round(selectedSensor.gas)}ppm</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-orange-400" />
                    <span className="text-slate-300 text-sm">Temperature</span>
                  </div>
                  <span className="text-orange-300 font-mono">{Math.round(selectedSensor.temperature)}°C</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-cyan-400" />
                    <span className="text-slate-300 text-sm">Humidity</span>
                  </div>
                  <span className="text-cyan-300 font-mono">{Math.round(selectedSensor.humidity)}%</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Flame className="h-4 w-4 text-red-400" />
                    <span className="text-slate-300 text-sm">Flame</span>
                  </div>
                  <span className="text-red-300 font-mono">{selectedSensor.flame}</span>
                </div>
                
                <div className="mt-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm font-medium">Risk Level</span>
                    <span className={`font-bold ${
                      calculateRiskLevel(selectedSensor) > 70 ? 'text-red-400' :
                      calculateRiskLevel(selectedSensor) > 40 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>{Math.round(calculateRiskLevel(selectedSensor))}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        calculateRiskLevel(selectedSensor) > 70 ? 'bg-red-500' :
                        calculateRiskLevel(selectedSensor) > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${calculateRiskLevel(selectedSensor)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 text-center">
              <AlertTriangle className="h-12 w-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">Click on a sensor to view detailed information</p>
            </div>
          )}
          
          {/* Zone Summary */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <h4 className="text-slate-100 font-bold mb-3 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-cyan-400" />
              Zone Summary
            </h4>
            <div className="space-y-2">
              {['Zone A', 'Zone B', 'Zone C', 'Zone D'].map(zone => {
                const zoneSensors = floorSensors.filter(s => s.zone === zone);
                const zoneRisk = getZoneRiskLevel(zoneSensors);
                return (
                  <div key={zone} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                    <span className="text-slate-300 text-sm">{zone}</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        zoneRisk > 70 ? 'bg-red-500' : zoneRisk > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}></div>
                      <span className="text-slate-400 text-xs font-mono">{Math.round(zoneRisk)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}