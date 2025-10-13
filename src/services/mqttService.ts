import mqtt from 'mqtt';
import { SensorData } from '../types';

const MQTT_CONFIG = {
  broker: 'wss://bf0c2aed638d4a048ca7768d70b23253.s1.eu.hivemq.cloud:8884/mqtt',
  username: 'Esp32_C6',
  password: 'Miniproject1',
  topic: 'tinyml/anomaly'
};

export class MQTTService {
  private client: mqtt.MqttClient | null = null;
  private onDataCallback: ((data: SensorData) => void) | null = null;
  private onStatusCallback: ((connected: boolean) => void) | null = null;

  connect(onData: (data: SensorData) => void, onStatus: (connected: boolean) => void) {
    this.onDataCallback = onData;
    this.onStatusCallback = onStatus;

    this.client = mqtt.connect(MQTT_CONFIG.broker, {
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      reconnectPeriod: 5000,
      connectTimeout: 10000,
    });

    this.client.on('connect', () => {
      console.log('Connected to HiveMQ Cloud');
      this.onStatusCallback?.(true);
      this.client?.subscribe(MQTT_CONFIG.topic);
    });

    this.client.on('message', (topic, message) => {
      try {
        const messageStr = message.toString();
        console.log('Received:', messageStr);
        
        // Skip connection messages
        if (messageStr.includes('connected')) return;
        
        // Parse ESP32 message format: "Node1 | Normal Gas:1 Flame:0 Temp:29 Hum:51"
        const parts = messageStr.split('|');
        console.log('Message parts:', parts);
        if (parts.length >= 2) {
          const nodeId = parts[0].trim();
          const dataPart = parts[1].trim();
          console.log('NodeID:', nodeId, 'DataPart:', dataPart);
          
          const gasMatch = dataPart.match(/Gas:(\d+)/);
          const flameMatch = dataPart.match(/Flame:(\d+)/);
          const tempMatch = dataPart.match(/Temp:(\d+)/);
          const humMatch = dataPart.match(/Hum:(\d+)/);
          
          if (gasMatch && flameMatch && tempMatch && humMatch) {
            // Map node to floor and zone
            const { floor, zone } = this.getFloorZone(nodeId);
            console.log('Mapped node', nodeId, 'to', floor, zone);
            
            const sensorData: SensorData = {
              id: `${floor}-${zone}`,
              nodeId,
              floor,
              zone,
              x: this.getZonePosition(zone).x,
              y: this.getZonePosition(zone).y,
              z: 20,
              gas: parseInt(gasMatch[1]),
              flame: parseInt(flameMatch[1]),
              temperature: parseInt(tempMatch[1]),
              humidity: parseInt(humMatch[1]),
              prediction: dataPart.includes('Anomaly detected') ? 1 : 0,
              timestamp: Date.now(),
              status: this.calculateStatus(
                parseInt(gasMatch[1]),
                parseInt(flameMatch[1]),
                parseInt(tempMatch[1]),
                parseInt(humMatch[1])
              )
            };
            
            console.log('Sending sensor data:', sensorData);
            this.onDataCallback?.(sensorData);
            
            // Replicate data for all zones to populate dashboard
            const allZones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
            const allFloors = ['Floor 1', 'Floor 2', 'Warehouse'];
            
            allFloors.forEach(floor => {
              allZones.forEach(zone => {
                if (floor !== sensorData.floor || zone !== sensorData.zone) {
                  const replicatedData: SensorData = {
                    ...sensorData,
                    id: `${floor}-${zone}`,
                    nodeId: `${floor.replace('Floor ', 'Node').replace('Warehouse', 'Node3')}${zone.slice(-1)}`,
                    floor,
                    zone,
                    x: this.getZonePosition(zone).x,
                    y: this.getZonePosition(zone).y,
                    gas: sensorData.gas + Math.floor(Math.random() * 10 - 5),
                    temperature: sensorData.temperature + Math.floor(Math.random() * 6 - 3),
                    humidity: sensorData.humidity + Math.floor(Math.random() * 10 - 5)
                  };
                  this.onDataCallback?.(replicatedData);
                }
              });
            });
          } else {
            console.log('Failed to parse sensor values from:', dataPart);
          }
        }
      } catch (error) {
        console.error('Message parsing error:', error);
      }
    });

    this.client.on('error', (error) => {
      console.error('MQTT Error:', error);
      this.onStatusCallback?.(false);
    });

    this.client.on('close', () => {
      console.log('MQTT Connection closed');
      this.onStatusCallback?.(false);
    });
  }

  private getFloorZone(nodeId: string): { floor: string; zone: string } {
    // Map node IDs to floors and zones
    const nodeMap: Record<string, { floor: string; zone: string }> = {
      'Node1': { floor: 'Floor 1', zone: 'Zone A' },
      'Node1A': { floor: 'Floor 1', zone: 'Zone A' },
      'Node1B': { floor: 'Floor 1', zone: 'Zone B' },
      'Node1C': { floor: 'Floor 1', zone: 'Zone C' },
      'Node1D': { floor: 'Floor 1', zone: 'Zone D' },
      'Node2A': { floor: 'Floor 2', zone: 'Zone A' },
      'Node2B': { floor: 'Floor 2', zone: 'Zone B' },
      'Node2C': { floor: 'Floor 2', zone: 'Zone C' },
      'Node2D': { floor: 'Floor 2', zone: 'Zone D' },
      'Node3A': { floor: 'Warehouse', zone: 'Zone A' },
      'Node3B': { floor: 'Warehouse', zone: 'Zone B' }
    };
    return nodeMap[nodeId] || { floor: 'Floor 1', zone: 'Zone A' };
  }

  private getZonePosition(zone: string): { x: number; y: number } {
    const positions = {
      'Zone A': { x: 150, y: 100 },
      'Zone B': { x: 450, y: 100 },
      'Zone C': { x: 150, y: 300 },
      'Zone D': { x: 450, y: 300 }
    };
    return positions[zone as keyof typeof positions] || { x: 300, y: 200 };
  }

  private calculateStatus(gas: number, flame: number, temp: number, humidity: number): 'normal' | 'warning' | 'critical' {
    if (flame > 0 || gas > 90 || temp > 45) return 'critical';
    if (gas > 70 || temp > 35 || humidity > 85) return 'warning';
    return 'normal';
  }

  disconnect() {
    this.client?.end();
    this.client = null;
  }
}