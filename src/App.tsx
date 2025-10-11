import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';
import { Activity, Flame, Droplets, Thermometer, Wifi, WifiOff, Download, Trash2, BarChart3, Clock, Zap } from 'lucide-react';
import SensorChart from './components/SensorChart';
import SensorCard from './components/SensorCard';
import AlertBanner from './components/AlertBanner';
import LoadingSpinner from './components/LoadingSpinner';

const MQTT_BROKER = import.meta.env.VITE_MQTT_BROKER || 'ws://10.68.146.126:9001';
const MQTT_TOPIC = import.meta.env.VITE_MQTT_TOPIC || 'tinyml/anomaly';

interface SensorData {
  gas: number;
  flame: number;
  temperature: number;
  humidity: number;
  prediction: number;
  timestamp: number;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<SensorData[]>(() => {
    const saved = localStorage.getItem('sensorHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [totalAnomalies, setTotalAnomalies] = useState(() => {
    return parseInt(localStorage.getItem('totalAnomalies') || '0');
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER, {
      clientId: `mqtt_dashboard_${Math.random().toString(16).slice(3)}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      setConnected(true);
      client.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
          console.error('Subscription error:', err);
        } else {
          console.log(`Subscribed to ${MQTT_TOPIC}`);
        }
      });
    });

    client.on('disconnect', () => {
      console.log('Disconnected from MQTT broker');
      setConnected(false);
    });

    client.on('error', (err) => {
      console.error('MQTT error:', err);
      setConnected(false);
    });

    client.on('message', (topic, message) => {
      try {
        const messageStr = message.toString();
        let data: any;

        // Try to parse as JSON first
        try {
          data = JSON.parse(messageStr);
        } catch {
          // Parse format: "Node1 | Anomaly detected! Gas:93 Flame:0 Temp:32 Hum:52"
          const gasMatch = messageStr.match(/Gas:(\d+)/);
          const flameMatch = messageStr.match(/Flame:(\d+)/);
          const tempMatch = messageStr.match(/Temp:(\d+)/);
          const humMatch = messageStr.match(/Hum:(\d+)/);
          
          console.log('Parsing message:', messageStr);
          console.log('Matches:', { gasMatch, flameMatch, tempMatch, humMatch });
          
          if (gasMatch && flameMatch && tempMatch && humMatch) {
            data = {
              gas: parseInt(gasMatch[1]),
              flame: parseInt(flameMatch[1]),
              temperature: parseInt(tempMatch[1]),
              humidity: parseInt(humMatch[1]),
              prediction: messageStr.includes('Anomaly detected!') ? 1 : 0
            };
            console.log('Parsed data:', data);
          } else {
            console.warn('Unknown message format:', messageStr);
            return;
          }
        }

        const newData: SensorData = {
          gas: data.gas || 0,
          flame: data.flame || 0,
          temperature: data.temperature || 0,
          humidity: data.humidity || 0,
          prediction: data.prediction || 0,
          timestamp: Date.now(),
        };

        setSensorData(newData);
        setLastUpdate(new Date());
        
        const newHistory = [...history.slice(-99), newData];
        setHistory(newHistory);
        localStorage.setItem('sensorHistory', JSON.stringify(newHistory));

        // Check thresholds and set alerts
        const alerts = [];
        if (newData.gas > 80) alerts.push(`Gas: ${newData.gas}ppm`);
        if (newData.flame > 0) alerts.push(`Flame: ${newData.flame}`);
        if (newData.temperature > 40) alerts.push(`Temp: ${newData.temperature}°C`);
        if (newData.humidity > 90) alerts.push(`Humidity: ${newData.humidity}%`);
        
        if (newData.prediction > 0.5 || alerts.length > 0) {
          setAnomalyDetected(true);
          const newTotal = totalAnomalies + 1;
          setTotalAnomalies(newTotal);
          localStorage.setItem('totalAnomalies', newTotal.toString());
          setAlertMessage(alerts.length > 0 ? `Thresholds exceeded: ${alerts.join(', ')}` : 'Anomaly detected!');
          setTimeout(() => {
            setAnomalyDetected(false);
            setAlertMessage('');
          }, 5000);
        }
      } catch (err) {
        console.error('Failed to process message:', err);
      }
    });

    clientRef.current = client;

    return () => {
      if (client) {
        client.end();
      }
    };
  }, [history, totalAnomalies]);

  const exportData = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensor-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const clearData = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setHistory([]);
      setTotalAnomalies(0);
      localStorage.removeItem('sensorHistory');
      localStorage.removeItem('totalAnomalies');
    }
  };

  const getStats = () => {
    if (history.length === 0) return null;
    return {
      avgGas: Math.round(history.reduce((sum, d) => sum + d.gas, 0) / history.length),
      avgTemp: Math.round(history.reduce((sum, d) => sum + d.temperature, 0) / history.length),
      avgHumidity: Math.round(history.reduce((sum, d) => sum + d.humidity, 0) / history.length),
      maxGas: Math.max(...history.map(d => d.gas)),
      maxTemp: Math.max(...history.map(d => d.temperature)),
      dataPoints: history.length
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              MQTT Sensor Dashboard
            </h1>
            <p className="text-gray-400">Real-time TinyML Anomaly Detection System</p>
            {lastUpdate && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/30 text-sm">
              <BarChart3 size={16} className="text-purple-400" />
              <span className="text-gray-300">{totalAnomalies} Anomalies</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportData}
                className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 transition-all duration-300"
                title="Export Data"
              >
                <Download size={18} />
              </button>
              <button
                onClick={clearData}
                className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-all duration-300"
                title="Clear Data"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 backdrop-blur transition-all duration-300">
              {connected ? (
                <>
                  <Wifi className="text-green-400 transition-colors duration-300" size={20} />
                  <span className="text-green-400 font-medium transition-colors duration-300">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="text-red-400 transition-colors duration-300" size={20} />
                  <span className="text-red-400 font-medium transition-colors duration-300">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={`transition-all duration-500 ease-in-out ${anomalyDetected ? 'opacity-100 max-h-20 mb-6' : 'opacity-0 max-h-0 overflow-hidden'}`}>
          <AlertBanner
            message={alertMessage || "Anomaly Detected! Prediction threshold exceeded."}
            prediction={sensorData?.prediction || 0}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-300">
          <SensorCard
            title="Gas Level"
            value={sensorData?.gas}
            unit="ppm"
            icon={Activity}
            color="blue"
            anomaly={anomalyDetected && (sensorData?.gas || 0) > 80}
            previousValue={history[history.length - 2]?.gas}
            threshold={100}
          />
          <SensorCard
            title="Flame Sensor"
            value={sensorData?.flame}
            unit=""
            icon={Flame}
            color="orange"
            anomaly={anomalyDetected && (sensorData?.flame || 0) > 0}
            previousValue={history[history.length - 2]?.flame}
            threshold={1}
          />
          <SensorCard
            title="Temperature"
            value={sensorData?.temperature}
            unit="°C"
            icon={Thermometer}
            color="red"
            anomaly={anomalyDetected && (sensorData?.temperature || 0) > 40}
            previousValue={history[history.length - 2]?.temperature}
            threshold={50}
          />
          <SensorCard
            title="Humidity"
            value={sensorData?.humidity}
            unit="%"
            icon={Droplets}
            color="cyan"
            anomaly={anomalyDetected && (sensorData?.humidity || 0) > 90}
            previousValue={history[history.length - 2]?.humidity}
            threshold={100}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 bg-gray-800/50 backdrop-blur rounded-xl p-6 shadow-xl border border-gray-700 transition-all duration-300 hover:bg-gray-800/60">
            <h2 className="text-2xl font-bold mb-4 transition-colors duration-300">Sensor Trends</h2>
            <SensorChart data={history} />
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 shadow-xl border border-gray-700 transition-all duration-300">
            <h3 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
              <Zap size={20} />
              {stats ? 'Statistics' : 'System Status'}
            </h3>
            {stats ? (
              <div className="space-y-4">
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Average Gas Level</div>
                  <div className="text-2xl font-bold text-blue-400">{stats.avgGas} ppm</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Average Temperature</div>
                  <div className="text-2xl font-bold text-red-400">{stats.avgTemp}°C</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Average Humidity</div>
                  <div className="text-2xl font-bold text-cyan-400">{stats.avgHumidity}%</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Peak Values</div>
                  <div className="text-sm text-gray-300">
                    Gas: {stats.maxGas}ppm | Temp: {stats.maxTemp}°C
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Data Points</div>
                  <div className="text-lg font-semibold text-green-400">{stats.dataPoints}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {connected ? (
                  <div>
                    <LoadingSpinner />
                    <p className="text-gray-400 mt-4">Waiting for sensor data...</p>
                  </div>
                ) : (
                  <div>
                    <WifiOff className="mx-auto text-gray-500 mb-4" size={48} />
                    <p className="text-gray-400">Connect to MQTT broker to view statistics</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 transition-all duration-300 hover:bg-gray-800/40">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 transition-colors duration-300">Connection Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Broker:</span>
                <span className="text-gray-300 font-mono text-xs">{MQTT_BROKER}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Topic:</span>
                <span className="text-gray-300 font-mono">{MQTT_TOPIC}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
                  {connected ? 'Active' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 transition-all duration-300 hover:bg-gray-800/40">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Thresholds</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Gas Alert:</span>
                <span className="text-orange-400">&gt; 80 ppm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Flame Alert:</span>
                <span className="text-red-400">&gt; 0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Temp Alert:</span>
                <span className="text-red-400">&gt; 40°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Humidity Alert:</span>
                <span className="text-cyan-400">&gt; 90%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 py-6 border-t border-gray-700/50">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 MQTT Sensor Dashboard | Real-time IoT Monitoring System</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
