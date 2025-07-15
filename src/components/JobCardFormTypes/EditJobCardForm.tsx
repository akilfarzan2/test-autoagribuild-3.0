import React, { useState } from 'react';
import { X, FileText, RefreshCw } from 'lucide-react';
import InformationTab from '../JobCardForm/InformationTab';
import MechanicTab from '../JobCardForm/MechanicTab';
import PartsTab from '../JobCardForm/PartsTab';
import PaymentsTab from '../JobCardForm/PaymentsTab';
import Modal from '../Modal';
import { supabase } from '../../utils/supabaseClient';
import { JobCard, JobCardFormData, ServiceTask } from '../../types/jobCardTypes';
import { getAdelaideDateTimeForInput } from '../../utils/dateUtils';
import { SERVICE_A_TASKS } from '../JobCardForm/InformationTabSections/VehicleDetailsTaskLists/ServiceATaskList';
import { SERVICE_B_TASKS } from '../JobCardForm/InformationTabSections/VehicleDetailsTaskLists/ServiceBTaskList';
import { SERVICE_C_TASKS } from '../JobCardForm/InformationTabSections/VehicleDetailsTaskLists/ServiceCTaskList';
import { SERVICE_D_TASKS } from '../JobCardForm/InformationTabSections/VehicleDetailsTaskLists/ServiceDTaskList';
import { TRAILER_TASK_SECTIONS } from '../JobCardForm/InformationTabSections/VehicleDetailsTaskLists/TrailerTaskList';

interface EditJobCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialJobCardData: JobCard;
  allowedTabs?: string[];
}

const EditJobCardForm: React.FC<EditJobCardFormProps> = ({ isOpen, onClose, initialJobCardData, allowedTabs }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingJobNumber, setIsGeneratingJobNumber] = useState(false);
  
  // Determine initial active tab based on allowed tabs
  const getInitialTab = (): 'information' | 'mechanic' | 'parts' | 'payments' => {
    if (allowedTabs && allowedTabs.length > 0) {
      if (allowedTabs.includes('mechanic')) return 'mechanic';
      if (allowedTabs.includes('information')) return 'information';
      if (allowedTabs.includes('parts')) return 'parts';
      if (allowedTabs.includes('payments')) return 'payments';
    }
    return 'information';
  };
  
  const [activeTab, setActiveTab] = useState<'information' | 'mechanic' | 'parts' | 'payments'>(getInitialTab());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });
  const [jobCardFormData, setJobCardFormData] = useState<JobCardFormData>({
    job_year: new Date().getFullYear().toString(),
    job_month: String(new Date().getMonth() + 1).padStart(2, '0'),
    job_sequence: '001',
    job_start_date: getAdelaideDateTimeForInput(),
    expected_completion_date: '',
    completed_date: '',
    approximate_cost: '0.00',
    customer_name: '',
    company_name: '',
    abn: '',
    mobile: '',
    email: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_month: '',
    vehicle_year: '',
    vehicle_kms: '',
    fuel_type: '',
    vin: '',
    rego: '',
    vehicle_state: '',
    tyre_size: '',
    next_service_kms: '',
    vehicle_type: [],
    service_selection: '',
    assigned_worker: '',
    assigned_parts: '',
    customer_declaration_authorized: false,
    customer_signature: '',
    service_progress: null,
    trailer_progress: null,
  });

  // Generate next job number sequence for given year and month
  const generateNextJobNumber = async (year: string, month: string) => {
    try {
      setIsGeneratingJobNumber(true);
      
      // Query database for existing job numbers with the same year and month
      const { data, error } = await supabase
        .from('job_cards')
        .select('job_number')
        .like('job_number', `JC-${year}-${month}-%`);

      if (error) {
        console.error('Error fetching job numbers:', error);
        return '001';
      }

      if (!data || data.length === 0) {
        return '001';
      }

      // Extract sequence numbers and find the highest
      const sequences = data
        .map(item => {
          const parts = item.job_number.split('-');
          if (parts.length === 4 && parts[0] === 'JC' && parts[1] === year && parts[2] === month) {
            return parseInt(parts[3], 10);
          }
          return 0;
        })
        .filter(num => !isNaN(num) && num > 0);

      const maxSequence = sequences.length > 0 ? Math.max(...sequences) : 0;
      const nextSequence = maxSequence + 1;

      return String(nextSequence).padStart(3, '0');
    } catch (error) {
      console.error('Error generating job number:', error);
      return '001';
    } finally {
      setIsGeneratingJobNumber(false);
    }
  };

  // Helper function to populate form with existing job card data
  const populateFormWithJobCardData = (jobCard: JobCard) => {
    // Extract job number parts
    const jobNumberParts = jobCard.job_number.split('-');
    const year = jobNumberParts[1] || new Date().getFullYear().toString();
    const month = jobNumberParts[2] || String(new Date().getMonth() + 1).padStart(2, '0');
    const sequence = jobNumberParts[3] || '001';

    // Format dates for datetime-local inputs
    const formatDateForInput = (dateString: string | null): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const formatDateOnly = (dateString: string | null): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formData = {
      job_year: year,
      job_month: month,
      job_sequence: sequence,
      job_start_date: formatDateForInput(jobCard.job_start_date),
      expected_completion_date: formatDateOnly(jobCard.expected_completion_date),
      completed_date: formatDateOnly(jobCard.completed_date),
      approximate_cost: jobCard.approximate_cost?.toString() || '0.00',
      customer_name: jobCard.customer_name || '',
      company_name: jobCard.company_name || '',
      abn: jobCard.abn || '',
      mobile: jobCard.mobile || '',
      email: jobCard.email || '',
      vehicle_make: jobCard.vehicle_make || '',
      vehicle_model: jobCard.vehicle_model || '',
      vehicle_month: jobCard.vehicle_month || '',
      vehicle_year: jobCard.vehicle_year?.toString() || '',
      vehicle_kms: jobCard.vehicle_kms?.toString() || '',
      fuel_type: jobCard.fuel_type || '',
      vin: jobCard.vin || '',
      rego: jobCard.rego || '',
      vehicle_state: jobCard.vehicle_state || '',
      tyre_size: jobCard.tyre_size || '',
      next_service_kms: jobCard.next_service_kms?.toString() || '',
      vehicle_type: jobCard.vehicle_type || [],
      service_selection: jobCard.service_selection || '',
      assigned_worker: jobCard.assigned_worker || '',
      assigned_parts: jobCard.assigned_parts || '',
      customer_declaration_authorized: jobCard.customer_declaration_authorized || false,
      customer_signature: jobCard.customer_signature || '',
      service_progress: jobCard.service_progress || null,
      trailer_progress: jobCard.trailer_progress || null,
      other_progress: jobCard.other_progress || null,
      parts_and_consumables: jobCard.parts_and_consumables || null,
      lubricants_used: jobCard.lubricants_used || null,
      handover_valuables_to_customer: jobCard.handover_valuables_to_customer || '',
      check_all_tyres: jobCard.check_all_tyres || '',
      total_a: jobCard.total_a?.toString() || '0.00',
      total_hours: jobCard.total_hours?.toString() || '0.0',
      future_work_notes: jobCard.future_work_notes || '',
    };

    // If service_progress is null but service_selection is set, initialize with default tasks
    if (!formData.service_progress && formData.service_selection) {
      if (formData.service_selection === 'Service A') {
        formData.service_progress = SERVICE_A_TASKS.map(task => ({
          task,
          status: null,
          description: '',
          done_by: '',
          hours: null
        }));
      } else if (formData.service_selection === 'Service B') {
        formData.service_progress = SERVICE_B_TASKS.map(task => ({
          task,
          status: null,
          description: '',
          done_by: '',
          hours: null
        }));
      } else if (formData.service_selection === 'Service C') {
        formData.service_progress = SERVICE_C_TASKS.map(task => ({
          task,
          status: null,
          description: '',
          done_by: '',
          hours: null
        }));
      } else if (formData.service_selection === 'Service D') {
        formData.service_progress = SERVICE_D_TASKS.map(task => ({
          task,
          status: null,
          description: '',
          done_by: '',
          hours: null
        }));
      }
    }

    // If trailer_progress is null but vehicle_type includes 'Trailer', initialize with default tasks
    if (!formData.trailer_progress && formData.vehicle_type && formData.vehicle_type.includes('Trailer')) {
      const tasks: ServiceTask[] = [];
      TRAILER_TASK_SECTIONS.forEach(section => {
        section.tasks.forEach(task => {
          tasks.push({
            task,
            status: null,
            description: '',
            done_by: '',
            hours: null,
            section: section.heading
          });
        });
      });
      
      formData.trailer_progress = {
        inspection_date: null,
        kilometers: null,
        plant_number: null,
        tasks: tasks
      };
    }

    // If other_progress is null but vehicle_type includes 'Other', initialize with default tasks
    if (!formData.other_progress && formData.vehicle_type && formData.vehicle_type.includes('Other')) {
      formData.other_progress = {
        tasks: []
      };
    }

    setJobCardFormData(formData);
  };

  // Initialize form with job card data on component mount
  React.useEffect(() => {
    if (isOpen && initialJobCardData) {
      // Fetch fresh data from database to ensure we have the latest
      fetchLatestJobCardData(initialJobCardData.id);
    }
  }, [isOpen, initialJobCardData]);

  // Fetch the latest job card data from database
  const fetchLatestJobCardData = async (jobCardId: string) => {
    try {
      const { data, error } = await supabase
        .from('job_cards')
        .select('*')
        .eq('id', jobCardId)
        .single();

      if (error) {
        console.error('Error fetching latest job card data:', error);
        // Fallback to using the passed data
        populateFormWithJobCardData(initialJobCardData);
        return;
      }

      if (data) {
        // Use the fresh data from database
        populateFormWithJobCardData(data);
      }
    } catch (error) {
      console.error('Unexpected error fetching job card data:', error);
      // Fallback to using the passed data
      populateFormWithJobCardData(initialJobCardData);
    }
  };

  // Handle form close
  const handleClose = () => {
    onClose();
  };

  // Handle refresh - revert to saved data for edit mode
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Fetch the latest saved data from database to revert unsaved changes
    await fetchLatestJobCardData(initialJobCardData.id);
    
    // Add a small delay to show the refresh animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleJobCardDataChange = (field: keyof JobCardFormData, value: string | string[] | boolean | ServiceTask[] | null) => {
    // Handle service selection changes - reset service_progress to match selected service
    if (field === 'service_selection') {
      let newServiceProgress: ServiceTask[] | null = null;
      
      if (value === 'Service A') {
        newServiceProgress = SERVICE_A_TASKS.map(task => ({
          task,
          status: null,
          description: '',
          done_by: '',
          hours: null
        }));
      } else if (value === 'Service B') {
        newServiceProgress = SERVICE_B_TASKS.map(task => ({
          task,
          status: null,
          description: '',
          done_by: '',
          hours: null
        }));
      } else if (value === 'Service C') {
        newServiceProgress = SERVICE_C_TASKS.map(task => ({
          task,
          status: null,
          description: '',
          done_by: '',
          hours: null
        }));
      } else if (value === 'Service D') {
        newServiceProgress = SERVICE_D_TASKS.map(task => ({
          task,
          status: null,
          description: '',
          done_by: '',
          hours: null
        }));
      }
      
      setJobCardFormData(prev => ({
        ...prev,
        [field]: value,
        service_progress: newServiceProgress
      }));
      return;
    }
    
    if (field === 'vehicle_type') {
      // Handle vehicle type changes - initialize trailer_progress if Trailer is selected
      const newVehicleTypes = value as string[];
      let newTrailerProgress = jobCardFormData.trailer_progress;
      
      if (newVehicleTypes.includes('Trailer') && !newTrailerProgress) {
        // Initialize trailer progress with new structure
        const tasks: ServiceTask[] = [];
        TRAILER_TASK_SECTIONS.forEach(section => {
          section.tasks.forEach(task => {
            tasks.push({
              task,
              status: null,
              description: '',
              done_by: '',
              hours: null,
              section: section.heading
            });
          });
        });
        
        newTrailerProgress = {
          inspection_date: null,
          kilometers: null,
          plant_number: null,
          tasks: tasks
        };
      } else if (!newVehicleTypes.includes('Trailer')) {
        // Clear trailer progress if Trailer is deselected
        newTrailerProgress = null;
      }
      
      setJobCardFormData(prev => ({
        ...prev,
        [field]: value,
        trailer_progress: newTrailerProgress
      }));
      return;
    }
    
    if (field === 'job_year' || field === 'job_month') {
      // When year or month changes, regenerate sequence number
      const newYear = field === 'job_year' ? value as string : jobCardFormData.job_year;
      const newMonth = field === 'job_month' ? value as string : jobCardFormData.job_month;
      
      setJobCardFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Generate new sequence for the new year/month combination
      generateNextJobNumber(newYear, newMonth).then(sequence => {
        setJobCardFormData(prev => ({
          ...prev,
          job_sequence: sequence
        }));
      });
    } else {
      setJobCardFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmitJobCard = async () => {
    try {
      // Prepare data for database update
      const jobCardData = {
        job_number: `JC-${jobCardFormData.job_year}-${jobCardFormData.job_month}-${jobCardFormData.job_sequence}`,
        job_start_date: jobCardFormData.job_start_date ? `${jobCardFormData.job_start_date}:00+09:30` : null,
        expected_completion_date: jobCardFormData.expected_completion_date || null,
        completed_date: jobCardFormData.completed_date || null,
        approximate_cost: jobCardFormData.grand_total ? parseFloat(jobCardFormData.grand_total) : 0.00,
        customer_name: jobCardFormData.customer_name || null,
        company_name: jobCardFormData.company_name || null,
        abn: jobCardFormData.abn || null,
        mobile: jobCardFormData.mobile || null,
        email: jobCardFormData.email || null,
        vehicle_make: jobCardFormData.vehicle_make || null,
        vehicle_model: jobCardFormData.vehicle_model || null,
        vehicle_month: jobCardFormData.vehicle_month || null,
        vehicle_year: jobCardFormData.vehicle_year ? parseInt(jobCardFormData.vehicle_year, 10) : null,
        vehicle_kms: jobCardFormData.vehicle_kms ? parseInt(jobCardFormData.vehicle_kms, 10) : null,
        fuel_type: jobCardFormData.fuel_type || null,
        vin: jobCardFormData.vin || null,
        rego: jobCardFormData.rego || null,
        vehicle_state: jobCardFormData.vehicle_state || null,
        tyre_size: jobCardFormData.tyre_size || null,
        next_service_kms: jobCardFormData.next_service_kms ? parseInt(jobCardFormData.next_service_kms, 10) : null,
        vehicle_type: jobCardFormData.vehicle_type.length > 0 ? jobCardFormData.vehicle_type : null,
        service_selection: jobCardFormData.service_selection || null,
        assigned_worker: jobCardFormData.assigned_worker || null,
        assigned_parts: jobCardFormData.assigned_parts || null,
        customer_declaration_authorized: jobCardFormData.customer_declaration_authorized,
        customer_signature: jobCardFormData.customer_signature || null,
        service_progress: jobCardFormData.service_progress || null,
        trailer_progress: jobCardFormData.trailer_progress || null,
        other_progress: jobCardFormData.other_progress || null,
        parts_and_consumables: jobCardFormData.parts_and_consumables || null,
        lubricants_used: jobCardFormData.lubricants_used || null,
        handover_valuables_to_customer: jobCardFormData.handover_valuables_to_customer || null,
        check_all_tyres: jobCardFormData.check_all_tyres || null,
        total_a: jobCardFormData.total_a ? parseFloat(jobCardFormData.total_a) : 0.00,
        total_hours: jobCardFormData.total_hours ? parseFloat(jobCardFormData.total_hours) : 0.0,
        future_work_notes: jobCardFormData.future_work_notes || null,
        invoice_number: jobCardFormData.invoice_number || null,
        invoice_date: jobCardFormData.invoice_date || null,
        invoice_value: jobCardFormData.invoice_value ? parseFloat(jobCardFormData.invoice_value) : null,
        part_location: jobCardFormData.part_location || null,
        issue_counter_sale: jobCardFormData.issue_counter_sale || null,
        image_front: jobCardFormData.image_front || null,
        image_back: jobCardFormData.image_back || null,
        image_right_side: jobCardFormData.image_right_side || null,
        image_left_side: jobCardFormData.image_left_side || null,
        supervisor_signature: jobCardFormData.supervisor_signature || null,
        grand_total: jobCardFormData.grand_total ? parseFloat(jobCardFormData.grand_total) : 0.00,
        updated_at: new Date().toISOString()
      };

      console.log('Updating job card data:', jobCardData);
      
      // Update existing job card
      const { data, error } = await supabase
        .from('job_cards')
        .update(jobCardData)
        .eq('id', initialJobCardData.id)
        .select();

      if (error) {
        console.error('Error updating job card:', error);
        setModalContent({
          title: 'Error',
          message: 'Failed to update job card. Please try again.',
          type: 'error'
        });
        setShowSuccessModal(true);
        return;
      }

      console.log('Job card updated successfully:', data);
      setModalContent({
        title: 'Success!',
        message: 'Job card has been updated successfully.',
        type: 'success'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Unexpected error:', error);
      setModalContent({
        title: 'Unexpected Error',
        message: 'An unexpected error occurred while updating the job card. Please try again.',
        type: 'error'
      });
      setShowSuccessModal(true);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (modalContent.type === 'success') {
      handleClose(); // Only close the form if it was a success
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Job Card</h1>
              <p className="text-sm text-gray-500">Edit the job card details for AutoAgri Australia</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
              title="Revert to saved data"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Tab Navigation - Only show if multiple tabs are allowed or no restriction */}
          {(!allowedTabs || allowedTabs.length > 1) && (
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex space-x-8 px-6">
                {(!allowedTabs || allowedTabs.includes('information')) && (
                  <button
                    onClick={() => setActiveTab('information')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'information'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Information
                  </button>
                )}
                
                {(!allowedTabs || allowedTabs.includes('mechanic')) && (
                  <button
                    onClick={() => setActiveTab('mechanic')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'mechanic'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Mechanic
                  </button>
                )}
                
                {(!allowedTabs || allowedTabs.includes('parts')) && (
                  <button
                    onClick={() => setActiveTab('parts')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'parts'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Parts
                  </button>
                )}
                
                {(!allowedTabs || allowedTabs.includes('payments')) && (
                  <button
                    onClick={() => setActiveTab('payments')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'payments'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Payments
                  </button>
                )}
              </nav>
            </div>
          )}
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'information' && (!allowedTabs || allowedTabs.includes('information')) && (
              <InformationTab 
                jobCardFormData={jobCardFormData}
                onJobCardDataChange={handleJobCardDataChange}
                generateNextJobNumber={generateNextJobNumber}
                isGeneratingJobNumber={isGeneratingJobNumber}
              />
            )}
            
            {activeTab === 'mechanic' && (!allowedTabs || allowedTabs.includes('mechanic')) && (
              <MechanicTab 
                jobCardFormData={jobCardFormData}
                onJobCardDataChange={handleJobCardDataChange}
              />
            )}
            
            {activeTab === 'parts' && (!allowedTabs || allowedTabs.includes('parts')) && (
              <PartsTab 
                jobCardFormData={jobCardFormData}
                onJobCardDataChange={handleJobCardDataChange}
              />
            )}
            
            {activeTab === 'payments' && (!allowedTabs || allowedTabs.includes('payments')) && (
              <PaymentsTab 
                jobCardFormData={jobCardFormData}
                onJobCardDataChange={handleJobCardDataChange}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmitJobCard}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Update Job Card
          </button>
        </div>
      </div>
      
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </div>
  );
};

export default EditJobCardForm;