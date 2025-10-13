import { useState } from 'react';
import { FileText, Camera, MapPin, AlertTriangle } from 'lucide-react';
import { IncidentReport } from '../types';

interface IncidentReportingProps {
  onSubmitReport: (report: Omit<IncidentReport, 'id' | 'timestamp'>) => void;
  userId: string;
}

export default function IncidentReporting({ onSubmitReport, userId }: IncidentReportingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    severity: 'low' as 'low' | 'medium' | 'high'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const report: Omit<IncidentReport, 'id' | 'timestamp'> = {
      reporterId: userId,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      severity: formData.severity,
      status: 'open'
    };

    onSubmitReport(report);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      location: '',
      severity: 'low'
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
      >
        <AlertTriangle size={20} />
        <span>Report Incident</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <FileText className="mr-2" size={20} />
            Report Safety Incident
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Incident Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              placeholder="Brief description of the incident"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
              <select
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-3 pl-10 bg-gray-700 text-white rounded border border-gray-600"
                required
              >
                <option value="">Select location</option>
                <option value="Floor 1 - Zone A">Floor 1 - Zone A</option>
                <option value="Floor 1 - Zone B">Floor 1 - Zone B</option>
                <option value="Floor 2 - Zone A">Floor 2 - Zone A</option>
                <option value="Floor 2 - Zone B">Floor 2 - Zone B</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Loading Dock">Loading Dock</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Severity Level</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({...formData, severity: e.target.value as 'low' | 'medium' | 'high'})}
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
            >
              <option value="low">Low - Minor issue</option>
              <option value="medium">Medium - Requires attention</option>
              <option value="high">High - Immediate action needed</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 h-24"
              placeholder="Detailed description of the unsafe condition or incident"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white p-3 rounded font-semibold"
            >
              Submit Report
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-400">
          <p>Reports are immediately sent to supervisors and safety team.</p>
        </div>
      </div>
    </div>
  );
}