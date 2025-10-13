// MQTT Test Script - Simulates ESP32 data for testing
const mqtt = require('mqtt');

const MQTT_CONFIG = {
  broker: 'wss://bf0c2aed638d4a048ca7768d70b23253.s1.eu.hivemq.cloud:8884/mqtt',
  username: 'Esp32_C6',
  password: 'Miniproject1',
  topic: 'tinyml/anomaly'
};

const client = mqtt.connect(MQTT_CONFIG.broker, {
  username: MQTT_CONFIG.username,
  password: MQTT_CONFIG.password,
  reconnectPeriod: 5000,
  connectTimeout: 10000,
});

const nodes = [
  { id: 'Node1A', floor: 'Floor 1', zone: 'Zone A' },
  { id: 'Node1B', floor: 'Floor 1', zone: 'Zone B' },
  { id: 'Node1C', floor: 'Floor 1', zone: 'Zone C' },
  { id: 'Node1D', floor: 'Floor 1', zone: 'Zone D' },
  { id: 'Node2A', floor: 'Floor 2', zone: 'Zone A' },
  { id: 'Node2B', floor: 'Floor 2', zone: 'Zone B' },
];

client.on('connect', () => {
  console.log('✅ Connected to HiveMQ Cloud');
  console.log('🚀 Starting to publish sensor data...\n');
  
  // Publish data every 3 seconds
  setInterval(() => {
    nodes.forEach(node => {
      const gas = Math.floor(Math.random() * 100);
      const flame = Math.random() > 0.95 ? 1 : 0;
      const temp = Math.floor(20 + Math.random() * 30);
      const humidity = Math.floor(40 + Math.random() * 50);
      
      // Simulate anomaly detection
      const isAnomaly = flame > 0 || gas > 90 || temp > 45;
      
      const message = `${node.id}|${node.floor}|${node.zone}|${isAnomaly ? 'Anomaly detected!' : 'Normal'} Gas:${gas} Flame:${flame} Temp:${temp} Hum:${humidity}`;
      
      client.publish(MQTT_CONFIG.topic, message);
      console.log(`📡 ${node.id}: Gas:${gas} Flame:${flame} Temp:${temp}°C Hum:${humidity}% ${isAnomaly ? '🚨 ANOMALY' : '✅ Normal'}`);
    });
    console.log('---');
  }, 3000);
});

client.on('error', (error) => {
  console.error('❌ MQTT Error:', error);
});

client.on('close', () => {
  console.log('🔌 MQTT Connection closed');
});

console.log('🔄 Connecting to HiveMQ Cloud...');