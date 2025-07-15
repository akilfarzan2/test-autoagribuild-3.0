import React, { useState, useEffect } from 'react';
import { CheckSquare, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { ServiceTask, JobCardFormData } from '../../../../types/jobCardTypes';

// Service C Tasks - Alphabetically sorted (65 tasks)
export const SERVICE_C_TASKS = [
  "Adjust brakes",
  "Adjust brakes (raise axles)",
  "Brakes are in good serviceable condition; second check sign-off",
  "Check air cleaner restriction indicator and/or air cleaner element condition – replace if necessary",
  "Check air intake system for leaks, cracks or damage – report defects",
  "Check all air suspension components including airbags, height control valves, hoses – report defects",
  "Check all fleet I.D.; replace if missing, damaged or faded",
  "Check all steering components including king pins, ball joints & steering column – report defects",
  "Check all transmission, rear axles & hubs lubricant levels – report any leaks",
  "Check all tyre pressures; fit valve caps; report any abnormal wear or damage",
  "Check battery security & fluid levels; check terminals, clean & lubricate",
  "Check brake linings and record",
  "Check brake linings, drums, disc pads, rotors & adjusters for wear; check hub seals for leakage",
  "Check brakes system for audible air leaks",
  "Check cabin and bonnet tilt system, mounting bolts & operation, reservoir level, leaks & locks",
  "Check clutch and adjust if needed",
  "Check clutch free travel/clearance and adjust as required",
  "Check condition and security of mudflaps, mudguards and spray suppression",
  "Check condition and security of registration plates and marker plates",
  "Check condition of driveline components – report defects",
  "Check condition of fire extinguisher, security, current service tag – report if not fitted",
  "Check condition of windscreen, cabin glass, mirrors and mirror security",
  "Check cooling system level & condition of all hoses; top coolant up if necessary – record usage",
  "Check current registration and/or RWC label, label conditions and remove expired registration labels",
  "Check differential oil levels",
  "Check engine oil level & engine oil leaks; top up as required; report defects",
  "Check for any oil/fuel leaking",
  "Check gearbox oil level",
  "Check hub seals for leaking",
  "Check hydraulic hoses and connections for wear, leaks and potential issues",
  "Check hydraulic oil reservoir level; refill if necessary – record usage",
  "Check mechanical suspension components, springs, hangers, bushes and U-bolts – report defects",
  "Check operation & condition of all exterior lights & reflectors",
  "Check operation of all gauges, warning lights & buzzers, electrical accessories & ABS (if fitted)",
  "Check operation of reversing buzzer, interior lights, horn and all pedal pads/rubbers",
  "Check overhead mounting for cracks",
  "Check park brake operation",
  "Check power steering oil level; top up as required; report any leaks",
  "Check seat belt operation & condition; check seat condition – advise if repairs necessary",
  "Check shock absorber for leaks, damage and worn mountings – report defects",
  "Check steer axle wheel bearing adjustment, oil levels – report defects",
  "Check tension & condition of all Vee-belts; check component mountings for security",
  "Check turntable",
  "Check wheel bearing play",
  "Check windscreen wiper & washer operation; top up reservoir; replace wiper blades if required",
  "Check, record and clear any diagnostic fault codes – advise workshop manager of logged codes",
  "Clean and fit engine drain plug",
  "Completely grease including turntable; replace damaged or missing nipples (raise vehicle if necessary)",
  "Drain air tanks & build up air pressure; check brake systems valves, pipes & hoses for air leaks",
  "Drain engine oil (take oil sample for test on customer request if any)",
  "Drain gearbox oil (take oil sample for test on customer request if any)",
  "Drain water separator on Horton fan air supply; report excessive oil in air system",
  "Fill engine oil and record",
  "Fill gearbox oil",
  "Fit wheel chocks and danger tags (render vehicle safe)",
  "Raise bonnet/cabin & visually check engine bay & components – report defects",
  "Remove grease marks from cabin area",
  "Replace air filter",
  "Replace cab filter",
  "Replace fuel filter",
  "Replace gearbox oil filter",
  "Replace oil filters",
  "Return updated repair request to the vehicle or appropriate person. At completion of the A service, remove danger tag and wheel chocks",
  "Tension all wheel nuts; 10 stud rims to 450 ft/lbs",
  "Update service sticker & attach"
];

interface ServiceCTaskListProps {
  jobCardFormData: JobCardFormData;
  onJobCardDataChange: (field: keyof JobCardFormData, value: ServiceTask[]) => void;
}

const ServiceCTaskList: React.FC<ServiceCTaskListProps> = ({ 
  jobCardFormData,
  onJobCardDataChange 
}) => {
  const [serviceProgress, setServiceProgress] = useState<ServiceTask[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Initialize service progress data
  useEffect(() => {
    // Safely access service_progress with optional chaining and default to empty array
    const existingProgress = jobCardFormData?.service_progress || [];
    
    if (existingProgress.length > 0) {
      // Use existing data from database
      setServiceProgress(existingProgress);
    } else {
      // Initialize with default values for new job cards
      const initialTasks: ServiceTask[] = SERVICE_C_TASKS.map(task => ({
        task,
        status: null,
        description: '',
        done_by: '',
        hours: null
      }));
      setServiceProgress(initialTasks);
    }
  }, [jobCardFormData]);

  // Update task status
  const updateTaskStatus = (taskIndex: number, status: 'tick' | 'cross' | 'n/a' | null) => {
    const updatedProgress = [...serviceProgress];
    updatedProgress[taskIndex] = {
      ...updatedProgress[taskIndex],
      status
    };
    setServiceProgress(updatedProgress);
    onJobCardDataChange('service_progress', updatedProgress);
  };

  // Update task field (description, done_by, hours)
  const updateTaskField = (taskIndex: number, field: 'description' | 'done_by' | 'hours', value: string | number | null) => {
    const updatedProgress = [...serviceProgress];
    updatedProgress[taskIndex] = {
      ...updatedProgress[taskIndex],
      [field]: value
    };
    setServiceProgress(updatedProgress);
    onJobCardDataChange('service_progress', updatedProgress);
  };

  // Calculate progress
  const completedTasks = serviceProgress.filter(task => task.status !== null).length;
  const progressPercentage = serviceProgress.length > 0 ? Math.round((completedTasks / serviceProgress.length) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors duration-200 border-b border-purple-200"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Service C Task List</h4>
            <p className="text-sm text-purple-600">
              {completedTasks} of {serviceProgress.length} tasks addressed
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
        <div className="overflow-x-auto max-h-96 animate-fadeIn">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                Task
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                Status <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[33%]">
                Description <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[17%]">
                Done by <span className="text-red-500">*</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                Hours
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {serviceProgress.map((taskData, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                {/* Task Number Column */}
                <td className="px-4 py-3 text-center w-[8%]">
                  <span className="font-medium text-purple-600 text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </td>
                
                {/* Task Column */}
                <td className="px-4 py-3 text-sm text-gray-700 w-[25%]">
                  {taskData.task}
                </td>
                
                {/* Status Column */}
                <td className="px-4 py-3 text-center w-[8%]">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => updateTaskStatus(index, taskData.status === 'tick' ? null : 'tick')}
                      className={`p-1.5 rounded-md transition-colors duration-200 ${
                        taskData.status === 'tick'
                          ? 'bg-green-100 text-green-600 border border-green-300'
                          : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500'
                      }`}
                      title="Mark as completed"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => updateTaskStatus(index, taskData.status === 'cross' ? null : 'cross')}
                      className={`p-1.5 rounded-md transition-colors duration-200 ${
                        taskData.status === 'cross'
                          ? 'bg-red-100 text-red-600 border border-red-300'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
                      }`}
                      title="Mark as failed/issue"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => updateTaskStatus(index, taskData.status === 'n/a' ? null : 'n/a')}
                      className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                        taskData.status === 'n/a'
                          ? 'bg-gray-200 text-gray-700 border border-gray-300'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-150 hover:text-gray-600'
                      }`}
                      title="Mark as not applicable"
                    >
                      N/A
                    </button>
                  </div>
                </td>
                
                {/* Description Column */}
                <td className="px-4 py-3 w-[33%] align-top">
                  <textarea
                    value={taskData.description}
                    onChange={(e) => updateTaskField(index, 'description', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none overflow-hidden"
                    rows={1}
                    placeholder="Add description..."
                    style={{ minHeight: '32px' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.max(32, target.scrollHeight) + 'px';
                    }}
                  />
                </td>
                
                {/* Done by Column */}
                <td className="px-4 py-3 w-[17%] align-top">
                  <textarea
                    value={taskData.done_by}
                    onChange={(e) => updateTaskField(index, 'done_by', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none overflow-hidden"
                    rows={1}
                    placeholder="Mechanic name"
                    style={{ minHeight: '32px' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.max(32, target.scrollHeight) + 'px';
                    }}
                  />
                </td>
                
                {/* Hours Column */}
                <td className="px-4 py-3 w-[8%]">
                  <input
                    type="number"
                    value={taskData.hours || ''}
                    onChange={(e) => updateTaskField(index, 'hours', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-[60px]"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      
      {isExpanded && (
        <div className="p-4 bg-purple-50 border-t border-purple-200 animate-fadeIn">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-700 font-medium">
              Progress: {progressPercentage}%
            </span>
            <div className="w-32 bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCTaskList;