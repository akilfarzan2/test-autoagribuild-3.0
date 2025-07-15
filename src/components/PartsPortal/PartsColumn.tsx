import React from 'react';
import { Package } from 'lucide-react';
import { JobCard } from '../../types/jobCardTypes';
import PartsJobCard from './PartsJobCard';

interface PartsColumnProps {
  partsName: string;
  jobCards: JobCard[];
  onEdit: (jobCard: JobCard) => void;
  onComplete: (jobCard: JobCard) => void;
}

const PartsColumn: React.FC<PartsColumnProps> = ({ 
  partsName, 
  jobCards, 
  onEdit, 
  onComplete 
}) => {
  const activeJobsCount = jobCards.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Column Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Package className="w-5 h-5" />
          <h3 className="text-lg font-semibold">{partsName}</h3>
        </div>
        <p className="text-blue-100 text-sm">
          {activeJobsCount} active job{activeJobsCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Job Cards */}
      <div className="p-4 min-h-[400px]">
        {jobCards.length > 0 ? (
          <div className="space-y-4">
            {jobCards.map((jobCard) => (
              <PartsJobCard
                key={jobCard.id}
                jobCard={jobCard}
                onEdit={onEdit}
                onComplete={onComplete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Package className="w-12 h-12 mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">No assigned jobs</h4>
            <p className="text-sm text-gray-400 text-center">
              Jobs will appear here when assigned
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartsColumn;