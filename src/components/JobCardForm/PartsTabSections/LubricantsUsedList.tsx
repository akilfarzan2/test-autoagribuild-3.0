import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Trash2, ChevronDown, ChevronRight, DollarSign, Hash, FileText, MessageSquare } from 'lucide-react';
import { Lubricant, JobCardFormData, LubricantsUsedData } from '../../../types/jobCardTypes';

// Default lubricant names
const DEFAULT_LUBRICANT_NAMES = [
  'Engine Oil',
  'Gearbox Oil',
  'Diff Oil',
  'Steering Oil',
  'Brake Oil',
  'Coolant',
  'Grease',
  'Windscreen Fluid',
  'Battery Fluid',
  'Brake Cleaner'
];

interface LubricantsUsedListProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: LubricantsUsedData) => void;
}

const LubricantsUsedList: React.FC<LubricantsUsedListProps> = ({ 
  jobCardFormData,
  onJobCardDataChange 
}) => {
  const [lubricantsData, setLubricantsData] = useState<Lubricant[]>([]);
  const [totalC, setTotalC] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Initialize lubricants data
  useEffect(() => {
    const existingData = jobCardFormData?.lubricants_used;
    
    if (existingData && existingData.lubricants) {
      // Use existing data from database
      setLubricantsData(existingData.lubricants);
      setTotalC(existingData.total_c || 0);
    } else {
      // Initialize with 10 default lubricants for new job cards
      const defaultLubricants: Lubricant[] = DEFAULT_LUBRICANT_NAMES.map(name => ({
        name,
        grade: '',
        qty: null,
        cost_per_litre: null,
        total_cost: null,
        remarks: ''
      }));
      
      setLubricantsData(defaultLubricants);
      setTotalC(0);
      
      // Update the parent component with default data
      const defaultLubricantsData: LubricantsUsedData = {
        lubricants: defaultLubricants,
        total_c: 0
      };
      onJobCardDataChange('lubricants_used', defaultLubricantsData);
    }
  }, [jobCardFormData]);

  // Calculate total cost for a single lubricant
  const calculateTotalCost = (qty: number | null, costPerLitre: number | null): number | null => {
    if (qty !== null && costPerLitre !== null && qty >= 0 && costPerLitre >= 0) {
      return qty * costPerLitre;
    }
    return null;
  };

  // Calculate Total C (sum of all total costs)
  const calculateTotalC = (lubricants: Lubricant[]): number => {
    return lubricants.reduce((sum, lubricant) => {
      return sum + (lubricant.total_cost || 0);
    }, 0);
  };

  // Helper function to update lubricants data
  const updateLubricantsData = (updatedLubricants: Lubricant[]) => {
    const newTotalC = calculateTotalC(updatedLubricants);
    setTotalC(newTotalC);
    
    const lubricantsUsedData: LubricantsUsedData = {
      lubricants: updatedLubricants,
      total_c: newTotalC
    };
    
    onJobCardDataChange('lubricants_used', lubricantsUsedData);
  };

  // Add new lubricant row
  const addNewLubricant = () => {
    const newLubricant: Lubricant = {
      name: '',
      grade: '',
      qty: null,
      cost_per_litre: null,
      total_cost: null,
      remarks: ''
    };
    
    const updatedLubricants = [...lubricantsData, newLubricant];
    setLubricantsData(updatedLubricants);
    updateLubricantsData(updatedLubricants);
  };

  // Delete lubricant row
  const deleteLubricant = (lubricantIndex: number) => {
    const updatedLubricants = lubricantsData.filter((_, index) => index !== lubricantIndex);
    setLubricantsData(updatedLubricants);
    updateLubricantsData(updatedLubricants);
  };

  // Update lubricant field
  const updateLubricantField = (lubricantIndex: number, field: keyof Lubricant, value: string | number | null) => {
    const updatedLubricants = [...lubricantsData];
    updatedLubricants[lubricantIndex] = {
      ...updatedLubricants[lubricantIndex],
      [field]: value
    };

    // Auto-calculate total cost when qty or cost_per_litre changes
    if (field === 'qty' || field === 'cost_per_litre') {
      const qty = field === 'qty' ? value as number : updatedLubricants[lubricantIndex].qty;
      const costPerLitre = field === 'cost_per_litre' ? value as number : updatedLubricants[lubricantIndex].cost_per_litre;
      updatedLubricants[lubricantIndex].total_cost = calculateTotalCost(qty, costPerLitre);
    }

    setLubricantsData(updatedLubricants);
    updateLubricantsData(updatedLubricants);
  };

  // Calculate progress
  const completedLubricants = lubricantsData.filter(lubricant => 
    lubricant.name.trim() !== '' || lubricant.grade.trim() !== ''
  ).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 transition-colors duration-200 border-b border-red-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <Droplets className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Lubricants Used</h4>
            <p className="text-sm text-red-600">
              {lubricantsData.length} lubricants • Total C: ${totalC.toFixed(2)} AUD
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
          {/* Add Lubricant Button */}
          <div className="p-4 bg-red-50 border-b border-red-200">
            <button
              onClick={addNewLubricant}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lubricant
            </button>
          </div>

          {/* Lubricants Table */}
          {lubricantsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                      #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[18%]">
                      Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                      Grade
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                      QTY (L)
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                      Cost Per Litre (AUD)
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                      Total Cost (AUD)
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                      Remarks
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[5%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lubricantsData.map((lubricant, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      {/* Row Number */}
                      <td className="px-3 py-3 text-center w-[8%]">
                        <span className="font-medium text-red-600 text-sm">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      
                      {/* Name */}
                      <td className="px-3 py-3 w-[18%] align-top">
                        <input
                          type="text"
                          value={lubricant.name}
                          onChange={(e) => updateLubricantField(index, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Lubricant name"
                        />
                      </td>
                      
                      {/* Grade */}
                      <td className="px-3 py-3 w-[15%] align-top">
                        <input
                          type="text"
                          value={lubricant.grade}
                          onChange={(e) => updateLubricantField(index, 'grade', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Grade"
                        />
                      </td>
                      
                      {/* QTY */}
                      <td className="px-3 py-3 w-[10%]">
                        <input
                          type="number"
                          value={lubricant.qty || ''}
                          onChange={(e) => updateLubricantField(index, 'qty', e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="0.0"
                          step="0.1"
                          min="0"
                        />
                      </td>
                      
                      {/* Cost Per Litre */}
                      <td className="px-3 py-3 w-[12%]">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            value={lubricant.cost_per_litre || ''}
                            onChange={(e) => updateLubricantField(index, 'cost_per_litre', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </td>
                      
                      {/* Total Cost (Auto-calculated) */}
                      <td className="px-3 py-3 w-[12%]">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input
                            type="text"
                            value={lubricant.total_cost !== null ? lubricant.total_cost.toFixed(2) : ''}
                            readOnly
                            className="w-full pl-6 pr-2 py-1 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      
                      {/* Remarks */}
                      <td className="px-3 py-3 w-[20%] align-top">
                        <textarea
                          value={lubricant.remarks}
                          onChange={(e) => updateLubricantField(index, 'remarks', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none overflow-hidden"
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
                      <td className="px-3 py-3 text-center w-[5%]">
                        <button
                          onClick={() => deleteLubricant(index)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                          title="Delete lubricant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Total C Row */}
                  <tr className="bg-red-50 border-t-2 border-red-200">
                    <td colSpan={5} className="px-3 py-3 text-right font-semibold text-gray-900">
                      Total C:
                    </td>
                    <td className="px-3 py-3 w-[12%]">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-700 text-sm font-medium">$</span>
                        <input
                          type="text"
                          value={totalC.toFixed(2)}
                          readOnly
                          className="w-full pl-6 pr-2 py-1 text-sm border border-red-300 rounded-md bg-red-100 text-red-800 font-semibold cursor-not-allowed"
                        />
                      </div>
                    </td>
                    <td colSpan={2} className="px-3 py-3 text-sm text-gray-600">
                      Sum of all total costs
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Droplets className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-400 mb-2">No Lubricants Data</p>
              <p className="text-sm text-gray-400 mb-4">
                Default lubricants will be loaded automatically
              </p>
            </div>
          )}
        </div>
      )}
      
      {isExpanded && lubricantsData.length > 0 && (
        <div className="p-4 bg-red-50 border-t border-red-200 animate-fadeIn">
          <div className="flex items-center justify-between text-sm">
            <span className="text-red-700 font-medium">
              {lubricantsData.length} lubricant{lubricantsData.length !== 1 ? 's' : ''} • Total C: ${totalC.toFixed(2)} AUD
            </span>
            <div className="text-xs text-red-600">
              Auto-calculated from QTY × Cost Per Litre
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LubricantsUsedList;