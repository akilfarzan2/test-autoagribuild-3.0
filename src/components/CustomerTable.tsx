import React, { useState } from 'react';
import { Search, X, Plus, Edit, Trash2, Eye, Users, Car, Phone, Mail, Building, Hash } from 'lucide-react';
import { Customer } from '../types/customerTypes';
import { supabase } from '../utils/supabaseClient';
import Modal from './Modal';

interface CustomerTableProps {
  customers: Customer[];
  onRefresh: () => void;
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ customers, onRefresh, onAddCustomer, onEditCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Modal states
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [customerToView, setCustomerToView] = useState<Customer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  // Filter customers based on search term
  const filteredCustomers = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return customers;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return customers.filter(customer => {
      // Search by customer name
      const nameMatch = customer.customer_name?.toLowerCase().includes(searchLower);
      
      // Search by REGO
      const regoMatch = customer.rego?.toLowerCase().includes(searchLower);
      
      // Search by mobile
      const mobileMatch = customer.mobile?.toLowerCase().includes(searchLower);
      
      // Search by company name
      const companyMatch = customer.company_name?.toLowerCase().includes(searchLower);
      
      // Search by email
      const emailMatch = customer.email?.toLowerCase().includes(searchLower);
      
      return nameMatch || regoMatch || mobileMatch || companyMatch || emailMatch;
    });
  }, [customers, searchTerm]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle view details
  const handleViewDetails = (customer: Customer) => {
    setCustomerToView(customer);
    setShowViewDetailsModal(true);
  };

  // Handle edit customer (placeholder)
  const handleEditCustomer = (customer: Customer) => {
    onEditCustomer(customer);
  };

  // Handle delete click (opens confirmation)
  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      const { error } = await supabase
        .from('customer_db')
        .delete()
        .eq('id', customerToDelete.id);

      if (error) {
        console.error('Error deleting customer:', error);
        setModalContent({
          title: 'Error',
          message: 'Failed to delete customer. Please try again.',
          type: 'error'
        });
        setShowModal(true);
        return;
      }

      setModalContent({
        title: 'Success',
        message: 'Customer has been permanently deleted from the database.',
        type: 'success'
      });
      setShowModal(true);
      onRefresh(); // Refresh the table data
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
      setCustomerToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Search and Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Section */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, REGO, mobile, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
            {filteredCustomers.length !== customers.length && (
              <span className="text-green-600"> (filtered from {customers.length} total)</span>
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
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {currentCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : 'No customers have been added yet.'
                }
              </p>
              {searchTerm ? (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={onAddCustomer}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Add First Customer
                </button>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.customer_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.abn ? `ABN: ${customer.abn}` : 'No ABN'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Phone className="w-3 h-3 text-gray-400 mr-1" />
                          {customer.mobile || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 text-gray-400 mr-1" />
                          {customer.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {customer.company_name || 'No company'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          REGO: {customer.rego || 'N/A'}
                        </div>
                        <div className="text-gray-500">
                          {[
                            customer.vehicle_make,
                            customer.vehicle_model,
                            customer.vehicle_year
                          ].filter(Boolean).join(' ') || 'Vehicle details not specified'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleViewDetails(customer)}
                          className="flex items-center text-green-600 hover:text-green-800 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button 
                          onClick={() => handleEditCustomer(customer)}
                          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(customer)}
                          className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-gray-50 border-t border-gray-200">
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

      {/* View Details Modal */}
      {showViewDetailsModal && customerToView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
                <button
                  onClick={() => setShowViewDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-600" />
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{customerToView.customer_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Mobile</label>
                      <p className="text-gray-900">{customerToView.mobile || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{customerToView.email || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company</label>
                      <p className="text-gray-900">{customerToView.company_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">ABN</label>
                      <p className="text-gray-900">{customerToView.abn || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Car className="w-5 h-5 mr-2 text-blue-600" />
                    Vehicle Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">REGO</label>
                      <p className="text-gray-900">{customerToView.rego || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Make</label>
                      <p className="text-gray-900">{customerToView.vehicle_make || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Model</label>
                      <p className="text-gray-900">{customerToView.vehicle_model || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Month</label>
                      <p className="text-gray-900">{customerToView.vehicle_month || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Year</label>
                      <p className="text-gray-900">{customerToView.vehicle_year || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Added Date */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="text-sm font-medium text-gray-500">Added to Database</label>
                  <p className="text-gray-900">{formatDate(customerToView.created_at)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setShowViewDetailsModal(false)}
                className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-6 text-center border-b border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">
                Delete Customer
              </h3>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-gray-600 text-base leading-relaxed mb-4">
                Are you sure you want to delete <strong>{customerToDelete.customer_name || 'this customer'}</strong>?
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                This action cannot be undone and will permanently remove all associated data. 
                <strong className="text-red-600"> You can never get the customer data back.</strong>
              </p>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCustomerToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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
        onClose={() => setShowModal(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </>
  );
};

export default CustomerTable;