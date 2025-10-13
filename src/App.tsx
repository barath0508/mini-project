import { useEffect, useState } from 'react';
import { User, SensorData, Alert, IncidentReport } from './types';
import Login from './components/Login';
import FloorTabs from './components/FloorTabs';
import RealTimeDashboard from './components/RealTimeDashboard';
import ControlPanel from './components/ControlPanel';
import AIPanel from './components/AIPanel';
import Heatmap from './components/Heatmap';
import Factory3D from './components/Factory3D';
import SensorChart from './components/SensorChart';
import EmergencyEvacuation from './components/EmergencyEvacuation';
import IncidentReporting from './components/IncidentReporting';
import { MQTTService } from './services/mqttService';
import { Shield, LogOut, Menu, X, Wifi, WifiOff, Settings, Building, Map, Bot, AlertTriangle, Phone, Bell, Download, Users, Mic, Search, Activity } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeFloor, setActiveFloor] = useState('Floor 1');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPanelTab, setAIPanelTab] = useState<'voice' | 'search' | 'chat'>('chat');
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'heatmap' | '3d' | 'chart'>('dashboard');
  const [mqttConnected, setMqttConnected] = useState(false);
  const [mqttService] = useState(() => new MQTTService());
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Real-time MQTT data connection


  useEffect(() => {
    if (user) {
      mqttService.connect(
        (newSensorData: SensorData) => {
          setSensors(prev => {
            const updated = prev.filter(s => s.id !== newSensorData.id);
            return [...updated, newSensorData];
          });
          
          // Generate alerts for critical conditions
          if (newSensorData.status === 'critical') {
            const newAlert: Alert = {
              id: Date.now().toString(),
              type: newSensorData.flame > 0 ? 'fire' : newSensorData.gas > 90 ? 'gas' : 'temperature',
              message: `Critical alert in ${newSensorData.floor} ${newSensorData.zone}: ${newSensorData.flame > 0 ? 'Fire detected!' : newSensorData.gas > 90 ? `High gas level: ${newSensorData.gas}ppm` : `High temperature: ${newSensorData.temperature}°C`}`,
              severity: 'high',
              location: `${newSensorData.floor} - ${newSensorData.zone}`,
              timestamp: newSensorData.timestamp,
              acknowledged: false
            };
            setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
          }
        },
        (connected: boolean) => {
          setMqttConnected(connected);
        }
      );
    }

    return () => {
      mqttService.disconnect();
    };
  }, [user, mqttService]);

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('emergency') || lowerCommand.includes('evacuation')) {
      setEmergencyMode(true);
    } else if (lowerCommand.includes('gas') && lowerCommand.includes('zone')) {
      alert('Gas levels are within normal range in all zones.');
    } else if (lowerCommand.includes('temperature')) {
      alert('Current temperature: 28°C average across all zones.');
    }
  };

  const handleIncidentReport = (report: Omit<IncidentReport, 'id' | 'timestamp'>) => {
    const newReport: IncidentReport = {
      ...report,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setIncidents(prev => [...prev, newReport]);
    alert('Incident report submitted successfully!');
  };

  const handleEmergencyBroadcast = (message: string) => {
    alert(`Emergency broadcast sent: ${message}`);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleExport = () => {
    const data = {
      sensors: currentSensors,
      alerts: alerts,
      timestamp: new Date().toISOString(),
      floor: activeFloor
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safety-report-${activeFloor}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-emerald-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg z-50 animate-in slide-in-from-right-2 duration-300';
    notification.innerHTML = '✅ Report exported successfully!';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const handleShowAlerts = () => {
    setShowAlertsModal(true);
  };

  const handleShowUsers = () => {
    if (user?.role === 'admin') {
      setShowUsersModal(true);
    } else {
      // Show access denied notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg z-50 animate-in slide-in-from-right-2 duration-300';
      notification.innerHTML = '🚫 Access denied - Admin only';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  };

  const handleShowSettings = () => {
    if (user?.role === 'admin') {
      setShowSettingsModal(true);
    } else {
      // Show access denied notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg z-50 animate-in slide-in-from-right-2 duration-300';
      notification.innerHTML = '🚫 Access denied - Admin only';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const floors = ['Floor 1', 'Floor 2', 'Warehouse'];
  const currentSensors = sensors.filter(s => s.floor === activeFloor);
  const currentData = currentSensors.length > 0 ? currentSensors.map(s => ({
    gas: s.gas,
    flame: s.flame,
    temperature: s.temperature,
    humidity: s.humidity,
    prediction: s.prediction,
    timestamp: s.timestamp
  })) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-800 relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="bg-white/5 backdrop-blur-2xl shadow-2xl border-b border-white/10 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-blue-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-gray-400 hover:text-white p-3 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
              >
                {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  DHEEMA
                </h1>
                <p className="text-gray-500 text-xs mt-1">Detection Hub for Emergency Event Monitoring & Analysis</p>
                <div className="flex items-center space-x-6">
                  <span className="text-gray-400 text-sm">Welcome, <span className="text-cyan-400 font-semibold">{user.name}</span> <span className="text-purple-400">({user.role})</span></span>
                  
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <FloorTabs floors={floors} activeFloor={activeFloor} onFloorChange={setActiveFloor} />
              
              {user.role === 'worker' && (
                <IncidentReporting onSubmitReport={handleIncidentReport} userId={user.id} />
              )}
              
              {(user.role === 'admin' || user.role === 'supervisor') && (
                <button
                  onClick={() => setEmergencyMode(!emergencyMode)}
                  className={`flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-sm ${
                    emergencyMode 
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-2xl shadow-red-500/40 animate-pulse scale-105' 
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-xl hover:shadow-amber-500/30 hover:scale-105 border border-amber-500/30'
                  }`}
                >
                  {emergencyMode ? '🚨 EMERGENCY ACTIVE' : 'Activate Emergency'}
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                <LogOut size={18} />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      {emergencyMode && (
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-b border-red-600/50 animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <span className="text-red-100 font-bold text-lg tracking-wide">
                🚨 EMERGENCY MODE ACTIVE - FOLLOW EVACUATION PROCEDURES 🚨
              </span>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Modern Sidebar */}
        <div className={`${showSidebar ? 'w-96' : 'w-0'} transition-all duration-500 overflow-hidden bg-white/5 backdrop-blur-3xl border-r border-white/10 relative`}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent"></div>
          <div className="p-6 space-y-6 relative z-10 h-full overflow-y-auto">
            
            {/* User Profile Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                  user.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  user.role === 'supervisor' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{user.name}</h3>
                  <p className="text-gray-400 text-sm">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                  <div className={`inline-flex items-center space-x-2 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    mqttConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${mqttConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <span>{mqttConnected ? 'CONNECTED' : 'OFFLINE'}</span>
                  </div>
                </div>
              </div>
            </div>

           
            {/* View Selector */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
              <h4 className="text-white font-bold mb-4 flex items-center">
                <Map className="h-5 w-5 mr-3 text-cyan-400" />
                Dashboard Views
              </h4>
              <div className="space-y-3">
                {[
                  { key: 'dashboard', label: 'Real-time Dashboard', icon: '📊' },
                  { key: 'heatmap', label: 'Risk Heatmap', icon: '🔥' },
                  { key: '3d', label: '3D Factory Model', icon: '🏭' },
                  { key: 'chart', label: 'Analytics Charts', icon: '📈' }
                ].map((view) => (
                  <button
                    key={view.key}
                    onClick={() => setActiveView(view.key as any)}
                    className={`w-full flex items-center space-x-3 p-4 rounded-2xl text-left font-semibold transition-all duration-300 ${
                      activeView === view.key
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30 scale-105'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{view.icon}</span>
                    <span>{view.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Assistant */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
              <h4 className="text-white font-bold mb-4 flex items-center">
                <Bot className="h-5 w-5 mr-3 text-purple-400" />
                Gemini Flash 2.0
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => { setAIPanelTab('voice'); setShowAIPanel(true); }}
                  className="w-full flex items-center space-x-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-2xl text-blue-300 hover:text-white transition-all duration-300 border border-blue-500/30"
                >
                  <Mic className="h-5 w-5" />
                  <span className="font-semibold">Voice Commands</span>
                </button>
                <button
                  onClick={() => { setAIPanelTab('search'); setShowAIPanel(true); }}
                  className="w-full flex items-center space-x-3 p-4 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-2xl text-emerald-300 hover:text-white transition-all duration-300 border border-emerald-500/30"
                >
                  <Search className="h-5 w-5" />
                  <span className="font-semibold">Smart Search</span>
                </button>
                <button
                  onClick={() => { setAIPanelTab('chat'); setShowAIPanel(true); }}
                  className="w-full flex items-center space-x-3 p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-2xl text-purple-300 hover:text-white transition-all duration-300 border border-purple-500/30"
                >
                  <Bot className="h-5 w-5" />
                  <span className="font-semibold">AI Chat</span>
                </button>
              </div>
            </div>

            {/* Emergency Controls */}
            {(user.role === 'admin' || user.role === 'supervisor') && (
              <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-3xl p-6">
                <h4 className="text-red-300 font-bold mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3" />
                  Emergency Controls
                </h4>
                <button
                  onClick={() => setEmergencyMode(!emergencyMode)}
                  className={`w-full p-4 rounded-2xl font-bold transition-all duration-300 ${
                    emergencyMode 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-lg shadow-red-500/30' 
                      : 'bg-white/10 text-red-300 hover:bg-red-500/20 hover:text-white border border-red-500/30'
                  }`}
                >
                  {emergencyMode ? '🚨 EMERGENCY ACTIVE' : 'Activate Emergency Mode'}
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
              <h4 className="text-white font-bold mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-3 text-gray-400" />
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleExport}
                  className="flex flex-col items-center p-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-2xl text-blue-300 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  <Download className="h-6 w-6 mb-2" />
                  <span className="text-xs font-semibold">Export</span>
                </button>
                <button 
                  onClick={handleShowAlerts}
                  className="flex flex-col items-center p-4 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-2xl text-emerald-300 hover:text-white transition-all duration-300 hover:scale-105 relative"
                >
                  <Bell className="h-6 w-6 mb-2" />
                  <span className="text-xs font-semibold">Alerts</span>
                  {alerts.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {alerts.length}
                    </div>
                  )}
                </button>
                {user.role === 'admin' && (
                  <>
                    <button 
                      onClick={handleShowUsers}
                      className="flex flex-col items-center p-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-2xl text-purple-300 hover:text-white transition-all duration-300 hover:scale-105"
                    >
                      <Users className="h-6 w-6 mb-2" />
                      <span className="text-xs font-semibold">Users</span>
                    </button>
                    <button 
                      onClick={handleShowSettings}
                      className="flex flex-col items-center p-4 bg-orange-500/20 hover:bg-orange-500/30 rounded-2xl text-orange-300 hover:text-white transition-all duration-300 hover:scale-105"
                    >
                      <Settings className="h-6 w-6 mb-2" />
                      <span className="text-xs font-semibold">Settings</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
              <h4 className="text-white font-bold mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-3 text-cyan-400" />
                Quick Stats - {activeFloor}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/20 rounded-2xl">
                  <span className="text-emerald-300 font-semibold">Active Sensors</span>
                  <span className="text-emerald-400 font-bold text-xl">{currentSensors.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-2xl">
                  <span className="text-red-300 font-semibold">Critical Alerts</span>
                  <span className="text-red-400 font-bold text-xl">{currentSensors.filter(s => s.status === 'critical').length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-2xl">
                  <span className="text-blue-300 font-semibold">MQTT Status</span>
                  <span className={`font-bold text-sm px-2 py-1 rounded-full ${
                    mqttConnected ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300'
                  }`}>
                    {mqttConnected ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
              <h4 className="text-white font-bold mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-3 text-green-400" />
                Emergency Contacts
              </h4>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg z-50 animate-in slide-in-from-right-2 duration-300';
                    notification.innerHTML = '📞 Calling Fire Department...';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-red-500/20 hover:bg-red-500/30 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  <span className="text-red-300 font-semibold">Fire Department</span>
                  <span className="text-red-400 font-bold font-mono bg-red-500/30 px-3 py-1 rounded-full">911</span>
                </button>
                <button 
                  onClick={() => {
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 bg-yellow-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg z-50 animate-in slide-in-from-right-2 duration-300';
                    notification.innerHTML = '📞 Calling Security...';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  <span className="text-yellow-300 font-semibold">Security</span>
                  <span className="text-yellow-400 font-bold font-mono bg-yellow-500/30 px-3 py-1 rounded-full">5555</span>
                </button>
                <button 
                  onClick={() => {
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 bg-emerald-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg z-50 animate-in slide-in-from-right-2 duration-300';
                    notification.innerHTML = '📞 Calling Medical Emergency...';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  <span className="text-emerald-300 font-semibold">Medical</span>
                  <span className="text-emerald-400 font-bold font-mono bg-emerald-500/30 px-3 py-1 rounded-full">911</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6 relative z-10">
            {/* Emergency Banner */}
            {emergencyMode && (
              <div className="mb-6">
                <EmergencyEvacuation
                  isActive={emergencyMode}
                  floor={activeFloor}
                  onBroadcast={handleEmergencyBroadcast}
                />
              </div>
            )}

            {/* Dynamic Content Based on Active View */}
            {activeView === 'dashboard' && (
              <RealTimeDashboard
                user={user}
                sensors={currentSensors}
                activeFloor={activeFloor}
                emergencyMode={emergencyMode}
              />
            )}
            
            {activeView === 'heatmap' && (
              <Heatmap sensors={currentSensors} floor={activeFloor} />
            )}
            
            {activeView === '3d' && (
              <Factory3D sensors={currentSensors} floor={activeFloor} />
            )}
            
            {activeView === 'chart' && currentData.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Real-time Analytics - {activeFloor}</h3>
                <SensorChart data={currentData} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AIPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        activeTab={aiPanelTab}
        sensors={currentSensors}
        alerts={alerts}
        onVoiceCommand={handleVoiceCommand}
      />

      {/* Alerts Modal */}
      {showAlertsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Bell className="h-6 w-6 mr-3 text-emerald-400" />
                  Recent Alerts ({alerts.length})
                </h3>
                <button
                  onClick={() => setShowAlertsModal(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-2xl border ${
                      alert.severity === 'high' ? 'bg-red-500/20 border-red-500/30' :
                      alert.severity === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30' :
                      'bg-blue-500/20 border-blue-500/30'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-white mb-1">{alert.message}</h4>
                          <p className="text-gray-400 text-sm">{alert.location}</p>
                          <p className="text-gray-500 text-xs mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          alert.severity === 'high' ? 'bg-red-500/30 text-red-300' :
                          alert.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                          'bg-blue-500/30 text-blue-300'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No alerts at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Modal */}
      {showUsersModal && user.role === 'admin' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl w-full max-w-2xl">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Users className="h-6 w-6 mr-3 text-purple-400" />
                  User Management
                </h3>
                <button
                  onClick={() => setShowUsersModal(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { name: 'System Administrator', role: 'admin', status: 'online', email: 'admin@factory.com' },
                  { name: 'Floor Supervisor', role: 'supervisor', status: 'online', email: 'supervisor@factory.com' },
                  { name: 'Factory Worker', role: 'worker', status: 'offline', email: 'worker@factory.com' }
                ].map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                        u.role === 'admin' ? 'bg-purple-500' :
                        u.role === 'supervisor' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{u.name}</h4>
                        <p className="text-gray-400 text-sm">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.status === 'online' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {u.status.toUpperCase()}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                        u.role === 'supervisor' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {u.role.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && user.role === 'admin' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl w-full max-w-2xl">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Settings className="h-6 w-6 mr-3 text-orange-400" />
                  System Settings
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-white/10 rounded-2xl p-4">
                  <h4 className="text-white font-semibold mb-3">Alert Thresholds</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Gas Level (ppm)</span>
                      <input type="number" defaultValue="70" className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white w-20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Temperature (°C)</span>
                      <input type="number" defaultValue="35" className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white w-20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Humidity (%)</span>
                      <input type="number" defaultValue="85" className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white w-20" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <h4 className="text-white font-semibold mb-3">Notification Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">Email Notifications</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">SMS Alerts</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">WhatsApp Integration</span>
                    </label>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowSettingsModal(false);
                    // Show success notification
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 bg-emerald-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg z-50 animate-in slide-in-from-right-2 duration-300';
                    notification.innerHTML = '✅ Settings saved successfully!';
                    document.body.appendChild(notification);
                    setTimeout(() => {
                      notification.remove();
                    }, 3000);
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;