import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FileCheck, ChevronDown, ChevronRight, PenTool, RotateCcw } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { SignatureCanvasRef } from '../../../types/jobCardTypes';

interface JobCardFormData {
  customer_declaration_authorized: boolean;
  customer_signature: string;
}

interface CustomerDeclarationProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string | boolean) => void;
  initialCustomerSignature: string | null;
}

const CustomerDeclaration = forwardRef<SignatureCanvasRef, CustomerDeclarationProps>(({
  jobCardFormData,
  onJobCardDataChange,
  initialCustomerSignature
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasSignature, setHasSignature] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(200);
  const signatureRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to update canvas dimensions
  const updateCanvasDimensions = () => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setCanvasWidth(width);
    }
  };

  // Set up canvas dimensions on mount and window resize
  useEffect(() => {
    updateCanvasDimensions();
    
    const handleResize = () => {
      updateCanvasDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load initial signature when component mounts and canvas is ready
  useEffect(() => {
    if (initialCustomerSignature && signatureRef.current && canvasWidth > 0) {
      setTimeout(() => {
        if (signatureRef.current) {
          signatureRef.current.fromDataURL(initialCustomerSignature);
          setHasSignature(true);
        }
      }, 100);
    }
  }, [initialCustomerSignature, canvasWidth]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getSignatureData: () => {
      if (signatureRef.current && hasSignature) {
        return signatureRef.current.toDataURL();
      }
      return '';
    },
    clearCanvas: () => {
      if (signatureRef.current) {
        signatureRef.current.clear();
        setHasSignature(false);
      }
    }
  }));

  // Handle signature end (when user finishes drawing)
  const handleSignatureEnd = () => {
    setHasSignature(true);
  };

  // Clear signature
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setHasSignature(false);
    }
    onJobCardDataChange('customer_signature', '');
  };

  // Handle authorization checkbox change
  const handleAuthorizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onJobCardDataChange('customer_declaration_authorized', e.target.checked);
  };

  return (
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
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Clear
                </button>
              </div>

              <div ref={containerRef}>
                {jobCardFormData.customer_signature ? (
                  // Display saved signature
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                    <img
                      src={jobCardFormData.customer_signature}
                      alt="Customer Signature"
                      className="w-full h-[200px] object-contain border border-gray-200 rounded-md bg-white"
                      style={{ maxWidth: '100%', height: '200px' }}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Saved customer signature - Click "Clear" to create a new signature
                    </p>
                  </div>
                ) : (
                  // Display signature canvas for new signature
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {canvasWidth > 0 && (
                      <SignatureCanvas
                        ref={signatureRef}
                        onEnd={handleSignatureEnd}
                        canvasProps={{
                          width: canvasWidth,
                          height: canvasHeight,
                          className: 'signature-canvas w-full border border-gray-200 rounded-md',
                          style: { width: '100%', height: '200px' }
                        }}
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Please sign above using your mouse, trackpad, or touch screen
                    </p>
                  </div>
                )}
              </div>
              
              {hasSignature && (
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
  );
});

CustomerDeclaration.displayName = 'CustomerDeclaration';

export default CustomerDeclaration;