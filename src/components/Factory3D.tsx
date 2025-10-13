import { useEffect, useRef, useState, useCallback } from 'react';
import { SensorData } from '../types';
import { Box, RotateCcw, Zap, Eye, Settings, Maximize2, Minus, Plus } from 'lucide-react';

interface Factory3DProps {
  sensors: SensorData[];
  floor: string;
}

export default function Factory3D({ sensors, floor }: Factory3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [rotation, setRotation] = useState(0);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Animation loop with requestAnimationFrame for better performance
  const animate = useCallback(() => {
    if (autoRotate) {
      setRotation(prev => (prev + 0.5) % 360);
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [autoRotate]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Drawing functions
  const drawFactory3D = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2 + offset.x;
    const centerY = height / 2 + offset.y;
    const rotRad = (rotation * Math.PI) / 180;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.rotate(rotRad);
    ctx.translate(-centerX, -centerY);
    
    // Enhanced factory floor with perspective
    const floorGradient = ctx.createLinearGradient(0, height - 100, width, height - 200);
    floorGradient.addColorStop(0, '#374151');
    floorGradient.addColorStop(0.5, '#4B5563');
    floorGradient.addColorStop(1, '#6B7280');
    ctx.fillStyle = floorGradient;
    
    ctx.beginPath();
    ctx.moveTo(80, height - 80);
    ctx.lineTo(width - 80, height - 180);
    ctx.lineTo(width - 80, 80);
    ctx.lineTo(80, 180);
    ctx.closePath();
    ctx.fill();
    
    // Grid lines for depth
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    for (let i = 0; i < 5; i++) {
      const x = 80 + (i * (width - 160) / 4);
      ctx.beginPath();
      ctx.moveTo(x, 180);
      ctx.lineTo(x + 100, 80);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // Enhanced factory walls with lighting
    const wallGradient = ctx.createLinearGradient(0, 0, width, 0);
    wallGradient.addColorStop(0, '#4B5563');
    wallGradient.addColorStop(0.5, '#6B7280');
    wallGradient.addColorStop(1, '#374151');
    ctx.fillStyle = wallGradient;
    
    ctx.beginPath();
    ctx.moveTo(80, 180);
    ctx.lineTo(width - 80, 80);
    ctx.lineTo(width - 80, 120);
    ctx.lineTo(80, 220);
    ctx.closePath();
    ctx.fill();
    
    // Enhanced machinery with 3D depth
    const machines = [
      { x: 180, y: 220, w: 100, h: 50, height: 30, color: '#059669', name: 'Mixer' },
      { x: 320, y: 200, w: 80, h: 40, height: 25, color: '#dc2626', name: 'Press' },
      { x: 460, y: 180, w: 90, h: 45, height: 35, color: '#7c3aed', name: 'Dryer' }
    ];

    const time = Date.now() * 0.001;

    machines.forEach((machine, i) => {
      const pulse = 1 + Math.sin(time * 2 + i) * 0.1;
      
      // Machine shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(machine.x + 5, machine.y + 5, machine.w, machine.h);
      
      // Machine base with gradient
      const machineGradient = ctx.createLinearGradient(
        machine.x, machine.y, 
        machine.x + machine.w, machine.y + machine.h
      );
      machineGradient.addColorStop(0, machine.color);
      machineGradient.addColorStop(1, darkenColor(machine.color, 30));
      ctx.fillStyle = machineGradient;
      ctx.fillRect(machine.x, machine.y, machine.w, machine.h);
      
      // Machine top (3D effect with animation)
      ctx.fillStyle = lightenColor(machine.color, 20);
      ctx.beginPath();
      ctx.moveTo(machine.x, machine.y);
      ctx.lineTo(machine.x + 15 * pulse, machine.y - machine.height * pulse);
      ctx.lineTo(machine.x + machine.w + 15 * pulse, machine.y - machine.height * pulse);
      ctx.lineTo(machine.x + machine.w, machine.y);
      ctx.closePath();
      ctx.fill();
      
      // Machine side
      ctx.fillStyle = darkenColor(machine.color, 15);
      ctx.beginPath();
      ctx.moveTo(machine.x + machine.w, machine.y);
      ctx.lineTo(machine.x + machine.w + 15 * pulse, machine.y - machine.height * pulse);
      ctx.lineTo(machine.x + machine.w + 15 * pulse, machine.y + machine.h - machine.height * pulse);
      ctx.lineTo(machine.x + machine.w, machine.y + machine.h);
      ctx.closePath();
      ctx.fill();
      
      // Status light
      ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(machine.x + machine.w - 10, machine.y + 10, 3 * pulse, 0, 2 * Math.PI);
      ctx.fill();

      // Machine label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(machine.name, machine.x + machine.w / 2, machine.y + machine.h + 15);
    });
    
    ctx.restore();
  }, [rotation, zoom, offset]);

  const drawSensor3D = useCallback((ctx: CanvasRenderingContext2D, sensor: SensorData) => {
    const centerX = ctx.canvas.width / 2 + offset.x;
    const centerY = ctx.canvas.height / 2 + offset.y;
    const rotRad = (rotation * Math.PI) / 180;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.rotate(rotRad);
    ctx.translate(-centerX, -centerY);
    
    const x = sensor.x;
    const y = sensor.y;
    const z = (sensor.z || 20) * 0.8;
    const isSelected = selectedSensor?.id === sensor.id;
    const time = Date.now() * 0.001;
    const pulse = 1 + Math.sin(time * 4) * 0.2;

    // Sensor base color with status
    const baseColor = sensor.status === 'critical' ? '#EF4444' : 
                     sensor.status === 'warning' ? '#F59E0B' : '#10B981';
    
    // Sensor shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 3, y + 3, 12, 6, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Sensor glow effect for critical status
    if (sensor.status === 'critical' || isSelected) {
      const glowSize = 20 * pulse;
      const glowGradient = ctx.createRadialGradient(x, y - z/2, 0, x, y - z/2, glowSize);
      glowGradient.addColorStop(0, `${baseColor}80`);
      glowGradient.addColorStop(1, `${baseColor}00`);
      ctx.fillStyle = glowGradient;
      ctx.fillRect(x - glowSize, y - z/2 - glowSize, glowSize * 2, glowSize * 2);
    }
    
    // Sensor base (bottom circle)
    ctx.fillStyle = darkenColor(baseColor, 20);
    ctx.beginPath();
    ctx.arc(x, y, isSelected ? 12 * pulse : 10, 0, 2 * Math.PI);
    ctx.fill();

    // 3D cylinder body with gradient
    const cylinderGradient = ctx.createLinearGradient(x - 10, y - z, x + 10, y);
    cylinderGradient.addColorStop(0, lightenColor(baseColor, 30));
    cylinderGradient.addColorStop(0.5, baseColor);
    cylinderGradient.addColorStop(1, darkenColor(baseColor, 20));
    ctx.fillStyle = cylinderGradient;
    ctx.fillRect(x - (isSelected ? 12 * pulse : 10), y - z, isSelected ? 24 * pulse : 20, z);

    // Top of cylinder (ellipse for 3D effect)
    ctx.fillStyle = lightenColor(baseColor, 40);
    ctx.beginPath();
    ctx.ellipse(x, y - z, isSelected ? 12 * pulse : 10, isSelected ? 6 * pulse : 5, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Sensor border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Status indicator with animation
    if (sensor.status === 'critical') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y - z, 4 * pulse, 0, 2 * Math.PI);
      ctx.fill();
      
      // Blinking effect
      if (Math.floor(time * 10) % 2 === 0) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x, y - z, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Enhanced sensor ID label with background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x - 20, y + 15, 40, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sensor.nodeId, x, y + 26);
    
    // Data visualization above sensor
    if (isSelected) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(x - 30, y - z - 40, 60, 30);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Gas: ${Math.round(sensor.gas)}ppm`, x, y - z - 25);
      ctx.fillText(`Temp: ${Math.round(sensor.temperature)}°C`, x, y - z - 15);
      ctx.fillText(`Hum: ${Math.round(sensor.humidity)}%`, x, y - z - 5);
    }
    
    ctx.restore();
  }, [rotation, selectedSensor, zoom, offset]);

  // Main drawing effect
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(0.5, '#1e293b');
    bgGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw enhanced 3D factory layout
    drawFactory3D(ctx, canvas.width, canvas.height);
    
    // Draw sensors with enhanced 3D effects
    sensors.filter(s => s.floor === floor).forEach(sensor => {
      drawSensor3D(ctx, sensor);
    });

  }, [sensors, floor, drawFactory3D, drawSensor3D]);

  // Utility functions
  const lightenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  };
  
  const darkenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  };

  // Event handlers
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
      return distance <= 20;
    });
    
    setSelectedSensor(clickedSensor || null);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX - offset.x, y: event.clientY - offset.y });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    setOffset({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * zoomFactor)));
  };

  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const floorSensors = sensors.filter(s => s.floor === floor);
  
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Box className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              DHEEMA 3D Monitor - {floor}
            </h3>
            <p className="text-gray-400 text-sm">
              Interactive 3D visualization • {floorSensors.length} sensors active
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              autoRotate 
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            <span className="text-sm">{autoRotate ? 'Auto' : 'Manual'}</span>
          </button>
          <button
            onClick={resetView}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300"
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm">Reset</span>
          </button>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <div className="relative bg-slate-900/50 rounded-2xl p-4 border border-white/10 mb-6">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-96 rounded-xl cursor-pointer touch-none"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
        
        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-2 border border-white/20 flex flex-col space-y-2">
          <button
            onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>
          <div className="text-center text-xs text-white px-2">
            {Math.round(zoom * 100)}%
          </div>
          <button
            onClick={() => setZoom(prev => Math.max(0.5, prev * 0.8))}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Minus className="h-4 w-4 text-white" />
          </button>
        </div>
        
        {/* Status Overlay */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 border border-white/20">
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              <span className="text-red-300 font-medium">Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
              <span className="text-yellow-300 font-medium">Warning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
              <span className="text-green-300 font-medium">Normal</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span>Click sensors • Drag to pan • Scroll to zoom</span>
          </div>
        </div>
        
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
          <div className="text-xs text-gray-300">
            <div>Rotation: {Math.round(rotation)}°</div>
            <div>Sensors: {floorSensors.length}</div>
            <div>Zoom: {Math.round(zoom * 100)}%</div>
          </div>
        </div>
      </div>
      
      {/* Sensor Details */}
      {selectedSensor && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 relative z-10 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-bold text-lg flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                selectedSensor.status === 'critical' ? 'bg-red-500 animate-pulse' :
                selectedSensor.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              {selectedSensor.nodeId} - Detailed View
            </h4>
            <button
              onClick={() => setSelectedSensor(null)}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
              <div className="text-blue-300 text-sm font-medium mb-1">Gas Level</div>
              <div className="text-white text-2xl font-bold">{Math.round(selectedSensor.gas)}<span className="text-sm text-blue-300 ml-1">ppm</span></div>
            </div>
            <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-500/30">
              <div className="text-orange-300 text-sm font-medium mb-1">Temperature</div>
              <div className="text-white text-2xl font-bold">{Math.round(selectedSensor.temperature)}<span className="text-sm text-orange-300 ml-1">°C</span></div>
            </div>
            <div className="bg-cyan-500/20 rounded-xl p-4 border border-cyan-500/30">
              <div className="text-cyan-300 text-sm font-medium mb-1">Humidity</div>
              <div className="text-white text-2xl font-bold">{Math.round(selectedSensor.humidity)}<span className="text-sm text-cyan-300 ml-1">%</span></div>
            </div>
            <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30">
              <div className="text-red-300 text-sm font-medium mb-1">Flame Status</div>
              <div className="text-white text-2xl font-bold">{selectedSensor.flame ? 'DETECTED' : 'CLEAR'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}