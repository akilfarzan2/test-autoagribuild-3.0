import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { JobCard } from '../types/jobCardTypes';
import PartsColumn from '../components/PartsPortal/PartsColumn';
import JobCardForm from '../components/JobCardForm/JobCardForm';
import Modal from '../components/Modal';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const PartsPortalPage: React.FC = () => {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJobCardFormOpen, setIsJobCardFormOpen] = useState(false);
  const [editingJobCard, setEditingJobCard] = useState<JobCard | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  // Define parts assignments
  const partsAssignments = ['Parts 1', 'Parts 2', 'Parts 3', 'Parts 4'];

  // Fetch job cards from Supabase
  useEffect(() => {
    fetchJobCards();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('parts_portal_job_cards')
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
                  ).filter(job => !job.is_archived && !job.is_parts_assigned_complete) // Remove archived and completed jobs
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
        .eq('is_parts_assigned_complete', false) // Only fetch jobs not completed by parts
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

  // Group job cards by assigned parts
  const getJobCardsByParts = (partsAssignment: string): JobCard[] => {
    return jobCards.filter(job => job.assigned_parts === partsAssignment);
  };

  // Get total counts for summary
  const getPartsCounts = () => {
    return partsAssignments.map(parts => ({
      name: parts,
      count: getJobCardsByParts(parts).length
    }));
  };

  // Handle edit job card
  const handleEditJobCard = (jobCard: JobCard) => {
    setEditingJobCard(jobCard);
    setIsJobCardFormOpen(true);
  };

  // Handle complete job card (mark parts assignment as complete)
  const handleCompleteJobCard = async (jobCard: JobCard) => {
    try {
      const { error } = await supabase
        .from('job_cards')
        .update({ 
          is_parts_assigned_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobCard.id);

      if (error) {
        console.error('Error completing job card:', error);
        setModalContent({
          title: 'Error',
          message: 'Failed to mark parts assignment as complete. Please try again.',
          type: 'error'
        });
        setShowModal(true);
        return;
      }

      setModalContent({
        title: 'Success!',
        message: `Parts assignment for job card ${jobCard.job_number} has been marked as complete.`,
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading parts portal...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-medium">Error loading parts portal</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button 
            onClick={fetchJobCards}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const partsCounts = getPartsCounts();
  const totalActiveJobs = partsCounts.reduce((sum, parts) => sum + parts.count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Parts Portal</h1>
              <p className="text-sm text-gray-500">View and manage assigned job cards by parts assignment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">Parts Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {partsCounts.map((parts) => (
              <div key={parts.name} className="bg-white border border-blue-200 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">{parts.name}</h3>
                <p className="text-2xl font-bold text-blue-600">{parts.count}</p>
                <p className="text-xs text-gray-500">active job{parts.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Parts Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partsAssignments.map((partsAssignment) => (
            <PartsColumn
              key={partsAssignment}
              partsName={partsAssignment}
              jobCards={getJobCardsByParts(partsAssignment)}
              onEdit={handleEditJobCard}
              onComplete={handleCompleteJobCard}
            />
          ))}
        </div>

        {/* No Jobs Message */}
        {totalActiveJobs === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No Active Job Cards</h3>
            <p className="text-gray-400">
              Job cards will appear here when parts are assigned to them.
            </p>
          </div>
        )}
      </div>

      {/* Job Card Form Modal */}
      <JobCardForm 
        isOpen={isJobCardFormOpen} 
        onClose={handleCloseJobCardForm}
        initialJobCardData={editingJobCard}
        allowedTabs={['parts']}
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

export default PartsPortalPage;