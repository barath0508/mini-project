import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Waveform, MessageCircle, Sparkles, Zap } from 'lucide-react';
import { geminiAI } from '../services/geminiAI';
import { SensorData } from '../types';

interface VoiceBotProps {
  onVoiceCommand: (command: string) => void;
  sensors: SensorData[];
}

export default function VoiceBot({ onVoiceCommand, sensors }: VoiceBotProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    const animate = () => setAnimationFrame(prev => prev + 1);
    const interval = setInterval(animate, 100);
    return () => clearInterval(interval);
  }, []);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = async (event) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        if (event.results[0].isFinal) {
          setIsProcessing(true);
          try {
            const aiResponse = await geminiAI.processVoiceCommand(result, sensors);
            setResponse(aiResponse);
            speak(aiResponse);
            onVoiceCommand(result);
          } catch (error) {
            console.error('AI processing error:', error);
            setResponse('Sorry, I could not process your command.');
          } finally {
            setIsProcessing(false);
            setTranscript('');
          }
        }
      };

      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Voice Control Header */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Volume2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Voice Commands</h3>
              <p className="text-gray-400 text-sm">Speak naturally to control the system</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isListening ? 'bg-red-500/20 text-red-300 animate-pulse' : 
              isProcessing ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {isListening ? 'LISTENING' : isProcessing ? 'PROCESSING' : 'READY'}
            </div>
          </div>
        </div>
        
        {/* Voice Control Button */}
        <div className="flex justify-center">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative w-24 h-24 rounded-full transition-all duration-300 shadow-2xl ${
              isListening 
                ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse scale-110 shadow-red-500/50' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 shadow-blue-500/30'
            }`}
          >
            <div className="absolute inset-2 bg-white/20 rounded-full flex items-center justify-center">
              {isListening ? (
                <MicOff className="h-8 w-8 text-white" />
              ) : (
                <Mic className="h-8 w-8 text-white" />
              )}
            </div>
            {isListening && (
              <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
            )}
          </button>
        </div>
        
        {/* Voice Level Indicator */}
        {isListening && (
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full transition-all duration-150 ${
                    Math.sin(animationFrame * 0.3 + i) > 0 ? 'h-8' : 'h-2'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Conversation Area */}
      <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 overflow-y-auto min-h-[400px]">
        <div className="space-y-4 h-full">
          {transcript && (
            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl px-4 py-3 max-w-xs">
                <div className="flex items-center space-x-2 mb-1">
                  <Mic className="h-4 w-4 text-white" />
                  <span className="text-white text-sm font-semibold">You said:</span>
                </div>
                <p className="text-white">"{transcript}"</p>
              </div>
            </div>
          )}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center animate-spin">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-cyan-300 font-semibold">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          {response && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl px-4 py-3 max-w-md">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-white text-sm font-semibold">DHEEMA AI</span>
                </div>
                <p className="text-white">{response}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Commands */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mt-4 flex-shrink-0">
        <h4 className="text-white font-semibold mb-3 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-cyan-400" />
          Quick Voice Commands
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { text: "Show gas level in Zone 3", icon: "🔍" },
            { text: "Any alerts today?", icon: "⚠️" },
            { text: "Temperature in Floor 1", icon: "🌡️" },
            { text: "Emergency evacuation", icon: "🚨" },
            { text: "System status report", icon: "📊" },
            { text: "Show critical sensors", icon: "🔴" }
          ].map((cmd, i) => (
            <button
              key={i}
              onClick={() => {
                setTranscript(cmd.text);
                onVoiceCommand(cmd.text);
              }}
              className="flex items-center space-x-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-105 text-left"
            >
              <span className="text-lg">{cmd.icon}</span>
              <span className="text-gray-300 text-xs">{cmd.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}