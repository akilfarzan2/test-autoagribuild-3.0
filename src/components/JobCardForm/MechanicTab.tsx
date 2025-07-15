import React, { forwardRef } from 'react';
import { Wrench, User, Clock, CheckCircle } from 'lucide-react';
import { JobCardFormData, ServiceTask, SignatureCanvasRef } from '../../types/jobCardTypes';
import ServiceATaskList from './InformationTabSections/VehicleDetailsTaskLists/ServiceATaskList';
import ServiceBTaskList from './InformationTabSections/VehicleDetailsTaskLists/ServiceBTaskList';
import ServiceCTaskList from './InformationTabSections/VehicleDetailsTaskLists/ServiceCTaskList';
import ServiceDTaskList from './InformationTabSections/VehicleDetailsTaskLists/ServiceDTaskList';
import TrailerTaskList from './InformationTabSections/VehicleDetailsTaskLists/TrailerTaskList';
import OtherTaskList from './InformationTabSections/VehicleDetailsTaskLists/OtherTaskList';
import MechanicSection from './MechanicTabSections/MechanicSection';
import VehicleImages from './MechanicTabSections/VehicleImages';

interface MechanicTabProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string | string[] | boolean | ServiceTask[] | null) => void;
}

const MechanicTab = forwardRef<SignatureCanvasRef, MechanicTabProps>(({ 
  jobCardFormData, 
  onJobCardDataChange 
}, ref) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <Wrench className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mechanic Information</h2>
          <p className="text-sm text-gray-500">Manage mechanic assignments and work progress</p>
        </div>
      </div>

      {/* Content area - ready for your custom fields */}
      <div className="space-y-6">
        {/* Service-specific task lists */}
        {jobCardFormData.service_selection === 'Service A' && (
          <ServiceATaskList 
            jobCardFormData={jobCardFormData}
            onJobCardDataChange={onJobCardDataChange}
          />
        )}
        
        {/* Placeholder for other service types */}
        {jobCardFormData.service_selection === 'Service B' && (
          <ServiceBTaskList 
            jobCardFormData={jobCardFormData}
            onJobCardDataChange={onJobCardDataChange}
          />
        )}
        
        {jobCardFormData.service_selection === 'Service C' && (
          <ServiceCTaskList 
            jobCardFormData={jobCardFormData}
            onJobCardDataChange={onJobCardDataChange}
          />
        )}
        
        {jobCardFormData.service_selection === 'Service D' && (
          <ServiceDTaskList 
            jobCardFormData={jobCardFormData}
            onJobCardDataChange={onJobCardDataChange}
          />
        )}
        
        {/* Default state when no service is selected */}
        {!jobCardFormData.service_selection && (
          <div className="min-h-[200px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-400 mb-2">No Service Selected</p>
              <p className="text-sm text-gray-400">
                Please select a service type in the Information tab to view the task list
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Trailer Task List - Shows when "Trailer" is selected in vehicle type */}
      {jobCardFormData.vehicle_type && jobCardFormData.vehicle_type.includes('Trailer') && (
        <div className="mt-6">
          <TrailerTaskList 
            jobCardFormData={jobCardFormData}
            onJobCardDataChange={onJobCardDataChange}
          />
        </div>
      )}

      {/* Other Task List - Shows when "Other" is selected in vehicle type */}
      {jobCardFormData.vehicle_type && jobCardFormData.vehicle_type.includes('Other') && (
        <div className="mt-6">
          <OtherTaskList 
            jobCardFormData={jobCardFormData}
            onJobCardDataChange={onJobCardDataChange}
          />
        </div>
      )}

      {/* Mechanic Section - Always visible */}
      <div className="mt-6">
        <MechanicSection 
          ref={ref}
          jobCardFormData={jobCardFormData}
          onJobCardDataChange={onJobCardDataChange}
          initialSupervisorSignature={jobCardFormData.supervisor_signature}
        />
      </div>

      {/* Vehicle Images Section - Always visible */}
      <div className="mt-6">
        <VehicleImages 
          jobCardFormData={jobCardFormData}
          onJobCardDataChange={onJobCardDataChange}
        />
      </div>

      {/* Information Panel */}
      <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-orange-800 mb-2">Mechanic Tab Information</h4>
        <p className="text-xs text-orange-600">
          This tab is used to track mechanic assignments, work progress, and quality control. 
          All information entered here helps maintain accurate records of work performed and time spent on each job.
        </p>
      </div>
    </div>
  );
});

MechanicTab.displayName = 'MechanicTab';

export default MechanicTab;