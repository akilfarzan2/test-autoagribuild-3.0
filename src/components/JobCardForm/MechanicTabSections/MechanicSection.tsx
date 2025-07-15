import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Wrench, ChevronDown, ChevronRight, Package, Clock, DollarSign, FileText, CheckCircle, PenTool, RotateCcw } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { JobCardFormData, SignatureCanvasRef } from '../../../types/jobCardTypes';

interface MechanicSectionProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string | boolean) => void;
  initialSupervisorSignature: string | null;
}

const MechanicSection = forwardRef<SignatureCanvasRef, MechanicSectionProps>(({ 
  jobCardFormData, 
  onJobCardDataChange,
  initialSupervisorSignature
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasSignature, setHasSignature] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(300);
  const [canvasHeight, setCanvasHeight] = useState(120);
  const signatureRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to measure and set canvas dimensions
  const updateCanvasDimensions = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setCanvasWidth(containerWidth);
      setCanvasHeight(120); // Keep height fixed at 120px
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

  // Load initial signature data when canvas dimensions are ready
  useEffect(() => {
    if (initialSupervisorSignature && signatureRef.current && canvasWidth > 0) {
      try {
        // Small delay to ensure canvas is fully rendered
        setTimeout(() => {
          if (signatureRef.current) {
            signatureRef.current.fromDataURL(initialSupervisorSignature);
            setHasSignature(true);
          }
        }, 100);
      } catch (error) {
        console.error('Error loading initial supervisor signature:', error);
      }
    }
  }, [initialSupervisorSignature, canvasWidth]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getSignatureData: () => {
      if (signatureRef.current) {
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

  // Handle signature drawing (only update local state, not parent form)
  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      const isEmpty = signatureRef.current.isEmpty();
      setHasSignature(!isEmpty);
    }
  };

  // Clear signature
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setHasSignature(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200 border-b border-emerald-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Mechanic Section</h4>
            <p className="text-sm text-emerald-600">
              Final checks, totals, and additional notes
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-6 bg-white animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Handover Valuables to Customer */}
              <div>
                <label htmlFor="handoverValuables" className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  Handover Valuables to Customer
                </label>
                <textarea
                  id="handoverValuables"
                  name="handoverValuables"
                  value={jobCardFormData.handover_valuables_to_customer}
                  onChange={(e) => onJobCardDataChange('handover_valuables_to_customer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  rows={3}
                  placeholder="List any valuables returned to customer..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Document any personal items, keys, or valuables returned to the customer
                </p>
              </div>

              {/* Check All Tyres */}
              <div>
                <label htmlFor="checkAllTyres" className="block text-sm font-medium text-gray-700 mb-2">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Check All Tyres
                </label>
                <textarea
                  id="checkAllTyres"
                  name="checkAllTyres"
                  value={jobCardFormData.check_all_tyres}
                  onChange={(e) => onJobCardDataChange('check_all_tyres', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  rows={3}
                  placeholder="Record tyre inspection results..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note tyre condition, pressure, wear patterns, and any recommendations
                </p>
              </div>

              {/* Future Work Notes */}
              <div>
                <label htmlFor="futureWorkNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Future Work Notes
                </label>
                <textarea
                  id="futureWorkNotes"
                  name="futureWorkNotes"
                  value={jobCardFormData.future_work_notes}
                  onChange={(e) => onJobCardDataChange('future_work_notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  rows={4}
                  placeholder="Note any recommended future work or maintenance..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Record recommendations for future services, repairs, or maintenance
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Total A */}
              <div>
                <label htmlFor="totalA" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Total A
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    id="totalA"
                    name="totalA"
                    min="0"
                    step="0.01"
                    value={jobCardFormData.total_a}
                    onChange={(e) => onJobCardDataChange('total_a', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total amount for section A (will be configured later)
                </p>
              </div>

              {/* Total Hours */}
              <div>
                <label htmlFor="totalHours" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Total Hours
                </label>
                <input
                  type="number"
                  id="totalHours"
                  name="totalHours"
                  min="0"
                  step="0.1"
                  value={jobCardFormData.total_hours}
                  onChange={(e) => onJobCardDataChange('total_hours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total hours spent on this job (decimal format: 1.5 = 1 hour 30 minutes)
                </p>
              </div>

              {/* Supervisor Signature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <PenTool className="w-4 h-4 inline mr-1" />
                    Supervisor Signature
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Clear
                  </button>
                </div>
                
                <div 
                  ref={containerRef}
                  className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-2"
                >
                  <SignatureCanvas
                    ref={signatureRef}
                    onEnd={handleSignatureEnd}
                    canvasProps={{
                      width: canvasWidth,
                      height: canvasHeight,
                      className: 'signature-canvas w-full border border-gray-200 rounded-md',
                      style: { width: '100%', height: '120px' }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Supervisor signature for work completion approval
                  </p>
                </div>
                
                {hasSignature && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-xs text-green-700 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Supervisor signature captured
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MechanicSection.displayName = 'MechanicSection';

export default MechanicSection;