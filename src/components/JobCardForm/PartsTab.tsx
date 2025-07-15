import React from 'react';
import { Package, FileText, Calendar, DollarSign, MapPin, ShoppingCart, Hash, Phone, Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { JobCardFormData, PartsAndConsumablesData } from '../../types/jobCardTypes';
import PartsAndConsumablesList from './PartsTabSections/PartsAndConsumablesList';
import LubricantsUsedList from './PartsTabSections/LubricantsUsedList';

interface PartsTabProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string | string[] | boolean | PartsAndConsumablesData | any) => void;
}

const PartsTab: React.FC<PartsTabProps> = ({ 
  jobCardFormData, 
  onJobCardDataChange 
}) => {
  const [isInvoiceDetailsExpanded, setIsInvoiceDetailsExpanded] = React.useState(true);

  // Generate job number for display
  const jobNumber = `JC-${jobCardFormData.job_year}-${jobCardFormData.job_month}-${jobCardFormData.job_sequence}`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Package className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Parts & Inventory</h2>
          <p className="text-sm text-gray-500">Manage parts used and inventory for this job</p>
        </div>
      </div>

      {/* Invoice & Job Details Section */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsInvoiceDetailsExpanded(!isInvoiceDetailsExpanded)}
          className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors duration-200 border-b border-purple-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Invoice & Job Details</h3>
              <p className="text-sm text-purple-600">
                Invoice information and job references
              </p>
            </div>
          </div>
          {isInvoiceDetailsExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {isInvoiceDetailsExpanded && (
          <div className="p-6 bg-white animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Invoice Details */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Invoice Information
                </h4>
                
                {/* Invoice Number */}
                <div>
                  <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    id="invoiceNumber"
                    value={jobCardFormData.invoice_number}
                    onChange={(e) => onJobCardDataChange('invoice_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter invoice number"
                  />
                </div>

                {/* Invoice Date */}
                <div>
                  <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    id="invoiceDate"
                    value={jobCardFormData.invoice_date}
                    onChange={(e) => onJobCardDataChange('invoice_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Invoice Value */}
                <div>
                  <label htmlFor="invoiceValue" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Invoice Value
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="invoiceValue"
                      step="0.01"
                      min="0"
                      value={jobCardFormData.invoice_value}
                      onChange={(e) => onJobCardDataChange('invoice_value', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Part Location */}
                <div>
                  <label htmlFor="partLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Part Location
                  </label>
                  <input
                    type="text"
                    id="partLocation"
                    value={jobCardFormData.part_location}
                    onChange={(e) => onJobCardDataChange('part_location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter part location"
                  />
                </div>

                {/* Issue Counter Sale */}
                <div>
                  <label htmlFor="issueCounterSale" className="block text-sm font-medium text-gray-700 mb-2">
                    <ShoppingCart className="w-4 h-4 inline mr-1" />
                    Issue Counter Sale
                  </label>
                  <input
                    type="text"
                    id="issueCounterSale"
                    value={jobCardFormData.issue_counter_sale}
                    onChange={(e) => onJobCardDataChange('issue_counter_sale', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter counter sale details"
                  />
                </div>
              </div>

              {/* Right Column - Job References */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                  <Hash className="w-5 h-5 mr-2 text-blue-600" />
                  Job References
                </h4>
                
                {/* Job Number (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Job Number
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 font-medium">
                    {jobNumber}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Auto-generated job card number</p>
                </div>

                {/* REGO (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    REGO
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                    {jobCardFormData.rego || 'Not specified'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Vehicle registration number</p>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                    {jobCardFormData.email || 'Not specified'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Customer email address</p>
                </div>

                {/* Mobile Number (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Mobile Number
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                    {jobCardFormData.mobile || 'Not specified'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Customer mobile number</p>
                </div>
              </div>
            </div>

            {/* Information Panel */}
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-purple-800 mb-2">Invoice & Job Details Information</h4>
              <p className="text-xs text-purple-600">
                This section manages invoice-related information and displays key job references. 
                Invoice details are used for billing and parts tracking, while job references provide 
                quick access to essential job card information.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Parts and Consumables Section */}
      <div className="space-y-6">
        <PartsAndConsumablesList 
          jobCardFormData={jobCardFormData}
          onJobCardDataChange={onJobCardDataChange}
        />
        
        <LubricantsUsedList 
          jobCardFormData={jobCardFormData}
          onJobCardDataChange={onJobCardDataChange}
        />
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Parts Tab Information</h4>
        <p className="text-xs text-blue-600">
          This tab manages all parts-related information for the job card. Track parts ordering, 
          delivery status, costs, and maintain detailed records of all components used in the service.
        </p>
      </div>
    </div>
  );
};

export default PartsTab;