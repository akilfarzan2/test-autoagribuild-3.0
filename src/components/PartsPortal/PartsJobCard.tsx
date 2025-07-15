import React from 'react';
import { Edit, CheckCircle, Calendar, User, Car, Package, Building } from 'lucide-react';
import { JobCard } from '../../types/jobCardTypes';

interface PartsJobCardProps {
  jobCard: JobCard;
  onEdit: (jobCard: JobCard) => void;
  onComplete: (jobCard: JobCard) => void;
}

const PartsJobCard: React.FC<PartsJobCardProps> = ({ 
  jobCard, 
  onEdit, 
  onComplete 
}) => {
  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Determine the primary work scope/service type
  const getWorkScope = (): string => {
    const workScopes: string[] = [];
    
    // Add service selection if present (Service A, B, C, D)
    if (jobCard.service_selection) {
      workScopes.push(jobCard.service_selection);
    }
    
    // Add vehicle-specific work types
    if (jobCard.vehicle_type && Array.isArray(jobCard.vehicle_type)) {
      if (jobCard.vehicle_type.includes('Trailer')) {
        workScopes.push('Trailer Service');
      }
      if (jobCard.vehicle_type.includes('Other')) {
        workScopes.push('Other Work');
      }
    }
    
    // Return combined scopes or default
    return workScopes.length > 0 ? workScopes.join(', ') : 'General Service';
  };

  // Format vehicle details
  const formatVehicleDetails = (): string => {
    const parts = [];
    if (jobCard.vehicle_type && Array.isArray(jobCard.vehicle_type)) parts.push(jobCard.vehicle_type.join(', '));
    if (jobCard.vehicle_make) parts.push(jobCard.vehicle_make);
    if (jobCard.vehicle_model) parts.push(jobCard.vehicle_model);
    return parts.length > 0 ? parts.join(' ') : 'Not specified';
  };

  // Get status badge
  const getStatusBadge = () => {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Active
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 mb-4">
      {/* Header with Job Number and Status */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">{jobCard.job_number}</h3>
        {getStatusBadge()}
      </div>

      {/* Job Details */}
      <div className="space-y-2 mb-4">
        {/* Customer */}
        <div className="flex items-center text-sm">
          <User className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <span className="font-medium text-gray-700">CUSTOMER</span>
            <div className="text-gray-900">{jobCard.customer_name || 'Not specified'}</div>
            <div className="text-gray-600 text-xs">{jobCard.company_name || 'No company'}</div>
          </div>
        </div>

        {/* Vehicle */}
        <div className="flex items-center text-sm">
          <Car className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <span className="font-medium text-gray-700">VEHICLE</span>
            <div className="text-gray-900">REGO: {jobCard.rego || 'N/A'}</div>
            <div className="text-gray-600 text-xs">{formatVehicleDetails()}</div>
          </div>
        </div>

        {/* Work Scope/Service */}
        <div className="flex items-center text-sm">
          <Package className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <span className="font-medium text-gray-700">JOB</span>
            <div className="text-gray-900">{getWorkScope()}</div>
          </div>
        </div>

        {/* Start Date */}
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
          <span>Started: {formatDate(jobCard.job_start_date)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(jobCard)}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </button>
        <button
          onClick={() => onComplete(jobCard)}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Complete
        </button>
      </div>
    </div>
  );
};

export default PartsJobCard;