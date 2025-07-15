import React, { forwardRef } from 'react';
import JobInformation from './InformationTabSections/JobInformation';
import CustomerDetails from './InformationTabSections/CustomerDetails';
import VehicleDetails from './InformationTabSections/VehicleDetails';
import Assignments from './InformationTabSections/Assignments';
import CustomerDeclaration from './InformationTabSections/CustomerDeclaration';
import { JobCardFormData, SignatureCanvasRef } from '../../types/jobCardTypes';

interface InformationTabProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string | string[] | boolean) => void;
  generateNextJobNumber: (year: string, month: string) => Promise<string>;
  isGeneratingJobNumber?: boolean;
}

const InformationTab = forwardRef<SignatureCanvasRef, InformationTabProps>(({ 
  jobCardFormData, 
  onJobCardDataChange,
  generateNextJobNumber,
  isGeneratingJobNumber = false
}, ref) => {
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
        ref={ref}
        jobCardFormData={jobCardFormData}
        onJobCardDataChange={onJobCardDataChange}
        initialCustomerSignature={jobCardFormData.customer_signature}
      />
    </div>
  );
});

InformationTab.displayName = 'InformationTab';

export default InformationTab;