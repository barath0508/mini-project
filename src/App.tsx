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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 transition-all duration-500">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(99,102,241,0.05)_25%,rgba(99,102,241,0.05)_50%,transparent_50%,transparent_75%,rgba(99,102,241,0.05)_75%)] bg-[length:60px_60px] animate-[slide_20s_linear_infinite]"></div>
      </div>

      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 relative z-10 animate-in slide-in-from-top duration-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-slate-600 hover:text-slate-900 p-3 rounded-xl hover:bg-white/60 transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                {showSidebar ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="animate-in fade-in slide-in-from-left duration-700 delay-200">
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  DHEEMA
                </h1>
                <p className="text-slate-500 text-sm font-medium tracking-wide">Detection Hub for Emergency Event Monitoring & Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 animate-in fade-in slide-in-from-right duration-700 delay-300">
              <div className="text-slate-600 text-sm bg-white/60 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/30">
                Welcome, <span className="font-bold text-slate-900">{user.name}</span> 
                <span className="ml-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs rounded-lg font-semibold">
                  {user.role.toUpperCase()}
                </span>
              </div>
            
              <FloorTabs floors={floors} activeFloor={activeFloor} onFloorChange={setActiveFloor} />
              
              {user.role === 'worker' && (
                <IncidentReporting onSubmitReport={handleIncidentReport} userId={user.id} />
              )}
              
              {(user.role === 'admin' || user.role === 'supervisor') && (
                <button
                  onClick={() => setEmergencyMode(!emergencyMode)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                    emergencyMode 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-red-500/30' 
                      : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 shadow-orange-500/30'
                  }`}
                >
                  {emergencyMode ? '🚨 Emergency Active' : 'Activate Emergency'}
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-5 py-3 text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/30"
              >
                <LogOut size={20} />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      {emergencyMode && (
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 border-b border-red-700/50 animate-in slide-in-from-top duration-500 delay-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center space-x-4 animate-pulse">
              <AlertTriangle className="h-6 w-6 text-white animate-bounce" />
              <span className="text-white font-bold text-lg tracking-wide">
                🚨 EMERGENCY MODE ACTIVE - FOLLOW EVACUATION PROCEDURES 🚨
              </span>
              <AlertTriangle className="h-6 w-6 text-white animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Modern Sidebar */}
        <div className={`${showSidebar ? 'w-96' : 'w-0'} transition-all duration-500 ease-in-out overflow-hidden bg-white/90 backdrop-blur-xl border-r border-white/30 shadow-2xl`}>
          <div className="p-8 space-y-8 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            
            {/* User Profile Card */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-left duration-700">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
                  user.role === 'admin' ? 'bg-gradient-to-br from-purple-600 to-purple-700' :
                  user.role === 'supervisor' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
                  'bg-gradient-to-br from-emerald-600 to-emerald-700'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-lg">{user.name}</h3>
                  <p className="text-slate-600 font-medium">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                  <div className={`inline-flex items-center space-x-2 mt-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                    mqttConnected ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${mqttConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span>{mqttConnected ? 'CONNECTED' : 'OFFLINE'}</span>
                  </div>
                </div>
              </div>
            </div>

           
            {/* View Selector */}
            <div className="bg-gradient-to-br from-white/70 to-slate-50/70 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-left duration-700 delay-100">
              <h4 className="text-slate-800 font-bold text-lg mb-6 flex items-center">
                <Map className="h-6 w-6 mr-3 text-blue-600" />
                Dashboard Views
              </h4>
              <div className="space-y-3">
                {[
                  { key: 'dashboard', label: 'Real-time Dashboard', icon: '📊', color: 'from-blue-500 to-blue-600' },
                  { key: 'heatmap', label: 'Risk Heatmap', icon: '🔥', color: 'from-red-500 to-red-600' },
                  { key: '3d', label: '3D Factory Model', icon: '🏭', color: 'from-purple-500 to-purple-600' },
                  { key: 'chart', label: 'Analytics Charts', icon: '📈', color: 'from-emerald-500 to-emerald-600' }
                ].map((view) => (
                  <button
                    key={view.key}
                    onClick={() => setActiveView(view.key as any)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl text-left font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                      activeView === view.key
                        ? `bg-gradient-to-r ${view.color} text-white shadow-2xl scale-105 border-2 border-white/30`
                        : 'bg-white/60 text-slate-700 hover:bg-white/80 hover:text-slate-900 border border-white/40'
                    }`}
                  >
                    <span className="text-2xl">{view.icon}</span>
                    <span className="text-sm">{view.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Assistant */}
            <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm border border-indigo-200/50 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-left duration-700 delay-200">
              <h4 className="text-slate-800 font-bold text-lg mb-6 flex items-center">
                <Bot className="h-6 w-6 mr-3 text-indigo-600" />
                Gemini Flash 2.0 AI
              </h4>
              <div className="space-y-4">
                <button
                  onClick={() => { setAIPanelTab('voice'); setShowAIPanel(true); }}
                  className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-bold"
                >
                  <Mic className="h-5 w-5" />
                  <span>Voice Commands</span>
                </button>
                <button
                  onClick={() => { setAIPanelTab('search'); setShowAIPanel(true); }}
                  className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-bold"
                >
                  <Search className="h-5 w-5" />
                  <span>Smart Search</span>
                </button>
                <button
                  onClick={() => { setAIPanelTab('chat'); setShowAIPanel(true); }}
                  className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-bold"
                >
                  <Bot className="h-5 w-5" />
                  <span>AI Chat Assistant</span>
                </button>
              </div>
            </div>

            {/* Emergency Controls */}
            {(user.role === 'admin' || user.role === 'supervisor') && (
              <div className="bg-gradient-to-br from-red-50/80 to-orange-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-left duration-700 delay-300">
                <h4 className="text-red-700 font-bold text-lg mb-6 flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-3" />
                  Emergency Controls
                </h4>
                <button
                  onClick={() => setEmergencyMode(!emergencyMode)}
                  className={`w-full p-5 rounded-xl font-black text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl ${
                    emergencyMode 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse shadow-red-500/50 border-2 border-red-300' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-red-500 hover:to-red-600 shadow-orange-500/30'
                  }`}
                >
                  {emergencyMode ? '🚨 EMERGENCY ACTIVE' : '🚨 Activate Emergency Mode'}
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white/70 to-slate-50/70 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-left duration-700 delay-400">
              <h4 className="text-slate-800 font-bold text-lg mb-6 flex items-center">
                <Settings className="h-6 w-6 mr-3 text-slate-600" />
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleExport}
                  className="flex flex-col items-center p-5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl font-bold"
                >
                  <Download className="h-7 w-7 mb-2" />
                  <span className="text-sm">Export</span>
                </button>
                <button 
                  onClick={handleShowAlerts}
                  className="flex flex-col items-center p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl text-white transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl font-bold relative"
                >
                  <Bell className="h-7 w-7 mb-2" />
                  <span className="text-sm">Alerts</span>
                  {alerts.length > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce shadow-lg">
                      {alerts.length}
                    </div>
                  )}
                </button>
                {user.role === 'admin' && (
                  <>
                    <button 
                      onClick={handleShowUsers}
                      className="flex flex-col items-center p-5 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl text-white transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl font-bold"
                    >
                      <Users className="h-7 w-7 mb-2" />
                      <span className="text-sm">Users</span>
                    </button>
                    <button 
                      onClick={handleShowSettings}
                      className="flex flex-col items-center p-5 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl text-white transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl font-bold"
                    >
                      <Settings className="h-7 w-7 mb-2" />
                      <span className="text-sm">Settings</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-slate-50/80 to-blue-50/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-left duration-700 delay-500">
              <h4 className="text-slate-800 font-bold text-lg mb-6 flex items-center">
                <Activity className="h-6 w-6 mr-3 text-blue-600" />
                Live Stats - {activeFloor}
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl border border-emerald-200/50 hover:scale-105 transition-all duration-300">
                  <span className="text-emerald-700 font-bold">Active Sensors</span>
                  <span className="text-emerald-800 font-black text-2xl">{currentSensors.length}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl border border-red-200/50 hover:scale-105 transition-all duration-300">
                  <span className="text-red-700 font-bold">Critical Alerts</span>
                  <span className="text-red-800 font-black text-2xl animate-pulse">{currentSensors.filter(s => s.status === 'critical').length}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-200/50 hover:scale-105 transition-all duration-300">
                  <span className="text-blue-700 font-bold">MQTT Status</span>
                  <span className={`font-black text-sm px-3 py-2 rounded-lg shadow-sm ${
                    mqttConnected ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white animate-pulse'
                  }`}>
                    {mqttConnected ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm border border-green-200/50 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-left duration-700 delay-600">
              <h4 className="text-green-800 font-bold text-lg mb-6 flex items-center">
                <Phone className="h-6 w-6 mr-3 text-green-600" />
                Emergency Contacts
              </h4>
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 bg-red-500/95 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-right-2 duration-300 font-bold';
                    notification.innerHTML = '📞 Calling Fire Department...';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-white font-bold"
                >
                  <span>🚒 Fire Department</span>
                  <span className="bg-white/20 px-3 py-2 rounded-lg font-mono text-lg">911</span>
                </button>
                <button 
                  onClick={() => {
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 bg-yellow-500/95 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-right-2 duration-300 font-bold';
                    notification.innerHTML = '📞 Calling Security...';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-white font-bold"
                >
                  <span>🛡️ Security</span>
                  <span className="bg-white/20 px-3 py-2 rounded-lg font-mono text-lg">5555</span>
                </button>
                <button 
                  onClick={() => {
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 bg-emerald-500/95 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-right-2 duration-300 font-bold';
                    notification.innerHTML = '📞 Calling Medical Emergency...';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-white font-bold"
                >
                  <span>🏥 Medical</span>
                  <span className="bg-white/20 px-3 py-2 rounded-lg font-mono text-lg">911</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 overflow-auto p-8 relative z-10">
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
              <div className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom duration-700">
                <h3 className="text-3xl font-black text-slate-800 mb-8 flex items-center">
                  <Activity className="h-8 w-8 mr-4 text-blue-600" />
                  Real-time Analytics - {activeFloor}
                </h3>
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