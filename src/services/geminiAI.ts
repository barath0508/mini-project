import { SensorData } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class GeminiAI {
  private async callGemini(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      return 'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.';
    }

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'AI service temporarily unavailable. Please try again later.';
    }
  }

  async processVoiceCommand(command: string, sensors: SensorData[]): Promise<string> {
    const sensorContext = sensors.map(s => 
      `${s.nodeId} (${s.floor}, ${s.zone}): Gas ${s.gas}ppm, Temp ${s.temperature}°C, Humidity ${s.humidity}%, Flame ${s.flame}, Status ${s.status}`
    ).join('\n');

    const prompt = `You are Gemini Flash 2.0, an advanced industrial safety AI assistant with real-time IoT analytics capabilities. 
    
    Voice Command: "${command}"
    
    Live ESP32 Sensor Network Data:
    ${sensorContext}
    
    Analyze the command and sensor data to provide intelligent safety insights. For emergency commands, respond with immediate action protocols. Include specific sensor readings and risk assessments in your response.`;

    return await this.callGemini(prompt);
  }

  async processSmartQuery(query: string, sensors: SensorData[], alerts: any[]): Promise<any[]> {
    const sensorContext = sensors.slice(-10).map(s => 
      `${s.nodeId}: Gas ${s.gas}ppm, Temp ${s.temperature}°C, Humidity ${s.humidity}%, Flame ${s.flame} at ${new Date(s.timestamp).toLocaleString()}`
    ).join('\n');

    const alertContext = alerts.slice(-5).map(a => 
      `Alert: ${a.message} at ${new Date(a.timestamp).toLocaleString()}`
    ).join('\n');

    const prompt = `Analyze this industrial safety query: "${query}"

Recent sensor data:
${sensorContext}

Recent alerts:
${alertContext}

Provide specific findings as JSON array with format: [{"message": "finding", "timestamp": timestamp}]`;

    const response = await this.callGemini(prompt);
    
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : [{ message: response, timestamp: Date.now() }];
    } catch {
      return [{ message: response, timestamp: Date.now() }];
    }
  }

  async processAIQuery(query: string, sensors: SensorData[], alerts: any[]): Promise<string> {
    const sensorContext = sensors.slice(-5).map(s => 
      `${s.nodeId} (${s.floor}, ${s.zone}): Gas ${s.gas}ppm, Temp ${s.temperature}°C, Humidity ${s.humidity}%, Flame ${s.flame}, Status ${s.status}`
    ).join('\n');

    const prompt = `You are Gemini Flash 2.0, powering an Industrial Safety Command Center with advanced AI capabilities.
    
    Safety Query: "${query}"
    
    Real-time ESP32 IoT Network Status:
    ${sensorContext}
    
    Alert Summary: ${alerts.length} alerts detected today
    
    Provide intelligent analysis with:
    - Risk assessment based on current readings
    - Predictive insights and trends
    - Actionable safety recommendations
    - Emergency protocols if needed
    
    Use your advanced reasoning to deliver precise, professional industrial safety guidance.`;

    return await this.callGemini(prompt);
  }

  async generateRiskAssessment(sensors: SensorData[]): Promise<{ riskLevel: number; analysis: string; recommendations: string[] }> {
    const sensorContext = sensors.map(s => 
      `${s.nodeId} (${s.floor}, ${s.zone}): Gas ${s.gas}ppm, Temp ${s.temperature}°C, Humidity ${s.humidity}%, Flame ${s.flame}, Status ${s.status}`
    ).join('\n');

    const prompt = `Analyze industrial safety risk based on sensor data:

${sensorContext}

Provide risk assessment as JSON:
{
  "riskLevel": 0-100,
  "analysis": "detailed analysis",
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

    const response = await this.callGemini(prompt);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        riskLevel: 25,
        analysis: response,
        recommendations: ['Monitor sensor readings', 'Check ventilation systems', 'Review safety protocols']
      };
    }
  }

  async generateEvacuationPlan(floor: string, sensors: SensorData[]): Promise<string> {
    const floorSensors = sensors.filter(s => s.floor === floor);
    const criticalSensors = floorSensors.filter(s => s.status === 'critical');

    const prompt = `Generate emergency evacuation instructions for ${floor}.

Critical sensors: ${criticalSensors.map(s => `${s.zone}: ${s.status}`).join(', ')}

Provide clear, step-by-step evacuation instructions prioritizing safety.`;

    return await this.callGemini(prompt);
  }
}

export const geminiAI = new GeminiAI();