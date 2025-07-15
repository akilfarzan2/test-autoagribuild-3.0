import React, { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { JobCard } from '../types/jobCardTypes';
import WorkerColumn from '../components/MechanicPortal/WorkerColumn';
import JobCardForm from '../components/JobCardForm/JobCardForm';
import Modal from '../components/Modal';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const MechanicPortalPage: React.FC = () => {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJobCardFormOpen, setIsJobCardFormOpen] = useState(false);
  const [editingJobCard, setEditingJobCard] = useState<JobCard | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  // Define workers
  const workers = ['Worker 1', 'Worker 2', 'Worker 3', 'Worker 4'];

  // Fetch job cards from Supabase
  useEffect(() => {
    fetchJobCards();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('mechanic_portal_job_cards')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_cards'
        },
        (payload: RealtimePostgresChangesPayload<JobCard>) => {
          console.log('Real-time update received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              if (payload.new && !payload.new.is_archived) {
                setJobCards(prev => [payload.new as JobCard, ...prev]);
              }
              break;
              
            case 'UPDATE':
              if (payload.new) {
                setJobCards(prev => 
                  prev.map(job => 
                    job.id === payload.new.id ? payload.new as JobCard : job
                  ).filter(job => !job.is_archived && !job.is_worker_assigned_complete) // Remove archived and completed jobs
                );
              }
              break;
              
            case 'DELETE':
              if (payload.old) {
                setJobCards(prev => 
                  prev.filter(job => job.id !== payload.old.id)
                );
              }
              break;
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchJobCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('job_cards')
        .select('*')
        .eq('is_archived', false) // Only fetch active job cards
        .eq('is_worker_assigned_complete', false) // Only fetch jobs not completed by workers
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching job cards:', error);
        setError('Failed to load job cards');
        return;
      }

      setJobCards(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Group job cards by assigned worker
  const getJobCardsByWorker = (workerName: string): JobCard[] => {
    return jobCards.filter(job => job.assigned_worker === workerName);
  };

  // Get total counts for summary
  const getWorkerCounts = () => {
    return workers.map(worker => ({
      name: worker,
      count: getJobCardsByWorker(worker).length
    }));
  };

  // Handle edit job card
  const handleEditJobCard = (jobCard: JobCard) => {
    setEditingJobCard(jobCard);
    setIsJobCardFormOpen(true);
  };

  // Handle complete job card (archive it)
  const handleCompleteJobCard = async (jobCard: JobCard) => {
    try {
      // Validation: Check if all mandatory fields are filled for service_progress tasks
      const serviceValidationErrors: string[] = [];
      const trailerValidationErrors: string[] = [];
      const otherValidationErrors: string[] = [];
      
      // Validate service_progress tasks (Service A, B, C, D)
      if (jobCard.service_progress && Array.isArray(jobCard.service_progress)) {
        jobCard.service_progress.forEach((task, index) => {
          const taskNumber = index + 1;
          
          // Check if status is missing
          if (task.status === null || task.status === undefined) {
            serviceValidationErrors.push(`Service Task ${taskNumber}: Status is missing.`);
          }
          
          // Check if description is empty or only whitespace
          if (!task.description || task.description.trim() === '') {
            serviceValidationErrors.push(`Service Task ${taskNumber}: Description is empty.`);
          }
          
          // Check if done_by is empty or only whitespace
          if (!task.done_by || task.done_by.trim() === '') {
            serviceValidationErrors.push(`Service Task ${taskNumber}: 'Done by' field is empty.`);
          }
        });
      }
      
      // Validate trailer_progress tasks
      if (jobCard.trailer_progress && jobCard.trailer_progress.tasks && Array.isArray(jobCard.trailer_progress.tasks)) {
        jobCard.trailer_progress.tasks.forEach((task, index) => {
          const taskNumber = index + 1;
          const taskName = task.task || `Task ${taskNumber}`;
          
          // Check if status is missing
          if (task.status === null || task.status === undefined) {
            trailerValidationErrors.push(`Trailer Task ${taskNumber} (${taskName}): Status is missing.`);
          }
          
          // Check if description is empty or only whitespace
          if (!task.description || task.description.trim() === '') {
            trailerValidationErrors.push(`Trailer Task ${taskNumber} (${taskName}): Description is empty.`);
          }
          
          // Check if done_by is empty or only whitespace
          if (!task.done_by || task.done_by.trim() === '') {
            trailerValidationErrors.push(`Trailer Task ${taskNumber} (${taskName}): 'Done by' field is empty.`);
          }
        });
      }
      
      // Validate other_progress tasks (custom tasks)
      if (jobCard.other_progress && jobCard.other_progress.tasks && Array.isArray(jobCard.other_progress.tasks)) {
        jobCard.other_progress.tasks.forEach((task, index) => {
          const taskNumber = index + 1;
          const taskName = task.task || `Custom Task ${taskNumber}`;
          
          // Check if task name is empty (required for custom tasks)
          if (!task.task || task.task.trim() === '') {
            otherValidationErrors.push(`Other Task ${taskNumber}: Task name is empty.`);
          }
          
          // Check if status is missing
          if (task.status === null || task.status === undefined) {
            otherValidationErrors.push(`Other Task ${taskNumber} (${taskName}): Status is missing.`);
          }
          
          // Check if description is empty or only whitespace
          if (!task.description || task.description.trim() === '') {
            otherValidationErrors.push(`Other Task ${taskNumber} (${taskName}): Description is empty.`);
          }
          
          // Check if done_by is empty or only whitespace
          if (!task.done_by || task.done_by.trim() === '') {
            otherValidationErrors.push(`Other Task ${taskNumber} (${taskName}): 'Done by' field is empty.`);
          }
        });
      }
      
      // Calculate totals
      const totalTaskCount = serviceValidationErrors.length + trailerValidationErrors.length + otherValidationErrors.length;
      
      // If there are validation errors, show error modal and prevent completion
      if (totalTaskCount > 0) {
        const taskText = totalTaskCount === 1 ? 'Task' : 'Tasks';
        
        // Build the message with categorized sections
        let message = `Please complete the following mandatory fields before marking this job as complete:\n\n**${totalTaskCount} ${taskText} Incomplete**\n\n`;
        
        // Add Service Tasks section
        if (serviceValidationErrors.length > 0) {
          const serviceType = jobCard.service_selection || 'Service';
          message += `**${serviceType} Tasks** (${serviceValidationErrors.length})\n\n`;
          serviceValidationErrors.forEach(error => {
            message += `• ${error}\n`;
          });
          message += '\n';
        }
        
        // Add Trailer Tasks section
        if (trailerValidationErrors.length > 0) {
          message += `**Trailer Tasks** (${trailerValidationErrors.length})\n\n`;
          trailerValidationErrors.forEach(error => {
            message += `• ${error}\n`;
          });
          message += '\n';
        }
        
        // Add Other Tasks section
        if (otherValidationErrors.length > 0) {
          message += `**Other Tasks** (${otherValidationErrors.length})\n\n`;
          otherValidationErrors.forEach(error => {
            message += `• ${error}\n`;
          });
        }
        
        setModalContent({
          title: 'Incomplete Tasks',
          message: message.trim(),
          type: 'error'
        });
        setShowModal(true);
        return;
      }
      
      // If validation passes, proceed with marking job as complete
      const { error } = await supabase
        .from('job_cards')
        .update({ 
          is_worker_assigned_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobCard.id);

      if (error) {
        console.error('Error completing job card:', error);
        setModalContent({
          title: 'Error',
          message: 'Failed to mark job as complete. Please try again.',
          type: 'error'
        });
        setShowModal(true);
        return;
      }

      setModalContent({
        title: 'Success!',
        message: `Job card ${jobCard.job_number} has been marked as complete.`,
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

  // Handle close job card form
  const handleCloseJobCardForm = () => {
    setIsJobCardFormOpen(false);
    setEditingJobCard(null);
    // Refresh data after form is closed
    setTimeout(() => {
      fetchJobCards();
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="text-gray-600">Loading mechanic portal...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-medium">Error loading mechanic portal</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button 
            onClick={fetchJobCards}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const workerCounts = getWorkerCounts();
  const totalActiveJobs = workerCounts.reduce((sum, worker) => sum + worker.count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mechanic Portal</h1>
              <p className="text-sm text-gray-500">View and manage assigned job cards by worker</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-4">Worker Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {workerCounts.map((worker) => (
              <div key={worker.name} className="bg-white border border-green-200 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Wrench className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">{worker.name}</h3>
                <p className="text-2xl font-bold text-green-600">{worker.count}</p>
                <p className="text-xs text-gray-500">active job{worker.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Worker Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workers.map((worker) => (
            <WorkerColumn
              key={worker}
              workerName={worker}
              jobCards={getJobCardsByWorker(worker)}
              onEdit={handleEditJobCard}
              onComplete={handleCompleteJobCard}
            />
          ))}
        </div>

        {/* No Jobs Message */}
        {totalActiveJobs === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No Active Job Cards</h3>
            <p className="text-gray-400">
              Job cards will appear here when workers are assigned to them.
            </p>
          </div>
        )}
      </div>

      {/* Job Card Form Modal */}
      <JobCardForm 
        isOpen={isJobCardFormOpen} 
        onClose={handleCloseJobCardForm}
        initialJobCardData={editingJobCard}
        allowedTabs={['mechanic']}
      />

      {/* Success/Error Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </div>
  );
};

export default MechanicPortalPage;