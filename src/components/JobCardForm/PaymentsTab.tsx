import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Receipt, CheckCircle, Clock, AlertCircle, Calculator } from 'lucide-react';
import { JobCardFormData } from '../../types/jobCardTypes';

interface PaymentsTabProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string | string[] | boolean) => void;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ 
  jobCardFormData, 
  onJobCardDataChange 
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');

  // Initialize payment status from form data
  useEffect(() => {
    if (jobCardFormData.payment_status) {
      setPaymentStatus(jobCardFormData.payment_status as 'paid' | 'unpaid');
    }
  }, [jobCardFormData.payment_status]);

  // Handle payment status change
  const handlePaymentStatusChange = (status: 'paid' | 'unpaid') => {
    setPaymentStatus(status);
    onJobCardDataChange('payment_status', status);
  };

  // Calculate totals from form data
  const calculateTotals = () => {
    // Total A from Mechanic Tab
    const totalA = parseFloat(jobCardFormData.total_a) || 0;
    
    // Total B from Parts and Consumables
    const totalB = jobCardFormData.parts_and_consumables?.total_b || 0;
    
    // Total C from Lubricants Used
    const totalC = jobCardFormData.lubricants_used?.total_c || 0;
    
    // Grand Total
    const grandTotal = totalA + totalB + totalC;
    
    return {
      totalA,
      totalB,
      totalC,
      grandTotal
    };
  };

  const { totalA, totalB, totalC, grandTotal } = calculateTotals();

  // Update grand total in form data when totals change
  useEffect(() => {
    onJobCardDataChange('grand_total', grandTotal.toFixed(2));
  }, [totalA, totalB, totalC, grandTotal, onJobCardDataChange]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payment Information</h2>
          <p className="text-sm text-gray-500">Manage billing, payments, and financial details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Payment Status */}
        <div className="space-y-6">
          {/* Payment Status Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Status</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the current payment status for this job card:
              </p>

              <div className="flex space-x-3">
                {/* Unpaid Button */}
                <button
                  onClick={() => handlePaymentStatusChange('unpaid')}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    paymentStatus === 'unpaid'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Unpaid</span>
                </button>

                {/* Paid Button */}
                <button
                  onClick={() => handlePaymentStatusChange('paid')}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    paymentStatus === 'paid'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Paid</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className={`p-3 rounded-md ${
                paymentStatus === 'paid' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {paymentStatus === 'paid' ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <Clock className="w-4 h-4 text-red-600 mr-2" />
                  )}
                  <span className={`text-sm font-medium ${
                    paymentStatus === 'paid' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Payment Status: {paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Cost Summary */}
        <div className="space-y-6">
          {/* Cost Summary Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cost Summary</h3>
            </div>

            <div className="space-y-4">
              {/* Total A */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Total A (Labor & Services)</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ${totalA.toFixed(2)} AUD
                </span>
              </div>

              {/* Total B */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Total B (Parts & Consumables)</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ${totalB.toFixed(2)} AUD
                </span>
              </div>

              {/* Total C */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Total C (Lubricants)</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ${totalC.toFixed(2)} AUD
                </span>
              </div>

              {/* Grand Total */}
              <div className="flex items-center justify-between py-3 border-t-2 border-gray-300 bg-gray-50 rounded-md px-3 mt-4">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-lg font-bold text-gray-900">Grand Total</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  ${grandTotal.toFixed(2)} AUD
                </span>
              </div>

              {/* Cost Breakdown Info */}
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                <h4 className="text-sm font-medium text-purple-800 mb-2">Cost Breakdown</h4>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• Total A: Labor costs and service charges from Mechanic tab</li>
                  <li>• Total B: Parts and consumables costs from Parts tab</li>
                  <li>• Total C: Lubricants and fluids costs from Parts tab</li>
                  <li>• Grand Total: Sum of all three totals (A + B + C)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;