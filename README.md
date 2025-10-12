# 🌟 MQTT Sensor Dashboard - Real-time TinyML Anomaly Detection

A modern, responsive web dashboard for monitoring IoT sensor data with real-time anomaly detection using TinyML on ESP32.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4)

## 🚀 Features

### 📊 **Real-time Monitoring**
- **Live sensor data** visualization (Gas, Flame, Temperature, Humidity)
- **Interactive charts** with smooth animations and gradients
- **Real-time updates** every 2 seconds from ESP32 device
- **Responsive design** for desktop, tablet, and mobile

### 🔔 **Smart Alerting System**
- **Threshold-based alerts** with customizable limits
- **Visual anomaly indicators** with pulsing animations
- **Specific alert messages** showing which sensors triggered
- **Auto-dismissing alerts** after 5 seconds

### 📈 **Advanced Analytics**
- **Statistical dashboard** with averages and peak values
- **Historical data tracking** (up to 100 data points)
- **Trend indicators** showing value changes (↗ ↘ →)
- **Progress bars** showing threshold proximity

### 🌐 **Global Connectivity**
- **HiveMQ Cloud integration** for worldwide access
- **Secure WebSocket connections** (WSS/TLS)
- **Real-time connection status** monitoring
- **ESP device health tracking** with timeout detection

### 💾 **Data Management**
- **Local storage persistence** - data survives browser refresh
- **Export functionality** - download data as JSON
- **Clear data option** with confirmation
- **Anomaly counter** with persistent storage

### 🎨 **Modern UI/UX**
- **Dark theme** with gradient backgrounds
- **Smooth transitions** and hover effects
- **Loading states** and error handling
- **Professional color scheme** with status indicators

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + Lucide Icons
- **Charts**: Chart.js with custom gradients
- **MQTT**: MQTT.js for WebSocket connections
- **Cloud**: HiveMQ Cloud + Netlify deployment
- **Hardware**: ESP32-C6 + TinyML model

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- ESP32 development environment
- HiveMQ Cloud account

### 1. Clone Repository
```bash
git clone <repository-url>
cd project
npm install
```

### 2. Environment Configuration
Create `.env` file:
```env
VITE_MQTT_BROKER=wss://your-hivemq-url:8884/mqtt
VITE_MQTT_TOPIC=tinyml/anomaly
VITE_MQTT_USERNAME=your_username
VITE_MQTT_PASSWORD=your_password
```

### 3. Development
```bash
npm run dev
```

### 4. Production Build
```bash
npm run build
```

## 🔧 ESP32 Configuration

### Hardware Requirements
- ESP32-C6 microcontroller
- Gas sensor (MQ-series)
- Flame sensor
- Temperature/Humidity sensor (DHT22)
- NeoPixel LED

### Software Setup
```cpp
// HiveMQ Cloud Configuration
const char* mqtt_server = "your-hivemq-url";
const int mqtt_port = 8883;
const char* mqtt_username = "your_username";
const char* mqtt_password = "your_password";
const char* mqtt_topic = "tinyml/anomaly";
```

### Message Format
```
Node1 | Anomaly detected! Gas:93 Flame:0 Temp:32 Hum:52
Node1 | Normal Gas:45 Flame:0 Temp:25 Hum:60
```

## 🌐 Deployment

### Netlify Deployment
1. Connect GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push

### Environment Variables for Production
```
VITE_MQTT_BROKER=wss://your-hivemq-url:8884/mqtt
VITE_MQTT_USERNAME=your_username
VITE_MQTT_PASSWORD=your_password
VITE_MQTT_TOPIC=tinyml/anomaly
```

## 📊 Monitoring Features

### Connection Status
- **Broker Status**: MQTT broker connection state
- **ESP Device Status**: Real device connectivity (15s timeout)
- **Reconnection Tracking**: Automatic retry with attempt counter
- **Last Data Timestamp**: When ESP last sent data

### Alert Thresholds
- **Gas Alert**: > 80 ppm
- **Flame Alert**: > 0 (any detection)
- **Temperature Alert**: > 40°C
- **Humidity Alert**: > 90%

### Data Visualization
- **Real-time charts** with 4 sensor lines
- **Gradient fills** and smooth animations
- **Interactive tooltips** with detailed values
- **Responsive legends** and axis labels

## 🔒 Security Features

- **TLS/WSS encryption** for all MQTT connections
- **Authentication required** for HiveMQ Cloud
- **Environment variable protection** for credentials
- **Secure client configuration** with proper certificates

## 📱 Responsive Design

- **Mobile-first approach** with breakpoint optimization
- **Touch-friendly interface** for mobile devices
- **Adaptive layouts** for different screen sizes
- **Optimized performance** for low-end devices

## 🚀 Performance Optimizations

- **Efficient re-renders** with React optimization
- **Local storage caching** for offline capability
- **Debounced updates** to prevent UI flooding
- **Memory management** with data point limits

## 🔄 Recent Updates

### v2.0.0 - Global Access & Enhanced UI
- ✅ HiveMQ Cloud integration for worldwide access
- ✅ Enhanced chart design with gradients and animations
- ✅ Real ESP device status tracking
- ✅ Improved connection status indicators
- ✅ Data persistence and export functionality

### v1.5.0 - Advanced Analytics
- ✅ Statistical dashboard with averages and peaks
- ✅ Trend indicators and progress bars
- ✅ Threshold-specific alerts
- ✅ Anomaly counter with persistence

### v1.0.0 - Initial Release
- ✅ Basic MQTT dashboard
- ✅ Real-time sensor monitoring
- ✅ Simple alerting system
- ✅ Local MQTT broker support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section below

## 🔧 Troubleshooting

### Common Issues

**MQTT Connection Failed**
- Verify HiveMQ Cloud credentials
- Check network connectivity
- Ensure correct broker URL and port

**ESP32 Not Connecting**
- Verify WiFi credentials
- Check MQTT broker configuration
- Ensure proper TLS setup

**Dashboard Not Loading**
- Check environment variables
- Verify build configuration
- Clear browser cache

## 📊 System Architecture

```
ESP32 → WiFi → HiveMQ Cloud → WebSocket → React Dashboard
  ↓                                           ↓
TinyML Model                            Real-time Visualization
  ↓                                           ↓
Anomaly Detection                       Alerts & Analytics
```

---

**Built with ❤️ for IoT monitoring and TinyML applications**