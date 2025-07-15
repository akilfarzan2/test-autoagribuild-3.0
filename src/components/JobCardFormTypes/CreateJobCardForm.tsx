import React, { useState } from 'react';
import { X, FileText, RefreshCw } from 'lucide-react';
import InformationTab from '../JobCardForm/InformationTab';
import Modal from '../Modal';
import { supabase } from '../../utils/supabaseClient';
import { JobCardFormData, ServiceTask } from '../../types/jobCardTypes';
import { Customer } from '../../types/customerTypes';
import { getAdelaideDateTimeForInput } from '../../utils/dateUtils';
import { SERVICE_A_TASKS } from '../JobCardForm/InformationTabSections/VehicleDetailsTaskLists/ServiceATaskList';
import { SERVICE_B_TASKS } from '../JobCardForm/InformationTabSections/VehicleDetailsTaskLists/ServiceBTaskList';
import { SERVICE_C_TASKS } from '../JobCardForm/InformationTabSections/VehicleDetailsTaskLists/ServiceCTaskList';
import { SERVICE_D_TASKS } from '../JobCardForm/InformationTabSections/VehicleDetailsTaskLists/ServiceDTaskList';
import { TRAILER_TASK_SECTIONS } from '../JobCardForm/InformationTabSections/VehicleDetailsTaskLists/TrailerTaskList';

// Default form data structure
const defaultJobCardFormData: JobCardFormData = {
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
  other_progress: null,
  parts_and_consumables: null,
  lubricants_used: null,
  handover_valuables_to_customer: '',
  check_all_tyres: '',
  total_a: '0.00',
  total_hours: '0.0',
  future_work_notes: '',
  image_front: '',
  image_back: '',
  image_right_side: '',
  image_left_side: '',
  supervisor_signature: '',
  grand_total: '0.00',
};

interface CreateJobCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomerData?: Customer | null;
}

const CreateJobCardForm: React.FC<CreateJobCardFormProps> = ({ isOpen, onClose, initialCustomerData }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingJobNumber, setIsGeneratingJobNumber] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });
  const [jobCardFormData, setJobCardFormData] = useState<JobCardFormData>(defaultJobCardFormData);

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

  // Initialize job number on component mount
  React.useEffect(() => {
    if (isOpen) {
      const currentYear = new Date().getFullYear().toString();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      
      generateNextJobNumber(currentYear, currentMonth).then(sequence => {
        // Start with clean default form data
        const baseFormData = {
          ...defaultJobCardFormData,
          job_year: currentYear,
          job_month: currentMonth,
          job_sequence: sequence
        };
        
        // If we have initial customer data, merge it with the base form data
        if (initialCustomerData) {
          const preFilledFormData = {
            ...baseFormData,
            customer_name: initialCustomerData.customer_name || '',
            company_name: initialCustomerData.company_name || '',
            abn: initialCustomerData.abn || '',
            mobile: initialCustomerData.mobile || '',
            email: initialCustomerData.email || '',
            rego: initialCustomerData.rego || '',
            vehicle_make: initialCustomerData.vehicle_make || '',
            vehicle_model: initialCustomerData.vehicle_model || '',
            vehicle_month: initialCustomerData.vehicle_month || '',
            vehicle_year: initialCustomerData.vehicle_year?.toString() || ''
          };
          setJobCardFormData(preFilledFormData);
        } else {
          setJobCardFormData(baseFormData);
        }
      });
    }
  }, [isOpen, initialCustomerData]);

  const resetFormData = () => {
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    const resetFormData = {
      ...defaultJobCardFormData,
      job_year: currentYear,
      job_month: currentMonth,
      job_sequence: '001'
    };
    
    setJobCardFormData(resetFormData);
    
    // Regenerate job number for current year/month
    generateNextJobNumber(currentYear, currentMonth).then(sequence => {
      setJobCardFormData(prev => ({
        ...prev,
        job_sequence: sequence
      }));
    });
  };

  // Handle form close with data reset
  const handleClose = () => {
    resetFormData();
    onClose();
  };

  // Handle refresh - reset to blank form for create mode
  const handleRefresh = async () => {
    setIsRefreshing(true);
    resetFormData();
    
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
      let newTrailerProgress = null;
      let newOtherProgress = null;
      
      if (newVehicleTypes.includes('Trailer')) {
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
      }
      
      if (newVehicleTypes.includes('Other')) {
        // Initialize other progress with empty structure
        newOtherProgress = {
          tasks: []
        };
      }
      
      setJobCardFormData(prev => ({
        ...prev,
        [field]: value,
        trailer_progress: newTrailerProgress,
        other_progress: newOtherProgress
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
      // Prepare data for database insertion
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false,
        payment_status: 'unpaid'
      };

      console.log('Inserting job card data:', jobCardData);
      
      // Insert new job card
      const { data, error } = await supabase
        .from('job_cards')
        .insert([jobCardData])
        .select();

      if (error) {
        console.error('Error creating job card:', error);
        setModalContent({
          title: 'Error',
          message: 'Failed to create job card. Please try again.',
          type: 'error'
        });
        setShowSuccessModal(true);
        return;
      }

      console.log('Job card created successfully:', data);
      setModalContent({
        title: 'Success!',
        message: 'Job card has been created successfully and is now available in the system.',
        type: 'success'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Unexpected error:', error);
      setModalContent({
        title: 'Unexpected Error',
        message: 'An unexpected error occurred while creating the job card. Please try again.',
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">New Job Card</h1>
              <p className="text-sm text-gray-500">Create a new job card for AutoAgri Australia</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
              title="Reset form"
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <InformationTab 
            jobCardFormData={jobCardFormData}
            onJobCardDataChange={handleJobCardDataChange}
            generateNextJobNumber={generateNextJobNumber}
            isGeneratingJobNumber={isGeneratingJobNumber}
          />
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
            Create Job Card
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

export default CreateJobCardForm;