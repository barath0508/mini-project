# MQTT Real-Time Data Integration

## 🔧 Configuration

Your Industrial Safety Command Center is now configured to receive real-time data from ESP32 nodes via HiveMQ Cloud.

### MQTT Broker Details
- **Broker**: `bf0c2aed638d4a048ca7768d70b23253.s1.eu.hivemq.cloud`
- **Port**: `8883` (TLS/SSL)
- **Username**: `Esp32_C6`
- **Password**: `Miniproject1`
- **Topic**: `tinyml/anomaly`

## 🚀 Quick Start

### 1. Start the React Application
```bash
npm run dev
```

### 2. Test MQTT Connection (Optional)
```bash
node mqtt-test.js
```

### 3. Deploy ESP32 Code
Upload the `esp32_enhanced.cpp` to your ESP32-C6 with:
- Update WiFi credentials
- Configure node ID, floor, and zone
- Install required libraries

## 📡 Data Format

ESP32 nodes send data in this format:
```
NodeID|Floor|Zone|Status Gas:XX Flame:X Temp:XX Hum:XX
```

Example:
```
Node1A|Floor 1|Zone A|Anomaly detected! Gas:93 Flame:0 Temp:32 Hum:52
```

## 🎯 Features

- ✅ **Real-time data** from multiple ESP32 nodes
- ✅ **Automatic alert generation** for critical conditions
- ✅ **Multi-floor/zone support** with dynamic routing
- ✅ **Connection status monitoring** with visual indicators
- ✅ **TinyML anomaly detection** on ESP32
- ✅ **Secure TLS connection** to HiveMQ Cloud

## 🔍 Troubleshooting

### MQTT Connection Issues
1. Check network connectivity
2. Verify HiveMQ Cloud credentials
3. Ensure WebSocket support in browser
4. Check firewall settings for port 8884

### ESP32 Issues
1. Verify WiFi credentials
2. Check MQTT broker URL and credentials
3. Ensure all libraries are installed
4. Monitor Serial output for debugging

## 📊 Monitoring

The dashboard shows:
- 🟢 **LIVE** indicator when MQTT is connected
- 🔴 **OFFLINE** indicator when disconnected
- Real-time sensor data updates every 2 seconds
- Automatic alert generation for critical conditions

## 🛠️ ESP32 Libraries Required

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <Adafruit_NeoPixel.h>
```

Install via Arduino Library Manager or PlatformIO.