import { useState, useEffect } from 'react';
import { Search, Clock, AlertTriangle, Sparkles, TrendingUp, Filter, History, Zap } from 'lucide-react';
import { geminiAI } from '../services/geminiAI';
import { SensorData } from '../types';

interface SmartSearchProps {
  sensors: SensorData[];
  alerts: any[];
}

export default function SmartSearch({ sensors, alerts }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'alerts' | 'sensors' | 'trends'>('all');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
    
    try {
      const searchResults = await geminiAI.processSmartQuery(query, sensors, alerts);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([{ message: 'Search failed. Please try again.', timestamp: Date.now(), type: 'error' }]);
    } finally {
      setIsSearching(false);
    }
  };

  const quickQueries = {
    alerts: [
      "Was there any fire alert in past 2 days?",
      "Which area had most alerts this week?",
      "Show critical alerts from yesterday"
    ],
    sensors: [
      "Show today's humidity levels",
      "Temperature history for Zone A",
      "Gas levels above threshold yesterday"
    ],
    trends: [
      "Temperature trends this week",
      "Humidity patterns by zone",
      "Peak alert times analysis"
    ]
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Smart Search</h3>
              <p className="text-gray-400 text-sm">Natural language queries with AI analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-sm font-semibold">AI-Powered</span>
          </div>
        </div>
      
        {/* Search Input */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything: 'Show gas levels above 80ppm today' or 'Which zone has most alerts?'"
              className="w-full p-4 pl-12 pr-32 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold flex items-center">
            <Filter className="h-5 w-5 mr-2 text-cyan-400" />
            Quick Queries
          </h4>
          <div className="flex items-center space-x-1 bg-white/10 rounded-xl p-1">
            {[{key: 'all', label: 'All', icon: Search}, {key: 'alerts', label: 'Alerts', icon: AlertTriangle}, {key: 'sensors', label: 'Sensors', icon: TrendingUp}, {key: 'trends', label: 'Trends', icon: TrendingUp}].map(({key, label, icon: Icon}) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key as any)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  activeFilter === key 
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(activeFilter === 'all' 
            ? [...quickQueries.alerts, ...quickQueries.sensors, ...quickQueries.trends]
            : activeFilter === 'alerts' ? quickQueries.alerts
            : activeFilter === 'sensors' ? quickQueries.sensors
            : quickQueries.trends
          ).map((q, i) => (
            <button
              key={i}
              onClick={() => setQuery(q)}
              className="text-left p-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-xl text-gray-300 hover:text-white text-sm transition-all duration-300 hover:scale-105"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 overflow-y-auto min-h-[400px]">
        {results.length > 0 ? (
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-emerald-400" />
              AI Analysis Results
            </h4>
            <div className="space-y-4">
              {results.map((result, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${
                  result.type === 'error' 
                    ? 'bg-red-500/20 border-red-500/30' 
                    : 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-500/30'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      result.type === 'error' ? 'bg-red-500/30' : 'bg-emerald-500/30'
                    }`}>
                      {result.type === 'error' ? (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      ) : (
                        <Zap className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{result.message}</p>
                      {result.timestamp && (
                        <div className="flex items-center space-x-1 mt-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(result.timestamp).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-emerald-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Ready for Smart Search</h4>
            <p className="text-gray-400 text-sm max-w-md">
              Ask natural language questions about your industrial safety data. 
              Our AI will analyze sensors, alerts, and trends to provide insights.
            </p>
          </div>
        )}
      </div>
      
      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mt-4 flex-shrink-0">
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <History className="h-5 w-5 mr-2 text-gray-400" />
            Recent Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((search, i) => (
              <button
                key={i}
                onClick={() => setQuery(search)}
                className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-gray-300 hover:text-white px-2 py-1 rounded-lg transition-all duration-300"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}