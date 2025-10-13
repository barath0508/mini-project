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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl w-[420px] border border-white/10 relative">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-60"></div>
        <div className="relative">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <span className="text-3xl font-bold text-white">🏭</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
              DHEEMA
            </h1>
            <p className="text-gray-400 text-base font-medium">Secure Access Portal</p>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full mx-auto mt-4"></div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-7">
            <div className="space-y-2">
              <label className="block text-gray-300 mb-3 font-semibold text-sm uppercase tracking-wide">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 bg-white/5 text-white rounded-2xl border border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm placeholder-gray-500 font-medium"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-300 mb-3 font-semibold text-sm uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-white/5 text-white rounded-2xl border border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm placeholder-gray-500 font-medium"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 via-purple-600 to-blue-600 hover:from-cyan-500 hover:via-purple-500 hover:to-blue-500 text-white p-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/30 transform hover:scale-[1.02] hover:-translate-y-1"
            >
              Access System
            </button>
          </form>
          
          <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="text-gray-300 text-sm font-bold mb-4 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-2"></div>
              Demo Credentials
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <span className="text-purple-400 font-bold font-mono">admin/password</span>
                <span className="text-gray-400 text-xs bg-purple-500/20 px-2 py-1 rounded-full">Full access</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <span className="text-blue-400 font-bold font-mono">supervisor/password</span>
                <span className="text-gray-400 text-xs bg-blue-500/20 px-2 py-1 rounded-full">Zone access</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="text-emerald-400 font-bold font-mono">worker/password</span>
                <span className="text-gray-400 text-xs bg-emerald-500/20 px-2 py-1 rounded-full">Limited access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}