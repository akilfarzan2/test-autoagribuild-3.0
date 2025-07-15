import React from 'react';
import CreateJobCardForm from '../JobCardFormTypes/CreateJobCardForm';
import EditJobCardForm from '../JobCardFormTypes/EditJobCardForm';
import { JobCard } from '../../types/jobCardTypes';
import { Customer } from '../../types/customerTypes';

interface JobCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialJobCardData?: JobCard | null;
  initialCustomerData?: Customer | null;
  allowedTabs?: string[];
}

const JobCardForm: React.FC<JobCardFormProps> = ({ isOpen, onClose, initialJobCardData, initialCustomerData, allowedTabs }) => {
  // Determine if we're in edit mode based on the presence of initialJobCardData
  const isEditMode = !!initialJobCardData;

  if (isEditMode) {
    return (
      <EditJobCardForm
        isOpen={isOpen}
        onClose={onClose}
        initialCustomerData={initialCustomerData}
        initialJobCardData={initialJobCardData}
        allowedTabs={allowedTabs}
      />
    );
  }

  return (
    <CreateJobCardForm
      isOpen={isOpen}
      onClose={onClose}
      initialCustomerData={initialCustomerData}
    />
  );
};

export default JobCardForm;