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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] animate-pulse"></div>
      </div>
      
      <div className="bg-white/90 backdrop-blur-xl p-12 rounded-3xl shadow-2xl w-[480px] border border-white/40 relative animate-in fade-in slide-in-from-bottom duration-700">
        {/* Professional Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-60"></div>
        <div className="relative">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700 delay-200">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-blue-500/30 hover:scale-110 transition-all duration-300">
              <span className="text-4xl font-bold text-white">🏭</span>
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
              DHEEMA
            </h1>
            <p className="text-slate-600 text-lg font-semibold tracking-wide">Detection Hub for Emergency Event Monitoring & Analysis</p>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full mx-auto mt-6"></div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <div className="space-y-3">
              <label className="block text-slate-700 mb-3 font-bold text-sm uppercase tracking-wide">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-5 bg-white/70 text-slate-800 rounded-2xl border border-white/40 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm placeholder-slate-500 font-semibold shadow-lg hover:shadow-xl focus:scale-[1.02]"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-slate-700 mb-3 font-bold text-sm uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-5 bg-white/70 text-slate-800 rounded-2xl border border-white/40 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm placeholder-slate-500 font-semibold shadow-lg hover:shadow-xl focus:scale-[1.02]"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white p-5 rounded-2xl font-black text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/40 transform hover:scale-[1.02] hover:-translate-y-1 btn-professional"
            >
              🚀 Access System
            </button>
          </form>
          
          <div className="mt-10 p-6 bg-white/60 rounded-2xl border border-white/40 backdrop-blur-sm shadow-lg animate-in fade-in slide-in-from-bottom duration-700 delay-500">
            <div className="text-slate-700 text-sm font-black mb-6 flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full mr-3 animate-pulse"></div>
              Demo Credentials
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200/50 hover:scale-105 transition-all duration-300 shadow-md">
                <span className="text-purple-700 font-black font-mono text-base">admin/password</span>
                <span className="text-purple-600 text-xs bg-purple-200 px-3 py-1 rounded-full font-bold">Full Access</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200/50 hover:scale-105 transition-all duration-300 shadow-md">
                <span className="text-blue-700 font-black font-mono text-base">supervisor/password</span>
                <span className="text-blue-600 text-xs bg-blue-200 px-3 py-1 rounded-full font-bold">Zone Access</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200/50 hover:scale-105 transition-all duration-300 shadow-md">
                <span className="text-emerald-700 font-black font-mono text-base">worker/password</span>
                <span className="text-emerald-600 text-xs bg-emerald-200 px-3 py-1 rounded-full font-bold">Limited Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}