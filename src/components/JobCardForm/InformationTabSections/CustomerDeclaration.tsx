import React, { useState, useRef } from 'react';
import { FileCheck, ChevronDown, ChevronRight, PenTool, RotateCcw, Edit } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import Modal from '../../Modal';

interface JobCardFormData {
  customer_declaration_authorized: boolean;
  customer_signature: string;
}

interface CustomerDeclarationProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string | boolean) => void;
}

const CustomerDeclaration: React.FC<CustomerDeclarationProps> = ({
  jobCardFormData,
  onJobCardDataChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCustomerSignatureEditing, setIsCustomerSignatureEditing] = useState(false);
  const [showConfirmClearModal, setShowConfirmClearModal] = useState(false);
  const [confirmModalContent, setConfirmModalContent] = useState({ title: '', message: '' });
  const signatureRef = useRef<SignatureCanvas>(null);

  // Load existing signature when component mounts or signature data changes
  React.useEffect(() => {
    if (signatureRef.current) {
      if (jobCardFormData.customer_signature && !isCustomerSignatureEditing) {
        // Load existing signature
        signatureRef.current.fromDataURL(jobCardFormData.customer_signature);
      } else if (!jobCardFormData.customer_signature && !isCustomerSignatureEditing) {
        // Clear canvas if no signature
        signatureRef.current.clear();
      }
    }
  }, [jobCardFormData.customer_signature, isCustomerSignatureEditing]);
  // Handle signature end (when user finishes drawing)
  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL();
      onJobCardDataChange('customer_signature', signatureData);
      setIsCustomerSignatureEditing(false); // Lock the canvas after signing
    }
  };

  // Clear signature
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      onJobCardDataChange('customer_signature', '');
      setIsCustomerSignatureEditing(true); // Enable editing mode
    }
  };

  // Handle edit signature button click
  const handleEditSignature = () => {
    setConfirmModalContent({
      title: 'Edit Customer Signature',
      message: 'Are you sure you want to edit the customer signature? This will clear the current signature and you will need to capture it again.'
    });
    setShowConfirmClearModal(true);
  };

  // Handle confirmation modal close
  const handleConfirmModalClose = (confirmed: boolean) => {
    if (confirmed) {
      clearSignature();
    }
    setShowConfirmClearModal(false);
  };
  // Handle authorization checkbox change
  const handleAuthorizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onJobCardDataChange('customer_declaration_authorized', e.target.checked);
  };

  return (
    <>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Customer Declaration</h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-6 bg-white animate-fadeIn">
          <div className="space-y-6">
            {/* Customer Authorization */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-purple-800 mb-4">Customer Authorization</h4>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="customerAuthorization"
                  checked={jobCardFormData.customer_declaration_authorized}
                  onChange={handleAuthorizationChange}
                  className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="customerAuthorization" className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-medium">I/WE HEREBY AUTHORISE THE ABOVE WORK TO BE DONE ALONG WITH THE NECESSARY SPARES/MATERIAL AT MY COST. 
                  ANY ADDITIONAL WORK IF REQUIRED SHALL BE DONE AT MY/OUR COST. I/WE ALSO AUTHORISE THE VEHICLE TO BE STORED, 
                  REPAIRED, TESTED & DRIVEN AT MY RISK/COST.</span>
                </label>
              </div>
            </div>

            {/* Customer Signature */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                  <PenTool className="w-5 h-5 mr-2 text-gray-600" />
                  Customer Signature
                </h4>
                {jobCardFormData.customer_signature && !isCustomerSignatureEditing ? (
                  <button
                    type="button"
                    onClick={handleEditSignature}
                    className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Clear
                  </button>
                )}
              </div>
              
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
                <SignatureCanvas
                  ref={signatureRef}
                  readOnly={!isCustomerSignatureEditing && !!jobCardFormData.customer_signature}
                  onEnd={isCustomerSignatureEditing ? handleSignatureEnd : undefined}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: `signature-canvas w-full h-full border border-gray-200 rounded-md ${
                      !isCustomerSignatureEditing && jobCardFormData.customer_signature ? 'cursor-default' : 'cursor-crosshair'
                    }`,
                    style: { width: '100%', height: '200px' }
                  }}
                />
                {isCustomerSignatureEditing || !jobCardFormData.customer_signature ? (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Please sign above using your mouse, trackpad, or touch screen
                  </p>
                ) : (
                  <p className="text-xs text-green-600 mt-2 text-center font-medium">
                    Signature captured - Click "Edit" to modify
                  </p>
                )}
              </div>
              
              {jobCardFormData.customer_signature && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700 flex items-center">
                    <FileCheck className="w-4 h-4 mr-2" />
                    Signature captured successfully
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Information Panel */}
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Declaration Requirements</h4>
            <p className="text-xs text-purple-600">
              Both the authorization checkbox and customer signature are required to complete the job card. 
              The signature will be stored securely and used for legal documentation purposes.
            </p>
          </div>
        </div>
      )}
    </div>

    {/* Confirmation Modal */}
    <Modal
      isOpen={showConfirmClearModal}
      onClose={() => handleConfirmModalClose(false)}
      title={confirmModalContent.title}
      message={confirmModalContent.message}
      type="info"
    >
      <div className="flex space-x-3">
        <button
          onClick={() => handleConfirmModalClose(false)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={() => handleConfirmModalClose(true)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Confirm
        </button>
      </div>
    </Modal>
    </>
  );
};

export default CustomerDeclaration;