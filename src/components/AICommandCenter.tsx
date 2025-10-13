import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, Sparkles, Zap, MessageCircle, Clock, User, Brain } from 'lucide-react';
import { geminiAI } from '../services/geminiAI';
import { SensorData } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

interface AICommandCenterProps {
  sensors: SensorData[];
  alerts: any[];
}

export default function AICommandCenter({ sensors, alerts }: AICommandCenterProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m DHEEMA, your Detection Hub for Emergency Event Monitoring & Analysis. I can analyze sensor data, predict risks, explain alerts, and provide safety insights. How can I help you today?',
      sender: 'ai',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Process with Gemini AI
    try {
      const response = await geminiAI.processAIQuery(input, sensors, alerts);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI query error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'ai',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };



  const quickCommands = [
    { text: "Show today's temperature history", icon: "🌡️", category: "data" },
    { text: "Any critical alerts today?", icon: "⚠️", category: "alerts" },
    { text: "Gas levels in all zones", icon: "💨", category: "sensors" },
    { text: "Which zone needs attention?", icon: "🎯", category: "analysis" },
    { text: "Predict risk patterns", icon: "🔮", category: "prediction" },
    { text: "Emergency evacuation routes", icon: "🚨", category: "emergency" }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">DHEEMA AI Assistant</h3>
              <p className="text-gray-400 text-sm flex items-center">
                <Brain className="h-4 w-4 mr-1 text-purple-400" />
                Emergency Detection & Monitoring • Powered by Gemini Flash 2.0
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-semibold">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 overflow-y-auto mb-6 min-h-[400px]">
        <div className="space-y-4 h-full">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-2xl ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-semibold">
                      {message.sender === 'user' ? 'You' : 'DHEEMA AI'}
                    </span>
                    {message.sender === 'ai' && (
                      <Zap className="h-3 w-3 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className="flex items-center space-x-1 mt-2 opacity-70">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-semibold text-white">DHEEMA AI</span>
                    <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Commands */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-4 flex-shrink-0">
        <h4 className="text-white font-semibold mb-3 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-purple-400" />
          Quick Commands
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickCommands.map((cmd, i) => (
            <button
              key={i}
              onClick={() => setInput(cmd.text)}
              className="flex items-center space-x-2 p-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg text-left transition-all duration-300 hover:scale-105 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform duration-300">{cmd.icon}</span>
              <span className="text-gray-300 group-hover:text-white text-xs font-medium">{cmd.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me anything about your industrial safety data..."
              className="w-full p-4 pr-12 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
            />
            <MessageCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white p-4 rounded-2xl transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isTyping ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}