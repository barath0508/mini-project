export interface User {
  id: string;
  username: string;
  role: 'admin' | 'supervisor' | 'worker';
  name: string;
  email: string;
  phone: string;
  assignedZones?: string[];
}

export interface SensorData {
  id: string;
  nodeId: string;
  floor: string;
  zone: string;
  x: number;
  y: number;
  z: number;
  gas: number;
  flame: number;
  temperature: number;
  humidity: number;
  prediction: number;
  timestamp: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface Alert {
  id: string;
  sensorId: string;
  type: 'gas' | 'flame' | 'temperature' | 'humidity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  acknowledged: boolean;
  floor: string;
  zone: string;
}

export interface IncidentReport {
  id: string;
  reporterId: string;
  title: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  status: 'open' | 'investigating' | 'resolved';
  images?: string[];
}

export interface EmergencyPlan {
  floor: string;
  exitRoutes: Array<{
    id: string;
    name: string;
    path: Array<{ x: number; y: number }>;
    capacity: number;
  }>;
  safeZones: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    capacity: number;
  }>;
}