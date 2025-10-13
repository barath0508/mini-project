import { useState, useEffect } from 'react';
import { X, Mic, Search, Bot, Sparkles, Zap, Brain } from 'lucide-react';
import VoiceBot from './VoiceBot';
import SmartSearch from './SmartSearch';
import AICommandCenter from './AICommandCenter';
import { SensorData } from '../types';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'voice' | 'search' | 'chat';
  sensors: SensorData[];
  alerts: any[];
  onVoiceCommand: (command: string) => void;
}

export default function AIPanel({ isOpen, onClose, activeTab, sensors, alerts, onVoiceCommand }: AIPanelProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [animationFrame, setAnimationFrame] = useState(0);
  
  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);
  
  useEffect(() => {
    const animate = () => setAnimationFrame(prev => prev + 1);
    const interval = setInterval(animate, 100);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-2 animate-in fade-in duration-300">
      <div className="bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 relative z-10">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-white font-bold text-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center">
                  DHEEMA AI Assistant
                  <Zap className="h-5 w-5 text-yellow-400 ml-2 animate-pulse" />
                </h2>
                <p className="text-gray-400 text-sm flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-cyan-400" />
                  Powered by Gemini Flash 2.0 • Emergency Detection & Analysis
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
              <button
                onClick={() => setCurrentTab('voice')}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  currentTab === 'voice' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40 scale-105' 
                    : 'text-gray-300 hover:text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                {currentTab === 'voice' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 animate-pulse"></div>
                )}
                <Mic className={`h-4 w-4 ${currentTab === 'voice' ? 'animate-pulse' : ''}`} />
                <span>Voice Commands</span>
              </button>
              <button
                onClick={() => setCurrentTab('search')}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  currentTab === 'search' 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 scale-105' 
                    : 'text-gray-300 hover:text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                {currentTab === 'search' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20 animate-pulse"></div>
                )}
                <Search className={`h-4 w-4 ${currentTab === 'search' ? 'animate-pulse' : ''}`} />
                <span>Smart Search</span>
              </button>
              <button
                onClick={() => setCurrentTab('chat')}
                className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                  currentTab === 'chat' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/40 scale-105' 
                    : 'text-gray-300 hover:text-white hover:bg-white/20 hover:scale-105'
                }`}
              >
                {currentTab === 'chat' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-purple-600/20 animate-pulse"></div>
                )}
                <Bot className={`h-4 w-4 ${currentTab === 'chat' ? 'animate-pulse' : ''}`} />
                <span>AI Chat</span>
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-3 rounded-2xl hover:bg-red-500/20 transition-all duration-300 border border-white/20 hover:border-red-500/50 hover:scale-110 group"
          >
            <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden relative z-10 min-h-0">
          {currentTab === 'voice' && (
            <VoiceBot onVoiceCommand={onVoiceCommand} sensors={sensors} />
          )}
          {currentTab === 'search' && (
            <SmartSearch sensors={sensors} alerts={alerts} />
          )}
          {currentTab === 'chat' && (
            <AICommandCenter sensors={sensors} alerts={alerts} />
          )}
        </div>
      </div>
    </div>
  );
}