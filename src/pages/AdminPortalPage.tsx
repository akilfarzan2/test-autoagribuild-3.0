import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TabNavigation from '../components/TabNavigation';
import JobCardTable from '../components/JobCardTable';
import { Plus, Database, ArrowRight } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import JobCardForm from '../components/JobCardForm/JobCardForm';
import CustomerSelectionModal from '../components/CustomerSelectionModal';
import { JobCard } from '../types/jobCardTypes';
import { Customer } from '../types/customerTypes';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const AdminPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [archivedJobCards, setArchivedJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCustomerSelectionOpen, setIsCustomerSelectionOpen] = useState(false);
  const [isJobCardFormOpen, setIsJobCardFormOpen] = useState(false);
  const [editingJobCard, setEditingJobCard] = useState<JobCard | null>(null);
  const [selectedCustomerData, setSelectedCustomerData] = useState<Customer | null>(null);
  const navigate = useNavigate();

  // Fetch job cards from Supabase
  useEffect(() => {
    fetchJobCards();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('job_cards_changes')
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
              if (payload.new) {
                if (!payload.new.is_archived) {
                  setJobCards(prev => [payload.new as JobCard, ...prev]);
                } else {
                  // For archived cards, add to the beginning and keep only latest 5
                  setArchivedJobCards(prev => [payload.new as JobCard, ...prev].slice(0, 5));
                }
              }
              break;
              
            case 'UPDATE':
              if (payload.new) {
                if (!payload.new.is_archived) {
                  setJobCards(prev => {
                    // Check if the job already exists in the active list
                    const existingIndex = prev.findIndex(job => job.id === payload.new.id);
                    
                    if (existingIndex >= 0) {
                      // Update existing job
                      return prev.map(job => 
                        job.id === payload.new.id ? payload.new as JobCard : job
                      );
                    } else {
                      // Add newly re-opened job to the beginning of the list
                      return [payload.new as JobCard, ...prev];
                    }
                  });
                  // Remove from archived if it was moved to active
                  setArchivedJobCards(prev => prev.filter(job => job.id !== payload.new.id));
                } else {
                  // Remove from active if archived
                  setJobCards(prev => prev.filter(job => job.id !== payload.new.id));
                  // Add to archived (if not already there) and keep only latest 5
                  setArchivedJobCards(prev => {
                    const exists = prev.some(job => job.id === payload.new.id);
                    if (exists) {
                      return prev.map(job => job.id === payload.new.id ? payload.new as JobCard : job);
                    } else {
                      return [payload.new as JobCard, ...prev].slice(0, 5);
                    }
                  });
                }
              }
              break;
              
            case 'DELETE':
              if (payload.old) {
                setJobCards(prev => 
                  prev.filter(job => job.id !== payload.old.id)
                );
                setArchivedJobCards(prev => 
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
      
      // Fetch active job cards
      const { data: activeData, error: activeError } = await supabase
        .from('job_cards')
        .select(`
          id,
          job_number,
          created_at,
          updated_at,
          customer_name,
          company_name,
          abn,
          mobile,
          email,
          vehicle_make,
          vehicle_model,
          vehicle_month,
          vehicle_year,
          vehicle_kms,
          fuel_type,
          vin,
          rego,
          vehicle_state,
          tyre_size,
          next_service_kms,
          vehicle_type,
          service_selection,
          job_start_date,
          expected_completion_date,
          completed_date,
          approximate_cost,
          assigned_worker,
          assigned_parts,
          customer_declaration_authorized,
          customer_signature,
          is_archived,
          is_worker_assigned_complete,
          is_parts_assigned_complete,
          payment_status,
          service_progress,
          trailer_progress,
          other_progress,
          parts_and_consumables,
          lubricants_used,
          handover_valuables_to_customer,
          check_all_tyres,
          total_a,
          total_hours,
          future_work_notes,
          image_front,
          image_back,
          image_right_side,
          image_left_side,
          supervisor_signature,
          grand_total
        `)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (activeError) {
        console.error('Error fetching active job cards:', activeError);
        setError('Failed to load job cards');
        return;
      }

      setJobCards(activeData || []);

      // Fetch latest 5 archived job cards
      const { data: archivedData, error: archivedError } = await supabase
        .from('job_cards')
        .select(`
          id,
          job_number,
          created_at,
          updated_at,
          customer_name,
          company_name,
          abn,
          mobile,
          email,
          vehicle_make,
          vehicle_model,
          vehicle_month,
          vehicle_year,
          vehicle_kms,
          fuel_type,
          vin,
          rego,
          vehicle_state,
          tyre_size,
          next_service_kms,
          vehicle_type,
          service_selection,
          job_start_date,
          expected_completion_date,
          completed_date,
          approximate_cost,
          assigned_worker,
          assigned_parts,
          customer_declaration_authorized,
          customer_signature,
          is_archived,
          is_worker_assigned_complete,
          is_parts_assigned_complete,
          payment_status,
          service_progress,
          trailer_progress,
          other_progress,
          parts_and_consumables,
          lubricants_used,
          handover_valuables_to_customer,
          check_all_tyres,
          total_a,
          total_hours,
          future_work_notes,
          image_front,
          image_back,
          image_right_side,
          image_left_side,
          supervisor_signature,
          grand_total
        `)
        .eq('is_archived', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (archivedError) {
        console.error('Error fetching archived job cards:', archivedError);
        // Don't set error for archived cards, just log it
      } else {
        setArchivedJobCards(archivedData || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter job cards based on archived status
  const activeJobCards = jobCards; // Already filtered to active only
  // archivedJobCards is already limited to latest 5

  // Calculate counts for tab navigation
  const activeCounts = {
    active: activeJobCards.length,
    archived: archivedJobCards.length, // This will show 5 or less
  };

  // Get current job cards based on active tab
  const currentJobCards = activeTab === 'active' ? activeJobCards : archivedJobCards;

  const handleTabChange = (tab: 'active' | 'archived') => {
    setActiveTab(tab);
  };

  const handleOpenNewJobCardForm = () => {
    setIsCustomerSelectionOpen(true);
  };

  const handleNewCustomer = () => {
    setSelectedCustomerData(null);
    setEditingJobCard(null);
    setIsJobCardFormOpen(true);
  };

  const handleExistingCustomer = (customer: Customer) => {
    setSelectedCustomerData(customer);
    setEditingJobCard(null);
    setIsJobCardFormOpen(true);
  };

  const handleOpenEditJobCardForm = (jobCard: JobCard) => {
    setEditingJobCard(jobCard);
    setIsJobCardFormOpen(true);
  };

  const handleNavigateToDatabase = () => {
    navigate('/job-cards-database');
  };

  const handleCloseJobCardForm = () => {
    setIsCustomerSelectionOpen(false);
    setIsJobCardFormOpen(false);
    setEditingJobCard(null);
    setSelectedCustomerData(null);
    // Refresh the job cards data after form is closed to get latest updates
    setTimeout(() => {
      fetchJobCards();
    }, 100);
  };
  if (loading) {
    return (
      <div>
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          activeCounts={activeCounts}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading job cards...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          activeCounts={activeCounts}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">Error loading job cards</p>
              <p className="text-sm mt-2">{error}</p>
              <button 
                onClick={fetchJobCards}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div>
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeCounts={activeCounts}
      />
      
      {/* New Job Card Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-1">
        <div className="flex justify-end">
          <button 
            onClick={handleOpenNewJobCardForm}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Job Card
          </button>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fadeIn">
          {/* Archived Job Cards Alert */}
          {activeTab === 'archived' && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 mb-1">
                    Limited View - Latest 5 Archived Job Cards
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    This view shows only the 5 most recently completed job cards to optimize performance. 
                    To view the complete job card database, please visit the Job Cards Database.
                  </p>
                  <button
                    onClick={handleNavigateToDatabase}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    View Complete Database
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <JobCardTable 
            activeTab={activeTab} 
            jobCards={currentJobCards}
            onRefresh={fetchJobCards}
            onEditJobCard={handleOpenEditJobCardForm}
          />
        </div>
      </main>
      
      <CustomerSelectionModal
        isOpen={isCustomerSelectionOpen}
        onClose={() => setIsCustomerSelectionOpen(false)}
        onNewCustomer={handleNewCustomer}
        onExistingCustomer={handleExistingCustomer}
      />
      
      <JobCardForm 
        isOpen={isJobCardFormOpen} 
        onClose={handleCloseJobCardForm}
        initialJobCardData={editingJobCard}
        initialCustomerData={selectedCustomerData}
      />
    </div>
  );
};

export default AdminPortalPage;