import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Database, Search, Filter, SortAsc, SortDesc, Calendar, DollarSign, X, ChevronDown, Archive, Eye, FileText, Users, CreditCard, Download, Edit, ArchiveRestore, FileDown, Trash2 } from 'lucide-react';
import JobCardForm from '../components/JobCardForm/JobCardForm';
import Modal from '../components/Modal';
import { JobCard } from '../types/jobCardTypes';
import { formatCurrency } from '../utils/formatUtils';

interface JobCardDatabaseItem {
  id: string;
  job_number: string;
  customer_name: string;
  company_name: string;
  rego: string;
  invoice_number: string;
  mobile: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  payment_status: string;
  grand_total: number;
  created_at: string;
  job_start_date: string;
}

type SearchField = 'all' | 'rego' | 'invoice_number' | 'customer_name' | 'company_name' | 'mobile';
type SortOrder = 'newest' | 'oldest';
type DateFilter = 'all' | 'year' | 'month_year';

const JobCardsDatabasePage: React.FC = () => {
  const [showDatabase, setShowDatabase] = useState(false);
  const [jobCards, setJobCards] = useState<JobCardDatabaseItem[]>([]);
  const [filteredJobCards, setFilteredJobCards] = useState<JobCardDatabaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Job Card Form Modal states
  const [isJobCardFormOpen, setIsJobCardFormOpen] = useState(false);
  const [editingJobCard, setEditingJobCard] = useState<JobCard | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' | 'info' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [jobToConfirm, setJobToConfirm] = useState<{ id: string; jobNumber: string } | null>(null);

  const searchFieldOptions = [
    { value: 'all', label: 'All Fields' },
    { value: 'rego', label: 'REGO' },
    { value: 'customer_name', label: 'Customer Name' },
    { value: 'company_name', label: 'Company Name' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'invoice_number', label: 'Invoice Number' }
  ];

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => (2020 + i).toString());

  const fetchJobCards = async () => {
    if (!showDatabase) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_cards')
        .select('*')
        .eq('is_archived', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobCards(data || []);
    } catch (error) {
      console.error('Error fetching job cards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDatabase) {
      fetchJobCards();
    }
  }, [showDatabase]);

  useEffect(() => {
    applyFilters();
  }, [jobCards, searchTerm, searchField, sortOrder, dateFilter, selectedYear, selectedMonth, paymentFilter]);

  const applyFilters = () => {
    let filtered = [...jobCards];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(card => {
        const term = searchTerm.toLowerCase();
        switch (searchField) {
          case 'rego':
            return card.rego?.toLowerCase().includes(term);
          case 'invoice_number':
            return card.invoice_number?.toLowerCase().includes(term);
          case 'customer_name':
            return card.customer_name?.toLowerCase().includes(term);
          case 'company_name':
            return card.company_name?.toLowerCase().includes(term);
          case 'mobile':
            return card.mobile?.toLowerCase().includes(term);
          default:
            return (
              card.job_number?.toLowerCase().includes(term) ||
              card.customer_name?.toLowerCase().includes(term) ||
              card.company_name?.toLowerCase().includes(term) ||
              card.rego?.toLowerCase().includes(term) ||
              card.invoice_number?.toLowerCase().includes(term) ||
              card.mobile?.toLowerCase().includes(term) ||
              card.vehicle_make?.toLowerCase().includes(term) ||
              card.vehicle_model?.toLowerCase().includes(term)
            );
        }
      });
    }

    // Apply date filter
    if (dateFilter === 'year' && selectedYear) {
      filtered = filtered.filter(card => {
        const cardYear = new Date(card.created_at).getFullYear().toString();
        return cardYear === selectedYear;
      });
    } else if (dateFilter === 'month_year' && selectedYear && selectedMonth) {
      filtered = filtered.filter(card => {
        const cardDate = new Date(card.created_at);
        const cardYear = cardDate.getFullYear().toString();
        const cardMonth = (cardDate.getMonth() + 1).toString().padStart(2, '0');
        return cardYear === selectedYear && cardMonth === selectedMonth;
      });
    }

    // Apply payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(card => card.payment_status === paymentFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      // Extract job number parts for proper sorting
      const getJobNumberParts = (jobNumber: string) => {
        const parts = jobNumber.split('-');
        if (parts.length === 4) {
          const year = parseInt(parts[1]) || 0;
          const month = parseInt(parts[2]) || 0;
          const sequence = parseInt(parts[3]) || 0;
          return { year, month, sequence };
        }
        return { year: 0, month: 0, sequence: 0 };
      };
      
      const partsA = getJobNumberParts(a.job_number);
      const partsB = getJobNumberParts(b.job_number);
      
      // Compare year first, then month, then sequence
      if (partsA.year !== partsB.year) {
        return sortOrder === 'newest' ? partsB.year - partsA.year : partsA.year - partsB.year;
      }
      if (partsA.month !== partsB.month) {
        return sortOrder === 'newest' ? partsB.month - partsA.month : partsA.month - partsB.month;
      }
      return sortOrder === 'newest' ? partsB.sequence - partsA.sequence : partsA.sequence - partsB.sequence;
    });

    setFilteredJobCards(filtered);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSearchField('all');
    setSortOrder('newest');
    setDateFilter('all');
    setSelectedYear('');
    setSelectedMonth('');
    setPaymentFilter('all');
  };

  // Handle edit job card
  const handleOpenEditJobCardForm = async (jobCard: JobCardDatabaseItem) => {
    try {
      // Fetch full job card data from database
      const { data, error } = await supabase
        .from('job_cards')
        .select('*')
        .eq('id', jobCard.id)
        .single();

      if (error) {
        console.error('Error fetching job card:', error);
        setModalContent({
          title: 'Error',
          message: 'Failed to load job card data. Please try again.',
          type: 'error'
        });
        setShowModal(true);
        return;
      }

      setEditingJobCard(data);
      setIsJobCardFormOpen(true);
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

  // Handle reopen click
  const handleReopenClick = (jobCard: JobCardDatabaseItem) => {
    setJobToConfirm({ id: jobCard.id, jobNumber: jobCard.job_number });
    setShowReopenConfirm(true);
  };

  // Handle confirmed reopen
  const handleConfirmReopen = async () => {
    if (!jobToConfirm) return;
    
    try {
      const { error } = await supabase
        .from('job_cards')
        .update({ 
          is_archived: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobToConfirm.id);

      if (error) {
        console.error('Error reopening job card:', error);
        setModalContent({
          title: 'Error',
          message: 'Failed to reopen job card. Please try again.',
          type: 'error'
        });
        setShowModal(true);
        return;
      }

      setModalContent({
        title: 'Success!',
        message: `Job card ${jobToConfirm.jobNumber} has been reopened successfully.`,
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
      setShowReopenConfirm(false);
      setJobToConfirm(null);
    }
  };

  // Handle generate invoice
  const handleGenerateInvoice = (jobId: string) => {
    setModalContent({
      title: 'Generate Invoice',
      message: 'Generate invoice functionality will be implemented soon.',
      type: 'info'
    });
    setShowModal(true);
  };

  // Handle download PDF
  const handleDownloadPDF = (jobId: string) => {
    setModalContent({
      title: 'Download PDF',
      message: 'Download PDF functionality will be implemented soon.',
      type: 'info'
    });
    setShowModal(true);
  };

  // Handle delete click
  const handleDeleteClick = (jobCard: JobCardDatabaseItem) => {
    setJobToConfirm({ id: jobCard.id, jobNumber: jobCard.job_number });
    setShowDeleteConfirm(true);
  };

  // Handle delete job card
  const handleDeleteJobCard = async () => {
    if (!jobToConfirm) return;

    try {
      const { error } = await supabase
        .from('job_cards')
        .delete()
        .eq('id', jobToConfirm.id);

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
        message: `Job card ${jobToConfirm.jobNumber} has been deleted successfully.`,
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
      setJobToConfirm(null);
    }
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowModal(false);
    if (modalContent.type === 'success') {
      // Refresh data after successful operations
      setTimeout(() => {
        fetchJobCards();
      }, 100);
    }
  };

  const getSearchPlaceholder = () => {
    switch (searchField) {
      case 'rego': return 'Search by REGO...';
      case 'invoice_number': return 'Search by Invoice Number...';
      case 'customer_name': return 'Search by Customer Name...';
      case 'company_name': return 'Search by Company Name...';
      case 'mobile': return 'Search by Mobile...';
      default: return 'Search all fields...';
    }
  };

  const hasActiveFilters = () => {
    return searchTerm || dateFilter !== 'all' || paymentFilter !== 'all';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const getPaymentBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'unpaid':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobCards = filteredJobCards.slice(startIndex, endIndex);

  if (!showDatabase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-8">
              <Database className="w-12 h-12 text-blue-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Archived Job Cards Database
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Access the complete archive of all historical job cards with advanced search, 
              filtering, and sorting capabilities. This comprehensive database contains all 
              completed and archived job cards from your system.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Archive className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Archive</h3>
                <p className="text-gray-600 text-sm">
                  Access all archived job cards with full historical data
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Search</h3>
                <p className="text-gray-600 text-sm">
                  Search by customer, vehicle, dates, and status
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Filter className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Filtering</h3>
                <p className="text-gray-600 text-sm">
                  Filter by payment status, completion status, and dates
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Export & Download</h3>
                <p className="text-gray-600 text-sm">
                  Download PDFs and export data for reporting
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDatabase(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center gap-3 mx-auto"
            >
              <Database className="w-6 h-6" />
              Show Database
            </button>

            <p className="text-sm text-gray-500 mt-4">
              This will load all archived job cards. Depending on your data size, this may take a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Archived Job Cards Database
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive database of all archived job cards</p>
          </div>
          <button
            onClick={() => setShowDatabase(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Back to Landing
          </button>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Section */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value as SearchField)}
                    className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {searchFieldOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={getSearchPlaceholder()}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex gap-3">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center gap-2"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                {sortOrder === 'newest' ? (
                  <SortDesc className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                ) : (
                  <SortAsc className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                )}
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilterModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 ${
                  hasActiveFilters()
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
                {hasActiveFilters() && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>

              {/* Clear All */}
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredJobCards.length)} of {filteredJobCards.length} archived job cards
            {filteredJobCards.length !== jobCards.length && (
              <span className="text-blue-600"> (filtered from {jobCards.length} total)</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading archived job cards...</span>
            </div>
          ) : currentJobCards.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No archived job cards found</h3>
              <p className="text-gray-600">
                {hasActiveFilters() 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No job cards have been archived yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentJobCards.map((jobCard) => (
                    <tr key={jobCard.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {jobCard.job_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          Start: {formatDate(jobCard.job_start_date)}
                        </div>
                        {jobCard.completed_date && (
                          <div className="text-xs text-gray-500">
                            Finish: {formatDate(jobCard.completed_date)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {jobCard.customer_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {jobCard.company_name || 'No company'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {jobCard.mobile || 'No mobile'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          REGO: {jobCard.rego || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {jobCard.vehicle_make} {jobCard.vehicle_model}
                        </div>
                        <div className="text-xs text-gray-500">
                          {jobCard.vehicle_month} {jobCard.vehicle_year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {jobCard.invoice_number || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(jobCard.invoice_value || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getPaymentBadge(jobCard.payment_status)}>
                          {jobCard.payment_status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(jobCard.grand_total || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-start space-x-4">
                          {/* Left Column: Edit and Re-open */}
                          <div className="flex flex-col space-y-1">
                            <button 
                              onClick={() => handleOpenEditJobCardForm(jobCard)}
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-xs"
                              title="Edit Job Card"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                            
                            <button 
                              onClick={() => handleReopenClick(jobCard)}
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 text-xs"
                              title="Re-open Job Card"
                            >
                              <ArchiveRestore className="w-3 h-3 mr-1" />
                              Re-open
                            </button>
                          </div>
                          
                          {/* Right Column: PDF, Invoice, Delete */}
                          <div className="flex flex-col space-y-1">
                            <button 
                              onClick={() => handleDownloadPDF(jobCard.id)}
                              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-xs"
                              title="Download PDF"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              PDF
                            </button>
                            
                            <button 
                              onClick={() => handleGenerateInvoice(jobCard.id)}
                              className="flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-200 text-xs"
                              title="Generate Invoice"
                            >
                              <FileDown className="w-3 h-3 mr-1" />
                              Invoice
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteClick(jobCard)}
                              className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200 text-xs"
                              title="Delete Job Card"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Job Card Date
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dateFilter"
                      value="all"
                      checked={dateFilter === 'all'}
                      onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                      className="mr-2"
                    />
                    All Dates
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dateFilter"
                      value="year"
                      checked={dateFilter === 'year'}
                      onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                      className="mr-2"
                    />
                    Specific Year
                  </label>
                  {dateFilter === 'year' && (
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="ml-6 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  )}
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="dateFilter"
                      value="month_year"
                      checked={dateFilter === 'month_year'}
                      onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                      className="mr-2"
                    />
                    Specific Month & Year
                  </label>
                  {dateFilter === 'month_year' && (
                    <div className="ml-6 flex gap-2">
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Month</option>
                        {months.map(month => (
                          <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                      </select>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Year</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Payment Status
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t">
              <button
                onClick={() => {
                  setDateFilter('all');
                  setSelectedYear('');
                  setSelectedMonth('');
                  setPaymentFilter('all');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Card Form Modal */}
      <JobCardForm 
        isOpen={isJobCardFormOpen} 
        onClose={handleCloseJobCardForm}
        initialJobCardData={editingJobCard}
      />

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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && jobToConfirm && (
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
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                Are you sure you want to delete job card <strong>{jobToConfirm.jobNumber}</strong>?
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                This action cannot be undone and will permanently remove all associated data.
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setJobToConfirm(null);
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

      {/* Success/Error Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleSuccessModalClose}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </div>
  );
};

export default JobCardsDatabasePage;