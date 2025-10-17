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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">

      {/* Header */}
      <div className="glass-strong relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="glass-button text-white/90 p-3 rounded-xl"
              >
                {showSidebar ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center">
                <Shield className="h-9 w-9 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">
                  DHEEMA
                </h1>
                <p className="glass-text text-base font-medium">Detection Hub for Emergency Event Monitoring & Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="glass text-white/90 px-5 py-3 rounded-xl">
                Welcome, <span className="font-bold text-white">{user.name}</span> 
                <span className="ml-3 px-3 py-1 glass text-white text-sm rounded-lg font-semibold">
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
                  className={`px-6 py-3 rounded-xl font-bold glass-button ${
                    emergencyMode 
                      ? 'bg-gradient-to-r from-red-500/80 to-red-600/80 text-white' 
                      : 'bg-gradient-to-r from-orange-500/80 to-amber-600/80 text-white'
                  }`}
                >
                  {emergencyMode ? '🚨 Emergency Active' : 'Activate Emergency'}
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-5 py-3 glass-button text-white/90 rounded-xl"
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
        <div className="glass bg-gradient-to-r from-red-500/30 to-red-500/30 border-b border-red-400/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
            <div className="flex items-center justify-center space-x-4">
              <AlertTriangle className="h-7 w-7 text-red-300" />
              <span className="text-white font-bold text-xl">
                🚨 EMERGENCY MODE ACTIVE - FOLLOW EVACUATION PROCEDURES 🚨
              </span>
              <AlertTriangle className="h-7 w-7 text-red-300" />
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'w-[26rem]' : 'w-0'} overflow-hidden glass-strong border-r border-white/20`}>
          <div className="p-8 space-y-8 h-full overflow-y-auto">
            
            {/* User Profile Card */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center space-x-5">
                <div className={`w-18 h-18 rounded-2xl flex items-center justify-center text-2xl font-black text-white ${
                  user.role === 'admin' ? 'bg-gradient-to-br from-purple-500/80 to-purple-600/80' :
                  user.role === 'supervisor' ? 'bg-gradient-to-br from-blue-500/80 to-blue-600/80' :
                  'bg-gradient-to-br from-emerald-500/80 to-emerald-600/80'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="glass-text font-bold text-xl">{user.name}</h3>
                  <p className="text-white/70 font-medium text-lg">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                  <div className={`inline-flex items-center space-x-2 mt-3 px-4 py-2 rounded-full text-sm font-bold glass-subtle ${
                    mqttConnected ? 'text-emerald-300' : 'text-red-300'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${mqttConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                    <span>{mqttConnected ? 'CONNECTED' : 'OFFLINE'}</span>
                  </div>
                </div>
              </div>
            </div>

           
            {/* View Selector */}
            <div className="glass rounded-3xl p-6">
              <h4 className="glass-text font-bold text-xl mb-6 flex items-center">
                <Map className="h-7 w-7 mr-4 text-blue-300" />
                Dashboard Views
              </h4>
              <div className="space-y-4">
                {[
                  { key: 'dashboard', label: 'Real-time Dashboard', icon: '📊', color: 'from-blue-500/80 to-blue-600/80' },
                  { key: 'heatmap', label: 'Risk Heatmap', icon: '🔥', color: 'from-red-500/80 to-red-600/80' },
                  { key: '3d', label: '3D Factory Model', icon: '🏭', color: 'from-purple-500/80 to-purple-600/80' },
                  { key: 'chart', label: 'Analytics Charts', icon: '📈', color: 'from-emerald-500/80 to-emerald-600/80' }
                ].map((view) => (
                  <button
                    key={view.key}
                    onClick={() => setActiveView(view.key as any)}
                    className={`w-full flex items-center space-x-5 p-5 rounded-2xl text-left font-bold ${
                      activeView === view.key
                        ? `bg-gradient-to-r ${view.color} text-white`
                        : 'glass-subtle text-white/80 hover:text-white'
                    }`}
                  >
                    <span className="text-3xl">{view.icon}</span>
                    <span className="text-base">{view.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Assistant */}
            <div className="glass rounded-3xl p-6">
              <h4 className="glass-text font-bold text-xl mb-6 flex items-center">
                <Bot className="h-7 w-7 mr-4 text-purple-300" />
                Gemini Flash 2.0 AI
              </h4>
              <div className="space-y-4">
                <button
                  onClick={() => { setAIPanelTab('voice'); setShowAIPanel(true); }}
                  className="w-full flex items-center space-x-5 p-5 bg-gradient-to-r from-blue-500/80 to-blue-600/80 rounded-2xl text-white glass-button font-bold text-base"
                >
                  <Mic className="h-6 w-6" />
                  <span>Voice Commands</span>
                </button>
                <button
                  onClick={() => { setAIPanelTab('search'); setShowAIPanel(true); }}
                  className="w-full flex items-center space-x-5 p-5 bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 rounded-2xl text-white glass-button font-bold text-base"
                >
                  <Search className="h-6 w-6" />
                  <span>Smart Search</span>
                </button>
                <button
                  onClick={() => { setAIPanelTab('chat'); setShowAIPanel(true); }}
                  className="w-full flex items-center space-x-5 p-5 bg-gradient-to-r from-purple-500/80 to-purple-600/80 rounded-2xl text-white glass-button font-bold text-base"
                >
                  <Bot className="h-6 w-6" />
                  <span>AI Chat Assistant</span>
                </button>
              </div>
            </div>

            {/* Emergency Controls */}
            {(user.role === 'admin' || user.role === 'supervisor') && (
              <div className="glass rounded-3xl p-6">
                <h4 className="text-red-300 font-bold text-xl mb-6 flex items-center">
                  <AlertTriangle className="h-7 w-7 mr-4" />
                  Emergency Controls
                </h4>
                <button
                  onClick={() => setEmergencyMode(!emergencyMode)}
                  className={`w-full p-6 rounded-2xl font-black text-xl glass-button ${
                    emergencyMode 
                      ? 'bg-gradient-to-r from-red-500/80 to-red-600/80 text-white' 
                      : 'bg-gradient-to-r from-orange-500/80 to-red-500/80 text-white'
                  }`}
                >
                  {emergencyMode ? '🚨 EMERGENCY ACTIVE' : '🚨 Activate Emergency Mode'}
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="glass rounded-3xl p-6">
              <h4 className="glass-text font-bold text-xl mb-6 flex items-center">
                <Settings className="h-7 w-7 mr-4 text-blue-300" />
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-5">
                <button 
                  onClick={handleExport}
                  className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-500/80 to-blue-600/80 rounded-2xl text-white glass-button font-bold"
                >
                  <Download className="h-8 w-8 mb-3" />
                  <span className="text-base">Export</span>
                </button>
                <button 
                  onClick={handleShowAlerts}
                  className="flex flex-col items-center p-6 bg-gradient-to-br from-emerald-500/80 to-emerald-600/80 rounded-2xl text-white glass-button font-bold relative"
                >
                  <Bell className="h-8 w-8 mb-3" />
                  <span className="text-base">Alerts</span>
                  {alerts.length > 0 && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500/90 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {alerts.length}
                    </div>
                  )}
                </button>
                {user.role === 'admin' && (
                  <>
                    <button 
                      onClick={handleShowUsers}
                      className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-500/80 to-purple-600/80 rounded-2xl text-white glass-button font-bold"
                    >
                      <Users className="h-8 w-8 mb-3" />
                      <span className="text-base">Users</span>
                    </button>
                    <button 
                      onClick={handleShowSettings}
                      className="flex flex-col items-center p-6 bg-gradient-to-br from-orange-500/80 to-orange-600/80 rounded-2xl text-white glass-button font-bold"
                    >
                      <Settings className="h-8 w-8 mb-3" />
                      <span className="text-base">Settings</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Live Stats */}
            <div className="glass rounded-3xl p-6">
              <h4 className="glass-text font-bold text-xl mb-6 flex items-center">
                <Activity className="h-7 w-7 mr-4 text-cyan-300" />
                Live Stats - {activeFloor}
              </h4>
              <div className="space-y-5">
                <div className="flex items-center justify-between p-5 glass-subtle rounded-2xl">
                  <span className="text-emerald-300 font-bold text-lg">Active Sensors</span>
                  <span className="text-emerald-200 font-black text-3xl">{currentSensors.length}</span>
                </div>
                <div className="flex items-center justify-between p-5 glass-subtle rounded-2xl">
                  <span className="text-red-300 font-bold text-lg">Critical Alerts</span>
                  <span className="text-red-200 font-black text-3xl">{currentSensors.filter(s => s.status === 'critical').length}</span>
                </div>
                <div className="flex items-center justify-between p-5 glass-subtle rounded-2xl">
                  <span className="text-blue-300 font-bold text-lg">MQTT Status</span>
                  <span className={`font-black text-base px-4 py-2 rounded-xl glass-button ${
                    mqttConnected ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'
                  }`}>
                    {mqttConnected ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="glass rounded-3xl p-6">
              <h4 className="text-green-300 font-bold text-xl mb-6 flex items-center">
                <Phone className="h-7 w-7 mr-4 text-green-400" />
                Emergency Contacts
              </h4>
              <div className="space-y-5">
                <button 
                  onClick={() => {
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 glass-strong text-white px-8 py-5 rounded-3xl shadow-2xl z-50 font-bold text-lg';
                    notification.innerHTML = '📞 Calling Fire Department...';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }}
                  className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-red-500/80 to-red-600/80 rounded-2xl glass-button text-white font-bold text-lg"
                >
                  <span>🚒 Fire Department</span>
                  <span className="glass-subtle px-4 py-2 rounded-xl font-mono text-xl">911</span>
                </button>
                <button 
                  onClick={() => {
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 glass-strong text-white px-8 py-5 rounded-3xl shadow-2xl z-50 font-bold text-lg';
                    notification.innerHTML = '📞 Calling Security...';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }}
                  className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 rounded-2xl glass-button text-white font-bold text-lg"
                >
                  <span>🛡️ Security</span>
                  <span className="glass-subtle px-4 py-2 rounded-xl font-mono text-xl">5555</span>
                </button>
                <button 
                  onClick={() => {
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 right-4 glass-strong text-white px-8 py-5 rounded-3xl shadow-2xl z-50 font-bold text-lg';
                    notification.innerHTML = '📞 Calling Medical Emergency...';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }}
                  className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 rounded-2xl glass-button text-white font-bold text-lg"
                >
                  <span>🏥 Medical</span>
                  <span className="glass-subtle px-4 py-2 rounded-xl font-mono text-xl">911</span>
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
              <div className="glass-strong rounded-3xl p-10">
                <h3 className="text-4xl font-black glass-text mb-10 flex items-center">
                  <Activity className="h-10 w-10 mr-5 text-blue-300" />
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