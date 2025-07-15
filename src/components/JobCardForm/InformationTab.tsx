import React from 'react';
import JobInformation from './InformationTabSections/JobInformation';
import CustomerDetails from './InformationTabSections/CustomerDetails';
import VehicleDetails from './InformationTabSections/VehicleDetails';
import Assignments from './InformationTabSections/Assignments';
import CustomerDeclaration from './InformationTabSections/CustomerDeclaration';
import { JobCardFormData } from '../../types/jobCardTypes';

interface InformationTabProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string | string[] | boolean) => void;
  generateNextJobNumber: (year: string, month: string) => Promise<string>;
  isGeneratingJobNumber?: boolean;
}

const InformationTab: React.FC<InformationTabProps> = ({ 
  jobCardFormData, 
  onJobCardDataChange,
  generateNextJobNumber,
  isGeneratingJobNumber = false
}) => {
  return (
    <div className="space-y-6">
      <JobInformation 
        jobCardFormData={jobCardFormData}
        onJobCardDataChange={onJobCardDataChange}
        generateNextJobNumber={generateNextJobNumber}
        isGeneratingJobNumber={isGeneratingJobNumber}
      />
      <CustomerDetails 
        jobCardFormData={jobCardFormData}
        onJobCardDataChange={onJobCardDataChange}
      />
      <VehicleDetails 
        jobCardFormData={jobCardFormData}
        onJobCardDataChange={onJobCardDataChange}
      />
      <Assignments 
        jobCardFormData={jobCardFormData}
        onJobCardDataChange={onJobCardDataChange}
      />
      <CustomerDeclaration 
        jobCardFormData={jobCardFormData}
        onJobCardDataChange={onJobCardDataChange}
      />
    </div>
  );
};

export default InformationTab;