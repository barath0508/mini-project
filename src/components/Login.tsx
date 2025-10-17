import { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Mock authentication - replace with real auth
    const mockUsers: Record<string, User> = {
      'admin': {
        id: '1',
        username: 'admin',
        role: 'admin',
        name: 'System Administrator',
        email: 'admin@factory.com',
        phone: '+1234567890'
      },
      'supervisor': {
        id: '2',
        username: 'supervisor',
        role: 'supervisor',
        name: 'Floor Supervisor',
        email: 'supervisor@factory.com',
        phone: '+1234567891',
        assignedZones: ['Zone A', 'Zone B']
      },
      'worker': {
        id: '3',
        username: 'worker',
        role: 'worker',
        name: 'Factory Worker',
        email: 'worker@factory.com',
        phone: '+1234567892'
      }
    };

    const user = mockUsers[username];
    if (user && password === 'password') {
      onLogin(user);
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center relative overflow-hidden">
      {/* Glassmorphic Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl glass-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-indigo-400/20 rounded-full blur-3xl glass-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-blue-400/15 rounded-full blur-2xl glass-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="glass-strong p-16 rounded-3xl w-[600px] relative animate-in fade-in slide-in-from-bottom duration-700 glass-glow">
        <div className="relative">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-700 delay-200">
            <div className="w-28 h-28 glass-gradient-blue rounded-3xl mx-auto mb-10 flex items-center justify-center glass-glow hover:scale-110 transition-all duration-300">
              <span className="text-5xl font-bold text-white">🏭</span>
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-6">
              DHEEMA
            </h1>
            <p className="glass-text text-xl font-semibold tracking-wide">Detection Hub for Emergency Event Monitoring & Analysis</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mt-8 glass-glow"></div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-10 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <div className="space-y-4">
              <label className="block glass-text mb-4 font-bold text-lg uppercase tracking-wide">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-6 glass text-white rounded-2xl placeholder-white/60 font-semibold text-lg hover:scale-[1.02] transition-all duration-300"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-4">
              <label className="block glass-text mb-4 font-bold text-lg uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-6 glass text-white rounded-2xl placeholder-white/60 font-semibold text-lg hover:scale-[1.02] transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500/80 to-indigo-600/80 hover:from-blue-600/80 hover:to-indigo-700/80 text-white p-6 rounded-2xl font-black text-xl transition-all duration-300 glass-button hover:scale-105 hover:-translate-y-1 glass-shimmer"
            >
              🚀 Access System
            </button>
          </form>
          
          <div className="mt-12 glass rounded-3xl p-8 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
            <div className="glass-text text-lg font-black mb-8 flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-4 animate-pulse glass-glow"></div>
              Demo Credentials
            </div>
            <div className="space-y-5 text-base">
              <div className="flex justify-between items-center p-5 glass-subtle rounded-2xl hover:scale-105 transition-all duration-300 glass-hover">
                <span className="text-purple-300 font-black font-mono text-lg">admin/password</span>
                <span className="text-purple-200 text-sm glass-subtle px-4 py-2 rounded-xl font-bold">Full Access</span>
              </div>
              <div className="flex justify-between items-center p-5 glass-subtle rounded-2xl hover:scale-105 transition-all duration-300 glass-hover">
                <span className="text-blue-300 font-black font-mono text-lg">supervisor/password</span>
                <span className="text-blue-200 text-sm glass-subtle px-4 py-2 rounded-xl font-bold">Zone Access</span>
              </div>
              <div className="flex justify-between items-center p-5 glass-subtle rounded-2xl hover:scale-105 transition-all duration-300 glass-hover">
                <span className="text-emerald-300 font-black font-mono text-lg">worker/password</span>
                <span className="text-emerald-200 text-sm glass-subtle px-4 py-2 rounded-xl font-bold">Limited Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}