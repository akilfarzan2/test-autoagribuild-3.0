import React, { useState } from 'react';
import { X, Users, User, Phone, Mail, Building, Hash, Car, Calendar } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { CustomerFormData } from '../types/customerTypes';
import Modal from './Modal';

interface AddCustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Customer | null;
}

const AddCustomerForm: React.FC<AddCustomerFormProps> = ({ isOpen, onClose, initialData = null }) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    customer_name: '',
    mobile: '',
    company_name: '',
    email: '',
    abn: '',
    rego: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_month: '',
    vehicle_year: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  // Determine if we're in edit mode
  const isEditMode = !!initialData;

  const months = [
    { value: '', label: 'Select Month' },
    { value: '01', label: '01 - January' },
    { value: '02', label: '02 - February' },
    { value: '03', label: '03 - March' },
    { value: '04', label: '04 - April' },
    { value: '05', label: '05 - May' },
    { value: '06', label: '06 - June' },
    { value: '07', label: '07 - July' },
    { value: '08', label: '08 - August' },
    { value: '09', label: '09 - September' },
    { value: '10', label: '10 - October' },
    { value: '11', label: '11 - November' },
    { value: '12', label: '12 - December' },
  ];

  // Generate years from 1980 to current year + 2
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1979 + 2 }, (_, i) => 1980 + i);

  // Initialize form data when initialData changes
  React.useEffect(() => {
    if (initialData) {
      // Populate form with existing customer data for editing
      setFormData({
        id: initialData.id,
        customer_name: initialData.customer_name || '',
        mobile: initialData.mobile || '',
        company_name: initialData.company_name || '',
        email: initialData.email || '',
        abn: initialData.abn || '',
        rego: initialData.rego || '',
        vehicle_make: initialData.vehicle_make || '',
        vehicle_model: initialData.vehicle_model || '',
        vehicle_month: initialData.vehicle_month || '',
        vehicle_year: initialData.vehicle_year?.toString() || ''
      });
    } else {
      // Reset form for adding new customer
      resetForm();
    }
  }, [initialData]);

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      mobile: '',
      company_name: '',
      email: '',
      abn: '',
      rego: '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_month: '',
      vehicle_year: ''
    });
  };

  const handleClose = () => {
    if (!isEditMode) {
      resetForm();
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.customer_name.trim()) {
      setModalContent({
        title: 'Validation Error',
        message: 'Customer name is required.',
        type: 'error'
      });
      setShowModal(true);
      return;
    }

    if (!formData.rego.trim()) {
      setModalContent({
        title: 'Validation Error',
        message: 'Vehicle REGO is required.',
        type: 'error'
      });
      setShowModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for database insertion
      const customerData = {
        customer_name: formData.customer_name.trim() || null,
        mobile: formData.mobile.trim() || null,
        company_name: formData.company_name.trim() || null,
        email: formData.email.trim() || null,
        abn: formData.abn.trim() || null,
        rego: formData.rego.trim() || null,
        vehicle_make: formData.vehicle_make.trim() || null,
        vehicle_model: formData.vehicle_model.trim() || null,
        vehicle_month: formData.vehicle_month || null,
        vehicle_year: formData.vehicle_year ? parseInt(formData.vehicle_year, 10) : null
      };

      console.log(isEditMode ? 'Updating customer data:' : 'Inserting customer data:', customerData);
      
      let data, error;
      
      if (isEditMode && formData.id) {
        // Update existing customer
        ({ data, error } = await supabase
          .from('customer_db')
          .update(customerData)
          .eq('id', formData.id)
          .select());
      } else {
        // Insert new customer
        ({ data, error } = await supabase
          .from('customer_db')
          .insert([customerData])
          .select());
      }

      if (error) {
        console.error(isEditMode ? 'Error updating customer:' : 'Error creating customer:', error);
        
        // Check if it's a unique constraint violation
        if (error.code === '23505') {
          setModalContent({
            title: 'Duplicate Entry',
            message: 'This customer and vehicle combination already exists in the database.',
            type: 'error'
          });
        } else {
          setModalContent({
            title: 'Error',
            message: isEditMode ? 'Failed to update customer. Please try again.' : 'Failed to add customer. Please try again.',
            type: 'error'
          });
        }
        setShowModal(true);
        return;
      }

      console.log(isEditMode ? 'Customer updated successfully:' : 'Customer created successfully:', data);
      setModalContent({
        title: 'Success!',
        message: isEditMode ? 'Customer has been updated successfully.' : 'Customer has been added to the database successfully.',
        type: 'success'
      });
      setShowModal(true);
    } catch (error) {
      console.error('Unexpected error:', error);
      setModalContent({
        title: 'Unexpected Error',
        message: isEditMode ? 'An unexpected error occurred while updating the customer. Please try again.' : 'An unexpected error occurred while adding the customer. Please try again.',
        type: 'error'
      });
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (modalContent.type === 'success') {
      handleClose(); // Only close the form if it was a success
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h1>
                <p className="text-sm text-gray-500">{isEditMode ? 'Edit customer and vehicle information' : 'Add a new customer and their vehicle to the database'}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-8">
              {/* Customer Details Section */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Customer Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Name */}
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      value={formData.customer_name}
                      onChange={(e) => handleInputChange('customer_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter mobile number"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="w-4 h-4 inline mr-1" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter company name (optional)"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  {/* ABN */}
                  <div className="md:col-span-2">
                    <label htmlFor="abn" className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="w-4 h-4 inline mr-1" />
                      ABN (Australian Business Number)
                    </label>
                    <input
                      type="text"
                      id="abn"
                      value={formData.abn}
                      onChange={(e) => handleInputChange('abn', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter ABN (optional)"
                      maxLength={11}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details Section */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Vehicle Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* REGO */}
                  <div>
                    <label htmlFor="rego" className="block text-sm font-medium text-gray-700 mb-2">
                      <Hash className="w-4 h-4 inline mr-1" />
                      REGO (Registration Number) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="rego"
                      value={formData.rego}
                      onChange={(e) => handleInputChange('rego', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter registration number"
                      required
                    />
                  </div>

                  {/* Vehicle Make */}
                  <div>
                    <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700 mb-2">
                      <Car className="w-4 h-4 inline mr-1" />
                      Vehicle Make
                    </label>
                    <input
                      type="text"
                      id="vehicleMake"
                      value={formData.vehicle_make}
                      onChange={(e) => handleInputChange('vehicle_make', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter vehicle make (e.g., Toyota, Ford)"
                    />
                  </div>

                  {/* Vehicle Model */}
                  <div>
                    <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-2">
                      <Car className="w-4 h-4 inline mr-1" />
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      id="vehicleModel"
                      value={formData.vehicle_model}
                      onChange={(e) => handleInputChange('vehicle_model', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter vehicle model (e.g., Hilux, Ranger)"
                    />
                  </div>

                  {/* Vehicle Month */}
                  <div>
                    <label htmlFor="vehicleMonth" className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Vehicle Month
                    </label>
                    <select
                      id="vehicleMonth"
                      value={formData.vehicle_month}
                      onChange={(e) => handleInputChange('vehicle_month', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {months.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Year */}
                  <div className="md:col-span-2">
                    <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Vehicle Year
                    </label>
                    <select
                      id="vehicleYear"
                      value={formData.vehicle_year}
                      onChange={(e) => handleInputChange('vehicle_year', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select Year</option>
                      {years.reverse().map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (isEditMode ? 'Updating Customer...' : 'Adding Customer...') : (isEditMode ? 'Update Customer' : 'Add Customer')}
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </>
  );
};

export default AddCustomerForm;