import React, { useState } from 'react';
import { X, Users, UserPlus, Search, User, Car, Phone, Mail, Building, Hash } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { Customer } from '../types/customerTypes';

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewCustomer: () => void;
  onExistingCustomer: (customer: Customer) => void;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
  isOpen,
  onClose,
  onNewCustomer,
  onExistingCustomer
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setShowSearch(false);
      setSearchTerm('');
      setSearchResults([]);
      setSearchError(null);
    }
  }, [isOpen]);

  // Handle search for existing customers
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const searchLower = searchTerm.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('customer_db')
        .select('*')
        .or(`customer_name.ilike.%${searchLower}%,rego.ilike.%${searchLower}%,company_name.ilike.%${searchLower}%,mobile.ilike.%${searchLower}%,email.ilike.%${searchLower}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error searching customers:', error);
        setSearchError('Failed to search customers. Please try again.');
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      setSearchError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  React.useEffect(() => {
    if (!showSearch) return;

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, showSearch]);

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    onExistingCustomer(customer);
    onClose();
  };

  // Handle new customer selection
  const handleNewCustomerSelect = () => {
    onNewCustomer();
    onClose();
  };

  // Handle existing customer option
  const handleExistingCustomerOption = () => {
    setShowSearch(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create New Job Card</h1>
              <p className="text-sm text-gray-500">Choose customer type to get started</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showSearch ? (
            // Initial choice screen
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Customer Type</h2>
                <p className="text-gray-600">Choose whether this is for a new customer or an existing customer</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New Customer Option */}
                <button
                  onClick={handleNewCustomerSelect}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
                      <UserPlus className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">New Customer</h3>
                    <p className="text-sm text-gray-600">
                      Start with a blank form for a first-time customer
                    </p>
                  </div>
                </button>

                {/* Existing Customer Option */}
                <button
                  onClick={handleExistingCustomerOption}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Existing Customer</h3>
                    <p className="text-sm text-gray-600">
                      Search and select from existing customer database
                    </p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            // Customer search screen
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Search Existing Customers</h2>
                  <p className="text-sm text-gray-600">Search by name, REGO, company, mobile, or email</p>
                </div>
                <button
                  onClick={() => setShowSearch(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  ← Back to options
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Searching...</span>
                  </div>
                ) : searchError ? (
                  <div className="text-center py-8 text-red-600">
                    <p>{searchError}</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Customer Information */}
                          <div>
                            <div className="flex items-center mb-2">
                              <User className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">
                                {customer.customer_name || 'No name'}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              {customer.company_name && (
                                <div className="flex items-center">
                                  <Building className="w-3 h-3 mr-2" />
                                  {customer.company_name}
                                </div>
                              )}
                              {customer.mobile && (
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-2" />
                                  {customer.mobile}
                                </div>
                              )}
                              {customer.email && (
                                <div className="flex items-center">
                                  <Mail className="w-3 h-3 mr-2" />
                                  {customer.email}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Vehicle Information */}
                          <div>
                            <div className="flex items-center mb-2">
                              <Car className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">
                                REGO: {customer.rego || 'N/A'}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>
                                {[customer.vehicle_make, customer.vehicle_model, customer.vehicle_year]
                                  .filter(Boolean)
                                  .join(' ') || 'Vehicle details not specified'}
                              </div>
                              {customer.abn && (
                                <div className="flex items-center">
                                  <Hash className="w-3 h-3 mr-2" />
                                  ABN: {customer.abn}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchTerm.trim() ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-400 mb-2">No customers found</p>
                    <p className="text-sm text-gray-400">
                      Try searching with different keywords or create a new customer
                    </p>
                    <button
                      onClick={handleNewCustomerSelect}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                    >
                      Create New Customer Instead
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-400 mb-2">Start typing to search</p>
                    <p className="text-sm text-gray-400">
                      Search by customer name, REGO, company, mobile, or email
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSelectionModal;