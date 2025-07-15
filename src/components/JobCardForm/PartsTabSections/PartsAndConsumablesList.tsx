import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, ChevronDown, ChevronRight, DollarSign, Hash, FileText, Building, MessageSquare } from 'lucide-react';
import { PartAndConsumable, JobCardFormData, PartsAndConsumablesData } from '../../../types/jobCardTypes';

interface PartsAndConsumablesListProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: PartsAndConsumablesData) => void;
}

const PartsAndConsumablesList: React.FC<PartsAndConsumablesListProps> = ({ 
  jobCardFormData,
  onJobCardDataChange 
}) => {
  const [partsData, setPartsData] = useState<PartAndConsumable[]>([]);
  const [totalB, setTotalB] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Initialize parts data
  useEffect(() => {
    const existingData = jobCardFormData?.parts_and_consumables;
    
    if (existingData && existingData.parts) {
      // Use existing data from database
      setPartsData(existingData.parts);
      setTotalB(existingData.total_b || 0);
    } else {
      // Initialize with empty array for new job cards
      setPartsData([]);
      setTotalB(0);
    }
  }, [jobCardFormData]);

  // Calculate total cost for a single part
  const calculateTotalCost = (price: number | null, qty: number | null): number | null => {
    if (price !== null && qty !== null && price >= 0 && qty >= 0) {
      return price * qty;
    }
    return null;
  };

  // Calculate Total B (sum of all total costs)
  const calculateTotalB = (parts: PartAndConsumable[]): number => {
    return parts.reduce((sum, part) => {
      return sum + (part.total_cost || 0);
    }, 0);
  };

  // Helper function to update parts and consumables data
  const updatePartsData = (updatedParts: PartAndConsumable[]) => {
    const newTotalB = calculateTotalB(updatedParts);
    setTotalB(newTotalB);
    
    const partsAndConsumablesData: PartsAndConsumablesData = {
      parts: updatedParts,
      total_b: newTotalB
    };
    
    onJobCardDataChange('parts_and_consumables', partsAndConsumablesData);
  };

  // Add new part row
  const addNewPart = () => {
    const newPart: PartAndConsumable = {
      part_number: '',
      description: '',
      price: null,
      qty_used: null,
      total_cost: null,
      supplier: '',
      remarks: ''
    };
    
    const updatedParts = [...partsData, newPart];
    setPartsData(updatedParts);
    updatePartsData(updatedParts);
  };

  // Delete part row
  const deletePart = (partIndex: number) => {
    const updatedParts = partsData.filter((_, index) => index !== partIndex);
    setPartsData(updatedParts);
    updatePartsData(updatedParts);
  };

  // Update part field
  const updatePartField = (partIndex: number, field: keyof PartAndConsumable, value: string | number | null) => {
    const updatedParts = [...partsData];
    updatedParts[partIndex] = {
      ...updatedParts[partIndex],
      [field]: value
    };

    // Auto-calculate total cost when price or qty changes
    if (field === 'price' || field === 'qty_used') {
      const price = field === 'price' ? value as number : updatedParts[partIndex].price;
      const qty = field === 'qty_used' ? value as number : updatedParts[partIndex].qty_used;
      updatedParts[partIndex].total_cost = calculateTotalCost(price, qty);
    }

    setPartsData(updatedParts);
    updatePartsData(updatedParts);
  };

  // Calculate progress
  const completedParts = partsData.filter(part => 
    part.part_number.trim() !== '' || part.description.trim() !== ''
  ).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors duration-200 border-b border-blue-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Parts and Consumables</h4>
            <p className="text-sm text-blue-600">
              {partsData.length} parts • Total B: ${totalB.toFixed(2)} AUD
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
        <div className="animate-fadeIn">
          {/* Add Part Button */}
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <button
              onClick={addNewPart}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Part
            </button>
          </div>

          {/* Parts Table */}
          {partsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                      Part Number
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                      Description
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                      Price (AUD)
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                      QTY Used
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                      Total Cost (AUD)
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                      Supplier
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                      Remarks
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[4%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partsData.map((part, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      {/* Row Number */}
                      <td className="px-3 py-3 text-center w-[8%]">
                        <span className="font-medium text-blue-600 text-sm">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      
                      {/* Part Number */}
                      <td className="px-3 py-3 w-[15%] align-top">
                        <input
                          type="text"
                          value={part.part_number}
                          onChange={(e) => updatePartField(index, 'part_number', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Part #"
                        />
                      </td>
                      
                      {/* Description */}
                      <td className="px-3 py-3 w-[20%] align-top">
                        <textarea
                          value={part.description}
                          onChange={(e) => updatePartField(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-hidden"
                          rows={1}
                          placeholder="Description..."
                          style={{ minHeight: '32px' }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.max(32, target.scrollHeight) + 'px';
                          }}
                        />
                      </td>
                      
                      {/* Price */}
                      <td className="px-3 py-3 w-[10%]">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            value={part.price || ''}
                            onChange={(e) => updatePartField(index, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </td>
                      
                      {/* QTY Used */}
                      <td className="px-3 py-3 w-[8%]">
                        <input
                          type="number"
                          value={part.qty_used || ''}
                          onChange={(e) => updatePartField(index, 'qty_used', e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          step="0.1"
                          min="0"
                        />
                      </td>
                      
                      {/* Total Cost (Auto-calculated) */}
                      <td className="px-3 py-3 w-[12%]">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input
                            type="text"
                            value={part.total_cost !== null ? part.total_cost.toFixed(2) : ''}
                            readOnly
                            className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      
                      {/* Supplier */}
                      <td className="px-3 py-3 w-[15%] align-top">
                        <input
                          type="text"
                          value={part.supplier}
                          onChange={(e) => updatePartField(index, 'supplier', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Supplier name"
                        />
                      </td>
                      
                      {/* Remarks */}
                      <td className="px-3 py-3 w-[15%] align-top">
                        <textarea
                          value={part.remarks}
                          onChange={(e) => updatePartField(index, 'remarks', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-hidden"
                          rows={1}
                          placeholder="Remarks..."
                          style={{ minHeight: '32px' }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.max(32, target.scrollHeight) + 'px';
                          }}
                        />
                      </td>
                      
                      {/* Actions */}
                      <td className="px-3 py-3 text-center w-[4%]">
                        <button
                          onClick={() => deletePart(index)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                          title="Delete part"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Total B Row */}
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td colSpan={5} className="px-3 py-3 text-right font-semibold text-gray-900">
                      Total B:
                    </td>
                    <td className="px-3 py-3 w-[12%]">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-700 text-sm font-medium">$</span>
                        <input
                          type="text"
                          value={totalB.toFixed(2)}
                          readOnly
                          className="w-full pl-6 pr-2 py-1 text-sm border border-blue-300 rounded-md bg-blue-100 text-blue-800 font-semibold cursor-not-allowed"
                        />
                      </div>
                    </td>
                    <td colSpan={3} className="px-3 py-3 text-sm text-gray-600">
                      Sum of all total costs
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-400 mb-2">No Parts Added</p>
              <p className="text-sm text-gray-400 mb-4">
                Click "Add Part" to start tracking parts and consumables for this job
              </p>
              <button
                onClick={addNewPart}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Part
              </button>
            </div>
          )}
        </div>
      )}
      
      {isExpanded && partsData.length > 0 && (
        <div className="p-4 bg-blue-50 border-t border-blue-200 animate-fadeIn">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium">
              {partsData.length} part{partsData.length !== 1 ? 's' : ''} • Total B: ${totalB.toFixed(2)} AUD
            </span>
            <div className="text-xs text-blue-600">
              Auto-calculated from Price × QTY Used
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsAndConsumablesList;