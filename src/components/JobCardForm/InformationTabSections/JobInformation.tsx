import React, { useState } from 'react';
import { FileText, Calendar, User, ChevronDown, ChevronRight, Lock, Unlock, RotateCcw } from 'lucide-react';

interface JobCardFormData {
  job_year: string;
  job_month: string;
  job_sequence: string;
  job_start_date: string;
  expected_completion_date: string;
  completed_date: string;
  approximate_cost: string;
}

interface JobInformationProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: string) => void;
  generateNextJobNumber: (year: string, month: string) => Promise<string>;
  isGeneratingJobNumber?: boolean;
}

const JobInformation: React.FC<JobInformationProps> = ({ 
  jobCardFormData, 
  onJobCardDataChange,
  generateNextJobNumber,
  isGeneratingJobNumber = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSequenceOverridden, setIsSequenceOverridden] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [jobSequenceError, setJobSequenceError] = useState<string | null>(null);

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Reset override when year or month changes
  React.useEffect(() => {
    setIsSequenceOverridden(false);
    setJobSequenceError(null);
  }, [jobCardFormData.job_year, jobCardFormData.job_month]);

  // Handle override button click
  const handleOverride = () => {
    setIsSequenceOverridden(true);
  };

  // Handle auto assign button click
  const handleAutoAssign = async () => {
    setIsAutoAssigning(true);
    try {
      const newSequence = await generateNextJobNumber(jobCardFormData.job_year, jobCardFormData.job_month);
      onJobCardDataChange('job_sequence', newSequence);
      setIsSequenceOverridden(false);
      setJobSequenceError(null);
    } catch (error) {
      console.error('Error auto-assigning job number:', error);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  // Handle job sequence input change
  const handleJobSequenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSequenceOverridden) return;
    
    const value = e.target.value;
    onJobCardDataChange('job_sequence', value);
    
    // Clear error when user starts typing
    if (jobSequenceError) {
      setJobSequenceError(null);
    }
  };

  // Handle job sequence input blur (validation)
  const handleJobSequenceBlur = () => {
    if (!isSequenceOverridden) return;
    
    const currentValue = jobCardFormData.job_sequence;
    const cleanedValue = currentValue.replace(/\D/g, '').slice(0, 3);
    
    if (cleanedValue === '') {
      setJobSequenceError('Job sequence cannot be empty');
      return;
    }
    
    if (cleanedValue.length < 3) {
      // Auto-pad with leading zeros
      const paddedValue = cleanedValue.padStart(3, '0');
      onJobCardDataChange('job_sequence', paddedValue);
      setJobSequenceError(null);
    } else {
      // Already 3 digits, just update and clear error
      onJobCardDataChange('job_sequence', cleanedValue);
      setJobSequenceError(null);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Job Information</h3>
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Number
                </label>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md text-gray-700 font-medium">
                    JC
                  </span>
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={jobCardFormData.job_year}
                    onChange={(e) => onJobCardDataChange('job_year', e.target.value)}
                    min="2020"
                    max="2099"
                    className="w-20 px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    placeholder="YYYY"
                  />
                  <span className="text-gray-400">-</span>
                  <select
                    value={jobCardFormData.job_month}
                    onChange={(e) => onJobCardDataChange('job_month', e.target.value)}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.value}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-400">-</span>
                  <div className="relative">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={jobCardFormData.job_sequence}
                        readOnly={!isSequenceOverridden}
                        onChange={handleJobSequenceChange}
                        onBlur={handleJobSequenceBlur}
                        className={`w-16 px-2 py-2 border rounded-md shadow-sm text-center transition-colors duration-200 ${
                          jobSequenceError 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } ${
                          isSequenceOverridden 
                            ? 'focus:outline-none focus:ring-2 bg-white' 
                            : 'bg-gray-50 text-gray-600 cursor-not-allowed'
                        }`}
                        placeholder="001"
                      />
                      
                      {/* Control Buttons */}
                      <div className="flex items-center space-x-1">
                        {!isSequenceOverridden ? (
                          <button
                            type="button"
                            onClick={handleOverride}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                            title="Override auto-assignment"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleAutoAssign}
                            disabled={isAutoAssigning}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors duration-200 disabled:opacity-50"
                            title="Auto-assign sequence number"
                          >
                            <RotateCcw className={`w-4 h-4 ${isAutoAssigning ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Loading indicator for initial generation */}
                    {isGeneratingJobNumber && !isSequenceOverridden && (
                      <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Error Message */}
                {jobSequenceError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {jobSequenceError}
                  </p>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  Format: JC-YYYY-MM-NNN (Year-Month-Sequence)
                  {isSequenceOverridden && (
                    <span className="text-orange-600 font-medium"> • Manual Override Active</span>
                  )}
                </p>
              </div>
              
              <div>
                <label htmlFor="jobStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Job Start Date and Time
                </label>
                <input
                  type="datetime-local"
                  id="jobStartDate"
                  name="jobStartDate"
                  value={jobCardFormData.job_start_date}
                  onChange={(e) => onJobCardDataChange('job_start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="expectedCompletionDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Expected Completion Date
                </label>
                <input
                  type="date"
                  id="expectedCompletionDate"
                  name="expectedCompletionDate"
                  value={jobCardFormData.expected_completion_date}
                  onChange={(e) => onJobCardDataChange('expected_completion_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="completedDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Completed Date
                </label>
                <input
                  type="date"
                  id="completedDate"
                  name="completedDate"
                  value={jobCardFormData.completed_date}
                  onChange={(e) => onJobCardDataChange('completed_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="approximateCost" className="block text-sm font-medium text-gray-700 mb-2">
                  Approximate Cost
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <div className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700 font-medium">
                    {parseFloat(jobCardFormData.grand_total || '0').toFixed(2)} AUD
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated from Parts tab totals (Total A + Total B + Total C)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobInformation;