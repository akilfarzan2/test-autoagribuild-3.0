import React, { useState } from 'react';
import { Users, ChevronDown, ChevronRight, User, Package } from 'lucide-react';

interface JobCardFormData {
  assigned_worker: string;
  assigned_parts: string;
}

interface AssignmentsProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string) => void;
}

const Assignments: React.FC<AssignmentsProps> = ({ 
  jobCardFormData, 
  onJobCardDataChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const workerOptions = [
    { value: '', label: 'Select Worker' },
    { value: 'Worker 1', label: 'Worker 1' },
    { value: 'Worker 2', label: 'Worker 2' },
    { value: 'Worker 3', label: 'Worker 3' },
    { value: 'Worker 4', label: 'Worker 4' },
  ];

  const partsOptions = [
    { value: '', label: 'Select Parts' },
    { value: 'Parts 1', label: 'Parts 1' },
    { value: 'Parts 2', label: 'Parts 2' },
    { value: 'Parts 3', label: 'Parts 3' },
    { value: 'Parts 4', label: 'Parts 4' },
  ];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-6 bg-white animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Assigned Worker */}
            <div className="space-y-4">
              <div>
                <label htmlFor="assignedWorker" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Assigned Worker
                </label>
                <select
                  id="assignedWorker"
                  name="assignedWorker"
                  value={jobCardFormData.assigned_worker}
                  onChange={(e) => onJobCardDataChange('assigned_worker', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {workerOptions.map(worker => (
                    <option key={worker.value} value={worker.value}>
                      {worker.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-indigo-800 mb-2">Worker Assignment</h4>
                <p className="text-xs text-indigo-600">
                  Select the worker responsible for this job card. This assignment helps track 
                  workload and ensures proper task delegation.
                </p>
              </div>
            </div>

            {/* Right Column - Assigned Parts */}
            <div className="space-y-4">
              <div>
                <label htmlFor="assignedParts" className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  Assigned Parts
                </label>
                <select
                  id="assignedParts"
                  name="assignedParts"
                  value={jobCardFormData.assigned_parts}
                  onChange={(e) => onJobCardDataChange('assigned_parts', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {partsOptions.map(parts => (
                    <option key={parts.value} value={parts.value}>
                      {parts.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-indigo-800 mb-2">Parts Assignment</h4>
                <p className="text-xs text-indigo-600">
                  Select the parts category or specialist responsible for parts procurement 
                  and management for this job.
                </p>
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-indigo-800 mb-2">Assignment Information</h4>
            <p className="text-xs text-indigo-600">
              Proper assignment of workers and parts ensures efficient job completion and clear responsibility tracking. 
              Both assignments are optional but recommended for better workflow management.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;