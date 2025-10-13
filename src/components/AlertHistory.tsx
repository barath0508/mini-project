import { AlertTriangle, Clock, X } from 'lucide-react';

interface Alert {
  id: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  sensors: string[];
}

interface AlertHistoryProps {
  alerts: Alert[];
  onClearHistory: () => void;
}

export default function AlertHistory({ alerts, onClearHistory }: AlertHistoryProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'medium': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'low': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
          <AlertTriangle size={20} />
          Alert History
        </h3>
        {alerts.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Clear History"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="mx-auto mb-2 opacity-50" size={32} />
            <p>No alerts recorded</p>
          </div>
        ) : (
          alerts.slice(-10).reverse().map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}