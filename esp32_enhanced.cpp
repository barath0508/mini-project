#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <Adafruit_NeoPixel.h>
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/schema/schema_generated.h"
#include "tensorflow/lite/micro/micro_mutable_op_resolver.h"
#include "model.h"

// Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "bf0c2aed638d4a048ca7768d70b23253.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "Esp32_C6";
const char* mqtt_password = "Miniproject1";
const char* mqtt_topic = "tinyml/anomaly";

// Enhanced node configuration for multi-floor system
const char* node_id = "Node1A";  // Format: Node[Floor][Zone] e.g., Node1A, Node2B
const char* floor_id = "Floor 1";
const char* zone_id = "Zone A";

WiFiClientSecure espClient;
PubSubClient client(espClient);

#define NEOPIXEL_PIN 8
#define NUM_PIXELS   1
Adafruit_NeoPixel rgb(NUM_PIXELS, NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);

// TensorFlow Lite Setup
constexpr int kTensorArenaSize = 8 * 1024;
uint8_t tensor_arena[kTensorArenaSize];
tflite::MicroInterpreter* interpreter;
TfLiteTensor* input;
TfLiteTensor* output;

void setup_wifi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void reconnect_mqtt() {
  while (!client.connected()) {
    if (client.connect(node_id, mqtt_username, mqtt_password)) {
      Serial.println("Connected to HiveMQ Cloud");
    } else {
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  rgb.begin();
  setup_wifi();
  
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);

  // Load TinyML model
  const tflite::Model* model = tflite::GetModel(model_tflite);
  static tflite::MicroMutableOpResolver<10> resolver;
  resolver.AddFullyConnected();
  resolver.AddRelu();
  resolver.AddLogistic();

  static tflite::MicroInterpreter static_interpreter(model, resolver, tensor_arena, kTensorArenaSize);
  interpreter = &static_interpreter;
  interpreter->AllocateTensors();

  input = interpreter->input(0);
  output = interpreter->output(0);
}

void loop() {
  if (!client.connected()) {
    reconnect_mqtt();
  }
  client.loop();

  // Read sensors
  int gas = random(0, 100);
  int flame = random(0, 2);
  int temp = random(20, 50);
  int humidity = random(40, 100);

  // TinyML inference
  input->data.f[0] = gas;
  input->data.f[1] = flame;
  input->data.f[2] = temp;
  input->data.f[3] = humidity;

  interpreter->Invoke();
  float prediction = output->data.f[0];

  // Enhanced message format with floor/zone info
  char msg[150];
  if (prediction > 0.5) {
    rgb.setPixelColor(0, rgb.Color(255, 0, 0));
    sprintf(msg, "%s|%s|%s|Anomaly detected! Gas:%d Flame:%d Temp:%d Hum:%d", 
            node_id, floor_id, zone_id, gas, flame, temp, humidity);
  } else {
    rgb.setPixelColor(0, rgb.Color(0, 255, 0));
    sprintf(msg, "%s|%s|%s|Normal Gas:%d Flame:%d Temp:%d Hum:%d", 
            node_id, floor_id, zone_id, gas, flame, temp, humidity);
  }
  
  client.publish(mqtt_topic, msg);
  rgb.show();
  delay(2000);
}