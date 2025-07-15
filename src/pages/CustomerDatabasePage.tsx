import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Database, Search, Filter, SortAsc, SortDesc, Calendar, DollarSign, X, ChevronDown, Users, Eye, FileText, Download, Plus } from 'lucide-react';
import { Customer } from '../types/customerTypes';
import CustomerTable from '../components/CustomerTable';
import AddCustomerForm from '../components/AddCustomerForm';

const CustomerDatabasePage: React.FC = () => {
  const [showDatabase, setShowDatabase] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddCustomerFormOpen, setIsAddCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    if (!showDatabase) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_db')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customer database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDatabase) {
      fetchCustomers();
    }
  }, [showDatabase]);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsAddCustomerFormOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsAddCustomerFormOpen(true);
  };

  const handleCloseAddCustomerForm = () => {
    setIsAddCustomerFormOpen(false);
    setEditingCustomer(null);
    // Refresh data after form is closed
    if (showDatabase) {
      setTimeout(() => {
        fetchCustomers();
      }, 100);
    }
  };

  if (!showDatabase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
              <Users className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Customer Database
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Access the complete customer database with advanced search, 
              filtering, and management capabilities. This comprehensive database contains all 
              customer and vehicle information from your system.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Management</h3>
                <p className="text-gray-600 text-sm">
                  Manage all customer information and contact details
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Search</h3>
                <p className="text-gray-600 text-sm">
                  Search by customer name, REGO, mobile, or company
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Filter className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vehicle Tracking</h3>
                <p className="text-gray-600 text-sm">
                  Track multiple vehicles per customer with detailed records
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Export & Reports</h3>
                <p className="text-gray-600 text-sm">
                  Export customer data and generate detailed reports
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDatabase(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center gap-3 mx-auto"
            >
              <Database className="w-6 h-6" />
              Show Database
            </button>

            <p className="text-sm text-gray-500 mt-4">
              This will load all customer records. Depending on your data size, this may take a moment.
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
              <Users className="w-8 h-8 text-green-600" />
              Customer Database
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive database of all customers and their vehicles</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleAddCustomer}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
            <button
              onClick={() => setShowDatabase(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Back to Landing
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Loading customer database...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium">Error loading customer database</p>
              <p className="text-sm mt-2">{error}</p>
              <button 
                onClick={fetchCustomers}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <CustomerTable 
            customers={customers}
            onRefresh={fetchCustomers}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
          />
        )}
      </div>

      {/* Add Customer Form Modal */}
      <AddCustomerForm 
        isOpen={isAddCustomerFormOpen} 
        onClose={handleCloseAddCustomerForm}
        initialData={editingCustomer}
      />
    </div>
  );
};

export default CustomerDatabasePage;