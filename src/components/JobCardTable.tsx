import React, { useState } from 'react';
import { Edit, MoreHorizontal, Check, Archive, Settings, Wrench, Package, FileText, Eye, FileDown, Download, Trash2, ArchiveRestore, Search, X, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import Modal from './Modal';
import { JobCard } from '../types/jobCardTypes';
import { formatCurrency } from '../utils/formatUtils';

interface JobCardTableProps {
  activeTab: 'active' | 'archived';
  jobCards: JobCard[];
  onRefresh: () => void;
  onEditJobCard: (jobCard: JobCard) => void;
}

const JobCardTable: React.FC<JobCardTableProps> = ({ activeTab, jobCards, onRefresh, onEditJobCard }) => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [jobToConfirm, setJobToConfirm] = useState<{ id: string; isArchived: boolean; jobNumber: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle toggle assignment completion status
  const handleToggleAssignmentCompletion = async (jobId: string, assignmentType: 'worker' | 'parts', currentStatus: boolean) => {
    try {
      const fieldToUpdate = assignmentType === 'worker' ? 'is_worker_assigned_complete' : 'is_parts_assigned_complete';
      
      const { error } = await supabase
        .from('job_cards')
        .update({ 
          [fieldToUpdate]: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) {
        console.error('Error updating assignment status:', error);
        setModalContent({
          title: 'Error',
          message: 'Failed to update assignment status. Please try again.',
          type: 'error'
        });
        setShowModal(true);
        return;
      }

      const statusText = !currentStatus ? 'completed' : 'reopened';
      const assignmentText = assignmentType === 'worker' ? 'Worker assignment' : 'Parts assignment';
      
      setModalContent({
        title: 'Success',
        message: `${assignmentText} has been ${statusText} successfully.`,
        type: 'success'
      });
      setShowModal(true);
    } catch (error) {
      console.error('Unexpected error:', error);
      setModalContent({
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
      setShowModal(true);
    }
  };

  // Format date for display with optional time
  const formatDate = (dateString: string, includeTime: boolean = false) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (includeTime) {
      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format vehicle details display
  const formatVehicleDetails = (vehicleType: string[] | null, make: string | null, model: string | null, year: number | null) => {
    const parts = [];
    
    // Add vehicle type if available
    if (vehicleType && vehicleType.length > 0) {
      parts.push(vehicleType.join(', '));
    }
    
    // Add make, model, year
    if (make) parts.push(make);
    if (model) parts.push(model);
    if (year) parts.push(year.toString());
    
    return parts.length > 0 ? parts.join(' ') : 'Not specified';
  };

  // Filter job cards based on search term (only for active tab)
  const filteredJobCards = React.useMemo(() => {
    if (activeTab !== 'active' || !searchTerm.trim()) {
      return jobCards;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return jobCards.filter(job => {
      // Search by REGO number
      const regoMatch = job.rego?.toLowerCase().includes(searchLower);
      
      // Search by Customer Name
      const customerMatch = job.customer_name?.toLowerCase().includes(searchLower);
      
      return regoMatch || customerMatch;
    });
  }, [jobCards, searchTerm, activeTab]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  const getStatusBadge = (isArchived: boolean) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (!isArchived) {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  // Handle archive/unarchive
  const handleArchiveToggle = async (jobId: string, currentArchiveStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('job_cards')
        .update({ 
          is_archived: !currentArchiveStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) {
        console.error('Error updating job card:', error);
        setModalContent({
          title: 'Error',
          message: 'Failed to update job card status. Please try again.',
          type: 'error'
        });
        setShowModal(true);
        return;
      }

      setModalContent({
        title: 'Success',
        message: `Job card ${!currentArchiveStatus ? 'completed and archived' : 'reopened'} successfully.`,
        type: 'success'
      });
      setShowModal(true);
    } catch (error) {
      console.error('Unexpected error:', error);
      setModalContent({
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
      setShowModal(true);
    }
  };

  // Handle complete confirmation
  const handleCompleteClick = (jobId: string, jobNumber: string) => {
    setJobToConfirm({ id: jobId, isArchived: false, jobNumber });
    setShowCompleteConfirm(true);
  };

  // Handle reopen confirmation
  const handleReopenClick = (jobId: string, jobNumber: string) => {
    setJobToConfirm({ id: jobId, isArchived: true, jobNumber });
    setShowReopenConfirm(true);
  };

  // Handle confirmed complete
  const handleConfirmComplete = async () => {
    if (!jobToConfirm) return;
    
    await handleArchiveToggle(jobToConfirm.id, jobToConfirm.isArchived);
    setShowCompleteConfirm(false);
    setJobToConfirm(null);
  };

  // Handle confirmed reopen
  const handleConfirmReopen = async () => {
    if (!jobToConfirm) return;
    
    await handleArchiveToggle(jobToConfirm.id, jobToConfirm.isArchived);
    setShowReopenConfirm(false);
    setJobToConfirm(null);
  };

  // Handle view details
  const handleEditJobCard = (job: JobCard) => {
    onEditJobCard(job);
  };

  // Handle generate invoice
  const handleGenerateInvoice = (jobId: string) => {
    // TODO: Implement generate invoice functionality
    setModalContent({
      title: 'Generate Invoice',
      message: 'Generate invoice functionality will be implemented soon.',
      type: 'info'
    });
    setShowModal(true);
  };

  // Handle download PDF
  const handleDownloadPDF = (jobId: string) => {
    // TODO: Implement download PDF functionality
    setModalContent({
      title: 'Download PDF',
      message: 'Download PDF functionality will be implemented soon.',
      type: 'info'
    });
    setShowModal(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (jobId: string) => {
    setJobToDelete(jobId);
    setShowDeleteConfirm(true);
  };

  // Handle delete job card
  const handleDeleteJobCard = async () => {
    if (!jobToDelete) return;

    try {
      const { error } = await supabase
        .from('job_cards')
        .delete()
        .eq('id', jobToDelete);

      if (error) {
        console.error('Error deleting job card:', error);
        setModalContent({
          title: 'Error',
          message: 'Failed to delete job card. Please try again.',
          type: 'error'
        });
        setShowModal(true);
        return;
      }

      setModalContent({
        title: 'Success',
        message: 'Job card deleted successfully.',
        type: 'success'
      });
      setShowModal(true);
    } catch (error) {
      console.error('Unexpected error:', error);
      setModalContent({
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
      setShowModal(true);
    } finally {
      setShowDeleteConfirm(false);
      setJobToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden table-responsive">
      {/* Search Bar - Only show for Active Job Cards */}
      {activeTab === 'active' && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by REGO or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              Found {filteredJobCards.length} of {jobCards.length} job cards
            </div>
          )}
        </div>
      )}
      
      {/* Complete Confirmation Modal */}
      {showCompleteConfirm && jobToConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-6 text-center border-b border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Archive className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Confirm Job Completion
              </h3>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                Are you sure you want to mark job card <strong>{jobToConfirm.jobNumber}</strong> as complete?
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Please ensure you are happy with all the contents in the Job Card before proceeding. 
                This will move the job card to the archived list.
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex space-x-3">
              <button
                onClick={() => {
                  setShowCompleteConfirm(false);
                  setJobToConfirm(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg transition-all duration-200 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-open Confirmation Modal */}
      {showReopenConfirm && jobToConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-6 text-center border-b border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ArchiveRestore className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-2">
                Confirm Re-open Job Card
              </h3>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                Are you sure you want to re-open job card <strong>{jobToConfirm.jobNumber}</strong>?
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                This will move the job card back to the active job cards list and allow further modifications.
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex space-x-3">
              <button
                onClick={() => {
                  setShowReopenConfirm(false);
                  setJobToConfirm(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReopen}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Re-open Job Card
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {activeTab === 'active' ? (
                // Active Job Cards columns
                <>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Number
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Types
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignments
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </>
              ) : (
                // Archived Job Cards columns
                <>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Number
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobCards.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? 'No matching job cards found' : 'No job cards found'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {searchTerm 
                        ? `No job cards match "${searchTerm}". Try searching by REGO or Customer Name.`
                        : activeTab === 'active' 
                          ? 'No active job cards to display. Create a new job card to get started.' 
                          : 'No archived job cards to display.'}
                    </p>
                    <div className="mt-4 flex space-x-2">
                      {searchTerm && (
                        <button 
                          onClick={clearSearch}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                        >
                          Clear Search
                        </button>
                      )}
                      <button 
                        onClick={onRefresh}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredJobCards.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50 transition-colors duration-200">
                {activeTab === 'active' ? (
                  // Active Job Cards row content
                  <>
                    {/* Job Number Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.job_number}</div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Start: {formatDate(job.job_start_date, true)}
                        </div>
                      </div>
                    </td>
                    
                    {/* Customer Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {job.customer_name || 'Not specified'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {job.company_name || 'No company'}
                        </div>
                      </div>
                    </td>
                    
                    {/* Vehicle Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          REGO: {job.rego || 'N/A'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {job.vehicle_make} {job.vehicle_model}
                        </div>
                      </div>
                    </td>
                    
                    {/* Vehicle Types Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {job.vehicle_type && job.vehicle_type.length > 0 && (
                          job.vehicle_type.map((type, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {type}
                            </span>
                          ))
                        )}
                        {job.service_selection && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {job.service_selection}
                          </span>
                        )}
                        {(!job.vehicle_type || job.vehicle_type.length === 0) && !job.service_selection && (
                          <span className="text-xs text-gray-500">No types assigned</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Assignments Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {job.assigned_worker && (
                          <button
                            onClick={() => handleToggleAssignmentCompletion(job.id, 'worker', job.is_worker_assigned_complete)}
                            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                              job.is_worker_assigned_complete
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={job.is_worker_assigned_complete ? 'Worker completed - Click to reopen' : 'Worker not completed - Click to mark complete'}
                          >
                            {job.is_worker_assigned_complete ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <X className="w-3 h-3 mr-1" />
                            )}
                            {job.assigned_worker}
                          </button>
                        )}
                        
                        {job.assigned_parts && (
                          <button
                            onClick={() => handleToggleAssignmentCompletion(job.id, 'parts', job.is_parts_assigned_complete)}
                            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                              job.is_parts_assigned_complete
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={job.is_parts_assigned_complete ? 'Parts completed - Click to reopen' : 'Parts not completed - Click to mark complete'}
                          >
                            {job.is_parts_assigned_complete ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <X className="w-3 h-3 mr-1" />
                            )}
                            {job.assigned_parts}
                          </button>
                        )}
                        
                        {!job.assigned_worker && !job.assigned_parts && (
                          <span className="text-xs text-gray-500">No assignments</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Status Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(job.is_archived)}>
                        {job.is_archived ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-start space-x-4">
                        {/* Left Column: Edit and Complete/Re-open */}
                        <div className="flex flex-col space-y-1">
                          <button 
                            onClick={() => handleEditJobCard(job)}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-xs"
                            title="Edit Job Card"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          
                          <button
                            onClick={() => handleCompleteClick(job.id, job.job_number)}
                            className="flex items-center transition-colors duration-200 text-xs text-green-600 hover:text-green-800"
                            title="Complete Job Card"
                          >
                            <Archive className="w-3 h-3 mr-1" />
                            Complete
                          </button>
                        </div>
                        
                        {/* Right Column: PDF, Invoice, Delete */}
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleDownloadPDF(job.id)}
                            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-xs"
                            title="Download PDF"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </button>
                          
                          <button
                            onClick={() => handleGenerateInvoice(job.id)}
                            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-200 text-xs"
                            title="Generate Invoice"
                          >
                            <FileDown className="w-3 h-3 mr-1" />
                            Invoice
                          </button>
                          
                          <button
                            onClick={() => handleDeleteClick(job.id)}
                            className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200 text-xs"
                            title="Delete Job Card"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </>
                ) : (
                  // Archived Job Cards row content (existing format)
                  <>
                    {/* Job Number Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.job_number}</div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          Start: {formatDate(job.job_start_date, true)}
                        </div>
                        {job.completed_date && (
                          <div className="text-xs sm:text-sm text-gray-500">
                            Finish: {formatDate(job.completed_date)}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Customer Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {job.customer_name || 'Not specified'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {job.company_name || 'No company'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {job.mobile || 'No mobile'}
                        </div>
                      </div>
                    </td>
                    
                    {/* Vehicle Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          REGO: {job.rego || 'N/A'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {job.vehicle_make} {job.vehicle_model}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {job.vehicle_month} {job.vehicle_year}
                        </div>
                      </div>
                    </td>
                    
                    {/* Invoice Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {job.invoice_number || 'N/A'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {formatCurrency(job.invoice_value || 0)}
                        </div>
                      </div>
                    </td>
                    
                    {/* Payment Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(job.is_archived)}>
                        {job.payment_status || 'Unknown'}
                      </span>
                    </td>
                    
                    {/* Total Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(job.grand_total || 0)}
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-start space-x-4">
                        {/* Left Column: Edit and Complete/Re-open */}
                        <div className="flex flex-col space-y-1">
                          <button 
                            onClick={() => handleEditJobCard(job)}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-xs"
                            title="Edit Job Card"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          
                          <button
                            onClick={() => handleReopenClick(job.id, job.job_number)}
                            className="flex items-center transition-colors duration-200 text-xs text-blue-600 hover:text-blue-800"
                            title="Re-open Job Card"
                          >
                            <ArchiveRestore className="w-3 h-3 mr-1" />
                            Re-open
                          </button>
                        </div>
                        
                        {/* Right Column: PDF, Invoice, Delete */}
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleDownloadPDF(job.id)}
                            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-xs"
                            title="Download PDF"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </button>
                          
                          <button
                            onClick={() => handleGenerateInvoice(job.id)}
                            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-200 text-xs"
                            title="Generate Invoice"
                          >
                            <FileDown className="w-3 h-3 mr-1" />
                            Invoice
                          </button>
                          
                          <button
                            onClick={() => handleDeleteClick(job.id)}
                            className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200 text-xs"
                            title="Delete Job Card"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </>
                )}
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
          <div className="text-sm text-gray-700 order-first sm:order-last">
            Showing {filteredJobCards.length} of {jobCards.length} job cards
            {searchTerm && (
              <span className="text-blue-600 ml-1">(filtered)</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Success/Error Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-6 text-center border-b border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                Delete Job Card
              </h3>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-gray-600 text-base leading-relaxed">
                Are you sure you want to delete this job card? This action cannot be undone and will permanently remove all associated data.
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setJobToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJobCard}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg transition-all duration-200 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCardTable;